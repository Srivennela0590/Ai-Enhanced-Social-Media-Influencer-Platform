#!/usr/bin/env python3
"""
===============================================================================
 AI-Enhanced Social Media Influencer Platform
 KNN Model Training Pipeline
===============================================================================

 This script trains a K-Nearest Neighbors classifier to predict the match
 quality between an influencer and a campaign based on 6 features.

 Features:
   1. influencer_category (encoded)
   2. followers_count
   3. engagement_rate
   4. campaign_category (encoded)
   5. audience_match_score
   6. previous_performance

 Labels:
   - Strong Match
   - Moderate Match
   - Low Match

 Steps:
   1. Load CSV dataset (1000 rows)
   2. Handle missing values (median/mode imputation)
   3. Label encode categorical features
   4. Scale features with StandardScaler
   5. Train/test split 80/20
   6. Train KNeighborsClassifier (k=7)
   7. Evaluate: Accuracy, Precision, Recall, F1, Confusion Matrix
   8. Export model to knn_model.pkl

 Usage:
   pip install pandas scikit-learn joblib numpy
   python train_model.py

===============================================================================
"""

import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
)
import joblib

# ─────────────────────────────────────────────────────────────
# 1. LOAD DATASET
# ─────────────────────────────────────────────────────────────
print("=" * 70)
print(" KNN Model Training Pipeline")
print("=" * 70)

DATA_PATH = os.path.join(os.path.dirname(__file__), "influencer_campaign_dataset.csv")
print(f"\n[1/8] Loading dataset from: {DATA_PATH}")
df = pd.read_csv(DATA_PATH)
print(f"      Dataset shape: {df.shape}")
print(f"      Columns: {list(df.columns)}")
print(f"\n      First 5 rows:")
print(df.head().to_string(index=False))

# ─────────────────────────────────────────────────────────────
# 2. HANDLE MISSING VALUES
# ─────────────────────────────────────────────────────────────
print(f"\n[2/8] Handling missing values...")
missing_before = df.isnull().sum().sum()
print(f"      Missing values before: {missing_before}")

# Numeric columns: fill with median
numeric_cols = ["followers_count", "engagement_rate", "audience_match_score", "previous_performance"]
for col in numeric_cols:
    if df[col].isnull().any():
        median_val = df[col].median()
        df[col].fillna(median_val, inplace=True)
        print(f"      Filled {col} NaN with median: {median_val}")

# Categorical columns: fill with mode
categorical_cols = ["influencer_category", "campaign_category"]
for col in categorical_cols:
    if df[col].isnull().any():
        mode_val = df[col].mode()[0]
        df[col].fillna(mode_val, inplace=True)
        print(f"      Filled {col} NaN with mode: {mode_val}")

# Target: drop rows with missing labels
df.dropna(subset=["match_label"], inplace=True)

missing_after = df.isnull().sum().sum()
print(f"      Missing values after: {missing_after}")
print(f"      Final dataset shape: {df.shape}")

# ─────────────────────────────────────────────────────────────
# 3. LABEL ENCODING
# ─────────────────────────────────────────────────────────────
print(f"\n[3/8] Label encoding categorical features...")

le_influencer = LabelEncoder()
le_campaign = LabelEncoder()
le_label = LabelEncoder()

df["influencer_category_enc"] = le_influencer.fit_transform(df["influencer_category"])
df["campaign_category_enc"] = le_campaign.fit_transform(df["campaign_category"])
df["match_label_enc"] = le_label.fit_transform(df["match_label"])

print(f"      Influencer categories: {list(le_influencer.classes_)}")
print(f"      Campaign categories:   {list(le_campaign.classes_)}")
print(f"      Match labels:          {list(le_label.classes_)}")

# Mapping tables
print(f"\n      Influencer category mapping:")
for i, c in enumerate(le_influencer.classes_):
    print(f"        {c} -> {i}")

print(f"\n      Campaign category mapping:")
for i, c in enumerate(le_campaign.classes_):
    print(f"        {c} -> {i}")

print(f"\n      Label mapping:")
for i, c in enumerate(le_label.classes_):
    print(f"        {c} -> {i}")

# ─────────────────────────────────────────────────────────────
# 4. PREPARE FEATURES & TARGET
# ─────────────────────────────────────────────────────────────
print(f"\n[4/8] Preparing features and target variable...")

feature_cols = [
    "influencer_category_enc",
    "followers_count",
    "engagement_rate",
    "campaign_category_enc",
    "audience_match_score",
    "previous_performance",
]

X = df[feature_cols].values
y = df["match_label_enc"].values

print(f"      Feature matrix shape: {X.shape}")
print(f"      Target vector shape:  {y.shape}")
print(f"      Label distribution:")
for label, count in zip(*np.unique(y, return_counts=True)):
    print(f"        {le_label.classes_[label]}: {count} ({count/len(y)*100:.1f}%)")

# ─────────────────────────────────────────────────────────────
# 5. FEATURE SCALING
# ─────────────────────────────────────────────────────────────
print(f"\n[5/8] Feature scaling with StandardScaler...")

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

print(f"      Scaler means:  {np.round(scaler.mean_, 4)}")
print(f"      Scaler scales: {np.round(scaler.scale_, 4)}")

# ─────────────────────────────────────────────────────────────
# 6. TRAIN/TEST SPLIT (80/20)
# ─────────────────────────────────────────────────────────────
print(f"\n[6/8] Splitting data 80/20...")

X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.20, random_state=42, stratify=y
)

print(f"      Training set: {X_train.shape[0]} samples")
print(f"      Testing set:  {X_test.shape[0]} samples")

# ─────────────────────────────────────────────────────────────
# 7. TRAIN KNN MODEL
# ─────────────────────────────────────────────────────────────
print(f"\n[7/8] Training KNeighborsClassifier (k=7)...")

knn = KNeighborsClassifier(
    n_neighbors=7,
    weights="distance",
    metric="euclidean",
    algorithm="auto",
    n_jobs=-1,
)

knn.fit(X_train, y_train)
print(f"      Model trained successfully!")

# ─────────────────────────────────────────────────────────────
# 8. EVALUATE MODEL
# ─────────────────────────────────────────────────────────────
print(f"\n[8/8] Evaluating model on test set...")

y_pred = knn.predict(X_test)

accuracy  = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred, average="weighted")
recall    = recall_score(y_test, y_pred, average="weighted")
f1        = f1_score(y_test, y_pred, average="weighted")
cm        = confusion_matrix(y_test, y_pred)

print(f"\n" + "=" * 70)
print(f" MODEL EVALUATION RESULTS")
print(f"=" * 70)
print(f"\n  Accuracy:   {accuracy:.4f}  ({accuracy*100:.2f}%)")
print(f"  Precision:  {precision:.4f}  ({precision*100:.2f}%)")
print(f"  Recall:     {recall:.4f}  ({recall*100:.2f}%)")
print(f"  F1 Score:   {f1:.4f}  ({f1*100:.2f}%)")
print(f"\n  Confusion Matrix:")
print(f"  {cm}")
print(f"\n  Detailed Classification Report:")
print(classification_report(y_test, y_pred, target_names=le_label.classes_))

# ─────────────────────────────────────────────────────────────
# SAVE MODEL & ARTIFACTS
# ─────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(SCRIPT_DIR, "knn_model.pkl")
SCALER_PATH = os.path.join(SCRIPT_DIR, "scaler.pkl")
ENCODERS_PATH = os.path.join(SCRIPT_DIR, "encoders.pkl")

# Save KNN model standalone
joblib.dump(knn, MODEL_PATH)
print(f"\n  Model saved to:    {MODEL_PATH}")

# Save fitted StandardScaler standalone
joblib.dump(scaler, SCALER_PATH)
print(f"  Scaler saved to:   {SCALER_PATH}")

# Save all fitted LabelEncoders as a dict
encoders_dict = {
    "influencer_category": le_influencer,
    "campaign_category": le_campaign,
    "match_label": le_label,
}
joblib.dump(encoders_dict, ENCODERS_PATH)
print(f"  Encoders saved to: {ENCODERS_PATH}")

# Save evaluation results
EVAL_PATH = os.path.join(os.path.dirname(__file__), "evaluation_results.txt")
with open(EVAL_PATH, "w") as f:
    f.write("=" * 70 + "\n")
    f.write(" KNN MODEL EVALUATION RESULTS\n")
    f.write(" AI-Enhanced Social Media Influencer Platform\n")
    f.write("=" * 70 + "\n\n")
    f.write(f"Model:          KNeighborsClassifier\n")
    f.write(f"K (neighbors):  7\n")
    f.write(f"Weights:        distance\n")
    f.write(f"Metric:         euclidean\n")
    f.write(f"Train/Test:     80/20 split (stratified)\n")
    f.write(f"Dataset size:   {len(df)} rows\n")
    f.write(f"Features:       {len(feature_cols)}\n\n")
    f.write(f"{'Metric':<15} {'Value':>10} {'Percentage':>12}\n")
    f.write(f"{'-'*15} {'-'*10} {'-'*12}\n")
    f.write(f"{'Accuracy':<15} {accuracy:>10.4f} {accuracy*100:>11.2f}%\n")
    f.write(f"{'Precision':<15} {precision:>10.4f} {precision*100:>11.2f}%\n")
    f.write(f"{'Recall':<15} {recall:>10.4f} {recall*100:>11.2f}%\n")
    f.write(f"{'F1 Score':<15} {f1:>10.4f} {f1*100:>11.2f}%\n\n")
    f.write(f"Confusion Matrix:\n{cm}\n\n")
    f.write(f"Detailed Classification Report:\n")
    f.write(classification_report(y_test, y_pred, target_names=le_label.classes_))

print(f"  Evaluation results saved to: {EVAL_PATH}")
print(f"\n{'=' * 70}")
print(f" Pipeline complete!")
print(f"{'=' * 70}\n")


# ─────────────────────────────────────────────────────────────
# PREDICTION FUNCTION (for API)
# Loads the three separate .pkl artifacts
# ─────────────────────────────────────────────────────────────
def predict_match(
    influencer_category: str,
    followers_count: int,
    engagement_rate: float,
    campaign_category: str,
    audience_match_score: int,
    previous_performance: int,
) -> dict:
    """
    POST /api/ml/predict endpoint handler.

    Loads: knn_model.pkl, scaler.pkl, encoders.pkl

    Input:
    {
      "influencer_category": "Fitness",
      "followers_count": 50000,
      "engagement_rate": 6.5,
      "campaign_category": "Fitness",
      "audience_match_score": 85,
      "previous_performance": 90
    }

    Output:
    {
      "prediction": "Strong Match",
      "confidence": "92%"
    }
    """
    # Load each artifact separately
    model = joblib.load(MODEL_PATH)
    loaded_scaler = joblib.load(SCALER_PATH)
    encoders = joblib.load(ENCODERS_PATH)

    le_inf = encoders["influencer_category"]
    le_camp = encoders["campaign_category"]
    le_lbl = encoders["match_label"]

    # Encode categories (handle unseen categories gracefully)
    try:
        inf_enc = le_inf.transform([influencer_category])[0]
    except ValueError:
        inf_enc = 0
    try:
        camp_enc = le_camp.transform([campaign_category])[0]
    except ValueError:
        camp_enc = 0

    features = np.array([[inf_enc, followers_count, engagement_rate,
                          camp_enc, audience_match_score, previous_performance]])
    features_scaled = loaded_scaler.transform(features)

    prediction_enc = model.predict(features_scaled)[0]
    prediction = le_lbl.inverse_transform([prediction_enc])[0]

    probabilities = model.predict_proba(features_scaled)[0]
    confidence = float(np.max(probabilities))

    return {
        "prediction": prediction,
        "confidence": f"{confidence * 100:.0f}%",
        "probabilities": {
            le_lbl.classes_[i]: f"{p * 100:.1f}%"
            for i, p in enumerate(probabilities)
        },
    }


if __name__ == "__main__":
    # Demo prediction
    print("\n  Demo prediction:")
    result = predict_match(
        influencer_category="Fitness",
        followers_count=50000,
        engagement_rate=6.5,
        campaign_category="Fitness",
        audience_match_score=85,
        previous_performance=90,
    )
    print(f"  Input:  Fitness influencer, 50K followers, 6.5% engagement")
    print(f"  Output: {result}")
