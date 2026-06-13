from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import db
from models.brand import Brand
from models.user import User

brands_bp = Blueprint('brands', __name__)


@brands_bp.route('', methods=['GET'])
def list_brands():
    """GET /api/brands — List all brands with optional search."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('limit', 20, type=int)
    industry = request.args.get('industry')
    search = request.args.get('search')

    query = Brand.query
    if industry:
        query = query.filter(Brand.industry == industry)
    if search:
        query = query.filter(Brand.company_name.ilike(f'%{search}%'))

    query = query.order_by(Brand.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify(
        success=True,
        data=[b.to_dict() for b in pagination.items],
        pagination={
            'page': page,
            'limit': per_page,
            'total': pagination.total,
            'pages': pagination.pages,
        },
    ), 200


@brands_bp.route('/<brand_id>', methods=['GET'])
def get_brand(brand_id):
    """GET /api/brands/<id> — Get a single brand by ID."""
    brand = Brand.query.get(brand_id)
    if not brand:
        return jsonify(success=False, error='Brand not found'), 404
    return jsonify(success=True, data=brand.to_dict()), 200


@brands_bp.route('', methods=['POST'])
@jwt_required()
def create_brand():
    """POST /api/brands — Create a brand profile (requires auth)."""
    claims = get_jwt()
    if claims.get('role') != 'brand':
        return jsonify(success=False, error='Brand role required'), 403

    user_id = get_jwt_identity()

    existing = Brand.query.filter_by(user_id=user_id).first()
    if existing:
        return jsonify(success=False, error='Brand profile already exists for this user'), 409

    data = request.get_json()
    if not data or not data.get('companyName'):
        return jsonify(success=False, error='companyName is required'), 400

    brand = Brand(
        user_id=user_id,
        company_name=data['companyName'],
        industry=data.get('industry', 'General'),
        website=data.get('website', ''),
        description=data.get('description', ''),
        logo_url=data.get('logoUrl', ''),
        budget=data.get('budget', 0),
    )
    db.session.add(brand)
    db.session.commit()

    return jsonify(success=True, data=brand.to_dict()), 201


@brands_bp.route('/<brand_id>', methods=['PUT'])
@jwt_required()
def update_brand(brand_id):
    """PUT /api/brands/<id> — Update a brand profile (owner only)."""
    brand = Brand.query.get(brand_id)
    if not brand:
        return jsonify(success=False, error='Brand not found'), 404

    user_id = get_jwt_identity()
    if brand.user_id != user_id:
        return jsonify(success=False, error='Not authorized to update this brand'), 403

    data = request.get_json()
    if not data:
        return jsonify(success=False, error='Request body required'), 400

    if 'companyName' in data:
        brand.company_name = data['companyName']
    if 'industry' in data:
        brand.industry = data['industry']
    if 'website' in data:
        brand.website = data['website']
    if 'description' in data:
        brand.description = data['description']
    if 'logoUrl' in data:
        brand.logo_url = data['logoUrl']
    if 'budget' in data:
        brand.budget = data['budget']

    db.session.commit()
    return jsonify(success=True, data=brand.to_dict()), 200


@brands_bp.route('/<brand_id>', methods=['DELETE'])
@jwt_required()
def delete_brand(brand_id):
    """DELETE /api/brands/<id> — Delete a brand profile (owner only)."""
    brand = Brand.query.get(brand_id)
    if not brand:
        return jsonify(success=False, error='Brand not found'), 404

    user_id = get_jwt_identity()
    if brand.user_id != user_id:
        return jsonify(success=False, error='Not authorized to delete this brand'), 403

    db.session.delete(brand)
    db.session.commit()
    return jsonify(success=True, message='Brand deleted successfully'), 200
