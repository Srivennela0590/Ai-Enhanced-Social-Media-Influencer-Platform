import uuid
import json
from datetime import datetime, timezone
from models import db


class Campaign(db.Model):
    __tablename__ = 'campaigns'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    brand_id = db.Column(db.String(36), db.ForeignKey('brands.id', ondelete='CASCADE'),
                         nullable=False, index=True)
    brand_name = db.Column(db.String(255), nullable=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100), nullable=False, index=True)
    budget = db.Column(db.Numeric(12, 2), nullable=False)
    target_audience = db.Column(db.String(500), nullable=True)
    requirements = db.Column(db.Text, nullable=True)
    start_date = db.Column(db.String(20), nullable=True)
    end_date = db.Column(db.String(20), nullable=True)
    status = db.Column(db.Enum('draft', 'active', 'paused', 'completed', 'cancelled',
                               name='campaign_status'), default='draft', nullable=False, index=True)
    platforms = db.Column(db.Text, nullable=True)  # JSON string
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    applications = db.relationship('Application', backref='campaign', lazy='dynamic', cascade='all, delete-orphan')
    invitations = db.relationship('Invitation', backref='campaign', lazy='dynamic', cascade='all, delete-orphan')
    collaborations = db.relationship('Collaboration', backref='campaign', lazy='dynamic')

    def get_platforms(self):
        if self.platforms:
            try:
                return json.loads(self.platforms)
            except (json.JSONDecodeError, TypeError):
                return []
        return []

    def to_dict(self):
        return {
            'id': self.id,
            'brandId': self.brand_id,
            'brandName': self.brand_name,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'budget': float(self.budget) if self.budget else 0,
            'targetAudience': self.target_audience,
            'requirements': self.requirements,
            'startDate': self.start_date,
            'endDate': self.end_date,
            'status': self.status,
            'platforms': self.get_platforms(),
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }
