-- YesBroker AI: MySQL / MariaDB schema (run in hPanel > phpMyAdmin > SQL tab)
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS properties (
  id CHAR(36) NOT NULL PRIMARY KEY,
  property_code VARCHAR(50) NULL UNIQUE,
  project_name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  property_type VARCHAR(100) NOT NULL,
  seller_price BIGINT NOT NULL,                 -- absolute INR (8500000 = 85 Lakhs)
  minimum_price BIGINT NULL,                    -- PRIVATE negotiation floor, never sent to public APIs
  amenities JSON NULL,
  payment_plan TEXT NULL,
  builder_details TEXT NULL,
  locality_advantages TEXT NULL,
  brochure_url VARCHAR(500) NULL,
  price_sheet_url VARCHAR(500) NULL,
  floor_plan_url VARCHAR(500) NULL,
  image_url VARCHAR(500) NULL,
  kb_chunk_id VARCHAR(100) NULL,
  availability_status VARCHAR(30) NOT NULL DEFAULT 'available',
  total_units INT NULL,
  available_units INT NULL,
  possession_date VARCHAR(50) NULL,
  rera_number VARCHAR(100) NULL,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  view_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_properties_pub (is_published, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS leads (
  id CHAR(36) NOT NULL PRIMARY KEY,
  phone_number VARCHAR(30) NOT NULL UNIQUE,
  customer_name VARCHAR(255) NULL,
  email VARCHAR(255) NULL,
  budget_min BIGINT NULL,
  budget_max BIGINT NULL,
  preferred_location VARCHAR(255) NULL,
  property_type VARCHAR(100) NULL,
  loan_requirement VARCHAR(100) NULL,
  site_visit_interest VARCHAR(255) NULL,
  lead_status VARCHAR(30) NOT NULL DEFAULT 'captured',
  lead_score INT NOT NULL DEFAULT 0,
  interest_score INT NOT NULL DEFAULT 0,
  sentiment VARCHAR(30) NULL,
  next_action VARCHAR(500) NULL,
  assigned_to VARCHAR(255) NULL,
  source VARCHAR(50) NOT NULL DEFAULT 'frontend',
  last_call_id VARCHAR(100) NULL,
  last_event_type VARCHAR(100) NULL,
  call_count INT NOT NULL DEFAULT 0,
  negotiation_count INT NOT NULL DEFAULT 0,
  last_negotiated_price BIGINT NULL,
  negotiation_accepted TINYINT(1) NOT NULL DEFAULT 0,
  whatsapp_sent TINYINT(1) NOT NULL DEFAULT 0,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_leads_updated (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS call_logs (
  id CHAR(36) NOT NULL PRIMARY KEY,
  call_id VARCHAR(100) NOT NULL UNIQUE,
  assistant_id VARCHAR(100) NULL,
  customer_name VARCHAR(255) NULL,
  customer_phone VARCHAR(30) NULL,
  event_type VARCHAR(100) NULL,
  route VARCHAR(50) NULL,
  transcript MEDIUMTEXT NULL,
  summary TEXT NULL,
  sentiment VARCHAR(30) NULL,
  interest_score INT NULL,
  next_action VARCHAR(500) NULL,
  recording_url VARCHAR(1000) NULL,
  raw_payload LONGTEXT NULL,
  call_status VARCHAR(30) NOT NULL DEFAULT 'active',
  received_at DATETIME NULL,
  duration_seconds INT NULL,
  ended_reason VARCHAR(255) NULL,
  property_queried VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_call_logs_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS call_analytics (
  id CHAR(36) NOT NULL PRIMARY KEY,
  call_id VARCHAR(100) NOT NULL UNIQUE,
  customer_name VARCHAR(255) NULL,
  budget VARCHAR(100) NULL,
  preferred_location VARCHAR(255) NULL,
  interest_score INT NULL,
  sentiment VARCHAR(30) NULL,
  next_action VARCHAR(500) NULL,
  summary TEXT NULL,
  call_duration_seconds INT NULL,
  property_queried VARCHAR(255) NULL,
  negotiation_rounds INT NULL,
  final_offer BIGINT NULL,
  visit_booked TINYINT(1) NOT NULL DEFAULT 0,
  recording_url VARCHAR(1000) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS negotiation_logs (
  id CHAR(36) NOT NULL PRIMARY KEY,
  call_id VARCHAR(100) NOT NULL DEFAULT 'frontend',
  lead_phone VARCHAR(30) NOT NULL DEFAULT '',
  property_id CHAR(36) NULL,
  round_number INT NOT NULL DEFAULT 1,
  buyer_offer BIGINT NOT NULL,
  seller_price BIGINT NOT NULL,
  minimum_price BIGINT NULL,
  counter_offer BIGINT NULL,
  response_text TEXT NULL,
  accepted TINYINT(1) NOT NULL DEFAULT 0,
  buyer_interest_score INT NULL,
  escalated TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_neg_created (created_at),
  KEY idx_neg_property (property_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_visits (
  id CHAR(36) NOT NULL PRIMARY KEY,
  lead_phone VARCHAR(30) NOT NULL,
  lead_name VARCHAR(255) NULL,
  property_id CHAR(36) NULL,
  slot_start DATETIME NOT NULL,                 -- stored in UTC
  slot_end DATETIME NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'booked',
  notes TEXT NULL,
  source VARCHAR(50) NOT NULL DEFAULT 'frontend',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_visits_created (created_at),
  KEY idx_visits_property (property_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_users (
  id CHAR(36) NOT NULL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
