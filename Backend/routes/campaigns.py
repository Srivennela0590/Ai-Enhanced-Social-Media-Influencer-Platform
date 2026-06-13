import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import db
from models.campaign import Campaign
from models.brand import Brand
from models.application import Application

campaigns_bp = Blueprint('campaigns', __name__)


@campaigns_bp.route('', methods=['GET'])
def list_campaigns():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('limit', 20, type=int)
    status = request.args.get('status')
    category = request.args.get('category')
    search = request.args.get('search')

    query = Campaign.query
    if status:
        query = query.filter(Campaign.status == status)
    if category:
        query = query.filter(Campaign.category == category)
    if search:
        query = query.filter(Campaign.title.ilike(f'%{search}%'))

    query = query.order_by(Campaign.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify(
        success=True,
        data=[c.to_dict() for c in pagination.items],
        pagination={'page': page, 'limit': per_page, 'total': pagination.total, 'pages': pagination.pages}
    ), 200


@campaigns_bp.route('/<campaign_id>', methods=['GET'])
def get_campaign(campaign_id):
    campaign = Campaign.query.get(campaign_id)
    if not campaign:
        return jsonify(success=False, error='Campaign not found'), 404
    applicant_count = Application.query.filter_by(campaign_id=campaign_id).count()
    data = campaign.to_dict()
    data['applicantCount'] = applicant_count
    return jsonify(success=True, data=data), 200


@campaigns_bp.route('', methods=['POST'])
@jwt_required()
def create_campaign():
    claims = get_jwt()
    if claims.get('role') != 'brand':
        return jsonify(success=False, error='Brand role required'), 403

    user_id = get_jwt_identity()
    brand = Brand.query.filter_by(user_id=user_id).first()
    if not brand:
        return jsonify(success=False, error='Brand profile not found'), 404

    data = request.get_json()
    if not data or not data.get('title') or not data.get('description'):
        return jsonify(success=False, error='Title and description required'), 400

    campaign = Campaign(
        brand_id=brand.id,
        brand_name=brand.company_name,
        title=data['title'],
        description=data['description'],
        category=data.get('category', 'General'),
        budget=data.get('budget', 0),
        target_audience=data.get('targetAudience', ''),
        requirements=data.get('requirements', ''),
        start_date=data.get('startDate', ''),
        end_date=data.get('endDate', ''),
        status=data.get('status', 'draft'),
        platforms=json.dumps(data.get('platforms', [])),
    )
    db.session.add(campaign)
    db.session.commit()
    return jsonify(success=True, data=campaign.to_dict()), 201


@campaigns_bp.route('/<campaign_id>', methods=['PUT'])
@jwt_required()
def update_campaign(campaign_id):
    claims = get_jwt()
    if claims.get('role') != 'brand':
        return jsonify(success=False, error='Brand role required'), 403

    campaign = Campaign.query.get(campaign_id)
    if not campaign:
        return jsonify(success=False, error='Campaign not found'), 404

    user_id = get_jwt_identity()
    brand = Brand.query.filter_by(user_id=user_id).first()
    if not brand or campaign.brand_id != brand.id:
        return jsonify(success=False, error='Not authorized'), 403

    data = request.get_json()
    if data.get('title'):
        campaign.title = data['title']
    if data.get('description'):
        campaign.description = data['description']
    if data.get('category'):
        campaign.category = data['category']
    if 'budget' in data:
        campaign.budget = data['budget']
    if 'targetAudience' in data:
        campaign.target_audience = data['targetAudience']
    if 'requirements' in data:
        campaign.requirements = data['requirements']
    if 'startDate' in data:
        campaign.start_date = data['startDate']
    if 'endDate' in data:
        campaign.end_date = data['endDate']
    if 'status' in data:
        campaign.status = data['status']
    if 'platforms' in data:
        campaign.platforms = json.dumps(data['platforms'])

    db.session.commit()
    return jsonify(success=True, data=campaign.to_dict()), 200


@campaigns_bp.route('/<campaign_id>', methods=['DELETE'])
@jwt_required()
def delete_campaign(campaign_id):
    claims = get_jwt()
    if claims.get('role') != 'brand':
        return jsonify(success=False, error='Brand role required'), 403

    campaign = Campaign.query.get(campaign_id)
    if not campaign:
        return jsonify(success=False, error='Campaign not found'), 404

    user_id = get_jwt_identity()
    brand = Brand.query.filter_by(user_id=user_id).first()
    if not brand or campaign.brand_id != brand.id:
        return jsonify(success=False, error='Not authorized'), 403

    db.session.delete(campaign)
    db.session.commit()
    return jsonify(success=True, message='Campaign deleted'), 200
