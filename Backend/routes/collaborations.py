from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import db
from models.collaboration import Collaboration
from models.brand import Brand
from models.influencer import Influencer

collaborations_bp = Blueprint('collaborations', __name__)


@collaborations_bp.route('', methods=['GET'])
@jwt_required()
def list_collaborations():
    user_id = get_jwt_identity()
    claims = get_jwt()

    if claims.get('role') == 'brand':
        brand = Brand.query.filter_by(user_id=user_id).first()
        if not brand:
            return jsonify(success=True, data=[]), 200
        collabs = Collaboration.query.filter_by(brand_id=brand.id)\
            .order_by(Collaboration.created_at.desc()).all()
    else:
        influencer = Influencer.query.filter_by(user_id=user_id).first()
        if not influencer:
            return jsonify(success=True, data=[]), 200
        collabs = Collaboration.query.filter_by(influencer_id=influencer.id)\
            .order_by(Collaboration.created_at.desc()).all()

    return jsonify(success=True, data=[c.to_dict() for c in collabs]), 200


@collaborations_bp.route('/<collab_id>/status', methods=['PUT'])
@jwt_required()
def update_status(collab_id):
    data = request.get_json()
    new_status = data.get('status')
    valid = ['negotiation', 'in_progress', 'content_review', 'completed', 'disputed']
    if new_status not in valid:
        return jsonify(success=False, error=f'Status must be one of: {", ".join(valid)}'), 400

    collab = Collaboration.query.get(collab_id)
    if not collab:
        return jsonify(success=False, error='Collaboration not found'), 404

    collab.status = new_status
    db.session.commit()
    return jsonify(success=True, message=f'Status updated to {new_status}'), 200
