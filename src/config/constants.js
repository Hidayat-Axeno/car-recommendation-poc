'use strict';

// Budget band boundaries in INR
const BUDGET_BANDS = {
  'u10':   { min: 0,        max: 1000000  },
  '10-15': { min: 1000001,  max: 1500000  },
  '15-20': { min: 1500001,  max: 2000000  },
  '20+':   { min: 2000001,  max: Infinity },
};

// Maps user preference keys → score columns in DB
// Weights sum to 1 per use-case (applied when user picks priorities)
const SCORE_COLUMNS = [
  'score_city',
  'score_highway',
  'score_family',
  'score_business',
  'score_mileage',
  'score_adas',
  'score_comfort',
  'score_performance',
  'score_large_screen',
  'score_safety',
  'score_premium',
  'score_offroad',
  'score_tech',
  'score_eco',
  'score_value',
];

// User-facing priority keys → DB score column
const PRIORITY_MAP = {
  city:         'score_city',
  highway:      'score_highway',
  family:       'score_family',
  business:     'score_business',
  mileage:      'score_mileage',
  adas:         'score_adas',
  comfort:      'score_comfort',
  performance:  'score_performance',
  large_screen: 'score_large_screen',
  safety:       'score_safety',
  premium:      'score_premium',
  offroad:      'score_offroad',
  tech:         'score_tech',
  eco:          'score_eco',
  value:        'score_value',
};

module.exports = { BUDGET_BANDS, SCORE_COLUMNS, PRIORITY_MAP };
