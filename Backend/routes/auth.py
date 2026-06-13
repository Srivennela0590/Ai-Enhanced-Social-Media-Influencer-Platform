from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt
)
from models import db
from models.user import User
from models.brand import Brand
from models.influencer import Influencer

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify(success=False, error='Request body required'), 400

    required = ['email', 'password', 'firstName', 'lastName', 'role']
    for field in required:
        if field not in data or not data[field]:
            return jsonify(success=False, error=f'{field} is required'), 400

    if data['role'] not in ('brand', 'influencer'):
        return jsonify(success=False, error='Role must be brand or influencer'), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify(success=False, error='Email already registered'), 409

    if len(data['password']) < 8:
        return jsonify(success=False, error='Password must be at least 8 characters'), 400

    user = User(
        email=data['email'],
        role=data['role'],
        first_name=data['firstName'],
        last_name=data['lastName'],
    )
    user.set_password(data['password'])
    db.session.add(user)
    db.session.flush()

    if data['role'] == 'brand':
        brand = Brand(
            user_id=user.id,
            company_name=data.get('companyName', f"{data['firstName']}'s Company"),
            industry=data.get('industry', 'Technology'),
            website=data.get('website', ''),
        )
        db.session.add(brand)
    else:
        influencer = Influencer(
            user_id=user.id,
            email=data['email'],
            display_name=data.get('displayName', f"{data['firstName']} {data['lastName']}"),
            niche=data.get('niche', 'lifestyle'),
            category=data.get('niche', 'Lifestyle').title(),
        )
        db.session.add(influencer)

    db.session.commit()

    access_token = create_access_token(identity=user.id, additional_claims={'role': user.role, 'email': user.email})
    refresh_token = create_refresh_token(identity=user.id, additional_claims={'role': user.role})

    return jsonify(
        success=True,
        data={
            'user': user.to_dict(),
            'accessToken': access_token,
            'refreshToken': refresh_token,
        }
    ), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify(success=False, error='Email and password required'), 400

    user = User.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        return jsonify(success=False, error='Invalid email or password'), 401

    if not user.is_active:
        return jsonify(success=False, error='Account is deactivated'), 403

    access_token = create_access_token(identity=user.id, additional_claims={'role': user.role, 'email': user.email})
    refresh_token = create_refresh_token(identity=user.id, additional_claims={'role': user.role})

    return jsonify(
        success=True,
        data={
            'user': user.to_dict(),
            'accessToken': access_token,
            'refreshToken': refresh_token,
        }
    ), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    claims = get_jwt()
    access_token = create_access_token(identity=user_id, additional_claims={'role': claims.get('role'), 'email': claims.get('email')})
    return jsonify(success=True, data={'accessToken': access_token}), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify(success=False, error='User not found'), 404
    return jsonify(success=True, data={'user': user.to_dict()}), 200


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify(success=True, message='Logged out successfully'), 200
