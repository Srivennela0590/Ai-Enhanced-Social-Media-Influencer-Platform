import uuid
from datetime import datetime, timezone
from models import db


class Invitation(db.Model):
    __tablename__ = 'invitations'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    campaign_id = db.Column(db.String(36), db.ForeignKey('campaigns.id', ondelete='CASCADE'),
                            nullable=False, index=True)
    campaign_title = db.Column(db.String(255), nullable=True)
    brand_id = db.Column(db.String(36), db.ForeignKey('brands.id', ondelete='CASCADE'),
                         nullable=False, index=True)
    brand_name = db.Column(db.String(255), nullable=True)
    influencer_id = db.Column(db.String(36), db.ForeignKey('influencers.id', ondelete='CASCADE'),
                              nullable=False, index=True)
    influencer_name = db.Column(db.String(255), nullable=True)
    message = db.Column(db.Text, nullable=True)
    status = db.Column(db.Enum('pending', 'accepted', 'declined',
                               name='invitation_status'), default='pending', nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'campaignId': self.campaign_id,
            'campaignTitle': self.campaign_title,
            'brandId': self.brand_id,
            'brandName': self.brand_name,
            'influencerId': self.influencer_id,
            'influencerName': self.influencer_name,
            'message': self.message,
            'status': self.status,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }
