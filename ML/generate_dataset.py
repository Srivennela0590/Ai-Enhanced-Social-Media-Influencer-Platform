#!/usr/bin/env python3
"""
Generate the influencer_campaign_dataset.csv with 1000 realistic rows.
Run: python generate_dataset.py
"""
import csv
import random
import os

random.seed(42)

CATEGORIES = [
    "Fitness", "Technology", "Fashion", "Food", "Travel",
    "Gaming", "Education", "Lifestyle", "Beauty", "Music",
]

def determine_label(inf_cat, camp_cat, followers, engagement, audience_match, prev_perf):
    score = 0
    if inf_cat == camp_cat:
        score += 35
    elif inf_cat in ("Fitness", "Lifestyle") and camp_cat in ("Fitness", "Lifestyle"):
        score += 20
    elif inf_cat in ("Technology", "Gaming") and camp_cat in ("Technology", "Gaming"):
        score += 20
    elif inf_cat in ("Fashion", "Beauty") and camp_cat in ("Fashion", "Beauty"):
        score += 20
    else:
        score += 5

    if followers >= 200000:
        score += 10
    elif followers >= 50000:
        score += 7
    elif followers >= 10000:
        score += 4

    if engagement >= 6.0:
        score += 15
    elif engagement >= 4.0:
        score += 10
    elif engagement >= 2.0:
        score += 5

    score += audience_match * 0.2
    score += prev_perf * 0.15

    noise = random.gauss(0, 5)
    score += noise

    if score >= 65:
        return "Strong Match"
    elif score >= 42:
        return "Moderate Match"
    else:
        return "Low Match"

rows = []
for i in range(1000):
    inf_cat = random.choice(CATEGORIES)
    camp_cat = random.choice(CATEGORIES)

    followers = random.choice([
        random.randint(1000, 15000),
        random.randint(15000, 80000),
        random.randint(80000, 300000),
        random.randint(300000, 2000000),
    ])

    engagement = round(random.uniform(0.5, 12.0), 2)
    audience_match = random.randint(10, 100)
    prev_perf = random.randint(10, 100)

    # Inject ~2% missing values
    if random.random() < 0.02:
        followers = ""
    if random.random() < 0.02:
        engagement = ""
    if random.random() < 0.02:
        audience_match = ""
    if random.random() < 0.02:
        prev_perf = ""
    if random.random() < 0.01:
        inf_cat = ""
    if random.random() < 0.01:
        camp_cat = ""

    # Compute label only on valid data
    f = int(followers) if followers != "" else 50000
    e = float(engagement) if engagement != "" else 4.0
    am = int(audience_match) if audience_match != "" else 50
    pp = int(prev_perf) if prev_perf != "" else 50
    ic = inf_cat if inf_cat != "" else "Lifestyle"
    cc = camp_cat if camp_cat != "" else "Lifestyle"
    label = determine_label(ic, cc, f, e, am, pp)

    rows.append([inf_cat, followers, engagement, camp_cat, audience_match, prev_perf, label])

path = os.path.join(os.path.dirname(__file__), "influencer_campaign_dataset.csv")
with open(path, "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow([
        "influencer_category", "followers_count", "engagement_rate",
        "campaign_category", "audience_match_score", "previous_performance",
        "match_label"
    ])
    writer.writerows(rows)

print(f"Generated {len(rows)} rows -> {path}")
