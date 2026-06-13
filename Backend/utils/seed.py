from models import db
from models.user import User
from models.brand import Brand
from models.influencer import Influencer
from models.campaign import Campaign
from models.application import Application
from models.collaboration import Collaboration
import json


def seed_database():
    if User.query.first():
        return

    # Brand user
    brand_user = User(email='brand@demo.com', role='brand', first_name='Sarah', last_name='Johnson')
    brand_user.set_password('Demo1234!')
    db.session.add(brand_user)
    db.session.flush()

    brand = Brand(user_id=brand_user.id, company_name='TechVibe Inc.', industry='Technology', website='https://techvibe.com')
    db.session.add(brand)
    db.session.flush()

    # Influencer user
    inf_user = User(email='influencer@demo.com', role='influencer', first_name='Alex', last_name='Rivera')
    inf_user.set_password('Demo1234!')
    db.session.add(inf_user)
    db.session.flush()

    inf = Influencer(
        user_id=inf_user.id, email='influencer@demo.com', display_name='Alex Rivera',
        bio='Tech enthusiast & content creator with 500K+ followers',
        niche='technology', category='Technology', total_followers=125000,
        engagement_rate=5.8, price_per_post=500, location='San Francisco, CA',
        verified=True, audience_age_group='18-34', audience_gender='60% Male',
        previous_campaign_score=88,
        social_links=json.dumps([{'platform': 'Instagram', 'url': 'https://instagram.com/alexrivera'}]),
    )
    db.session.add(inf)
    db.session.flush()

    # Seed extra influencers
    seed_data = [
        ('Emma Wilson', 'emma@demo.com', 'Fashion & Beauty', 'fashion', 245000, 4.8, 500, 'Los Angeles, CA', 92),
        ('Jake Chen', 'jake@demo.com', 'Technology', 'technology', 609000, 5.2, 800, 'San Francisco, CA', 95),
        ('Mia Torres', 'mia@demo.com', 'Lifestyle & Wellness', 'lifestyle', 500000, 6.1, 650, 'Miami, FL', 88),
        ('Ryan Patel', 'ryan@demo.com', 'Fitness & Health', 'fitness', 254000, 7.3, 400, 'Austin, TX', 85),
        ('Sophia Kim', 'sophia@demo.com', 'Food & Cooking', 'food', 730000, 5.5, 900, 'New York, NY', 97),
        ('Marcus Johnson', 'marcus@demo.com', 'Travel & Adventure', 'travel', 630000, 4.2, 750, 'Denver, CO', 90),
        ('Lily Zhang', 'lily@demo.com', 'Gaming & Esports', 'gaming', 670000, 8.1, 700, 'Seattle, WA', 93),
        ('David Park', 'david@demo.com', 'Education', 'education', 190000, 9.4, 350, 'Chicago, IL', 82),
    ]

    influencer_ids = [inf.id]
    for name, email, cat, niche, followers, eng, rate, loc, score in seed_data:
        first, last = name.split(' ', 1)
        u = User(email=email, role='influencer', first_name=first, last_name=last)
        u.set_password('Demo1234!')
        db.session.add(u)
        db.session.flush()
        i = Influencer(
            user_id=u.id, email=email, display_name=name, niche=niche, category=cat,
            total_followers=followers, engagement_rate=eng, price_per_post=rate,
            location=loc, previous_campaign_score=score,
            audience_age_group='18-34', audience_gender='Mixed',
        )
        db.session.add(i)
        db.session.flush()
        influencer_ids.append(i.id)

    # Campaigns
    campaigns_data = [
        ('Summer Product Launch 2024', 'Looking for tech influencers to showcase our new AI-powered gadget line.', 'Technology', 15000, 'active'),
        ('Back to School Campaign', 'Partner with education and tech influencers for our productivity suite launch.', 'Education', 8000, 'active'),
        ('Holiday Gift Guide', 'Create holiday gift guide content featuring our top-selling products.', 'Lifestyle', 25000, 'draft'),
        ('Fitness App Launch', 'Promote our AI-powered fitness tracking app.', 'Fitness & Health', 12000, 'active'),
        ('Sustainable Living Series', 'Partner with eco-conscious creators.', 'Lifestyle', 18000, 'paused'),
        ('Gaming Peripherals Review', 'In-depth reviews of our newest gaming gear.', 'Gaming', 10000, 'completed'),
    ]

    campaign_objs = []
    for title, desc, cat, budget, status in campaigns_data:
        c = Campaign(
            brand_id=brand.id, brand_name='TechVibe Inc.', title=title,
            description=desc, category=cat, budget=budget, status=status,
            target_audience='18-34 enthusiasts', requirements='Min 10K followers',
            start_date='2024-06-01', end_date='2024-12-31',
            platforms=json.dumps(['Instagram', 'YouTube', 'TikTok']),
        )
        db.session.add(c)
        db.session.flush()
        campaign_objs.append(c)

    # Applications
    if len(influencer_ids) > 2 and len(campaign_objs) > 0:
        app1 = Application(
            campaign_id=campaign_objs[0].id, campaign_title=campaign_objs[0].title,
            influencer_id=influencer_ids[2], influencer_name='Jake Chen',
            influencer_followers=609000, influencer_engagement=5.2, influencer_category='Technology',
            status='pending', proposal='I can create high-quality unboxing videos.', proposed_rate=800,
        )
        db.session.add(app1)

        app2 = Application(
            campaign_id=campaign_objs[0].id, campaign_title=campaign_objs[0].title,
            influencer_id=influencer_ids[1], influencer_name='Emma Wilson',
            influencer_followers=245000, influencer_engagement=4.8, influencer_category='Fashion & Beauty',
            status='accepted', proposal='Lifestyle integration content.', proposed_rate=500,
        )
        db.session.add(app2)

    # Collaboration
    if len(campaign_objs) > 0 and len(influencer_ids) > 1:
        collab = Collaboration(
            campaign_id=campaign_objs[0].id, campaign_title=campaign_objs[0].title,
            brand_id=brand.id, brand_name='TechVibe Inc.',
            influencer_id=influencer_ids[1], influencer_name='Emma Wilson',
            status='in_progress', agreed_rate=500,
            deliverables='2 Instagram posts, 3 Stories, 1 Reel',
            start_date='2024-06-15', end_date='2024-07-15',
        )
        db.session.add(collab)

    db.session.commit()
    print('Database seeded successfully!')
