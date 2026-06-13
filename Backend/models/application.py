import uuid
from datetime import datetime, timezone
from models import db


class Application(db.Model):
    __tablename__ = 'applications'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    campaign_id = db.Column(db.String(36), db.ForeignKey('campaigns.id', ondelete='CASCADE'),
                            nullable=False, index=True)
    campaign_title = db.Column(db.String(255), nullable=True)
    influencer_id = db.Column(db.String(36), db.ForeignKey('influencers.id', ondelete='CASCADE'),
                              nullable=False, index=True)
    influencer_name = db.Column(db.String(255), nullable=True)
    influencer_followers = db.Column(db.Integer, nullable=True)
    influencer_engagement = db.Column(db.Numeric(5, 2), nullable=True)
    influencer_category = db.Column(db.String(100), nullable=True)
    status = db.Column(db.Enum('pending', 'accepted', 'rejected', 'withdrawn',
                               name='application_status'), default='pending', nullable=False, index=True)
    proposal = db.Column(db.Text, nullable=False)
    proposed_rate = db.Column(db.Numeric(10, 2), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        db.UniqueConstraint('campaign_id', 'influencer_id', name='uq_campaign_influencer'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'campaignId': self.campaign_id,
            'campaignTitle': self.campaign_title,
            'influencerId': self.influencer_id,
            'influencerName': self.influencer_name,
            'influencerFollowers': self.influencer_followers,
            'influencerEngagement': float(self.influencer_engagement) if self.influencer_engagement else 0,
            'influencerCategory': self.influencer_category,
            'status': self.status,
            'proposal': self.proposal,
            'proposedRate': float(self.proposed_rate) if self.proposed_rate else 0,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }
