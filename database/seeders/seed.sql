-- ================================================================
-- AirServe Pro — Seed Data (Sample / Demo Records)
-- Run AFTER schema.sql
-- ================================================================
USE airserve_db;

-- ────────────────────────────────────────────────────────────────
-- USERS
-- All demo passwords: demo1234
-- Bcrypt hash of "demo1234" (12 rounds)
-- ────────────────────────────────────────────────────────────────
INSERT INTO users (full_name, email, password, role, phone, address) VALUES
('Mark Gonzales',   'admin@demo.com',    '$2a$12$XGhTjvUFwqJCnTp.cjE1.eV8K9lPQCJj3AYGX3Neh7QxCqQGCRqWu', 'admin',      '0917-100-0001', 'AirServe Pro HQ, Quezon City'),
('Jane Dela Cruz',  'customer@demo.com', '$2a$12$XGhTjvUFwqJCnTp.cjE1.eV8K9lPQCJj3AYGX3Neh7QxCqQGCRqWu', 'customer',   '0912-345-6789', '123 Rizal Street, Quezon City'),
('Rico Castillo',   'tech@demo.com',     '$2a$12$XGhTjvUFwqJCnTp.cjE1.eV8K9lPQCJj3AYGX3Neh7QxCqQGCRqWu', 'technician', '0923-456-7890', 'Caloocan City'),
('Lito Santos',     'lito@demo.com',     '$2a$12$XGhTjvUFwqJCnTp.cjE1.eV8K9lPQCJj3AYGX3Neh7QxCqQGCRqWu', 'technician', '0934-567-8901', 'Marikina City'),
('Ana Reyes',       'ana@demo.com',      '$2a$12$XGhTjvUFwqJCnTp.cjE1.eV8K9lPQCJj3AYGX3Neh7QxCqQGCRqWu', 'technician', '0945-678-9012', 'Pasig City'),
('Pedro Santos',    'pedro@demo.com',    '$2a$12$XGhTjvUFwqJCnTp.cjE1.eV8K9lPQCJj3AYGX3Neh7QxCqQGCRqWu', 'customer',   '0956-789-0123', '456 Bonifacio Ave, QC'),
('Maria Ocampo',    'maria@demo.com',    '$2a$12$XGhTjvUFwqJCnTp.cjE1.eV8K9lPQCJj3AYGX3Neh7QxCqQGCRqWu', 'customer',   '0967-890-1234', '789 Mabini Road, Makati');

-- ────────────────────────────────────────────────────────────────
-- SERVICES
-- ────────────────────────────────────────────────────────────────
INSERT INTO services (name, description, base_price, duration_hours) VALUES
('AC Installation',          'Professional installation of air conditioning units including mounting, wiring, and testing.',          2500.00, 4.0),
('AC Repair',                'Diagnosis and repair of faulty air conditioning units — all brands and types.',                          800.00, 2.0),
('Cleaning & Maintenance',   'Full cleaning of indoor and outdoor units, filter wash, and performance check.',                         500.00, 1.5),
('AC Inspection',            'Detailed inspection and assessment report for air conditioning units.',                                  350.00, 1.0),
('Refrigerant Recharge',     'Refilling of refrigerant gas (R-32, R-410A) for optimal cooling performance.',                         1200.00, 1.5),
('Electrical Check',         'Safety inspection of wiring, capacitors, and electrical components.',                                   600.00, 1.0);

-- ────────────────────────────────────────────────────────────────
-- PRODUCTS
-- ────────────────────────────────────────────────────────────────
INSERT INTO products (name, description, sku, category, price, stock_quantity, low_stock_threshold) VALUES
('Window Type AC 0.75HP',    'Panasonic inverter window type — ideal for small rooms.',          'AC-WIN-075', 'AC Unit',     14500.00, 12, 3),
('Window Type AC 1.0HP',     'Carrier standard window type — budget-friendly.',                  'AC-WIN-100', 'AC Unit',     16800.00,  8, 3),
('Split Type AC 1.0HP',      'Daikin split-type inverter — energy efficient.',                   'AC-SPL-100', 'AC Unit',     28500.00,  5, 2),
('Split Type AC 1.5HP',      'LG dual inverter split-type — fast cooling.',                      'AC-SPL-150', 'AC Unit',     34000.00,  4, 2),
('Refrigerant R-410A 1kg',   'Standard grade refrigerant for newer AC units.',                   'REF-R410-1K','Refrigerant',   950.00,  3, 5),
('Refrigerant R-32 1kg',     'Eco-friendly refrigerant for inverter ACs.',                       'REF-R32-1K', 'Refrigerant',  1100.00,  6, 5),
('AC Filter Set (5pcs)',      'Universal washable filter — fits most window and split types.',    'FLT-UNV-5PK','Parts',         280.00, 28, 10),
('Capacitor 25uF / 450V',    'Start/run capacitor for compressor and fan motor.',                'CAP-25UF-450','Parts',        420.00,  9, 5),
('Split AC Fan Motor',        'Indoor unit replacement fan motor — universal fit.',               'MOT-FAN-SPL','Parts',        1200.00,  0, 3),
('AC Coil Cleaner Spray',     'Non-rinse evaporator coil cleaner — 500ml.',                      'CLN-COIL-500','Supplies',      180.00, 42, 10),
('Drain Pan Cleaner Tablet',  'Anti-algae drain pan tablets — pack of 12.',                      'CLN-DRN-12P','Supplies',      120.00, 35, 10),
('Copper Pipe 1/4" (per ft)', 'Refrigerant-grade copper tubing for new installations.',          'PPE-COP-025','Materials',      85.00, 200, 50);

-- ────────────────────────────────────────────────────────────────
-- SAMPLE BOOKINGS
-- ────────────────────────────────────────────────────────────────
INSERT INTO service_requests (booking_code, customer_id, service_id, technician_id, scheduled_date, scheduled_time, address, status, payment_status, total_amount) VALUES
('SRQ-2026-042', 2, 2, 3, '2026-03-29', '09:00:00', '123 Rizal St., Quezon City', 'in_progress', 'unpaid', 850.00),
('SRQ-2026-044', 2, 3, NULL,'2026-04-03', '09:00:00', '123 Rizal St., Quezon City', 'confirmed', 'unpaid', 700.00),
('SRQ-2026-038', 2, 1, 4, '2026-02-15', '10:00:00', '123 Rizal St., Quezon City', 'completed', 'paid', 2800.00),
('SRQ-2026-043', 6, 1, 4, '2026-03-29', '14:00:00', '456 Bonifacio Ave., QC',    'confirmed', 'paid', 2800.00),
('SRQ-2026-045', 7, 3, NULL,'2026-04-01', '09:00:00', '789 Mabini Rd., Makati',   'pending', 'unpaid', 550.00);

-- ────────────────────────────────────────────────────────────────
-- SAMPLE DIAGNOSTICS
-- ────────────────────────────────────────────────────────────────
INSERT INTO diagnostics (booking_id, ac_type, problem, years_owned, location_type, previously_repaired, notes) VALUES
(1, 'split',  'Leaking water',  '1-3 years', 'residential', 1, 'Water drips from indoor unit every few hours. Still cools but reduced efficiency.'),
(2, 'window', 'Routine only',   '1-3 years', 'residential', 0, 'Annual cleaning and checkup.'),
(3, 'split',  'New unit',       'New',        'residential', 0, 'Brand new split-type installation, living room.'),
(5, 'window', 'Routine only',   '3-5 years', 'residential', 0, 'Regular cleaning.');

-- ────────────────────────────────────────────────────────────────
-- SAMPLE PAYMENTS
-- ────────────────────────────────────────────────────────────────
INSERT INTO payments (booking_id, customer_id, amount, currency, method, status, paymongo_payment_id, paid_at) VALUES
(3, 2, 2800.00, 'PHP', 'gcash', 'paid', 'pay_demo_gcash_001', '2026-02-15 14:30:00'),
(4, 6, 2800.00, 'PHP', 'card',  'paid', 'pay_demo_card_001',  '2026-03-29 08:00:00');

-- ────────────────────────────────────────────────────────────────
-- SAMPLE NOTIFICATIONS
-- ────────────────────────────────────────────────────────────────
INSERT INTO notifications (user_id, title, message, type) VALUES
(2, 'Booking Confirmed',    'Your booking SRQ-2026-044 for AC Cleaning on Apr 3, 2026 has been confirmed.', 'booking'),
(2, 'Technician Assigned',  'Rico Castillo has been assigned to your booking SRQ-2026-042.', 'booking'),
(2, 'Payment Received',     'Payment of ₱2,800.00 via GCash confirmed for booking SRQ-2026-038.', 'payment'),
(1, 'New Booking',          'New booking SRQ-2026-045 from Maria Ocampo requires approval.', 'booking'),
(1, 'Low Stock Alert',      'Refrigerant R-410A has only 3 units remaining. Consider restocking.', 'alert'),
(3, 'New Task Assigned',    'You have been assigned to SRQ-2026-042 — Jane Dela Cruz, AC Repair, Mar 29.', 'booking');
