'use strict';

/**
 * AWS Lambda handler wrapper.
 * The recommendation logic lives in recommendation.service.js
 * and can be called directly without HTTP overhead.
 *
 * Expected Lambda event shape:
 * {
 *   "budget":     1800000,
 *   "fuel_type":  "EV",
 *   "min_seater": 5,
 *   "priorities": ["safety", "tech", "comfort"],
 *   "top_n":      3
 * }
 */

require('dotenv').config();

const { getRecommendations } = require('./src/services/recommendation.service');

exports.handler = async (event) => {
  try {
    const params = typeof event === 'string' ? JSON.parse(event) : event;

    if (!params.budget) {
      return response(400, { success: false, error: 'budget is required' });
    }

    const results = await getRecommendations(params);
    return response(200, { success: true, count: results.length, payload: results });

  } catch (err) {
    console.error('[Lambda Error]', err);
    return response(500, { success: false, error: 'Internal server error' });
  }
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}
