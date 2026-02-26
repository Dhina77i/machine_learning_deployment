import os
import joblib
from flask import Flask, request, jsonify
import pandas as pd
import numpy as np

# Initialize Flask app
app = Flask(__name__)

# Load all required artifacts
model = joblib.load("kidney_disease_model.joblib")
imputation_values = joblib.load("imputation_values.joblib")
label_encoders = joblib.load("label_encoders.joblib")
class_label_encoder = joblib.load("class_label_encoder.joblib")
minmax_scaler = joblib.load("minmax_scaler.joblib")


def preprocess_input(data):
    df = pd.DataFrame([data])

    # Columns using mean imputation
    c_impute_mean = [
        "Age",
        "Blood_Pressure",
        "Hemoglobin",
        "Packed_Cell_Volume",
        "Red_Blood_Cell_Count",
    ]

    # Imputation
    for col in df.columns:
        if col in imputation_values:
            df[col] = df[col].fillna(imputation_values[col])

    # Clean text artifacts
    if "Diabetes_Mellitus" in df.columns:
        df["Diabetes_Mellitus"] = df["Diabetes_Mellitus"].replace(
            {" yes": "yes", "\tno": "no", "\tyes": "yes"}
        )

    if "Coronary_Artery_Disease" in df.columns:
        df["Coronary_Artery_Disease"] = df["Coronary_Artery_Disease"].replace(
            {"\tno": "no"}
        )

    # Label Encoding
    for col, encoder in label_encoders.items():
        if col in df.columns:
            df[col] = df[col].apply(
                lambda x: encoder.transform([x])[0]
                if x in encoder.classes_
                else encoder.transform([imputation_values[col]])[0]
            )

    # Ensure correct column order for scaling
    feature_columns = [col for col in imputation_values.keys() if col != "Class"]
    df_processed = df[feature_columns]

    # Convert to numeric
    df_processed = df_processed.apply(pd.to_numeric, errors="coerce")

    # Scale
    scaled_data = minmax_scaler.transform(df_processed)

    return scaled_data


@app.route("/")
def home():
    return jsonify({"message": "Kidney Disease Prediction API is running"})


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True)
        processed_data = preprocess_input(data)
        prediction = model.predict(processed_data)

        predicted_class = class_label_encoder.inverse_transform(prediction)

        return jsonify({"prediction": predicted_class[0]})

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# IMPORTANT: Render dynamic port binding
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
