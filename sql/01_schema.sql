-- ============================================================
-- MG Car Recommendation Engine - Schema
-- ============================================================

USE mgmotors;

DROP TABLE IF EXISTS mg_variants;

CREATE TABLE mg_variants (
  -- Identity
  model_sales_code      VARCHAR(30)   NOT NULL PRIMARY KEY,
  model_name            VARCHAR(100)  NOT NULL,            -- e.g. "MG Hector"
  variant_name          VARCHAR(100)  NOT NULL,            -- e.g. "Sharp Pro"
  fuel_type             ENUM('Petrol','Diesel','EV')       NOT NULL,
  seater                TINYINT       NOT NULL,            -- 2,4,5,6,7

  -- Pricing
  ex_showroom_price     INT           NOT NULL,            -- in INR
  budget_band           ENUM('u10','10-15','15-20','20+')  NOT NULL,

  -- Performance / Range
  arai_mileage_kmpl     DECIMAL(4,1)  NULL,               -- petrol only
  ev_range_km           SMALLINT      NULL,                -- EV only
  engine_cc             SMALLINT      NULL,                -- petrol only
  power_ps              SMALLINT      NULL,
  torque_nm             SMALLINT      NULL,
  transmission          ENUM('MT','CVT','Automatic')       NOT NULL,

  -- Safety
  airbags               TINYINT       NOT NULL DEFAULT 0,
  has_adas              TINYINT(1)    NOT NULL DEFAULT 0,  -- Level 2 ADAS
  safety_stars          TINYINT       NULL,                -- NCAP stars (fill manually)

  -- Key feature flags (used for hard filters + scoring)
  has_sunroof           TINYINT(1)    NOT NULL DEFAULT 0,
  has_wireless_charger  TINYINT(1)    NOT NULL DEFAULT 0,
  has_360_camera        TINYINT(1)    NOT NULL DEFAULT 0,
  has_ventilated_seats  TINYINT(1)    NOT NULL DEFAULT 0,
  has_powered_tailgate  TINYINT(1)    NOT NULL DEFAULT 0,
  has_cruise_control    TINYINT(1)    NOT NULL DEFAULT 0,
  screen_size_inch      DECIMAL(4,1)  NULL,               -- infotainment screen inches
  speaker_count         TINYINT       NOT NULL DEFAULT 0,
  has_premium_audio     TINYINT(1)    NOT NULL DEFAULT 0,  -- JBL / Infinity / Harman
  has_connected_car     TINYINT(1)    NOT NULL DEFAULT 0,  -- i-SMART
  has_ev_fast_charge    TINYINT(1)    NOT NULL DEFAULT 0,  -- DC fast charge capable
  fast_charge_kw        TINYINT       NULL,
  charge_time_0_80_min  TINYINT       NULL,               -- fast charge 0-80% in mins
  ground_clearance_mm   SMALLINT      NULL,
  boot_space_litres     SMALLINT      NULL,
  has_leather_seats     TINYINT(1)    NOT NULL DEFAULT 0,
  has_pm25_filter       TINYINT(1)    NOT NULL DEFAULT 0,
  has_v2l              TINYINT(1)    NOT NULL DEFAULT 0,   -- Vehicle to Load (EV)

  -- Scores (1-10)
  score_city            TINYINT       NOT NULL DEFAULT 0,
  score_highway         TINYINT       NOT NULL DEFAULT 0,
  score_family          TINYINT       NOT NULL DEFAULT 0,
  score_business        TINYINT       NOT NULL DEFAULT 0,
  score_mileage         TINYINT       NOT NULL DEFAULT 0,
  score_adas            TINYINT       NOT NULL DEFAULT 0,
  score_comfort         TINYINT       NOT NULL DEFAULT 0,
  score_performance     TINYINT       NOT NULL DEFAULT 0,
  score_large_screen    TINYINT       NOT NULL DEFAULT 0,
  score_safety          TINYINT       NOT NULL DEFAULT 0,
  score_premium         TINYINT       NOT NULL DEFAULT 0,
  score_offroad         TINYINT       NOT NULL DEFAULT 0,
  score_tech            TINYINT       NOT NULL DEFAULT 0,
  score_eco             TINYINT       NOT NULL DEFAULT 0,
  score_value           TINYINT       NOT NULL DEFAULT 0,

  -- UI display
  card_tags             VARCHAR(400)  NULL,               -- JSON array string e.g. '["Daily City Usage","Lower Running Cost"]'
  car_image_url         VARCHAR(500)  NULL,               -- fill via /admin/image API
  tagline               VARCHAR(200)  NULL,               -- short card description

  -- Meta
  created_at            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Index for common filter queries
CREATE INDEX idx_fuel_budget  ON mg_variants (fuel_type, budget_band);
CREATE INDEX idx_price        ON mg_variants (ex_showroom_price);
CREATE INDEX idx_seater       ON mg_variants (seater);
