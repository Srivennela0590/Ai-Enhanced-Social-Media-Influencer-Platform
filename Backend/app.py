import os
import sys
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    db.init_app(app)
    JWTManager(app)

    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # ── Register ALL blueprints ───────────────────────────────
    from routes.auth import auth_bp
    from routes.brands import brands_bp
    from routes.campaigns import campaigns_bp
    from routes.influencers import influencers_bp
    from routes.applications import applications_bp
    from routes.invitations import invitations_bp
    from routes.collaborations import collaborations_bp
    from routes.ml import ml_bp
    from routes.ai import ai_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(brands_bp, url_prefix='/api/brands')
    app.register_blueprint(campaigns_bp, url_prefix='/api/campaigns')
    app.register_blueprint(influencers_bp, url_prefix='/api/influencers')
    app.register_blueprint(applications_bp, url_prefix='/api/applications')
    app.register_blueprint(invitations_bp, url_prefix='/api/invitations')
    app.register_blueprint(collaborations_bp, url_prefix='/api/collaborations')
    app.register_blueprint(ml_bp, url_prefix='/api/ml')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')

    # ── Serve uploaded files ──────────────────────────────────
    @app.route('/uploads/<filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # ── Health check ──────────────────────────────────────────
    @app.route('/api/health')
    def health():
        return jsonify(status='ok', message='InfluenceAI Flask API is running'), 200

    # ── Error handlers ────────────────────────────────────────
    @app.errorhandler(404)
    def not_found(e):
        return jsonify(success=False, error='Resource not found'), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify(success=False, error='Internal server error'), 500

    # ── Create tables, seed data, validate ML artifacts ───────
    with app.app_context():
        db.create_all()

        # Seed demo data
        from utils.seed import seed_database
        try:
            seed_database()
        except Exception as e:
            print(f'  [SEED] Warning: {e}')

        # Validate ML artifacts at startup
        from services.ml_service import validate_artifacts
        missing = validate_artifacts()
        if missing:
            print(f'\n  [ML] WARNING: Missing ML artifacts: {missing}')
            print(f'  [ML] The /api/ml/predict endpoint will auto-train on first request.')
            print(f'  [ML] To train manually: cd ML && python train_model.py\n')
        else:
            print(f'  [ML] All artifacts loaded: knn_model.pkl, scaler.pkl, encoders.pkl')

    return app


if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv('PORT', 5000))
    print(f'\n  InfluenceAI Flask Backend')
    print(f'  Running on http://127.0.0.1:{port}')
    print(f'  API Base: http://127.0.0.1:{port}/api')
    print(f'  Registered routes:')
    print(f'    /api/auth      (register, login, logout, refresh, me)')
    print(f'    /api/brands    (CRUD)')
    print(f'    /api/campaigns (CRUD)')
    print(f'    /api/influencers (search, profile, upload)')
    print(f'    /api/applications (apply, accept, reject, withdraw)')
    print(f'    /api/invitations  (invite, accept, decline)')
    print(f'    /api/collaborations (status updates)')
    print(f'    /api/ml        (predict, model-info)')
    print(f'    /api/ai        (caption, proposal, outreach)\n')
    app.run(debug=True, host='0.0.0.0', port=port)
