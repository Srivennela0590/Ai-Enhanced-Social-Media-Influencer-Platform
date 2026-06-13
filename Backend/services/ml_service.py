"""
ML Prediction Service
Loads knn_model.pkl, scaler.pkl, encoders.pkl separately.
Auto-trains if artifacts are missing and dataset is available.
"""

import os
import numpy as np
import joblib
import warnings

warnings.filterwarnings('ignore')

ML_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'ML')
MODEL_PATH = os.path.join(ML_DIR, 'knn_model.pkl')
SCALER_PATH = os.path.join(ML_DIR, 'scaler.pkl')
ENCODERS_PATH = os.path.join(ML_DIR, 'encoders.pkl')

# Singleton cache
_model = None
_scaler = None
_encoders = None


def validate_artifacts():
    """Check if all three .pkl files exist. Returns list of missing files."""
    missing = []
    if not os.path.exists(MODEL_PATH):
        missing.append('knn_model.pkl')
    if not os.path.exists(SCALER_PATH):
        missing.append('scaler.pkl')
    if not os.path.exists(ENCODERS_PATH):
        missing.append('encoders.pkl')
    return missing


def _load_artifacts():
    """Load the three artifacts into memory. Auto-trains if missing."""
    global _model, _scaler, _encoders
    if _model is not None and _scaler is not None and _encoders is not None:
        return

    missing = validate_artifacts()
    if missing:
        print(f'[ML] Missing artifacts: {missing}. Training model now...')
        _train_and_save()
    else:
        _model = joblib.load(MODEL_PATH)
        _scaler = joblib.load(SCALER_PATH)
        _encoders = joblib.load(ENCODERS_PATH)
        print('[ML] Loaded knn_model.pkl, scaler.pkl, encoders.pkl')


def _train_and_save():
    """Train KNN from CSV dataset and save all three artifacts."""
    global _model, _scaler, _encoders
    import pandas as pd
    from sklearn.model_selection import train_test_split
    from sklearn.preprocessing import LabelEncoder, StandardScaler
    from sklearn.neighbors import KNeighborsClassifier
    from sklearn.metrics import (
        accuracy_score, precision_score, recall_score,
        f1_score, confusion_matrix, classification_report,
    )

    # Find dataset — check Backend/ML/ first, then project-root ML/
    csv_path = os.path.join(ML_DIR, 'influencer_campaign_dataset.csv')
    if not os.path.exists(csv_path):
        alt = os.path.join(os.path.dirname(os.path.dirname(ML_DIR)), 'ML', 'influencer_campaign_dataset.csv')
        if os.path.exists(alt):
            csv_path = alt
        else:
            raise FileNotFoundError(
                f'Dataset not found. Looked in:\n  {csv_path}\n  {alt}\n'
                'Please place influencer_campaign_dataset.csv in the Backend/ML/ folder.'
            )

    df = pd.read_csv(csv_path)

    # Handle missing values
    for col in ['followers_count', 'engagement_rate', 'audience_match_score', 'previous_performance']:
        df[col] = pd.to_numeric(df[col], errors='coerce')
        df[col].fillna(df[col].median(), inplace=True)
    for col in ['influencer_category', 'campaign_category']:
        df[col].fillna(df[col].mode()[0], inplace=True)
    df.dropna(subset=['match_label'], inplace=True)

    # Label encoding
    le_inf = LabelEncoder()
    le_camp = LabelEncoder()
    le_label = LabelEncoder()
    df['inf_enc'] = le_inf.fit_transform(df['influencer_category'])
    df['camp_enc'] = le_camp.fit_transform(df['campaign_category'])
    df['label_enc'] = le_label.fit_transform(df['match_label'])

    # Features and scaling
    feat_cols = ['inf_enc', 'followers_count', 'engagement_rate',
                 'camp_enc', 'audience_match_score', 'previous_performance']
    X = df[feat_cols].values
    y = df['label_enc'].values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42, stratify=y
    )

    # Train KNN
    knn = KNeighborsClassifier(n_neighbors=7, weights='distance', metric='euclidean')
    knn.fit(X_train, y_train)

    # Save all three artifacts separately
    os.makedirs(ML_DIR, exist_ok=True)
    joblib.dump(knn, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    joblib.dump({
        'influencer_category': le_inf,
        'campaign_category': le_camp,
        'match_label': le_label,
    }, ENCODERS_PATH)

    _model = knn
    _scaler = scaler
    _encoders = {
        'influencer_category': le_inf,
        'campaign_category': le_camp,
        'match_label': le_label,
    }

    # Evaluate and save results
    y_pred = knn.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average='weighted')
    rec = recall_score(y_test, y_pred, average='weighted')
    f1 = f1_score(y_test, y_pred, average='weighted')
    cm = confusion_matrix(y_test, y_pred)

    eval_path = os.path.join(ML_DIR, 'evaluation_results.txt')
    with open(eval_path, 'w') as f:
        f.write('=' * 60 + '\n KNN MODEL EVALUATION RESULTS\n' + '=' * 60 + '\n\n')
        f.write(f'Accuracy:  {acc:.4f} ({acc*100:.2f}%)\n')
        f.write(f'Precision: {prec:.4f} ({prec*100:.2f}%)\n')
        f.write(f'Recall:    {rec:.4f} ({rec*100:.2f}%)\n')
        f.write(f'F1 Score:  {f1:.4f} ({f1*100:.2f}%)\n\n')
        f.write(f'Confusion Matrix:\n{cm}\n\n')
        f.write('Classification Report:\n')
        f.write(classification_report(y_test, y_pred, target_names=le_label.classes_))

    print(f'[ML] Model trained. Accuracy: {acc:.4f}. Artifacts saved.')


def predict_match(influencer_category, followers_count, engagement_rate,
                  campaign_category, audience_match_score, previous_performance):
    """
    Full prediction pipeline:
    1. Encode categorical inputs using encoders.pkl
    2. Scale features using scaler.pkl
    3. Run prediction using knn_model.pkl
    4. Return confidence via predict_proba()
    """
    _load_artifacts()

    le_inf = _encoders['influencer_category']
    le_camp = _encoders['campaign_category']
    le_label = _encoders['match_label']

    # Step 1: Encode categorical inputs
    try:
        inf_enc = le_inf.transform([influencer_category])[0]
    except ValueError:
        inf_enc = 0
    try:
        camp_enc = le_camp.transform([campaign_category])[0]
    except ValueError:
        camp_enc = 0

    # Step 2: Scale features
    features = np.array([[inf_enc, followers_count, engagement_rate,
                          camp_enc, audience_match_score, previous_performance]])
    features_scaled = _scaler.transform(features)

    # Step 3: Predict
    prediction_enc = _model.predict(features_scaled)[0]
    prediction = le_label.inverse_transform([prediction_enc])[0]

    # Step 4: Confidence via predict_proba
    probabilities = _model.predict_proba(features_scaled)[0]
    confidence = float(np.max(probabilities))

    prob_dict = {}
    for i, cls in enumerate(le_label.classes_):
        prob_dict[cls] = f'{probabilities[i] * 100:.1f}%'

    match_score = min(int(
        probabilities[list(le_label.classes_).index('Strong Match')] * 70 +
        probabilities[list(le_label.classes_).index('Moderate Match')] * 20 +
        audience_match_score * 0.05 +
        previous_performance * 0.05
    ), 100)

    return {
        'prediction': prediction,
        'confidence': f'{confidence * 100:.0f}%',
        'matchScore': match_score,
        'probabilities': prob_dict,
    }
