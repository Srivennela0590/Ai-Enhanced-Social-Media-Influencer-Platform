import os
from flask import Blueprint, request, jsonify
from services.ml_service import predict_match, validate_artifacts

ml_bp = Blueprint('ml', __name__)


@ml_bp.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    if not data:
        return jsonify(success=False, error='Request body required'), 400

    required_fields = [
        'influencer_category', 'followers_count', 'engagement_rate',
        'campaign_category', 'audience_match_score', 'previous_performance',
    ]
    for field in required_fields:
        if field not in data:
            return jsonify(success=False, error=f'Missing required field: {field}'), 400

    try:
        followers = int(data['followers_count'])
        engagement = float(data['engagement_rate'])
        audience = int(data['audience_match_score'])
        prev_perf = int(data['previous_performance'])
    except (ValueError, TypeError) as e:
        return jsonify(success=False, error=f'Invalid numeric value: {e}'), 400

    if not (0 <= audience <= 100):
        return jsonify(success=False, error='audience_match_score must be 0-100'), 400
    if not (0 <= prev_perf <= 100):
        return jsonify(success=False, error='previous_performance must be 0-100'), 400

    try:
        result = predict_match(
            influencer_category=str(data['influencer_category']),
            followers_count=followers,
            engagement_rate=engagement,
            campaign_category=str(data['campaign_category']),
            audience_match_score=audience,
            previous_performance=prev_perf,
        )
        return jsonify(success=True, data=result), 200
    except FileNotFoundError as e:
        return jsonify(success=False, error=f'ML model not available: {str(e)}'), 503
    except Exception as e:
        return jsonify(success=False, error=f'Prediction failed: {str(e)}'), 500


@ml_bp.route('/model-info', methods=['GET'])
def model_info():
    missing = validate_artifacts()
    status = 'ready' if not missing else 'missing_artifacts'

    info = {
        'algorithm': 'KNeighborsClassifier',
        'k': 7,
        'weights': 'distance',
        'metric': 'euclidean',
        'accuracy': '93.5%',
        'precision': '93.7%',
        'recall': '93.5%',
        'f1Score': '93.4%',
        'trainingSize': 800,
        'testSize': 200,
        'features': 6,
        'classes': ['Strong Match', 'Moderate Match', 'Low Match'],
        'artifacts': {
            'knn_model.pkl': 'knn_model.pkl' not in missing,
            'scaler.pkl': 'scaler.pkl' not in missing,
            'encoders.pkl': 'encoders.pkl' not in missing,
        },
        'status': status,
    }
    return jsonify(success=True, data=info), 200
