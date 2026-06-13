-- ============================================================
-- InfluenceAI — Complete MySQL Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS influenceai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE influenceai;

-- ======================== USERS ========================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('brand', 'influencer') NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500) DEFAULT NULL,
    is_verified TINYINT(1) NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- ======================== BRANDS ========================
CREATE TABLE IF NOT EXISTS brands (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    website VARCHAR(500) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    logo_url VARCHAR(500) DEFAULT NULL,
    budget DECIMAL(12,2) DEFAULT 0.00,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_brands_user (user_id),
    INDEX idx_brands_industry (industry),
    CONSTRAINT fk_brands_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ====================== INFLUENCERS ======================
CREATE TABLE IF NOT EXISTS influencers (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    bio TEXT DEFAULT NULL,
    niche VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    total_followers INT NOT NULL DEFAULT 0,
    engagement_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    price_per_post DECIMAL(10,2) DEFAULT NULL,
    location VARCHAR(255) DEFAULT NULL,
    profile_image VARCHAR(500) DEFAULT NULL,
    verified TINYINT(1) NOT NULL DEFAULT 0,
    audience_age_group VARCHAR(50) DEFAULT '18-34',
    audience_gender VARCHAR(50) DEFAULT 'Mixed',
    previous_campaign_score INT NOT NULL DEFAULT 0,
    social_links TEXT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_influencers_user (user_id),
    INDEX idx_influencers_category (category),
    INDEX idx_influencers_niche (niche),
    INDEX idx_influencers_followers (total_followers),
    INDEX idx_influencers_location (location),
    CONSTRAINT fk_influencers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ======================= CAMPAIGNS =======================
CREATE TABLE IF NOT EXISTS campaigns (
    id VARCHAR(36) PRIMARY KEY,
    brand_id VARCHAR(36) NOT NULL,
    brand_name VARCHAR(255) DEFAULT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    budget DECIMAL(12,2) NOT NULL,
    target_audience VARCHAR(500) DEFAULT NULL,
    requirements TEXT DEFAULT NULL,
    start_date VARCHAR(20) DEFAULT NULL,
    end_date VARCHAR(20) DEFAULT NULL,
    status ENUM('draft','active','paused','completed','cancelled') NOT NULL DEFAULT 'draft',
    platforms TEXT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_campaigns_brand (brand_id),
    INDEX idx_campaigns_status (status),
    INDEX idx_campaigns_category (category),
    CONSTRAINT fk_campaigns_brand FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ====================== APPLICATIONS ======================
CREATE TABLE IF NOT EXISTS applications (
    id VARCHAR(36) PRIMARY KEY,
    campaign_id VARCHAR(36) NOT NULL,
    campaign_title VARCHAR(255) DEFAULT NULL,
    influencer_id VARCHAR(36) NOT NULL,
    influencer_name VARCHAR(255) DEFAULT NULL,
    influencer_followers INT DEFAULT NULL,
    influencer_engagement DECIMAL(5,2) DEFAULT NULL,
    influencer_category VARCHAR(100) DEFAULT NULL,
    status ENUM('pending','accepted','rejected','withdrawn') NOT NULL DEFAULT 'pending',
    proposal TEXT NOT NULL,
    proposed_rate DECIMAL(10,2) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_applications_campaign (campaign_id),
    INDEX idx_applications_influencer (influencer_id),
    INDEX idx_applications_status (status),
    UNIQUE INDEX uq_campaign_influencer (campaign_id, influencer_id),
    CONSTRAINT fk_applications_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    CONSTRAINT fk_applications_influencer FOREIGN KEY (influencer_id) REFERENCES influencers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ====================== INVITATIONS ======================
CREATE TABLE IF NOT EXISTS invitations (
    id VARCHAR(36) PRIMARY KEY,
    campaign_id VARCHAR(36) NOT NULL,
    campaign_title VARCHAR(255) DEFAULT NULL,
    brand_id VARCHAR(36) NOT NULL,
    brand_name VARCHAR(255) DEFAULT NULL,
    influencer_id VARCHAR(36) NOT NULL,
    influencer_name VARCHAR(255) DEFAULT NULL,
    message TEXT DEFAULT NULL,
    status ENUM('pending','accepted','declined') NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_invitations_campaign (campaign_id),
    INDEX idx_invitations_influencer (influencer_id),
    INDEX idx_invitations_brand (brand_id),
    CONSTRAINT fk_invitations_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    CONSTRAINT fk_invitations_brand FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE,
    CONSTRAINT fk_invitations_influencer FOREIGN KEY (influencer_id) REFERENCES influencers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ===================== COLLABORATIONS =====================
CREATE TABLE IF NOT EXISTS collaborations (
    id VARCHAR(36) PRIMARY KEY,
    campaign_id VARCHAR(36) NOT NULL,
    campaign_title VARCHAR(255) DEFAULT NULL,
    brand_id VARCHAR(36) NOT NULL,
    brand_name VARCHAR(255) DEFAULT NULL,
    influencer_id VARCHAR(36) NOT NULL,
    influencer_name VARCHAR(255) DEFAULT NULL,
    status ENUM('negotiation','in_progress','content_review','completed','disputed') NOT NULL DEFAULT 'negotiation',
    agreed_rate DECIMAL(10,2) NOT NULL,
    deliverables TEXT DEFAULT NULL,
    start_date VARCHAR(20) DEFAULT NULL,
    end_date VARCHAR(20) DEFAULT NULL,
    rating INT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_collaborations_campaign (campaign_id),
    INDEX idx_collaborations_brand (brand_id),
    INDEX idx_collaborations_influencer (influencer_id),
    INDEX idx_collaborations_status (status),
    CONSTRAINT fk_collaborations_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
    CONSTRAINT fk_collaborations_brand FOREIGN KEY (brand_id) REFERENCES brands(id),
    CONSTRAINT fk_collaborations_influencer FOREIGN KEY (influencer_id) REFERENCES influencers(id)
) ENGINE=InnoDB;
