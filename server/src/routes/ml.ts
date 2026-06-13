import { Router, Request, Response } from 'express';

const router = Router();

// KNN prediction is handled client-side in src/services/ml.ts
// This route provides a server-side endpoint for external integrations
router.post('/predict', (req: Request, res: Response) => {
  const { influencer_category, followers_count, engagement_rate, campaign_category, audience_match_score, previous_performance } = req.body;

  // Server-side KNN would use the Python model here
  // For now, provide a rule-based approximation
  let score = 0;
  if (influencer_category?.toLowerCase() === campaign_category?.toLowerCase()) score += 35;
  if (followers_count >= 100000) score += 15; else if (followers_count >= 30000) score += 10;
  if (engagement_rate >= 5) score += 15; else if (engagement_rate >= 3) score += 8;
  score += (audience_match_score || 50) * 0.2;
  score += (previous_performance || 50) * 0.15;

  const prediction = score >= 65 ? 'Strong Match' : score >= 42 ? 'Moderate Match' : 'Low Match';
  const confidence = Math.min(Math.round(50 + score * 0.5), 99);

  res.json({
    success: true,
    data: {
      prediction,
      confidence: `${confidence}%`,
      match_score: Math.round(score),
      probabilities: {
        'Strong Match': `${score >= 65 ? confidence : Math.max(confidence - 30, 5)}%`,
        'Moderate Match': `${score >= 42 && score < 65 ? confidence : 15}%`,
        'Low Match': `${score < 42 ? confidence : 5}%`,
      },
    },
  });
});

export default router;
