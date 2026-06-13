import uuid
import json
from datetime import datetime, timezone
from models import db


class Influencer(db.Model):
    __tablename__ = 'influencers'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'),
                        nullable=False, unique=True, index=True)
    email = db.Column(db.String(255), nullable=False)
    display_name = db.Column(db.String(255), nullable=False)
    bio = db.Column(db.Text, nullable=True)
    niche = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(100), nullable=False, index=True)
    total_followers = db.Column(db.Integer, default=0, nullable=False)
    engagement_rate = db.Column(db.Numeric(5, 2), default=0, nullable=False)
    price_per_post = db.Column(db.Numeric(10, 2), nullable=True)
    location = db.Column(db.String(255), nullable=True, index=True)
    profile_image = db.Column(db.String(500), nullable=True)
    verified = db.Column(db.Boolean, default=False, nullable=False)
    audience_age_group = db.Column(db.String(50), default='18-34')
    audience_gender = db.Column(db.String(50), default='Mixed')
    previous_campaign_score = db.Column(db.Integer, default=0, nullable=False)
    social_links = db.Column(db.Text, nullable=True)  # JSON string
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    applications = db.relationship('Application', backref='influencer', lazy='dynamic', cascade='all, delete-orphan')
    collaborations = db.relationship('Collaboration', backref='influencer', lazy='dynamic')

    def get_social_links(self):
        if self.social_links:
            try:
                return json.loads(self.social_links)
            except (json.JSONDecodeError, TypeError):
                return []
        return []

    def set_social_links(self, links):
        self.social_links = json.dumps(links) if links else '[]'

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'email': self.email,
            'displayName': self.display_name,
            'bio': self.bio,
            'niche': self.niche,
            'category': self.category,
            'totalFollowers': self.total_followers,
            'engagementRate': float(self.engagement_rate) if self.engagement_rate else 0,
            'pricePerPost': float(self.price_per_post) if self.price_per_post else 0,
            'location': self.location,
            'profileImage': self.profile_image,
            'verified': self.verified,
            'audienceAgeGroup': self.audience_age_group,
            'audienceGender': self.audience_gender,
            'previousCampaignScore': self.previous_campaign_score,
            'socialLinks': self.get_social_links(),
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }
