-- ================================================================
-- AirServe Pro — Database Schema
-- Database: airserve_db
-- Run this file in MySQL Workbench or via: mysql -u root -p < schema.sql
-- ================================================================

CREATE DATABASE IF NOT EXISTS airserve_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE airserve_db;

-- ────────────────────────────────────────────────────────────────
-- USERS (customers, admins, technicians)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  full_name    VARCHAR(150)  NOT NULL,
  email        VARCHAR(150)  NOT NULL UNIQUE,
  password     VARCHAR(255)  NOT NULL,
  role         ENUM('customer','admin','technician') NOT NULL DEFAULT 'customer',
  phone        VARCHAR(20),
  address      TEXT,
  status       ENUM('active','inactive','suspended') NOT NULL DEFAULT 'active',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ────────────────────────────────────────────────────────────────
-- SERVICES (types of AC services offered)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(150)   NOT NULL,
  description    TEXT,
  base_price     DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  duration_hours DECIMAL(4,1)   NOT NULL DEFAULT 1.0,
  is_active      TINYINT(1)     NOT NULL DEFAULT 1,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ────────────────────────────────────────────────────────────────
-- SERVICE REQUESTS (bookings)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_requests (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  booking_code     VARCHAR(30)   NOT NULL UNIQUE,
  customer_id      INT           NOT NULL,
  service_id       INT           NOT NULL,
  technician_id    INT,
  scheduled_date   DATE          NOT NULL,
  scheduled_time   TIME          NOT NULL,
  address          TEXT          NOT NULL,
  status           ENUM('pending','confirmed','in_progress','completed','cancelled')
                                 NOT NULL DEFAULT 'pending',
  payment_status   ENUM('unpaid','pending','paid','refunded') NOT NULL DEFAULT 'unpaid',
  total_amount     DECIMAL(10,2) DEFAULT NULL,
  admin_notes      TEXT,
  tech_notes       TEXT,
  completion_date  DATETIME,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id)   REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (service_id)    REFERENCES services(id) ON DELETE RESTRICT,
  FOREIGN KEY (technician_id) REFERENCES users(id)    ON DELETE SET NULL
);

-- ────────────────────────────────────────────────────────────────
-- DIAGNOSTICS (answers to diagnostic questionnaire)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS diagnostics (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  booking_id          INT NOT NULL UNIQUE,
  ac_type             ENUM('window','split','inverter','portable','central') NOT NULL,
  problem             VARCHAR(100),
  years_owned         VARCHAR(50),
  location_type       ENUM('residential','office','commercial') DEFAULT 'residential',
  previously_repaired TINYINT(1) DEFAULT 0,
  notes               TEXT,
  photo_path          VARCHAR(500),
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES service_requests(id) ON DELETE CASCADE
);

-- ────────────────────────────────────────────────────────────────
-- PAYMENTS (PayMongo transaction records)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id                      INT AUTO_INCREMENT PRIMARY KEY,
  booking_id              INT,
  order_id                INT,
  customer_id             INT           NOT NULL,
  amount                  DECIMAL(10,2) NOT NULL,
  currency                VARCHAR(5)    NOT NULL DEFAULT 'PHP',
  method                  ENUM('gcash','card','paymaya','billease','cod','bank_transfer') NOT NULL,
  status                  ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  -- PayMongo IDs
  paymongo_source_id      VARCHAR(100),
  paymongo_intent_id      VARCHAR(100),
  paymongo_payment_id     VARCHAR(100),
  paymongo_checkout_url   TEXT,
  -- Timestamps
  paid_at                 DATETIME,
  created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id)  REFERENCES service_requests(id) ON DELETE SET NULL
);

-- ────────────────────────────────────────────────────────────────
-- PRODUCTS (parts, AC units, accessories)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(200)  NOT NULL,
  description    TEXT,
  sku            VARCHAR(80)   NOT NULL UNIQUE,
  category       VARCHAR(80),
  price          DECIMAL(10,2) NOT NULL,
  stock_quantity INT           NOT NULL DEFAULT 0,
  low_stock_threshold INT      DEFAULT 5,
  is_active      TINYINT(1)   DEFAULT 1,
  image_path     VARCHAR(500),
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ────────────────────────────────────────────────────────────────
-- ORDERS (product purchases)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  customer_id    INT           NOT NULL,
  total_amount   DECIMAL(10,2) NOT NULL,
  status         ENUM('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  payment_status ENUM('unpaid','paid','refunded') DEFAULT 'unpaid',
  shipping_address TEXT,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  order_id    INT           NOT NULL,
  product_id  INT           NOT NULL,
  quantity    INT           NOT NULL,
  unit_price  DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- ────────────────────────────────────────────────────────────────
-- NOTIFICATIONS
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT          NOT NULL,
  title      VARCHAR(200) NOT NULL,
  message    TEXT         NOT NULL,
  type       ENUM('booking','payment','system','alert') DEFAULT 'system',
  is_read    TINYINT(1)   DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ────────────────────────────────────────────────────────────────
-- INDEXES for performance
-- ────────────────────────────────────────────────────────────────
CREATE INDEX idx_sr_customer    ON service_requests(customer_id);
CREATE INDEX idx_sr_technician  ON service_requests(technician_id);
CREATE INDEX idx_sr_status      ON service_requests(status);
CREATE INDEX idx_sr_date        ON service_requests(scheduled_date);
CREATE INDEX idx_pay_booking    ON payments(booking_id);
CREATE INDEX idx_pay_status     ON payments(status);
CREATE INDEX idx_notif_user     ON notifications(user_id, is_read);
