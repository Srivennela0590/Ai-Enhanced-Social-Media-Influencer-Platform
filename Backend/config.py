import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'influenceai-flask-secret-key-2024')
    SQLALCHEMY_DATABASE_URI = os.getenv(
    'DATABASE_URL',
    'sqlite:///influenceai.db'
)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 10,
        'pool_recycle': 3600,
        'pool_pre_ping': True,
    }
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'influenceai-jwt-secret-2024')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    JWT_TOKEN_LOCATION = ['headers']
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10 MB
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
