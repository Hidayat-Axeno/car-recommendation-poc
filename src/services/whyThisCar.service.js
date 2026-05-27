'use strict';

/**
 * buildWhyThisCar
 *
 * Returns a single plain-English paragraph (string) explaining why the top
 * recommended variant is the best match for this user. Shown directly under
 * the car name on the results card.
 *
 * Logic:
 *  1. Pick 2-3 reason sentences driven by the user's stated priorities.
 *  2. If the top car has features the other shortlisted cars don't, append
 *     a differentiator sentence.
 *  3. Join into one flowing paragraph.
 *
 * @param {Object}   topVariant   - DB row of the rank-1 variant
 * @param {Object[]} allResults   - All DB rows in the final shortlist (incl. top)
 * @param {string[]} priorities   - Ordered priority keys from the user
 * @returns {string}
 */
function buildWhyThisCar(topVariant, allResults, priorities) {
  const v      = topVariant;
  const others = allResults.filter(r => r.model_sales_code !== v.model_sales_code);

  // Sentence templates keyed by priority.
  // Each returns a sentence string or null if the feature isn't present.
  const SENTENCE_MAP = {
    city: () => v.fuel_type === 'EV'
      ? `With ${v.ev_range_km} km of range and zero running costs, it handles city stop-and-go better than anything else in your budget.`
      : `At ${v.arai_mileage_kmpl} km/l and a compact footprint, your daily city commute stays affordable and stress-free.`,

    highway: () => v.has_cruise_control
      ? `Cruise control${v.has_adas ? ' and adaptive lane assist' : ''} take the fatigue out of long highway stretches.`
      : `${v.power_ps}PS and ${v.torque_nm}Nm give you relaxed, confident overtaking on open roads.`,

    family: () => v.seater >= 7
      ? `With seating for ${v.seater}, rear AC vents, and ${v.boot_space_litres ? v.boot_space_litres + 'L of boot space' : 'generous luggage room'}, it's built around family trips.`
      : `${v.airbags} airbags, ISOFIX child anchors, and a well-proportioned cabin make it a safe, practical family choice.`,

    business: () => {
      const perks = [
        v.has_leather_seats      ? 'leather seats'         : null,
        v.screen_size_inch >= 14 ? `${v.screen_size_inch}" display` : null,
        v.has_wireless_charger   ? 'wireless charging'     : null,
        v.has_ventilated_seats   ? 'ventilated seats'      : null,
      ].filter(Boolean);
      return perks.length
        ? `${joinList(perks)} give the cabin a genuinely executive feel.`
        : null;
    },

    safety: () => v.has_adas
      ? `Full Level 2 ADAS — automatic emergency braking, lane-keep assist, and adaptive cruise — adds a meaningful layer of protection on every trip.`
      : `${v.airbags} airbags, electronic stability control, and disc brakes on all four wheels make it one of the safer choices in its class.`,

    adas: () => v.has_adas
      ? `Adaptive cruise, traffic jam assist, AEB, and lane-keep assist are all active on this variant — a full Level 2 ADAS suite.`
      : null,

    comfort: () => {
      const parts = [
        v.has_ventilated_seats  ? 'ventilated front seats'  : null,
        v.has_sunroof           ? 'panoramic sunroof'        : null,
        v.has_wireless_charger  ? 'wireless charging'        : null,
        v.has_pm25_filter       ? 'PM2.5 air purification'   : null,
        v.has_powered_tailgate  ? 'hands-free tailgate'      : null,
      ].filter(Boolean);
      return parts.length
        ? `${joinList(parts)} make every journey noticeably more relaxed.`
        : `Auto climate control and a well-insulated cabin keep long drives comfortable.`;
    },

    performance: () => v.fuel_type === 'EV'
      ? `The electric motor delivers ${v.torque_nm}Nm of instant torque — quick, silent acceleration from any speed.`
      : `${v.power_ps}PS from the turbocharged ${v.fuel_type.toLowerCase()} engine puts it ahead of most rivals in this price bracket.`,

    mileage: () => v.fuel_type === 'EV'
      ? `${v.ev_range_km} km of certified range means most users only need to charge once a week.`
      : `At ${v.arai_mileage_kmpl} km/l ARAI, running costs are among the lowest in its segment.`,

    large_screen: () => v.screen_size_inch
      ? v.screen_size_inch >= 15
        ? `The ${v.screen_size_inch}" GrandView touchscreen is the largest in its class and dominates the dashboard.`
        : `A ${v.screen_size_inch}" HD touchscreen with wireless Android Auto and Apple CarPlay keeps everything intuitive.`
      : null,

    tech: () => v.has_connected_car
      ? `i-SMART 2.0 brings 55+ connected features including remote AC, live tracking, digital Bluetooth key, and OTA updates.`
      : `A digital cluster, wireless CarPlay, and a feature-rich infotainment system keep you well connected on every drive.`,

    premium: () => {
      const perks = [
        v.has_leather_seats    ? 'leather upholstery'    : null,
        v.has_premium_audio    ? `${speakerBrand(v)} audio` : null,
        v.has_ventilated_seats ? 'ventilated seats'       : null,
        v.has_powered_tailgate ? 'powered tailgate'       : null,
      ].filter(Boolean);
      return perks.length
        ? `${joinList(perks)} set it apart as the most premium option in your shortlist.`
        : null;
    },

    eco: () => v.fuel_type === 'EV'
      ? `It's fully electric — zero tailpipe emissions${v.has_v2l ? ', and V2L lets you power devices straight from the car' : ''}.`
      : `The small-displacement turbo keeps CO2 output low without sacrificing driveability.`,

    value: () =>
      `At ${formatPrice(v.ex_showroom_price)}, it offers more features per rupee than the other options we found for you.`,

    offroad: () => v.score_offroad >= 8
      ? `4-wheel drive with multiple terrain modes gives it genuine off-road capability, not just cosmetic SUV styling.`
      : v.ground_clearance_mm
        ? `${v.ground_clearance_mm}mm of ground clearance handles broken roads and mild off-road trails comfortably.`
        : null,
  };

  // Pick sentences: user priorities first, then fill from highest scores
  const sentences    = [];
  const usedKeys     = new Set();
  const MAX_SENTENCES = 3;

  // Pass 1 - match user priorities in order
  for (const p of priorities) {
    if (sentences.length >= MAX_SENTENCES) break;
    if (!SENTENCE_MAP[p] || usedKeys.has(p)) continue;
    const s = SENTENCE_MAP[p]();
    if (s) { sentences.push(capitalise(s)); usedKeys.add(p); }
  }

  // Pass 2 - fill remaining slots by highest score column
  if (sentences.length < MAX_SENTENCES) {
    const scoreOrder = [
      { key: 'comfort',      score: v.score_comfort     },
      { key: 'safety',       score: v.score_safety      },
      { key: 'tech',         score: v.score_tech        },
      { key: 'mileage',      score: v.score_mileage     },
      { key: 'large_screen', score: v.score_large_screen },
      { key: 'premium',      score: v.score_premium     },
      { key: 'performance',  score: v.score_performance },
      { key: 'family',       score: v.score_family      },
      { key: 'value',        score: v.score_value       },
      { key: 'eco',          score: v.score_eco         },
    ].sort((a, b) => b.score - a.score);

    for (const { key } of scoreOrder) {
      if (sentences.length >= MAX_SENTENCES) break;
      if (!SENTENCE_MAP[key] || usedKeys.has(key)) continue;
      const s = SENTENCE_MAP[key]();
      if (s) { sentences.push(capitalise(s)); usedKeys.add(key); }
    }
  }

  // Differentiator sentence - features top car has that others don't
  const diff = buildDifferentiatorSentence(v, others);

  return stitchParagraph(v, priorities, sentences, diff);
}


// --- Paragraph stitching: makes the response feel AI-generated -----------

/**
 * Combines intro + body sentences + closing differentiator into one flowing
 * paragraph. Uses varied connector phrases between sentences and a deterministic
 * (but seemingly random) intro that references the user's actual priorities.
 */
function stitchParagraph(v, priorities, sentences, diff) {
  if (!sentences.length && !diff) return '';

  const intro     = pickIntro(v, priorities);
  const connectors = [
    '',                      // sentence 1 — no connector
    'On top of that, ',
    'Just as importantly, ',
    'And one more thing — ',
  ];

  const body = sentences.map((s, idx) => {
    const prefix = connectors[idx] || 'Beyond that, ';
    return idx === 0 ? s : prefix + lowercaseFirst(s);
  }).join(' ');

  let paragraph = intro + ' ' + body;

  if (diff) {
    // diff already starts with "It's also" — strip it for a cleaner closer
    const diffClean = diff.replace(/^It's also /, '');
    paragraph += ' One last thing — ' + diffClean;
  }

  return paragraph;
}

/**
 * Picks one of several intro sentences. If the user shared priorities, the
 * intro echoes them back — which is what makes the response feel personalised
 * rather than templated. Deterministic per (variant, priorities) so a given
 * input always renders the same paragraph.
 */
function pickIntro(v, priorities) {
  const name           = v.model_name;
  const priorityPhrase = humanisePriorities(priorities);
  const seed           = hashString((v.model_sales_code || '') + priorities.join('|'));

  if (priorityPhrase) {
    const personalised = [
      `Given your focus on ${priorityPhrase}, the ${name} is the clearest fit:`,
      `You told us ${priorityPhrase} matters most — and that's exactly where the ${name} delivers:`,
      `With ${priorityPhrase} sitting at the top of your list, the ${name} pulls ahead of the rest:`,
      `Weighing ${priorityPhrase} against everything else in your shortlist, the ${name} comes out on top:`,
    ];
    return personalised[seed % personalised.length];
  }

  const generic = [
    `Here's why the ${name} comes out on top for you:`,
    `After comparing your shortlist side by side, the ${name} stands out:`,
    `Based on your answers, the ${name} is the strongest match — and here's the reasoning:`,
    `Looking at the full picture, the ${name} pulls ahead:`,
  ];
  return generic[seed % generic.length];
}

/**
 * Turns priority keys into natural-language fragments — caps at 2 so the
 * intro stays readable.
 */
function humanisePriorities(priorities) {
  const LABELS = {
    city:         'city driving',
    highway:      'highway comfort',
    family:       'family use',
    business:     'an executive feel',
    mileage:      'fuel economy',
    adas:         'ADAS safety',
    comfort:      'cabin comfort',
    performance:  'performance',
    large_screen: 'a large infotainment screen',
    safety:       'safety',
    premium:      'a premium experience',
    offroad:      'off-road capability',
    tech:         'in-car tech',
    eco:          'eco-friendliness',
    value:        'value for money',
  };

  const labels = [...new Set(priorities.map(p => LABELS[p]).filter(Boolean))].slice(0, 2);
  if (labels.length === 0) return null;
  if (labels.length === 1) return labels[0];
  return `${labels[0]} and ${labels[1]}`;
}

function lowercaseFirst(s) {
  if (!s) return s;
  // Don't touch sentences that start with a number or all-caps acronym
  if (/^[A-Z]{2,}/.test(s)) return s;
  if (/^\d/.test(s))        return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function hashString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}


// --- Helpers -----------------------------------------------------------------

/**
 * Builds one sentence about what the top car has that the other two don't.
 * Returns null if there's nothing exclusive.
 */
function buildDifferentiatorSentence(v, others) {
  if (!others.length) return null;

  const exclusive = [];

  const FLAGS = [
    { key: 'has_adas',             label: 'Level 2 ADAS'          },
    { key: 'has_v2l',              label: 'Vehicle-to-Load (V2L)' },
    { key: 'has_ventilated_seats', label: 'ventilated seats'      },
    { key: 'has_powered_tailgate', label: 'a powered tailgate'    },
    { key: 'has_360_camera',       label: 'a 360 camera'          },
    { key: 'has_premium_audio',    label: 'branded premium audio' },
    { key: 'has_pm25_filter',      label: 'PM2.5 air filtration'  },
    { key: 'has_sunroof',          label: 'a sunroof'             },
    { key: 'has_leather_seats',    label: 'leather seats'         },
  ];

  for (const { key, label } of FLAGS) {
    if (v[key] && !others.some(o => o[key])) exclusive.push(label);
    if (exclusive.length >= 2) break; // cap to keep sentence short
  }

  // Numeric: longer range
  const otherMaxRange = Math.max(0, ...others.map(o => o.ev_range_km || 0));
  if (v.ev_range_km && v.ev_range_km > otherMaxRange) {
    exclusive.unshift(`the longest range at ${v.ev_range_km} km`);
  }

  if (!exclusive.length) return null;

  return `It's also the only car in your shortlist with ${joinList(exclusive)}.`;
}

function capitalise(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function joinList(arr) {
  if (arr.length === 1) return arr[0];
  if (arr.length === 2) return `${arr[0]} and ${arr[1]}`;
  return `${arr.slice(0, -1).join(', ')}, and ${arr[arr.length - 1]}`;
}

function speakerBrand(v) {
  if (v.model_name.includes('Majestor')) return 'JBL';
  if (v.model_name.includes('Hector'))   return 'Infinity';
  if (v.model_name.includes('Windsor'))  return 'Infinity';
  if (v.model_name.includes('Gloster'))  return 'Infinity';
  return 'premium';
}

function formatPrice(inr) {
  return `\u20B9${(inr / 100000).toFixed(2)}L`;
}

module.exports = { buildWhyThisCar };