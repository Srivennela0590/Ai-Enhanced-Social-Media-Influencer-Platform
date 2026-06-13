from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from models.user import User
from models.brand import Brand
from models.influencer import Influencer
from models.campaign import Campaign
from models.application import Application
from models.invitation import Invitation
from models.collaboration import Collaboration
