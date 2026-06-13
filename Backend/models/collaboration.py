import uuid
from datetime import datetime, timezone
from models import db


class Collaboration(db.Model):
    __tablename__ = 'collaborations'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    campaign_id = db.Column(db.String(36), db.ForeignKey('campaigns.id'), nullable=False, index=True)
    campaign_title = db.Column(db.String(255), nullable=True)
    brand_id = db.Column(db.String(36), db.ForeignKey('brands.id'), nullable=False, index=True)
    brand_name = db.Column(db.String(255), nullable=True)
    influencer_id = db.Column(db.String(36), db.ForeignKey('influencers.id'), nullable=False, index=True)
    influencer_name = db.Column(db.String(255), nullable=True)
    status = db.Column(db.Enum('negotiation', 'in_progress', 'content_review', 'completed', 'disputed',
                               name='collab_status'), default='negotiation', nullable=False, index=True)
    agreed_rate = db.Column(db.Numeric(10, 2), nullable=False)
    deliverables = db.Column(db.Text, nullable=True)
    start_date = db.Column(db.String(20), nullable=True)
    end_date = db.Column(db.String(20), nullable=True)
    rating = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'campaignId': self.campaign_id,
            'campaignTitle': self.campaign_title,
            'brandId': self.brand_id,
            'brandName': self.brand_name,
            'influencerId': self.influencer_id,
            'influencerName': self.influencer_name,
            'status': self.status,
            'agreedRate': float(self.agreed_rate) if self.agreed_rate else 0,
            'deliverables': self.deliverables,
            'startDate': self.start_date,
            'endDate': self.end_date,
            'rating': self.rating,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }
