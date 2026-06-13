from flask import Blueprint, request, jsonify
from services.ai_service import generate_caption, generate_proposal, generate_outreach

ai_bp = Blueprint('ai', __name__)


@ai_bp.route('/caption', methods=['POST'])
def caption():
    data = request.get_json()
    if not data or not data.get('topic'):
        return jsonify(success=False, error='Topic is required'), 400

    result = generate_caption(
        platform=data.get('platform', 'Instagram'),
        niche=data.get('niche', 'Technology'),
        topic=data['topic'],
        tone=data.get('tone', 'professional'),
        include_hashtags=data.get('includeHashtags', True),
        include_emojis=data.get('includeEmojis', True),
    )
    return jsonify(success=True, data=result), 200


@ai_bp.route('/proposal', methods=['POST'])
def proposal():
    data = request.get_json()
    if not data or not data.get('campaignTitle'):
        return jsonify(success=False, error='Campaign title is required'), 400

    result = generate_proposal(
        influencer_name=data.get('influencerName', 'Creator'),
        influencer_niche=data.get('influencerNiche', 'Lifestyle'),
        influencer_followers=data.get('influencerFollowers', 10000),
        campaign_title=data['campaignTitle'],
        campaign_category=data.get('campaignCategory', 'General'),
        campaign_description=data.get('campaignDescription', ''),
        proposed_rate=data.get('proposedRate', 500),
    )
    return jsonify(success=True, data=result), 200


@ai_bp.route('/outreach', methods=['POST'])
def outreach():
    data = request.get_json()
    if not data or not data.get('campaignTitle'):
        return jsonify(success=False, error='Campaign title is required'), 400

    result = generate_outreach(
        brand_name=data.get('brandName', 'Brand'),
        influencer_name=data.get('influencerName', 'Creator'),
        influencer_niche=data.get('influencerNiche', 'Lifestyle'),
        influencer_followers=data.get('influencerFollowers', 10000),
        campaign_title=data['campaignTitle'],
        campaign_goal=data.get('campaignGoal', 'Increase brand awareness'),
        message_type=data.get('messageType', 'initial'),
    )
    return jsonify(success=True, data=result), 200
