-- ============================================================
-- School Management System - Oracle Database Setup Script
-- ============================================================
-- Database: Oracle 11g/12c/19c/21c
-- Purpose: Create user, tablespace, and initial schema
-- ============================================================

-- ====================
-- 1. CREATE TABLESPACE
-- ====================
-- Run as SYSTEM or DBA user

CREATE TABLESPACE school_data
    DATAFILE 'school_data.dbf'
    SIZE 500M
    AUTOEXTEND ON
    NEXT 100M
    MAXSIZE UNLIMITED
    EXTENT MANAGEMENT LOCAL
    SEGMENT SPACE MANAGEMENT AUTO;

CREATE TEMPORARY TABLESPACE school_temp
    TEMPFILE 'school_temp.dbf'
    SIZE 100M
    AUTOEXTEND ON
    NEXT 50M
    MAXSIZE UNLIMITED;

-- ====================
-- 2. CREATE USER
-- ====================

CREATE USER school_admin IDENTIFIED BY school_admin
    DEFAULT TABLESPACE school_data
    TEMPORARY TABLESPACE school_temp
    QUOTA UNLIMITED ON school_data;

-- ====================
-- 3. GRANT PRIVILEGES
-- ====================

GRANT CONNECT, RESOURCE, CREATE VIEW, CREATE SEQUENCE TO school_admin;
GRANT CREATE SESSION TO school_admin;
GRANT CREATE TABLE TO school_admin;
GRANT CREATE PROCEDURE TO school_admin;
GRANT CREATE TRIGGER TO school_admin;
GRANT UNLIMITED TABLESPACE TO school_admin;

-- ====================
-- 4. CONNECT AS school_admin
-- ====================
-- Now connect as school_admin user and run the following

CONNECT school_admin/school_admin;

-- ====================
-- 5. CREATE SEQUENCES
-- ====================

CREATE SEQUENCE user_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE student_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE teacher_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE parent_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE class_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE section_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE subject_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE attendance_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE fee_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE exam_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE marks_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE homework_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE notice_seq START WITH 1 INCREMENT BY 1;

-- ====================
-- 6. VERIFY SETUP
-- ====================

SELECT tablespace_name, status, contents
FROM user_tablespaces;

SELECT sequence_name, last_number
FROM user_sequences;

-- ====================
-- SUCCESS MESSAGE
-- ====================

SELECT 'Oracle Database Setup Completed Successfully!' AS STATUS FROM DUAL;
SELECT 'User: school_admin created with all privileges' AS INFO FROM DUAL;
SELECT 'Tablespace: school_data created (500MB, auto-extend)' AS INFO FROM DUAL;
SELECT 'Ready for Spring Boot application startup' AS INFO FROM DUAL;

-- ====================
-- NOTES
-- ====================
-- 1. This script should be run as SYSTEM or DBA user first
-- 2. Spring Boot will automatically create tables via JPA/Hibernate
-- 3. Use these connection details in application.properties:
--    URL: jdbc:oracle:thin:@localhost:1521:XE
--    Username: school_admin
--    Password: school_admin
-- 4. For production, change the password!
-- ====================
