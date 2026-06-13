import os
import random
import requests

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'


def _call_gemini(prompt):
    if not GEMINI_API_KEY:
        return None
    try:
        resp = requests.post(
            f'{GEMINI_URL}?key={GEMINI_API_KEY}',
            json={
                'contents': [{'parts': [{'text': prompt}]}],
                'generationConfig': {'temperature': 0.8, 'topP': 0.95, 'maxOutputTokens': 1024},
            },
            timeout=15,
        )
        if resp.status_code != 200:
            return None
        data = resp.json()
        return data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '').strip()
    except Exception:
        return None


def generate_caption(platform, niche, topic, tone, include_hashtags, include_emojis):
    prompt = (
        f"Generate a {tone} social media caption for {platform} about {topic} in the {niche} niche. "
        f"{'Include 5-8 relevant hashtags.' if include_hashtags else 'No hashtags.'} "
        f"{'Include emojis.' if include_emojis else 'No emojis.'} "
        f"Write ONLY the caption text."
    )
    gemini = _call_gemini(prompt)
    if gemini:
        hashtags = [w for w in gemini.split() if w.startswith('#')]
        return {'caption': gemini, 'hashtags': hashtags, 'characterCount': len(gemini), 'source': 'gemini'}

    e = include_emojis
    hooks = {
        'professional': [f"Here's what most people get wrong about {topic}", f"After years in {niche}, here's my take on {topic}"],
        'casual': [f"{'👋 ' if e else ''}Let's talk about {topic}", f"{'🔥 ' if e else ''}POV: You just discovered {topic}"],
        'humorous': [f"{'😂 ' if e else ''}Nobody: ... Me: obsessing over {topic}"],
        'inspirational': [f"{'✨ ' if e else ''}Your journey in {niche} starts with one step", f"{'💪 ' if e else ''}Success in {niche} isn't luck — it's {topic}"],
        'educational': [f"{'📚 ' if e else ''}{topic} 101: Everything you need to know", f"{'🧠 ' if e else ''}3 things I wish I knew about {topic} sooner"],
    }
    tone_key = tone.lower() if tone.lower() in hooks else 'casual'
    hook = random.choice(hooks[tone_key])

    body = (f"In today's {niche} landscape, {topic} represents a significant opportunity. "
            f"The brands and creators who adapt early will lead the next wave.\n\n"
            f"{'📌 ' if e else ''}Save this for later — you'll want to reference it.")

    cta_map = {'instagram': f"\n\n{'👉 ' if e else ''}Follow for more {niche} content.",
               'tiktok': f"\n\n{'🔔 ' if e else ''}Follow for Part 2!",
               'youtube': f"\n\n{'🔔 ' if e else ''}Subscribe for more!",
               'linkedin': f"\n\nWhat are your thoughts on {topic}?", 'twitter': ''}
    cta = cta_map.get(platform.lower(), '')

    caption = f"{hook}\n\n{body}{cta}"
    hashtags = []
    if include_hashtags:
        tags = [f"#{niche.replace(' ', '')}", f"#{topic.replace(' ', '')}", f"#{platform.lower()}marketing",
                "#contentcreator", "#socialmedia", f"#{niche.lower().replace(' ', '')}tips", "#growthmindset"]
        caption += '\n\n' + ' '.join(tags)
        hashtags = tags

    return {'caption': caption, 'hashtags': hashtags, 'characterCount': len(caption), 'source': 'template'}


def generate_proposal(influencer_name, influencer_niche, influencer_followers,
                      campaign_title, campaign_category, campaign_description, proposed_rate):
    fk = f'{influencer_followers // 1000}K'
    prompt = (f"Write a 150-word campaign proposal from influencer {influencer_name} ({influencer_niche}, {fk} followers) "
              f"for \"{campaign_title}\". Rate: ${proposed_rate}. Campaign: {campaign_description}. Write ONLY the proposal.")
    gemini = _call_gemini(prompt)
    if gemini:
        return {'proposal': gemini, 'wordCount': len(gemini.split()), 'source': 'gemini'}

    proposal = (
        f"I'm excited about \"{campaign_title}\" and believe my expertise in {influencer_niche} "
        f"content creation makes me an ideal partner for this initiative.\n\n"
        f"With {fk} engaged followers who closely align with your target audience, "
        f"I can deliver authentic, high-quality content that resonates and converts.\n\n"
        f"For this collaboration, I propose the following deliverables at a rate of ${proposed_rate}:\n\n"
        f"- 2 dedicated feed posts with professional photography\n"
        f"- 4 Story sequences with engagement stickers\n"
        f"- 1 Reel or short-form video (60-90 seconds)\n"
        f"- Cross-promotion across secondary platforms\n\n"
        f"Based on my previous campaigns in similar categories, I project 3-5x ROI. "
        f"Looking forward to creating something impactful together!\n\n"
        f"Best regards,\n{influencer_name}"
    )
    return {'proposal': proposal, 'wordCount': len(proposal.split()), 'source': 'template'}


def generate_outreach(brand_name, influencer_name, influencer_niche,
                      influencer_followers, campaign_title, campaign_goal, message_type):
    fk = f'{influencer_followers // 1000}K'
    prompt = (f"Write a {message_type} outreach message from {brand_name} to influencer {influencer_name} "
              f"({influencer_niche}, {fk} followers) for \"{campaign_title}\". Goal: {campaign_goal}. "
              f"First line Subject:, then body. 100-150 words.")
    gemini = _call_gemini(prompt)
    if gemini:
        lines = gemini.split('\n')
        subject = lines[0].replace('Subject:', '').strip() if lines[0].lower().startswith('subject:') else f'Collaboration: {campaign_title}'
        body = '\n'.join(lines[1:]).strip() if len(lines) > 1 else gemini
        return {'subject': subject, 'message': body, 'wordCount': len(body.split()), 'source': 'gemini'}

    templates = {
        'initial': {
            'subject': f'Collaboration Opportunity: {campaign_title} x {influencer_name}',
            'message': (
                f"Hi {influencer_name},\n\n"
                f"I'm reaching out from {brand_name} because we've been following your incredible "
                f"work in the {influencer_niche} space. With {fk} dedicated followers, "
                f"your audience aligns perfectly with our target market.\n\n"
                f"We're launching \"{campaign_title}\" and believe a collaboration with you "
                f"would be fantastic. Our goal is to {campaign_goal.lower()}.\n\n"
                f"Would you be open to a quick call this week?\n\n"
                f"Warm regards,\n{brand_name} Team"
            ),
        },
        'follow_up': {
            'subject': f'Following Up: {campaign_title} Partnership',
            'message': (
                f"Hi {influencer_name},\n\n"
                f"I wanted to follow up on our previous message regarding \"{campaign_title}\". "
                f"We're still enthusiastic about collaborating with you.\n\n"
                f"Your {influencer_niche} content continues to reinforce why we think you'd be "
                f"the perfect partner. If you're interested, we're flexible on timing.\n\n"
                f"Best,\n{brand_name} Team"
            ),
        },
        'negotiation': {
            'subject': f'Re: {campaign_title} — Partnership Details',
            'message': (
                f"Hi {influencer_name},\n\n"
                f"Thank you for your interest in \"{campaign_title}\". "
                f"We value transparency and want this partnership to be rewarding for both sides.\n\n"
                f"We'd love to discuss adjusted deliverables matching your strengths in {influencer_niche}, "
                f"performance bonuses, and extended partnership potential.\n\n"
                f"Would you be available to discuss further?\n\n"
                f"Best regards,\n{brand_name} Team"
            ),
        },
    }

    t = templates.get(message_type, templates['initial'])
    return {'subject': t['subject'], 'message': t['message'], 'wordCount': len(t['message'].split()), 'source': 'template'}
