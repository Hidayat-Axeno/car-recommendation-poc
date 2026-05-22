'use strict';

const { getRecommendations } = require('../services/recommendation.service');

/**
 * POST /api/recommend
 *
 * Body:
 * {
 *   "budget":     1800000,          // INR, required
 *   "fuel_type":  "EV",             // "Petrol" | "EV" | "any"  (optional)
 *   "min_seater": 5,                // optional, default 0
 *   "priorities": ["safety","tech","comfort"],  // ordered, optional
 *   "top_n":      3                 // optional, default 3
 * }
 */
async function recommend(req, res) {
  const { budget, fuel_type, min_seater, priorities, top_n } = req.body;

  if (!budget || typeof budget !== 'number' || budget <= 0) {
    return res.status(400).json({
      success: false,
      error:   'budget is required and must be a positive number (in INR)',
    });
  }

  if (priorities !== undefined && !Array.isArray(priorities)) {
    return res.status(400).json({
      success: false,
      error:   'priorities must be an array of strings',
    });
  }

  const results = await getRecommendations({
    budget,
    fuel_type,
    min_seater,
    priorities,
    top_n,
  });

  return res.json({
    success: true,
    count:   results.length,
    data: results,
  });
}

module.exports = { recommend };
