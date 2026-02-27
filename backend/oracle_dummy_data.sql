-- ============================================================
-- School Management System - Oracle Dummy Data Script
-- ============================================================
-- Run this AFTER Spring Boot has created the tables
-- Connect as: school_admin
-- ============================================================

CONNECT school_admin/school_admin;

-- Clean existing data (optional - for fresh start)
-- DELETE FROM marks;
-- DELETE FROM exam_schedules;
-- DELETE FROM examinations;
-- DELETE FROM homework;
-- DELETE FROM attendance;
-- DELETE FROM fee_payments;
-- DELETE FROM fee_structures;
-- DELETE FROM teacher_subject_assignments;
-- DELETE FROM students;
-- DELETE FROM parents;
-- DELETE FROM teachers;
-- DELETE FROM subjects;
-- DELETE FROM sections;
-- DELETE FROM classes;
-- DELETE FROM academic_years;
-- DELETE FROM notices;
-- DELETE FROM user_roles;
-- DELETE FROM users;
-- COMMIT;

-- ====================
-- 1. ACADEMIC YEARS
-- ====================

INSERT INTO academic_years (id, name, start_date, end_date, is_active, created_date, updated_date)
VALUES (academic_year_seq.NEXTVAL, '2024-2025', TO_DATE('2024-04-01', 'YYYY-MM-DD'), TO_DATE('2025-03-31', 'YYYY-MM-DD'), 1, SYSTIMESTAMP, SYSTIMESTAMP);

INSERT INTO academic_years (id, name, start_date, end_date, is_active, created_date, updated_date)
VALUES (academic_year_seq.NEXTVAL, '2023-2024', TO_DATE('2023-04-01', 'YYYY-MM-DD'), TO_DATE('2024-03-31', 'YYYY-MM-DD'), 0, SYSTIMESTAMP, SYSTIMESTAMP);

-- ====================
-- 2. CLASSES
-- ====================

INSERT INTO classes (id, name, description, created_date, updated_date)
VALUES (class_seq.NEXTVAL, 'Class 1', 'First Grade', SYSTIMESTAMP, SYSTIMESTAMP);

INSERT INTO classes (id, name, description, created_date, updated_date)
VALUES (class_seq.NEXTVAL, 'Class 2', 'Second Grade', SYSTIMESTAMP, SYSTIMESTAMP);

INSERT INTO classes (id, name, description, created_date, updated_date)
VALUES (class_seq.NEXTVAL, 'Class 3', 'Third Grade', SYSTIMESTAMP, SYSTIMESTAMP);

INSERT INTO classes (id, name, description, created_date, updated_date)
VALUES (class_seq.NEXTVAL, 'Class 4', 'Fourth Grade', SYSTIMESTAMP, SYSTIMESTAMP);

INSERT INTO classes (id, name, description, created_date, updated_date)
VALUES (class_seq.NEXTVAL, 'Class 5', 'Fifth Grade', SYSTIMESTAMP, SYSTIMESTAMP);

-- ====================
-- 3. SECTIONS
-- ====================

-- Class 1 Sections
INSERT INTO sections (id, name, capacity, class_id, created_date, updated_date)
VALUES (section_seq.NEXTVAL, 'A', 40, 1, SYSTIMESTAMP, SYSTIMESTAMP);

INSERT INTO sections (id, name, capacity, class_id, created_date, updated_date)
VALUES (section_seq.NEXTVAL, 'B', 40, 1, SYSTIMESTAMP, SYSTIMESTAMP);

-- Class 2 Sections
INSERT INTO sections (id, name, capacity, class_id, created_date, updated_date)
VALUES (section_seq.NEXTVAL, 'A', 40, 2, SYSTIMESTAMP, SYSTIMESTAMP);

INSERT INTO sections (id, name, capacity, class_id, created_date, updated_date)
VALUES (section_seq.NEXTVAL, 'B', 40, 2, SYSTIMESTAMP, SYSTIMESTAMP);

-- Class 3 Sections
INSERT INTO sections (id, name, capacity, class_id, created_date, updated_date)
VALUES (section_seq.NEXTVAL, 'A', 40, 3, SYSTIMESTAMP, SYSTIMESTAMP);

-- ====================
-- 4. SUBJECTS
-- ====================

INSERT INTO subjects (id, name, code, type, theory_max_marks, practical_max_marks, pass_marks, created_date, updated_date)
VALUES (subject_seq.NEXTVAL, 'Mathematics', 'MATH', 'CORE', 100, 0, 40, SYSTIMESTAMP, SYSTIMESTAMP);

INSERT INTO subjects (id, name, code, type, theory_max_marks, practical_max_marks, pass_marks, created_date, updated_date)
VALUES (subject_seq.NEXTVAL, 'Science', 'SCI', 'CORE', 80, 20, 40, SYSTIMESTAMP, SYSTIMESTAMP);

INSERT INTO subjects (id, name, code, type, theory_max_marks, practical_max_marks, pass_marks, created_date, updated_date)
VALUES (subject_seq.NEXTVAL, 'English', 'ENG', 'CORE', 100, 0, 40, SYSTIMESTAMP, SYSTIMESTAMP);

INSERT INTO subjects (id, name, code, type, theory_max_marks, practical_max_marks, pass_marks, created_date, updated_date)
VALUES (subject_seq.NEXTVAL, 'Social Studies', 'SST', 'CORE', 100, 0, 40, SYSTIMESTAMP, SYSTIMESTAMP);

INSERT INTO subjects (id, name, code, type, theory_max_marks, practical_max_marks, pass_marks, created_date, updated_date)
VALUES (subject_seq.NEXTVAL, 'Computer Science', 'CS', 'ELECTIVE', 60, 40, 40, SYSTIMESTAMP, SYSTIMESTAMP);

-- ====================
-- 5. USERS (Admin, Teachers, Parents)
-- ====================

-- Admin User (password: admin123 - BCrypt hash)
INSERT INTO users (id, username, password, email, role, first_name, last_name, phone, is_active, created_date, updated_date)
VALUES (user_seq.NEXTVAL, 'admin', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6', 'admin@school.com', 'ADMIN', 'System', 'Administrator', '1234567890', 1, SYSTIMESTAMP, SYSTIMESTAMP);

-- Teacher 1 (password: teacher123)
INSERT INTO users (id, username, password, email, role, first_name, last_name, phone, is_active, created_date, updated_date)
VALUES (user_seq.NEXTVAL, 'teacher1', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6', 'teacher1@school.com', 'TEACHER', 'John', 'Smith', '1234567891', 1, SYSTIMESTAMP, SYSTIMESTAMP);

-- Teacher 2 (password: teacher123)
INSERT INTO users (id, username, password, email, role, first_name, last_name, phone, is_active, created_date, updated_date)
VALUES (user_seq.NEXTVAL, 'teacher2', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6', 'teacher2@school.com', 'TEACHER', 'Sarah', 'Johnson', '1234567892', 1, SYSTIMESTAMP, SYSTIMESTAMP);

-- Parent 1 (password: parent123)
INSERT INTO users (id, username, password, email, role, first_name, last_name, phone, is_active, created_date, updated_date)
VALUES (user_seq.NEXTVAL, 'parent1', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6', 'parent1@email.com', 'PARENT', 'Robert', 'Williams', '1234567893', 1, SYSTIMESTAMP, SYSTIMESTAMP);

-- Parent 2 (password: parent123)
INSERT INTO users (id, username, password, email, role, first_name, last_name, phone, is_active, created_date, updated_date)
VALUES (user_seq.NEXTVAL, 'parent2', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6', 'parent2@email.com', 'PARENT', 'Mary', 'Brown', '1234567894', 1, SYSTIMESTAMP, SYSTIMESTAMP);

-- ====================
-- 6. TEACHERS
-- ====================

INSERT INTO teachers (id, user_id, employee_id, qualification, specialization, date_of_joining, salary, address, created_date, updated_date)
VALUES (teacher_seq.NEXTVAL, 2, 'TCH001', 'M.Sc Mathematics', 'Mathematics', TO_DATE('2020-06-01', 'YYYY-MM-DD'), 45000, '123 Main St, City', SYSTIMESTAMP, SYSTIMESTAMP);

INSERT INTO teachers (id, user_id, employee_id, qualification, specialization, date_of_joining, salary, address, created_date, updated_date)
VALUES (teacher_seq.NEXTVAL, 3, 'TCH002', 'M.Sc Science', 'Science', TO_DATE('2021-07-15', 'YYYY-MM-DD'), 42000, '456 Oak Ave, City', SYSTIMESTAMP, SYSTIMESTAMP);

-- ====================
-- 7. PARENTS
-- ====================

INSERT INTO parents (id, user_id, occupation, annual_income, address, created_date, updated_date)
VALUES (parent_seq.NEXTVAL, 4, 'Engineer', 800000, '789 Pine Road, City', SYSTIMESTAMP, SYSTIMESTAMP);

INSERT INTO parents (id, user_id, occupation, annual_income, address, created_date, updated_date)
VALUES (parent_seq.NEXTVAL, 5, 'Doctor', 1200000, '321 Elm Street, City', SYSTIMESTAMP, SYSTIMESTAMP);

-- ====================
-- 8. STUDENTS
-- ====================

INSERT INTO students (id, admission_number, first_name, last_name, date_of_birth, gender, blood_group, address, parent_id, class_id, section_id, academic_year_id, admission_date, status, created_date, updated_date)
VALUES (student_seq.NEXTVAL, 'STU2024001', 'Michael', 'Williams', TO_DATE('2014-05-15', 'YYYY-MM-DD'), 'MALE', 'O+', '789 Pine Road, City', 1, 1, 1, 1, TO_DATE('2024-04-01', 'YYYY-MM-DD'), 'ACTIVE', SYSTIMESTAMP, SYSTIMESTAMP);

INSERT INTO students (id, admission_number, first_name, last_name, date_of_birth, gender, blood_group, address, parent_id, class_id, section_id, academic_year_id, admission_date, status, created_date, updated_date)
VALUES (student_seq.NEXTVAL, 'STU2024002', 'Emily', 'Williams', TO_DATE('2015-08-22', 'YYYY-MM-DD'), 'FEMALE', 'A+', '789 Pine Road, City', 1, 2, 3, 1, TO_DATE('2024-04-01', 'YYYY-MM-DD'), 'ACTIVE', SYSTIMESTAMP, SYSTIMESTAMP);

INSERT INTO students (id, admission_number, first_name, last_name, date_of_birth, gender, blood_group, address, parent_id, class_id, section_id, academic_year_id, admission_date, status, created_date, updated_date)
VALUES (student_seq.NEXTVAL, 'STU2024003', 'James', 'Brown', TO_DATE('2014-03-10', 'YYYY-MM-DD'), 'MALE', 'B+', '321 Elm Street, City', 2, 1, 1, 1, TO_DATE('2024-04-01', 'YYYY-MM-DD'), 'ACTIVE', SYSTIMESTAMP, SYSTIMESTAMP);

-- ====================
-- 9. FEE STRUCTURES
-- ====================

INSERT INTO fee_structures (id, class_id, academic_year_id, tuition_fee, transport_fee, library_fee, lab_fee, sports_fee, other_fee, total_fee, created_date, updated_date)
VALUES (fee_seq.NEXTVAL, 1, 1, 25000, 5000, 1000, 2000, 1500, 500, 35000, SYSTIMESTAMP, SYSTIMESTAMP);

INSERT INTO fee_structures (id, class_id, academic_year_id, tuition_fee, transport_fee, library_fee, lab_fee, sports_fee, other_fee, total_fee, created_date, updated_date)
VALUES (fee_seq.NEXTVAL, 2, 1, 27000, 5000, 1200, 2200, 1500, 600, 37500, SYSTIMESTAMP, SYSTIMESTAMP);

-- ====================
-- 10. EXAMINATIONS
-- ====================

INSERT INTO examinations (id, name, type, academic_year_id, start_date, end_date, result_publish_date, is_published, created_date, updated_date)
VALUES (exam_seq.NEXTVAL, 'First Terminal Exam 2024', 'UNIT_TEST', 1, TO_DATE('2024-07-15', 'YYYY-MM-DD'), TO_DATE('2024-07-25', 'YYYY-MM-DD'), TO_DATE('2024-08-01', 'YYYY-MM-DD'), 1, SYSTIMESTAMP, SYSTIMESTAMP);

INSERT INTO examinations (id, name, type, academic_year_id, start_date, end_date, result_publish_date, is_published, created_date, updated_date)
VALUES (exam_seq.NEXTVAL, 'Mid Term Exam 2024', 'MIDTERM', 1, TO_DATE('2024-10-01', 'YYYY-MM-DD'), TO_DATE('2024-10-15', 'YYYY-MM-DD'), TO_DATE('2024-10-25', 'YYYY-MM-DD'), 0, SYSTIMESTAMP, SYSTIMESTAMP);

-- ====================
-- 11. NOTICES
-- ====================

INSERT INTO notices (id, title, content, type, priority, target_audience, publish_date, expiry_date, published_by_id, is_active, created_date, updated_date)
VALUES (notice_seq.NEXTVAL, 'School Reopening Notice', 'School will reopen on 1st April 2024 after summer vacation. All students are requested to report on time.', 'GENERAL', 'HIGH', 'ALL', TO_DATE('2024-03-25', 'YYYY-MM-DD'), TO_DATE('2024-04-05', 'YYYY-MM-DD'), 1, 1, SYSTIMESTAMP, SYSTIMESTAMP);

INSERT INTO notices (id, title, content, type, priority, target_audience, publish_date, expiry_date, published_by_id, is_active, created_date, updated_date)
VALUES (notice_seq.NEXTVAL, 'Fee Payment Reminder', 'Parents are requested to pay the first term fees by 15th April 2024. Late payment will incur penalty.', 'FEE', 'URGENT', 'PARENTS', TO_DATE('2024-04-01', 'YYYY-MM-DD'), TO_DATE('2024-04-15', 'YYYY-MM-DD'), 1, 1, SYSTIMESTAMP, SYSTIMESTAMP);

INSERT INTO notices (id, title, content, type, priority, target_audience, publish_date, expiry_date, published_by_id, is_active, created_date, updated_date)
VALUES (notice_seq.NEXTVAL, 'Parent-Teacher Meeting', 'A parent-teacher meeting is scheduled for 20th April 2024 at 10:00 AM in the school auditorium. All parents are requested to attend.', 'EVENT', 'NORMAL', 'PARENTS', TO_DATE('2024-04-10', 'YYYY-MM-DD'), TO_DATE('2024-04-20', 'YYYY-MM-DD'), 1, 1, SYSTIMESTAMP, SYSTIMESTAMP);

-- ====================
-- COMMIT ALL CHANGES
-- ====================

COMMIT;

-- ====================
-- VERIFY DATA
-- ====================

SELECT 'Data Insertion Completed!' AS STATUS FROM DUAL;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_students FROM students;
SELECT COUNT(*) AS total_teachers FROM teachers;
SELECT COUNT(*) AS total_parents FROM parents;
SELECT COUNT(*) AS total_classes FROM classes;
SELECT COUNT(*) AS total_sections FROM sections;
SELECT COUNT(*) AS total_subjects FROM subjects;
SELECT COUNT(*) AS total_notices FROM notices;

-- ====================
-- LOGIN CREDENTIALS
-- ====================

SELECT 'LOGIN CREDENTIALS:' AS INFO FROM DUAL;
SELECT 'Admin - Username: admin, Password: admin123' AS CREDENTIALS FROM DUAL;
SELECT 'Teacher1 - Username: teacher1, Password: teacher123' AS CREDENTIALS FROM DUAL;
SELECT 'Parent1 - Username: parent1, Password: parent123' AS CREDENTIALS FROM DUAL;
