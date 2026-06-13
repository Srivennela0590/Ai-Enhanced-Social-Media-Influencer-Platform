#!/usr/bin/env python3
"""
KNN Model Training Pipeline for InfluenceAI
Generates: knn_model.pkl, scaler.pkl, encoders.pkl, evaluation_results.txt
Run: python train_model.py
"""

import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, confusion_matrix, classification_report,
)
import joblib

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Find dataset — check local dir first, then project root ML/
CSV_PATH = os.path.join(SCRIPT_DIR, 'influencer_campaign_dataset.csv')
if not os.path.exists(CSV_PATH):
    CSV_PATH = os.path.join(os.path.dirname(os.path.dirname(SCRIPT_DIR)), 'ML', 'influencer_campaign_dataset.csv')
    if not os.path.exists(CSV_PATH):
        print(f'ERROR: Dataset not found.')
        exit(1)

print('=' * 60)
print(' KNN Model Training Pipeline')
print('=' * 60)

# 1. Load
print(f'\n[1/8] Loading dataset: {CSV_PATH}')
df = pd.read_csv(CSV_PATH)
print(f'      Shape: {df.shape}')

# 2. Missing values
print('\n[2/8] Handling missing values...')
for c in ['followers_count', 'engagement_rate', 'audience_match_score', 'previous_performance']:
    df[c] = pd.to_numeric(df[c], errors='coerce')
    df[c].fillna(df[c].median(), inplace=True)
for c in ['influencer_category', 'campaign_category']:
    df[c].fillna(df[c].mode()[0], inplace=True)
df.dropna(subset=['match_label'], inplace=True)
print(f'      Clean shape: {df.shape}')

# 3. Label Encoding
print('\n[3/8] Label encoding...')
le_inf = LabelEncoder()
le_camp = LabelEncoder()
le_label = LabelEncoder()
df['inf_enc'] = le_inf.fit_transform(df['influencer_category'])
df['camp_enc'] = le_camp.fit_transform(df['campaign_category'])
df['label_enc'] = le_label.fit_transform(df['match_label'])
print(f'      Labels: {list(le_label.classes_)}')

# 4. Features
print('\n[4/8] Preparing features...')
feats = ['inf_enc', 'followers_count', 'engagement_rate', 'camp_enc', 'audience_match_score', 'previous_performance']
X = df[feats].values
y = df['label_enc'].values

# 5. Scaling
print('\n[5/8] Feature scaling...')
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 6. Split
print('\n[6/8] Train/test split 80/20...')
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42, stratify=y)
print(f'      Train: {len(X_train)}, Test: {len(X_test)}')

# 7. Train
print('\n[7/8] Training KNN (k=7)...')
knn = KNeighborsClassifier(n_neighbors=7, weights='distance', metric='euclidean')
knn.fit(X_train, y_train)

# 8. Evaluate
print('\n[8/8] Evaluating...')
y_pred = knn.predict(X_test)
acc = accuracy_score(y_test, y_pred)
prec = precision_score(y_test, y_pred, average='weighted')
rec = recall_score(y_test, y_pred, average='weighted')
f1 = f1_score(y_test, y_pred, average='weighted')
cm = confusion_matrix(y_test, y_pred)

print(f'\n  Accuracy:  {acc:.4f} ({acc*100:.2f}%)')
print(f'  Precision: {prec:.4f} ({prec*100:.2f}%)')
print(f'  Recall:    {rec:.4f} ({rec*100:.2f}%)')
print(f'  F1 Score:  {f1:.4f} ({f1*100:.2f}%)')
print(f'\n  Confusion Matrix:\n{cm}')
print(f'\n{classification_report(y_test, y_pred, target_names=le_label.classes_)}')

# Save all three artifacts separately
MODEL_PATH = os.path.join(SCRIPT_DIR, 'knn_model.pkl')
SCALER_PATH = os.path.join(SCRIPT_DIR, 'scaler.pkl')
ENCODERS_PATH = os.path.join(SCRIPT_DIR, 'encoders.pkl')

joblib.dump(knn, MODEL_PATH)
print(f'  Saved: {MODEL_PATH}')

joblib.dump(scaler, SCALER_PATH)
print(f'  Saved: {SCALER_PATH}')

encoders_dict = {
    'influencer_category': le_inf,
    'campaign_category': le_camp,
    'match_label': le_label,
}
joblib.dump(encoders_dict, ENCODERS_PATH)
print(f'  Saved: {ENCODERS_PATH}')

# Save evaluation results
eval_path = os.path.join(SCRIPT_DIR, 'evaluation_results.txt')
with open(eval_path, 'w') as f:
    f.write('=' * 60 + '\n KNN MODEL EVALUATION RESULTS\n' + '=' * 60 + '\n\n')
    f.write(f'Accuracy:  {acc:.4f} ({acc*100:.2f}%)\n')
    f.write(f'Precision: {prec:.4f} ({prec*100:.2f}%)\n')
    f.write(f'Recall:    {rec:.4f} ({rec*100:.2f}%)\n')
    f.write(f'F1 Score:  {f1:.4f} ({f1*100:.2f}%)\n\n')
    f.write(f'Confusion Matrix:\n{cm}\n\n')
    f.write('Classification Report:\n')
    f.write(classification_report(y_test, y_pred, target_names=le_label.classes_))
print(f'  Saved: {eval_path}')
print('\nDone!')
