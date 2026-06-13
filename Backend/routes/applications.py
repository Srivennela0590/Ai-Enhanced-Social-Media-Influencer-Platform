from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import db
from models.application import Application
from models.influencer import Influencer
from models.campaign import Campaign
from models.brand import Brand
from models.collaboration import Collaboration

applications_bp = Blueprint('applications', __name__)


@applications_bp.route('', methods=['GET'])
@jwt_required()
def list_applications():
    user_id = get_jwt_identity()
    claims = get_jwt()
    status_filter = request.args.get('status')
    campaign_filter = request.args.get('campaignId')

    if claims.get('role') == 'influencer':
        influencer = Influencer.query.filter_by(user_id=user_id).first()
        if not influencer:
            return jsonify(success=True, data=[]), 200
        query = Application.query.filter_by(influencer_id=influencer.id)
    else:
        brand = Brand.query.filter_by(user_id=user_id).first()
        if not brand:
            return jsonify(success=True, data=[]), 200
        campaign_ids = [c.id for c in brand.campaigns.all()]
        query = Application.query.filter(Application.campaign_id.in_(campaign_ids))

    if status_filter:
        query = query.filter(Application.status == status_filter)
    if campaign_filter:
        query = query.filter(Application.campaign_id == campaign_filter)

    apps = query.order_by(Application.created_at.desc()).all()
    return jsonify(success=True, data=[a.to_dict() for a in apps]), 200


@applications_bp.route('', methods=['POST'])
@jwt_required()
def create_application():
    claims = get_jwt()
    if claims.get('role') != 'influencer':
        return jsonify(success=False, error='Influencer role required'), 403

    data = request.get_json()
    user_id = get_jwt_identity()
    influencer = Influencer.query.filter_by(user_id=user_id).first()
    if not influencer:
        return jsonify(success=False, error='Profile not found'), 404

    campaign_id = data.get('campaignId')
    campaign = Campaign.query.get(campaign_id)
    if not campaign:
        return jsonify(success=False, error='Campaign not found'), 404

    existing = Application.query.filter_by(campaign_id=campaign_id, influencer_id=influencer.id).first()
    if existing:
        return jsonify(success=False, error='Already applied to this campaign'), 409

    app = Application(
        campaign_id=campaign_id,
        campaign_title=campaign.title,
        influencer_id=influencer.id,
        influencer_name=influencer.display_name,
        influencer_followers=influencer.total_followers,
        influencer_engagement=influencer.engagement_rate,
        influencer_category=influencer.category,
        status='pending',
        proposal=data.get('proposal', ''),
        proposed_rate=data.get('proposedRate', influencer.price_per_post or 0),
    )
    db.session.add(app)
    db.session.commit()
    return jsonify(success=True, data=app.to_dict()), 201


@applications_bp.route('/<app_id>/status', methods=['PUT'])
@jwt_required()
def update_status(app_id):
    claims = get_jwt()
    if claims.get('role') != 'brand':
        return jsonify(success=False, error='Brand role required'), 403

    data = request.get_json()
    new_status = data.get('status')
    if new_status not in ('accepted', 'rejected'):
        return jsonify(success=False, error='Status must be accepted or rejected'), 400

    app = Application.query.get(app_id)
    if not app:
        return jsonify(success=False, error='Application not found'), 404

    app.status = new_status
    db.session.flush()

    if new_status == 'accepted':
        campaign = Campaign.query.get(app.campaign_id)
        user_id = get_jwt_identity()
        brand = Brand.query.filter_by(user_id=user_id).first()
        if campaign and brand:
            collab = Collaboration(
                campaign_id=app.campaign_id,
                campaign_title=campaign.title,
                brand_id=brand.id,
                brand_name=brand.company_name,
                influencer_id=app.influencer_id,
                influencer_name=app.influencer_name,
                status='in_progress',
                agreed_rate=app.proposed_rate,
                deliverables='As per campaign requirements',
                start_date=campaign.start_date,
                end_date=campaign.end_date,
            )
            db.session.add(collab)

    db.session.commit()
    return jsonify(success=True, message=f'Application {new_status}'), 200


@applications_bp.route('/<app_id>/withdraw', methods=['POST'])
@jwt_required()
def withdraw(app_id):
    claims = get_jwt()
    if claims.get('role') != 'influencer':
        return jsonify(success=False, error='Influencer role required'), 403

    app = Application.query.get(app_id)
    if not app:
        return jsonify(success=False, error='Application not found'), 404

    app.status = 'withdrawn'
    db.session.commit()
    return jsonify(success=True, message='Application withdrawn'), 200
