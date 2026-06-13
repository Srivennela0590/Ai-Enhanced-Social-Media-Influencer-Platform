#!/usr/bin/env python3
"""
Quick generator — creates knn_model.pkl, scaler.pkl, encoders.pkl
from the CSV dataset. Run this once to produce all artifacts.

Usage:
    cd ML
    pip install pandas scikit-learn joblib numpy
    python generate_models.py
"""

import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib

DIR = os.path.dirname(os.path.abspath(__file__))
CSV = os.path.join(DIR, 'influencer_campaign_dataset.csv')

df = pd.read_csv(CSV)
for c in ['followers_count','engagement_rate','audience_match_score','previous_performance']:
    df[c] = pd.to_numeric(df[c], errors='coerce')
    df[c].fillna(df[c].median(), inplace=True)
for c in ['influencer_category','campaign_category']:
    df[c].fillna(df[c].mode()[0], inplace=True)
df.dropna(subset=['match_label'], inplace=True)

le_inf = LabelEncoder()
le_camp = LabelEncoder()
le_label = LabelEncoder()
df['ie'] = le_inf.fit_transform(df['influencer_category'])
df['ce'] = le_camp.fit_transform(df['campaign_category'])
df['le'] = le_label.fit_transform(df['match_label'])

X = df[['ie','followers_count','engagement_rate','ce','audience_match_score','previous_performance']].values
y = df['le'].values

scaler = StandardScaler()
Xs = scaler.fit_transform(X)
Xtr, Xte, ytr, yte = train_test_split(Xs, y, test_size=0.2, random_state=42, stratify=y)

knn = KNeighborsClassifier(n_neighbors=7, weights='distance', metric='euclidean')
knn.fit(Xtr, ytr)

acc = accuracy_score(yte, knn.predict(Xte))

joblib.dump(knn, os.path.join(DIR, 'knn_model.pkl'))
joblib.dump(scaler, os.path.join(DIR, 'scaler.pkl'))
joblib.dump({
    'influencer_category': le_inf,
    'campaign_category': le_camp,
    'match_label': le_label,
}, os.path.join(DIR, 'encoders.pkl'))

print(f'Accuracy: {acc:.4f}')
print(f'Saved: knn_model.pkl, scaler.pkl, encoders.pkl')
