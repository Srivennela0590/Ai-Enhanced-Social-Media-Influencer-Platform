import uuid
from datetime import datetime, timezone
from models import db


class Brand(db.Model):
    __tablename__ = 'brands'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'),
                        nullable=False, unique=True, index=True)
    company_name = db.Column(db.String(255), nullable=False)
    industry = db.Column(db.String(100), nullable=False)
    website = db.Column(db.String(500), nullable=True)
    description = db.Column(db.Text, nullable=True)
    logo_url = db.Column(db.String(500), nullable=True)
    budget = db.Column(db.Numeric(12, 2), default=0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    campaigns = db.relationship('Campaign', backref='brand', lazy='dynamic', cascade='all, delete-orphan')
    invitations = db.relationship('Invitation', backref='brand_ref', lazy='dynamic', cascade='all, delete-orphan')
    collaborations = db.relationship('Collaboration', backref='brand_ref', lazy='dynamic')

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'companyName': self.company_name,
            'industry': self.industry,
            'website': self.website,
            'description': self.description,
            'logoUrl': self.logo_url,
            'budget': float(self.budget) if self.budget else 0,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }
