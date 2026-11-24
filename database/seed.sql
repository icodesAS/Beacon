-- Beacon Seed Data
-- Demo account: demo@beacon.local / Demo1234

USE beacon;

-- Password hash is BCrypt for "Demo1234"
INSERT INTO users (full_name, email, password_hash)
SELECT 'Aarav Sharma', 'demo@beacon.local', '$2a$10$w1Hg8djMuwM9K2ajpsXuOOYIMrZjl7gvtCs14X9UsEjNYHIt3wVLa'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'demo@beacon.local'
);

SET @demo_user_id = (SELECT id FROM users WHERE email = 'demo@beacon.local' LIMIT 1);

INSERT INTO contacts (user_id, name, phone, relation)
SELECT @demo_user_id, 'Priya Sharma', '9876543210', 'PARENT'
WHERE NOT EXISTS (
  SELECT 1 FROM contacts WHERE user_id = @demo_user_id AND phone = '9876543210'
);

INSERT INTO contacts (user_id, name, phone, relation)
SELECT @demo_user_id, 'Rohan Verma', '9823456789', 'FRIEND'
WHERE NOT EXISTS (
  SELECT 1 FROM contacts WHERE user_id = @demo_user_id AND phone = '9823456789'
);

INSERT INTO contacts (user_id, name, phone, relation)
SELECT @demo_user_id, 'Dr. Meera Nair', '9765432109', 'DOCTOR'
WHERE NOT EXISTS (
  SELECT 1 FROM contacts WHERE user_id = @demo_user_id AND phone = '9765432109'
);

INSERT INTO alerts (user_id, category, priority, message, location_text, status, created_at)
SELECT @demo_user_id, 'MEDICAL', 1, 'I need urgent medical help. Please call me or come to my location as soon as you can.', 'Hostel Block B, Room 204', 'RESOLVED', NOW() - INTERVAL 2 DAY
WHERE NOT EXISTS (
  SELECT 1 FROM alerts WHERE user_id = @demo_user_id AND category = 'MEDICAL'
);

SET @alert1_id = (SELECT id FROM alerts WHERE user_id = @demo_user_id AND category = 'MEDICAL' LIMIT 1);

INSERT INTO alert_recipients (alert_id, contact_name, contact_phone, contact_relation)
SELECT @alert1_id, 'Priya Sharma', '9876543210', 'PARENT'
WHERE @alert1_id IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM alert_recipients WHERE alert_id = @alert1_id AND contact_phone = '9876543210'
);

INSERT INTO alert_recipients (alert_id, contact_name, contact_phone, contact_relation)
SELECT @alert1_id, 'Dr. Meera Nair', '9765432109', 'DOCTOR'
WHERE @alert1_id IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM alert_recipients WHERE alert_id = @alert1_id AND contact_phone = '9765432109'
);

INSERT INTO alerts (user_id, category, priority, message, location_text, status, created_at)
SELECT @demo_user_id, 'ACCIDENT', 2, 'I have been in an accident and need help. Please call me right away.', 'MG Road Crossing', 'SENT', NOW() - INTERVAL 6 HOUR
WHERE NOT EXISTS (
  SELECT 1 FROM alerts WHERE user_id = @demo_user_id AND category = 'ACCIDENT'
);

SET @alert2_id = (SELECT id FROM alerts WHERE user_id = @demo_user_id AND category = 'ACCIDENT' LIMIT 1);

INSERT INTO alert_recipients (alert_id, contact_name, contact_phone, contact_relation)
SELECT @alert2_id, 'Priya Sharma', '9876543210', 'PARENT'
WHERE @alert2_id IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM alert_recipients WHERE alert_id = @alert2_id AND contact_phone = '9876543210'
);

INSERT INTO alert_recipients (alert_id, contact_name, contact_phone, contact_relation)
SELECT @alert2_id, 'Rohan Verma', '9823456789', 'FRIEND'
WHERE @alert2_id IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM alert_recipients WHERE alert_id = @alert2_id AND contact_phone = '9823456789'
);
