from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import db
from models.invitation import Invitation
from models.brand import Brand
from models.influencer import Influencer
from models.campaign import Campaign

invitations_bp = Blueprint('invitations', __name__)


@invitations_bp.route('', methods=['GET'])
@jwt_required()
def list_invitations():
    user_id = get_jwt_identity()
    claims = get_jwt()

    if claims.get('role') == 'influencer':
        influencer = Influencer.query.filter_by(user_id=user_id).first()
        if not influencer:
            return jsonify(success=True, data=[]), 200
        invitations = Invitation.query.filter_by(influencer_id=influencer.id)\
            .order_by(Invitation.created_at.desc()).all()
    else:
        brand = Brand.query.filter_by(user_id=user_id).first()
        if not brand:
            return jsonify(success=True, data=[]), 200
        invitations = Invitation.query.filter_by(brand_id=brand.id)\
            .order_by(Invitation.created_at.desc()).all()

    return jsonify(success=True, data=[i.to_dict() for i in invitations]), 200


@invitations_bp.route('', methods=['POST'])
@jwt_required()
def create_invitation():
    claims = get_jwt()
    if claims.get('role') != 'brand':
        return jsonify(success=False, error='Brand role required'), 403

    data = request.get_json()
    user_id = get_jwt_identity()
    brand = Brand.query.filter_by(user_id=user_id).first()
    if not brand:
        return jsonify(success=False, error='Brand not found'), 404

    campaign = Campaign.query.get(data.get('campaignId'))
    if not campaign:
        return jsonify(success=False, error='Campaign not found'), 404

    influencer = Influencer.query.get(data.get('influencerId'))
    if not influencer:
        return jsonify(success=False, error='Influencer not found'), 404

    invitation = Invitation(
        campaign_id=campaign.id,
        campaign_title=campaign.title,
        brand_id=brand.id,
        brand_name=brand.company_name,
        influencer_id=influencer.id,
        influencer_name=influencer.display_name,
        message=data.get('message', ''),
        status='pending',
    )
    db.session.add(invitation)
    db.session.commit()
    return jsonify(success=True, data=invitation.to_dict()), 201


@invitations_bp.route('/<invitation_id>/status', methods=['PUT'])
@jwt_required()
def update_status(invitation_id):
    data = request.get_json()
    new_status = data.get('status')
    if new_status not in ('accepted', 'declined'):
        return jsonify(success=False, error='Status must be accepted or declined'), 400

    invitation = Invitation.query.get(invitation_id)
    if not invitation:
        return jsonify(success=False, error='Invitation not found'), 404

    invitation.status = new_status
    db.session.commit()
    return jsonify(success=True, message=f'Invitation {new_status}'), 200
