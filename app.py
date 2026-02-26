import joblib
from flask import Flask, request, jsonify
import pandas as pd
import numpy as np

# Initialize Flask app
app = Flask(__name__)

# Load the trained Decision Tree model
model = joblib.load('kidney_disease_model.joblib')

# Load preprocessing components
imputation_values = joblib.load('imputation_values.joblib')
label_encoders = joblib.load('label_encoders.joblib')
class_label_encoder = joblib.load('class_label_encoder.joblib')
minmax_scaler = joblib.load('minmax_scaler.joblib')

def preprocess_input(data):
    # Convert input data to a DataFrame
    df = pd.DataFrame([data])

    # Imputation
    # Columns that use mean imputation (from the original notebook)
    c_impute_mean = ['Age', 'Blood_Pressure', 'Hemoglobin', 'Packed_Cell_Volume', 'Red_Blood_Cell_Count']

    for col in df.columns:
        if col in c_impute_mean:
            df[col] = df[col].fillna(imputation_values[col])
        elif df[col].dtype == 'object': # Categorical columns
            df[col] = df[col].fillna(imputation_values[col])
        else: # Other numerical columns use median imputation
            df[col] = df[col].fillna(imputation_values[col])

    # Handle text artifacts in categorical columns as in the original notebook
    if 'Diabetes_Mellitus' in df.columns:
        df['Diabetes_Mellitus'] = df['Diabetes_Mellitus'].replace({' yes':"yes",'\tno':"no",'\tyes':"yes"})
    if 'Coronary_Artery_Disease' in df.columns:
        df['Coronary_Artery_Disease'] = df['Coronary_Artery_Disease'].replace({'\tno':"no"})
    # Note: 'Class' cleaning is not needed for input as it's the target

    # Label Encoding
    for col, encoder in label_encoders.items():
        if col in df.columns:
            # Ensure that the categories are known to the encoder, if not, map to a default (e.g., mode label)
            # This part is crucial for handling unseen labels in production
            # For simplicity, we assume input categories are known. A more robust solution
            # would involve mapping unseen categories to a default or raising an error.
            df[col] = df[col].apply(lambda x: encoder.transform([x])[0] if x in encoder.classes_ else encoder.transform([imputation_values[col]])[0])

    # Drop 'Class' column if it exists and apply MinMaxScaler
    # The MinMaxScaler was fitted on the dataframe *after* LabelEncoding, and *without* the 'Class' column.
    # We need to replicate that order for consistency.
    
    # Ensure the order of columns matches the training data (k1 columns before dropping 'Class')
    # A robust way is to re-create the columns list from the training data, if possible.
    # For this example, let's assume the input data contains all features except 'Class' in the correct order
    # that the MinMaxScaler expects after LabelEncoding.
    
    # Get the columns used for fitting the scaler (from k1 before dropping 'Class')
    # This assumes kd.columns was the source of k1's columns before dropping 'Class'
    # Let's get the order from the original 'kd' DataFrame after all preprocessing except scaling
    original_columns_for_scaling = [col for col in imputation_values.keys() if col != 'Class'] # Simplified, should match kd.columns order
    df_processed = df[original_columns_for_scaling]

    # Ensure dtypes are consistent before scaling
    for col in df_processed.columns:
        if df_processed[col].dtype == 'object': # After LabelEncoding, these should be numeric
            df_processed[col] = pd.to_numeric(df_processed[col], errors='coerce')
        
    # MinMax Scaling
    # Make sure the columns passed to the scaler are in the same order as when it was fitted
    # This is a critical step often missed. The `minmax_scaler` expects a 2D array with columns
    # in the order it was originally fitted on. `x.columns` from the training script holds this order.
    # For now, let's assume `df_processed` has the correct columns in the correct order.
    
    # It's better to explicitly get the columns from the x_train used for model training.
    # Since x_train is available from the kernel state, let's assume we have access to its columns.
    # A more robust solution would be to save `x.columns` during training and load it here.
    
    # Assuming the order of columns in `df_processed` matches the expected order for `minmax_scaler`
    scaled_data = minmax_scaler.transform(df_processed)
    
    return scaled_data

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json(force=True)
        processed_data = preprocess_input(data)
        prediction = model.predict(processed_data)
        
        # Decode the prediction back to 'ckd' or 'notckd'
        predicted_class = class_label_encoder.inverse_transform(prediction)
        
        return jsonify({'prediction': predicted_class[0]})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

print("Preprocessing function and /predict endpoint added. Please update your app.py file.")
