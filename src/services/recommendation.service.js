'use strict';

const db                               = require('../config/db');
const { PRIORITY_MAP, SCORE_COLUMNS }  = require('../config/constants');
const { buildWhyThisCar }              = require('./whyThisCar.service');

/**
 * Core recommendation function — always returns exactly `top_n` results.
 *
 * Strategy:
 *  1. Hard filter (budget + fuel_type + min_seater) → score → rank.
 *  2. If results < top_n, relax budget and fill remaining slots
 *     from out-of-budget variants (marked with out_of_budget: true).
 *  3. Enforce model diversity: at most 1 variant per model_name in
 *     the final list.
 *  4. Attach a `why` object to rank-1 result explaining why it's the top pick.
 *
 * @param {Object}   params
 * @param {number}   params.budget        - Max budget in INR (required)
 * @param {string}   [params.fuel_type]   - 'Petrol' | 'Diesel' | 'EV' | 'any'
 * @param {number}   [params.min_seater]  - Minimum seats required
 * @param {string[]} [params.priorities]  - Ordered priority keys
 * @param {number}   [params.top_n]       - Results to return (default 3)
 *
 * @returns {Promise<Object[]>}
 */
async function getRecommendations(params) {
  const {
    budget,
    fuel_type   = 'any',
    min_seater  = 0,
    priorities  = [],
    top_n       = 3,
  } = params;

  // ── 1. Fetch ALL variants ───────────────────────────────────────────────
  const [allRows] = await db.query('SELECT * FROM mg_variants');

  if (!allRows.length) return [];

  const validPriorities = priorities.filter(p => PRIORITY_MAP[p]);

  // ── 2. Score every variant ──────────────────────────────────────────────
  const scored = allRows.map(v => ({
    variant:    v,
    totalScore: computeScore(v, validPriorities),
  }));

  scored.sort((a, b) => b.totalScore - a.totalScore);

  // ── 3. Split into in-budget and out-of-budget pools ─────────────────────
  const passesHardFilters = (v) => {
    if (fuel_type && fuel_type !== 'any' && v.fuel_type !== fuel_type) return false;
    if (min_seater > 0 && v.seater < min_seater) return false;
    return true;
  };

  const inBudget  = scored.filter(r =>  passesHardFilters(r.variant) && r.variant.ex_showroom_price <= budget);
  const outBudget = scored.filter(r =>  passesHardFilters(r.variant) && r.variant.ex_showroom_price >  budget);
  const allSorted = scored; // absolute fallback — no filters

  // ── 4. Build diverse result set (1 model per slot) ──────────────────────
  const result     = [];
  const usedModels = new Set();

  const tryAdd = (pool, isOutOfBudget) => {
    for (const { variant, totalScore } of pool) {
      if (result.length >= top_n) break;
      if (usedModels.has(variant.model_name)) continue;
      result.push({ variant, totalScore, out_of_budget: isOutOfBudget });
      usedModels.add(variant.model_name);
    }
  };

  tryAdd(inBudget,  false);                                                           // Pass 1: in-budget
  if (result.length < top_n) tryAdd(outBudget, true);                                // Pass 2: over-budget, same filters
  if (result.length < top_n) tryAdd(allSorted.filter(                                // Pass 3: relax all filters
    r => !usedModels.has(r.variant.model_name)), true);

  // ── 5. Shape response ───────────────────────────────────────────────────
  const allVariantsInResult = result.map(r => r.variant);

  return result.map(({ variant, totalScore, out_of_budget }, index) => {
    const shaped = {
      rank:              index + 1,
      match_percent:     calcMatchPercent(totalScore),
      out_of_budget,
      model_sales_code:  variant.model_sales_code,
      model_name:        variant.model_name,
      variant_name:      variant.variant_name,
      fuel_type:         variant.fuel_type,
      seater:            variant.seater,
      ex_showroom_price: variant.ex_showroom_price,
      price_display:     formatPrice(variant.ex_showroom_price),
      tagline:           variant.tagline,
      car_image_url:     variant.car_image_url || null,
      card_tags:         safeParseJson(variant.card_tags),
      stats:             buildStats(variant),
      score:             totalScore,
      why:               null,   // populated for rank 1 only
    };

    // Attach explainer only for the top recommendation
    if (index === 0) {
      shaped.why = buildWhyThisCar(variant, allVariantsInResult, validPriorities);
    }

    return shaped;
  });
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function computeScore(variant, validPriorities) {
  let total = 0;

  if (validPriorities.length === 0) {
    total = SCORE_COLUMNS.reduce((s, col) => s + (variant[col] || 0), 0)
            / SCORE_COLUMNS.length;
  } else {
    const n     = validPriorities.length;
    const denom = (n * (n + 1)) / 2;
    validPriorities.forEach((key, idx) => {
      const col    = PRIORITY_MAP[key];
      const weight = (n - idx) / denom;
      total       += (variant[col] || 0) * weight;
    });
  }

  return Math.round(total * 10) / 10;
}

function calcMatchPercent(score) {
  return Math.min(Math.round(65 + (score / 10) * 34), 99);
}

function buildStats(v) {
  if (v.fuel_type === 'EV') {
    return {
      range:    { label: 'RANGE',    value: v.ev_range_km     ? `${v.ev_range_km} KM` : 'N/A' },
      charging: { label: 'CHARGING', value: v.has_ev_fast_charge ? 'Fast' : 'Slow'            },
      ai:       { label: 'AI',       value: v.has_connected_car  ? 'Voice+' : 'Basic'          },
    };
  }
  return {
    mileage: { label: 'MILEAGE', value: v.arai_mileage_kmpl ? `${v.arai_mileage_kmpl} KM/L` : 'N/A' },
    seats:   { label: 'SEATS',   value: `${v.seater} Seater`                                        },
    adas:    { label: 'ADAS',    value: v.has_adas ? 'Level 2' : 'Basic'                            },
  };
}

function formatPrice(inr) {
  return `₹${(inr / 100000).toFixed(2)}L`;
}

function safeParseJson(str) {
  try { return JSON.parse(str); } catch { return []; }
}

module.exports = { getRecommendations };