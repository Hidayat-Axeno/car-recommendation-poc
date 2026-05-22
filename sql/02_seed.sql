-- ============================================================
-- MG Car Recommendation Engine - Seed Data
-- Parsed from brochures: Hector, Windsor EV, Comet EV
-- car_image_url left NULL — use PATCH /admin/variants/:code/image
-- safety_stars left NULL — fill from NCAP reports manually
-- arai_mileage_kmpl for Hector petrol ~14.5 kmpl (ARAI est.)
-- ============================================================

USE mgmotors;

-- ============================================================
-- SCORING RATIONALE (1-10 scale)
-- score_city      : compact size, EV zero-emission, tight turning radius
-- score_highway   : engine power, cruise control, ADAS, large tank/range
-- score_family    : seater count, boot space, safety airbags, sunroof
-- score_business  : premium interior, connected tech, large screen, leather
-- score_mileage   : ARAI kmpl (petrol) or EV range/kWh efficiency
-- score_adas      : number of ADAS features available on variant
-- score_comfort   : ventilated seats, sunroof, wireless charge, auto AC
-- score_performance: power PS, torque Nm, transmission type
-- score_large_screen: screen size (10"=5, 14"=8, 15.6"=10)
-- score_safety    : airbag count, ADAS, ESC, disc brakes, TPMS
-- score_premium   : leather, ambient light, premium audio, powered tailgate
-- score_offroad   : ground clearance, suspension, AWD (none here = low)
-- score_tech      : i-SMART, connected features, OTA, digital key
-- score_eco       : EV=10, low-emission petrol turbo=5, no diesel here
-- score_value     : features-per-rupee subjective index
-- ============================================================

INSERT INTO mg_variants VALUES

-- ============================================================
-- MG HECTOR (Petrol 1.5T, 5-Seater)
-- ============================================================
(
  'HEC-STYLE-5-MT', 'MG Hector', 'Style 5S MT', 'Petrol', 5,
  1199000, '10-15',
  14.5, NULL, 1451, 143, 250, 'MT',
  6, 0, NULL,
  0, 0, 0, 0, 0, 0,   -- sunroof,wireless,360,vent,tailgate,cruise
  NULL, 4, 0, 0,       -- screen,speakers,premium_audio,connected
  0, NULL, NULL,       -- ev_fast,fast_kw,charge_time
  180, NULL, 0, 0, 0,  -- ground_clear,boot,leather,pm25,v2l
  -- scores
  6, 5, 6, 4, 6, 0, 4, 6, 0, 6, 3, 3, 2, 5, 8,
  '["Entry Level SUV","Manual Transmission","6 Airbags"]',
  NULL, 'Affordable entry into the Hector family'
),
(
  'HEC-SELECTPRO-5-MT', 'MG Hector', 'Select Pro 5S MT', 'Petrol', 5,
  1429000, '10-15',
  14.5, NULL, 1451, 143, 250, 'MT',
  6, 0, NULL,
  1, 0, 0, 0, 0, 1,
  14.0, 6, 0, 1,
  0, NULL, NULL,
  180, NULL, 0, 0, 0,
  6, 6, 6, 5, 6, 0, 5, 6, 8, 6, 4, 3, 5, 5, 7,
  '["Panoramic Sunroof","14\" HD Screen","Wireless Android Auto"]',
  NULL, 'Feature-packed mid variant with big screen'
),
(
  'HEC-SMARTPRO-5-MT', 'MG Hector', 'Smart Pro 5S MT', 'Petrol', 5,
  1529000, '15-20',
  14.5, NULL, 1451, 143, 250, 'MT',
  6, 0, NULL,
  1, 1, 0, 0, 0, 1,
  14.0, 8, 0, 1,
  0, NULL, NULL,
  180, NULL, 1, 0, 0,
  6, 6, 7, 6, 6, 0, 6, 6, 8, 6, 6, 3, 7, 5, 7,
  '["Panoramic Sunroof","Wireless Charger","i-SMART Connected","8 Speakers"]',
  NULL, 'Smart features with connected car tech'
),
(
  'HEC-SMARTPRO-5-CVT', 'MG Hector', 'Smart Pro 5S CVT', 'Petrol', 5,
  1659000, '15-20',
  13.5, NULL, 1451, 143, 250, 'CVT',
  6, 0, NULL,
  1, 1, 0, 0, 0, 1,
  14.0, 8, 0, 1,
  0, NULL, NULL,
  180, NULL, 1, 0, 0,
  7, 6, 7, 7, 5, 0, 7, 6, 8, 6, 7, 3, 7, 5, 6,
  '["CVT Automatic","Panoramic Sunroof","Wireless Charger","i-SMART"]',
  NULL, 'Auto gearbox comfort with smart features'
),
(
  'HEC-SHARPPRO-5-MT', 'MG Hector', 'Sharp Pro 5S MT', 'Petrol', 5,
  1699000, '15-20',
  14.5, NULL, 1451, 143, 250, 'MT',
  6, 0, NULL,
  1, 1, 0, 1, 0, 1,
  14.0, 8, 1, 1,
  0, NULL, NULL,
  180, NULL, 1, 0, 0,
  6, 7, 7, 7, 6, 0, 8, 7, 8, 7, 8, 3, 7, 5, 6,
  '["Ventilated Seats","Harman Infinity Audio","Premium Interiors","Panoramic Sunroof"]',
  NULL, 'Premium comfort with ventilated seats'
),
(
  'HEC-SHARPPRO-5-CVT', 'MG Hector', 'Sharp Pro 5S CVT', 'Petrol', 5,
  1829000, '15-20',
  13.5, NULL, 1451, 143, 250, 'CVT',
  6, 0, NULL,
  1, 1, 0, 1, 0, 1,
  14.0, 8, 1, 1,
  0, NULL, NULL,
  180, NULL, 1, 0, 0,
  7, 7, 7, 8, 5, 0, 8, 7, 8, 7, 8, 3, 7, 5, 6,
  '["CVT Auto","Ventilated Seats","Harman Infinity","Panoramic Sunroof"]',
  NULL, 'Sharp Pro comfort in smooth CVT auto'
),
(
  'HEC-SAVVYPRO-5-CVT', 'MG Hector', 'Savvy Pro 5S CVT', 'Petrol', 5,
  1919000, '15-20',
  13.5, NULL, 1451, 143, 250, 'CVT',
  6, 1, NULL,
  1, 1, 1, 1, 1, 1,
  14.0, 8, 1, 1,
  0, NULL, NULL,
  180, NULL, 1, 1, 0,
  7, 9, 8, 9, 5, 9, 9, 7, 8, 9, 9, 3, 9, 5, 5,
  '["ADAS Level 2","360 Camera","PM2.5 Filter","Powered Tailgate","Ventilated Seats"]',
  NULL, 'Top-of-line Hector with full ADAS suite'
),

-- Hector 7-Seater variants
(
  'HEC-SHARPPRO-7-MT', 'MG Hector', 'Sharp Pro 7S MT', 'Petrol', 7,
  1749000, '15-20',
  14.0, NULL, 1451, 143, 250, 'MT',
  6, 0, NULL,
  1, 1, 0, 1, 0, 1,
  14.0, 8, 1, 1,
  0, NULL, NULL,
  180, NULL, 1, 0, 0,
  6, 7, 9, 7, 5, 0, 8, 7, 8, 7, 7, 3, 7, 5, 6,
  '["7 Seater","3rd Row AC","Ventilated Seats","Premium Audio"]',
  NULL, 'Family 7-seater with premium features'
),
(
  'HEC-SHARPPRO-7-CVT', 'MG Hector', 'Sharp Pro 7S CVT', 'Petrol', 7,
  1879000, '15-20',
  13.5, NULL, 1451, 143, 250, 'CVT',
  6, 0, NULL,
  1, 1, 0, 1, 0, 1,
  14.0, 8, 1, 1,
  0, NULL, NULL,
  180, NULL, 1, 0, 0,
  7, 7, 9, 8, 5, 0, 8, 7, 8, 7, 8, 3, 7, 5, 5,
  '["7 Seater CVT","Ventilated Seats","3rd Row AC","Harman Audio"]',
  NULL, '7-seater family hauler with auto gearbox'
),
(
  'HEC-SAVVYPRO-7-CVT', 'MG Hector', 'Savvy Pro 7S CVT', 'Petrol', 7,
  1969000, '15-20',
  13.5, NULL, 1451, 143, 250, 'CVT',
  6, 1, NULL,
  1, 1, 1, 1, 1, 1,
  14.0, 8, 1, 1,
  0, NULL, NULL,
  180, NULL, 1, 1, 0,
  7, 9, 9, 9, 5, 9, 9, 7, 8, 9, 9, 3, 9, 5, 5,
  '["ADAS Level 2","7 Seater","360 Camera","Powered Tailgate","PM2.5 Filter"]',
  NULL, 'Ultimate 7-seater with full ADAS'
),

-- ============================================================
-- MG WINDSOR EV (38kWh variants)
-- ============================================================
(
  'WIN-EXCITE-38', 'MG Windsor EV', 'Excite 38kWh', 'EV', 5,
  1409800, '10-15',
  NULL, 332, NULL, 136, 200, 'Automatic',
  6, 0, NULL,
  0, 0, 0, 0, 0, 1,
  10.1, 6, 0, 1,
  0, 45, 45,
  186, 604, 0, 0, 0,
  8, 6, 6, 6, 8, 0, 6, 7, 5, 7, 5, 2, 6, 10, 7,
  '["332km Range","Zero Emission","i-SMART Connected","Disc Brakes"]',
  NULL, 'Affordable EV entry with solid range'
),
(
  'WIN-EXCLUSIVE-38', 'MG Windsor EV', 'Exclusive 38kWh', 'EV', 5,
  1552900, '15-20',
  NULL, 332, NULL, 136, 200, 'Automatic',
  6, 0, NULL,
  0, 1, 1, 0, 0, 1,
  15.6, 6, 0, 1,
  1, 45, 45,
  186, 604, 1, 0, 0,
  8, 7, 7, 7, 8, 0, 7, 7, 9, 7, 7, 2, 7, 10, 7,
  '["15.6\" GrandView Screen","360 Camera","Wireless Charger","Leather Seats"]',
  NULL, 'Big screen EV with premium feel'
),
(
  'WIN-ESSENCE-38', 'MG Windsor EV', 'Essence 38kWh', 'EV', 5,
  1652900, '15-20',
  NULL, 332, NULL, 136, 200, 'Automatic',
  6, 0, NULL,
  1, 1, 1, 1, 0, 1,
  15.6, 9, 1, 1,
  1, 45, 45,
  186, 579, 1, 1, 0,
  8, 7, 7, 8, 8, 0, 9, 7, 9, 7, 8, 2, 7, 10, 6,
  '["Glass Roof","Ventilated Seats","Infinity 9-Speaker","PM2.5 Filter","360 Camera"]',
  NULL, 'Premium EV comfort with glass roof'
),

-- Windsor EV 52.9kWh variants
(
  'WIN-EXCLUSIVEPRO-529', 'MG Windsor EV', 'Exclusive Pro 52.9kWh', 'EV', 5,
  1737900, '15-20',
  NULL, 449, NULL, 136, 200, 'Automatic',
  6, 0, NULL,
  0, 1, 1, 0, 0, 1,
  15.6, 6, 0, 1,
  1, 60, 50,
  186, 579, 1, 0, 0,
  8, 8, 7, 8, 9, 0, 7, 7, 9, 7, 7, 2, 7, 10, 6,
  '["449km Range","60kW Fast Charge","15.6\" Screen","Leather Seats"]',
  NULL, 'Long range EV with fast charging'
),
(
  'WIN-ESSENCEPRO-529', 'MG Windsor EV', 'Essence Pro 52.9kWh', 'EV', 5,
  1859900, '15-20',
  NULL, 449, NULL, 136, 200, 'Automatic',
  6, 1, NULL,
  1, 1, 1, 1, 1, 1,
  15.6, 9, 1, 1,
  1, 60, 50,
  186, 579, 1, 1, 1,
  8, 9, 8, 9, 9, 9, 10, 8, 9, 9, 10, 2, 9, 10, 5,
  '["ADAS Level 2","449km Range","V2L/V2V","Glass Roof","Ventilated Seats","Infinity Audio"]',
  NULL, 'Flagship Windsor — the complete EV package'
),

-- ============================================================
-- MG COMET EV
-- ============================================================
(
  'COM-EXECUTIVE', 'MG Comet EV', 'Executive', 'EV', 4,
  762800, 'u10',
  NULL, 230, NULL, 42, 110, 'Automatic',
  2, 0, NULL,
  0, 0, 0, 0, 0, 0,
  10.25, 2, 0, 0,
  0, NULL, NULL,
  155, NULL, 0, 0, 0,
  9, 2, 3, 3, 9, 0, 3, 3, 5, 3, 2, 1, 3, 10, 9,
  '["Ultra Compact","Zero Emission","Easy Parking","Low Running Cost"]',
  NULL, 'City-perfect micro EV for daily commutes'
),
(
  'COM-EXCITE', 'MG Comet EV', 'Excite', 'EV', 4,
  872800, 'u10',
  NULL, 230, NULL, 42, 110, 'Automatic',
  2, 0, NULL,
  0, 0, 0, 0, 0, 0,
  10.25, 4, 0, 1,
  0, NULL, NULL,
  155, NULL, 0, 0, 0,
  9, 2, 3, 4, 9, 0, 4, 3, 5, 4, 3, 1, 5, 10, 8,
  '["Street Smart","i-SMART Connected","4 Speakers","Wireless Android Auto"]',
  NULL, 'Street smart city car with connected tech'
),
(
  'COM-EXCITE-FC', 'MG Comet EV', 'Excite FC', 'EV', 4,
  899800, 'u10',
  NULL, 230, NULL, 42, 110, 'Automatic',
  2, 0, NULL,
  0, 0, 0, 0, 0, 0,
  10.25, 4, 0, 1,
  1, NULL, 210,
  155, NULL, 0, 0, 0,
  9, 2, 3, 4, 9, 0, 4, 3, 5, 4, 3, 1, 5, 10, 8,
  '["Fast Charging","Street Smart","i-SMART Connected","City Commuter"]',
  NULL, 'Excite with AC fast charging support'
),
(
  'COM-EXCLUSIVE', 'MG Comet EV', 'Exclusive', 'EV', 4,
  972800, 'u10',
  NULL, 230, NULL, 42, 110, 'Automatic',
  2, 0, NULL,
  0, 0, 0, 0, 0, 0,
  10.25, 4, 0, 1,
  0, NULL, NULL,
  155, NULL, 1, 0, 0,
  9, 2, 4, 5, 9, 0, 5, 3, 5, 5, 5, 1, 6, 10, 7,
  '["Leather Seats","Digital Key","i-SMART 2.0","Disc Brakes","ESC+HHC"]',
  NULL, 'Premium micro EV with leather and smart entry'
),
(
  'COM-EXCLUSIVE-FC', 'MG Comet EV', 'Exclusive FC', 'EV', 4,
  999800, 'u10',
  NULL, 230, NULL, 42, 110, 'Automatic',
  2, 0, NULL,
  0, 0, 0, 0, 0, 0,
  10.25, 4, 0, 1,
  1, NULL, 210,
  155, NULL, 1, 0, 0,
  9, 2, 4, 5, 9, 0, 5, 3, 5, 5, 5, 1, 6, 10, 7,
  '["Fast Charging","Leather Seats","Digital Key","i-SMART 2.0","Disc Brakes"]',
  NULL, 'Top Comet EV with fast charge + premium interior'
),
(
  'COM-BLACKSTORM', 'MG Comet EV', 'Blackstorm Edition', 'EV', 4,
  999800, 'u10',
  NULL, 230, NULL, 42, 110, 'Automatic',
  2, 0, NULL,
  0, 0, 0, 0, 0, 0,
  10.25, 4, 0, 1,
  0, NULL, NULL,
  155, NULL, 1, 0, 0,
  9, 2, 4, 6, 9, 0, 5, 3, 5, 5, 6, 1, 6, 10, 7,
  '["Special Edition","Blackstorm Styling","Leather Seats","i-SMART 2.0"]',
  NULL, 'Bold limited edition Comet EV'
);
