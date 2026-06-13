import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from werkzeug.utils import secure_filename
from models import db
from models.influencer import Influencer

influencers_bp = Blueprint('influencers', __name__)

ALLOWED = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED


@influencers_bp.route('', methods=['GET'])
def search_influencers():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('limit', 20, type=int)
    category = request.args.get('category')
    location = request.args.get('location')
    min_followers = request.args.get('minFollowers', type=int)
    max_rate = request.args.get('maxRate', type=float)
    search = request.args.get('search')
    sort_by = request.args.get('sort', 'followers')

    query = Influencer.query
    if category and category != 'All':
        query = query.filter(Influencer.category == category)
    if location:
        query = query.filter(Influencer.location.ilike(f'%{location}%'))
    if min_followers:
        query = query.filter(Influencer.total_followers >= min_followers)
    if max_rate:
        query = query.filter(Influencer.price_per_post <= max_rate)
    if search:
        query = query.filter(
            db.or_(
                Influencer.display_name.ilike(f'%{search}%'),
                Influencer.category.ilike(f'%{search}%'),
                Influencer.niche.ilike(f'%{search}%'),
            )
        )

    if sort_by == 'engagement':
        query = query.order_by(Influencer.engagement_rate.desc())
    elif sort_by == 'score':
        query = query.order_by(Influencer.previous_campaign_score.desc())
    else:
        query = query.order_by(Influencer.total_followers.desc())

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify(
        success=True,
        data=[i.to_dict() for i in pagination.items],
        pagination={'page': page, 'limit': per_page, 'total': pagination.total, 'pages': pagination.pages}
    ), 200


@influencers_bp.route('/<influencer_id>', methods=['GET'])
def get_influencer(influencer_id):
    influencer = Influencer.query.get(influencer_id)
    if not influencer:
        return jsonify(success=False, error='Influencer not found'), 404
    return jsonify(success=True, data=influencer.to_dict()), 200


@influencers_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    claims = get_jwt()
    if claims.get('role') != 'influencer':
        return jsonify(success=False, error='Influencer role required'), 403

    user_id = get_jwt_identity()
    influencer = Influencer.query.filter_by(user_id=user_id).first()
    if not influencer:
        return jsonify(success=False, error='Profile not found'), 404

    data = request.get_json()
    for field, attr in [
        ('displayName', 'display_name'), ('bio', 'bio'), ('category', 'category'),
        ('niche', 'niche'), ('location', 'location'), ('audienceAgeGroup', 'audience_age_group'),
        ('audienceGender', 'audience_gender'),
    ]:
        if field in data:
            setattr(influencer, attr, data[field])

    if 'totalFollowers' in data:
        influencer.total_followers = int(data['totalFollowers'])
    if 'engagementRate' in data:
        influencer.engagement_rate = float(data['engagementRate'])
    if 'pricePerPost' in data:
        influencer.price_per_post = float(data['pricePerPost'])
    if 'socialLinks' in data:
        influencer.set_social_links(data['socialLinks'])

    db.session.commit()
    return jsonify(success=True, data=influencer.to_dict()), 200


@influencers_bp.route('/upload-image', methods=['POST'])
@jwt_required()
def upload_image():
    claims = get_jwt()
    if claims.get('role') != 'influencer':
        return jsonify(success=False, error='Influencer role required'), 403

    if 'file' not in request.files:
        return jsonify(success=False, error='No file provided'), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify(success=False, error='No file selected'), 400

    if not allowed_file(file.filename):
        return jsonify(success=False, error='File type not allowed. Use jpg, jpeg, or png'), 400

    upload_dir = current_app.config['UPLOAD_FOLDER']
    os.makedirs(upload_dir, exist_ok=True)

    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(upload_dir, filename)
    file.save(filepath)

    image_url = f"/uploads/{filename}"

    user_id = get_jwt_identity()
    influencer = Influencer.query.filter_by(user_id=user_id).first()
    if influencer:
        influencer.profile_image = image_url
        db.session.commit()

    return jsonify(success=True, data={'url': image_url, 'filename': filename}), 200
