-- ============================================================
-- Hospital Management System — PostgreSQL Initial Setup
-- Run this ONCE to create the database before starting the app
-- ============================================================

-- 1. Create the database (run this as the postgres superuser)
CREATE DATABASE hospital_db
    WITH ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8';

-- 2. Connect to hospital_db and create a dedicated user (optional but recommended)
-- \c hospital_db

-- CREATE USER hospital_user WITH ENCRYPTED PASSWORD 'hospital_pass';
-- GRANT ALL PRIVILEGES ON DATABASE hospital_db TO hospital_user;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO hospital_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO hospital_user;

-- ============================================================
-- Note: Hibernate's ddl-auto=update will create all tables
-- automatically from the JPA entities. You DON'T need to
-- write CREATE TABLE statements manually.
-- ============================================================

-- After the app starts, these tables will be auto-created:
-- users, user_roles, staff, attendance, payroll,
-- patients, appointments, queue, support_tickets, ticket_comments

-- You can verify by running:
-- \dt
