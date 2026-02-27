-- ============================================
-- SCHOOL MANAGEMENT SYSTEM - DUMMY DATA
-- ============================================
-- Run this AFTER the backend has started and created the tables
-- This will populate your database with sample data for testing
-- ============================================

-- Note: Roles and default admin user are created automatically by the application
-- Role IDs: 1=ADMIN, 2=TEACHER, 3=PARENT

-- ============================================
-- ACADEMIC YEARS
-- ============================================
INSERT INTO academic_years (name, start_date, end_date, is_active, description, created_at, updated_at)
VALUES
('2023-2024', '2023-04-01', '2024-03-31', false, 'Previous Academic Year', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('2024-2025', '2024-04-01', '2025-03-31', true, 'Current Academic Year', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('2025-2026', '2025-04-01', '2026-03-31', false, 'Next Academic Year', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================
-- CLASSES
-- ============================================
INSERT INTO classes (name, code, capacity, description, created_at, updated_at)
VALUES
('1st Grade', 'CLASS_1', 30, 'First Grade Class', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('2nd Grade', 'CLASS_2', 30, 'Second Grade Class', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('3rd Grade', 'CLASS_3', 30, 'Third Grade Class', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('4th Grade', 'CLASS_4', 30, 'Fourth Grade Class', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('5th Grade', 'CLASS_5', 30, 'Fifth Grade Class', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('6th Grade', 'CLASS_6', 35, 'Sixth Grade Class', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('7th Grade', 'CLASS_7', 35, 'Seventh Grade Class', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('8th Grade', 'CLASS_8', 35, 'Eighth Grade Class', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('9th Grade', 'CLASS_9', 40, 'Ninth Grade Class', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('10th Grade', 'CLASS_10', 40, 'Tenth Grade Class', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================
-- SECTIONS
-- ============================================
INSERT INTO sections (name, class_id, capacity, description, created_at, updated_at)
VALUES
('A', 1, 30, 'Section A', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('B', 1, 30, 'Section B', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('A', 2, 30, 'Section A', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('B', 2, 30, 'Section B', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('A', 3, 30, 'Section A', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('A', 4, 30, 'Section A', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('A', 5, 30, 'Section A', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('B', 5, 30, 'Section B', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('A', 6, 35, 'Section A', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('A', 7, 35, 'Section A', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('A', 8, 35, 'Section A', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('A', 9, 40, 'Section A', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('A', 10, 40, 'Section A', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================
-- SUBJECTS
-- ============================================
INSERT INTO subjects (name, code, subject_type, max_marks, pass_marks, description, created_at, updated_at)
VALUES
('Mathematics', 'MATH', 'THEORY', 100, 35, 'Mathematics', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('English', 'ENG', 'THEORY', 100, 35, 'English Language', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Science', 'SCI', 'THEORY', 100, 35, 'General Science', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Social Studies', 'SS', 'THEORY', 100, 35, 'Social Studies', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Hindi', 'HIN', 'THEORY', 100, 35, 'Hindi Language', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Computer Science', 'CS', 'PRACTICAL', 100, 35, 'Computer Science', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Physics', 'PHY', 'THEORY', 100, 35, 'Physics', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Chemistry', 'CHEM', 'THEORY', 100, 35, 'Chemistry', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Biology', 'BIO', 'THEORY', 100, 35, 'Biology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Physical Education', 'PE', 'PRACTICAL', 100, 35, 'Physical Education', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================
-- TEACHERS
-- ============================================
INSERT INTO teachers (employee_id, first_name, last_name, date_of_birth, gender, contact, email, qualification, experience, designation, joining_date, address, active, specialization, created_at, updated_at)
VALUES
('EMP001', 'John', 'Smith', '1985-05-15', 'MALE', '9876543210', 'john.smith@school.com', 'M.Sc Mathematics', '10 years', 'Senior Teacher', '2015-06-01', '123 Teacher Street, City', true, 'Mathematics', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('EMP002', 'Sarah', 'Johnson', '1988-08-20', 'FEMALE', '9876543211', 'sarah.j@school.com', 'M.A English', '8 years', 'Senior Teacher', '2016-07-01', '456 School Road, City', true, 'English', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('EMP003', 'Michael', 'Brown', '1990-03-10', 'MALE', '9876543212', 'michael.b@school.com', 'M.Sc Physics', '6 years', 'Teacher', '2018-06-01', '789 Education Lane, City', true, 'Science', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('EMP004', 'Emily', 'Davis', '1992-11-25', 'FEMALE', '9876543213', 'emily.d@school.com', 'M.Sc Chemistry', '4 years', 'Teacher', '2020-06-01', '321 Academy Street, City', true, 'Science', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('EMP005', 'Robert', 'Wilson', '1987-07-30', 'MALE', '9876543214', 'robert.w@school.com', 'M.C.A', '9 years', 'Senior Teacher', '2015-07-01', '654 Tech Road, City', true, 'Computer Science', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('EMP006', 'Lisa', 'Anderson', '1989-01-18', 'FEMALE', '9876543215', 'lisa.a@school.com', 'M.A Hindi', '7 years', 'Teacher', '2017-06-01', '987 Language Street, City', true, 'Hindi', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('EMP007', 'David', 'Martinez', '1991-09-05', 'MALE', '9876543216', 'david.m@school.com', 'M.A Social Studies', '5 years', 'Teacher', '2019-06-01', '147 History Lane, City', true, 'Social Studies', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('EMP008', 'Jennifer', 'Garcia', '1993-04-12', 'FEMALE', '9876543217', 'jennifer.g@school.com', 'M.Sc Biology', '3 years', 'Teacher', '2021-06-01', '258 Bio Avenue, City', true, 'Biology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================
-- STUDENTS (20 Students across different classes)
-- ============================================
INSERT INTO students (admission_no, roll_no, first_name, last_name, date_of_birth, gender, blood_group, address, class_id, section_id, academic_year_id, admission_date, active, contact, email, created_at, updated_at)
VALUES
('STU2024001', '1', 'Aarav', 'Kumar', '2015-03-15', 'MALE', 'O+', '10 Student Street, City', 1, 1, 2, '2024-04-01', true, '9123456780', 'aarav.parent@email.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('STU2024002', '2', 'Ananya', 'Sharma', '2015-07-20', 'FEMALE', 'A+', '20 School Road, City', 1, 1, 2, '2024-04-01', true, '9123456781', 'ananya.parent@email.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('STU2024003', '3', 'Arjun', 'Patel', '2015-01-10', 'MALE', 'B+', '30 Education Lane, City', 1, 1, 2, '2024-04-01', true, '9123456782', 'arjun.parent@email.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('STU2024004', '4', 'Diya', 'Singh', '2015-09-05', 'FEMALE', 'AB+', '40 Learning Street, City', 1, 1, 2, '2024-04-01', true, '9123456783', 'diya.parent@email.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('STU2024005', '5', 'Ishaan', 'Verma', '2015-11-12', 'MALE', 'O+', '50 Knowledge Road, City', 1, 1, 2, '2024-04-01', true, '9123456784', 'ishaan.parent@email.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('STU2024006', '1', 'Kavya', 'Reddy', '2015-04-18', 'FEMALE', 'A+', '60 Study Avenue, City', 1, 2, 2, '2024-04-01', true, '9123456785', 'kavya.parent@email.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('STU2024007', '2', 'Rohan', 'Gupta', '2015-08-22', 'MALE', 'B+', '70 Book Lane, City', 1, 2, 2, '2024-04-01', true, '9123456786', 'rohan.parent@email.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('STU2024008', '3', 'Sanya', 'Joshi', '2015-02-14', 'FEMALE', 'O+', '80 Academic Street, City', 1, 2, 2, '2024-04-01', true, '9123456787', 'sanya.parent@email.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('STU2024009', '1', 'Vihaan', 'Mehta', '2014-06-10', 'MALE', 'AB+', '90 Class Road, City', 2, 3, 2, '2024-04-01', true, '9123456788', 'vihaan.parent@email.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('STU2024010', '2', 'Aisha', 'Khan', '2014-10-25', 'FEMALE', 'A+', '100 School Lane, City', 2, 3, 2, '2024-04-01', true, '9123456789', 'aisha.parent@email.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('STU2024011', '3', 'Advait', 'Nair', '2014-03-30', 'MALE', 'O+', '110 Student Avenue, City', 2, 3, 2, '2024-04-01', true, '9123456790', 'advait.parent@email.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('STU2024012', '4', 'Myra', 'Desai', '2014-12-08', 'FEMALE', 'B+', '120 Education Road, City', 2, 3, 2, '2024-04-01', true, '9123456791', 'myra.parent@email.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('STU2024013', '1', 'Kabir', 'Iyer', '2013-05-15', 'MALE', 'A+', '130 Learning Street, City', 3, 5, 2, '2024-04-01', true, '9123456792', 'kabir.parent@email.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('STU2024014', '2', 'Pari', 'Malhotra', '2013-09-20', 'FEMALE', 'AB+', '140 Knowledge Lane, City', 3, 5, 2, '2024-04-01', true, '9123456793', 'pari.parent@email.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('STU2024015', '3', 'Reyansh', 'Kapoor', '2013-01-05', 'MALE', 'O+', '150 Study Road, City', 3, 5, 2, '2024-04-01', true, '9123456794', 'reyansh.parent@email.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('STU2024016', '1', 'Saanvi', 'Bhat', '2012-07-18', 'FEMALE', 'B+', '160 Book Street, City', 5, 7, 2, '2024-04-01', true, '9123456795', 'saanvi.parent@email.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('STU2024017', '2', 'Ayaan', 'Chopra', '2012-11-22', 'MALE', 'A+', '170 Academic Avenue, City', 5, 7, 2, '2024-04-01', true, '9123456796', 'ayaan.parent@email.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('STU2024018', '3', 'Zara', 'Saxena', '2012-04-10', 'FEMALE', 'O+', '180 Class Lane, City', 5, 7, 2, '2024-04-01', true, '9123456797', 'zara.parent@email.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('STU2024019', '1', 'Atharv', 'Rao', '2010-08-15', 'MALE', 'AB+', '190 School Street, City', 9, 12, 2, '2024-04-01', true, '9123456798', 'atharv.parent@email.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('STU2024020', '2', 'Kiara', 'Pandey', '2010-12-20', 'FEMALE', 'A+', '200 Student Road, City', 9, 12, 2, '2024-04-01', true, '9123456799', 'kiara.parent@email.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================
-- PARENTS (For the students above)
-- ============================================
INSERT INTO parents (student_id, father_name, father_occupation, father_contact, father_email, mother_name, mother_occupation, mother_contact, mother_email, address, emergency_contact, created_at, updated_at)
VALUES
(1, 'Rajesh Kumar', 'Engineer', '9123456780', 'rajesh.k@email.com', 'Priya Kumar', 'Teacher', '9123456781', 'priya.k@email.com', '10 Student Street, City', '9123456780', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Amit Sharma', 'Doctor', '9123456782', 'amit.s@email.com', 'Neha Sharma', 'Nurse', '9123456783', 'neha.s@email.com', '20 School Road, City', '9123456782', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Vijay Patel', 'Business', '9123456784', 'vijay.p@email.com', 'Anjali Patel', 'Homemaker', '9123456785', 'anjali.p@email.com', '30 Education Lane, City', '9123456784', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'Suresh Singh', 'Lawyer', '9123456786', 'suresh.s@email.com', 'Kavita Singh', 'Lawyer', '9123456787', 'kavita.s@email.com', '40 Learning Street, City', '9123456786', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'Manoj Verma', 'Accountant', '9123456788', 'manoj.v@email.com', 'Sunita Verma', 'Teacher', '9123456789', 'sunita.v@email.com', '50 Knowledge Road, City', '9123456788', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'Ramesh Reddy', 'Engineer', '9123456790', 'ramesh.r@email.com', 'Lakshmi Reddy', 'Doctor', '9123456791', 'lakshmi.r@email.com', '60 Study Avenue, City', '9123456790', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 'Anil Gupta', 'Business', '9123456792', 'anil.g@email.com', 'Pooja Gupta', 'Homemaker', '9123456793', 'pooja.g@email.com', '70 Book Lane, City', '9123456792', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 'Prakash Joshi', 'Teacher', '9123456794', 'prakash.j@email.com', 'Meera Joshi', 'Nurse', '9123456795', 'meera.j@email.com', '80 Academic Street, City', '9123456794', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(9, 'Dinesh Mehta', 'Doctor', '9123456796', 'dinesh.m@email.com', 'Nisha Mehta', 'Teacher', '9123456797', 'nisha.m@email.com', '90 Class Road, City', '9123456796', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(10, 'Ashok Khan', 'Engineer', '9123456798', 'ashok.k@email.com', 'Fatima Khan', 'Homemaker', '9123456799', 'fatima.k@email.com', '100 School Lane, City', '9123456798', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(11, 'Kumar Nair', 'Business', '9123456800', 'kumar.n@email.com', 'Radha Nair', 'Doctor', '9123456801', 'radha.n@email.com', '110 Student Avenue, City', '9123456800', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(12, 'Sanjay Desai', 'Lawyer', '9123456802', 'sanjay.d@email.com', 'Rekha Desai', 'Teacher', '9123456803', 'rekha.d@email.com', '120 Education Road, City', '9123456802', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(13, 'Mohan Iyer', 'Accountant', '9123456804', 'mohan.i@email.com', 'Shanti Iyer', 'Homemaker', '9123456805', 'shanti.i@email.com', '130 Learning Street, City', '9123456804', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(14, 'Ravi Malhotra', 'Engineer', '9123456806', 'ravi.m@email.com', 'Divya Malhotra', 'Nurse', '9123456807', 'divya.m@email.com', '140 Knowledge Lane, City', '9123456806', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(15, 'Gopal Kapoor', 'Business', '9123456808', 'gopal.k@email.com', 'Maya Kapoor', 'Doctor', '9123456809', 'maya.k@email.com', '150 Study Road, City', '9123456808', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(16, 'Krishna Bhat', 'Teacher', '9123456810', 'krishna.b@email.com', 'Uma Bhat', 'Teacher', '9123456811', 'uma.b@email.com', '160 Book Street, City', '9123456810', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(17, 'Naveen Chopra', 'Doctor', '9123456812', 'naveen.c@email.com', 'Preeti Chopra', 'Homemaker', '9123456813', 'preeti.c@email.com', '170 Academic Avenue, City', '9123456812', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(18, 'Kiran Saxena', 'Engineer', '9123456814', 'kiran.s@email.com', 'Sonal Saxena', 'Lawyer', '9123456815', 'sonal.s@email.com', '180 Class Lane, City', '9123456814', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(19, 'Praveen Rao', 'Business', '9123456816', 'praveen.r@email.com', 'Geeta Rao', 'Teacher', '9123456817', 'geeta.r@email.com', '190 School Street, City', '9123456816', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(20, 'Santosh Pandey', 'Accountant', '9123456818', 'santosh.p@email.com', 'Anita Pandey', 'Doctor', '9123456819', 'anita.p@email.com', '200 Student Road, City', '9123456818', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================
-- FEE STRUCTURES (For different classes)
-- ============================================
INSERT INTO fee_structures (class_id, academic_year_id, tuition_fee, transport_fee, library_fee, lab_fee, sports_fee, other_fee, total_fee, installment_type, description, created_at, updated_at)
VALUES
(1, 2, 5000, 1000, 500, 0, 300, 200, 7000, 'QUARTERLY', 'Grade 1 Fee Structure', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 2, 5000, 1000, 500, 0, 300, 200, 7000, 'QUARTERLY', 'Grade 2 Fee Structure', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 2, 5500, 1000, 500, 0, 300, 200, 7500, 'QUARTERLY', 'Grade 3 Fee Structure', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 2, 5500, 1000, 500, 0, 300, 200, 7500, 'QUARTERLY', 'Grade 4 Fee Structure', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 2, 6000, 1000, 500, 500, 300, 200, 8500, 'QUARTERLY', 'Grade 5 Fee Structure', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 2, 7000, 1200, 600, 800, 400, 300, 10300, 'QUARTERLY', 'Grade 6 Fee Structure', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 2, 7000, 1200, 600, 800, 400, 300, 10300, 'QUARTERLY', 'Grade 7 Fee Structure', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 2, 7500, 1200, 600, 800, 400, 300, 10800, 'QUARTERLY', 'Grade 8 Fee Structure', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(9, 2, 8000, 1500, 700, 1000, 500, 500, 12200, 'QUARTERLY', 'Grade 9 Fee Structure', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(10, 2, 8000, 1500, 700, 1000, 500, 500, 12200, 'QUARTERLY', 'Grade 10 Fee Structure', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================
-- FEE PAYMENTS (Sample payments for some students)
-- ============================================
INSERT INTO fee_payments (student_id, academic_year_id, amount, payment_date, payment_mode, transaction_id, remarks, collected_by, created_at, updated_at)
VALUES
(1, 2, 3500, '2024-04-05', 'CASH', 'TXN001', 'First installment', 'Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 2, 3500, '2024-04-06', 'UPI', 'TXN002', 'First installment', 'Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 2, 7000, '2024-04-07', 'CARD', 'TXN003', 'Full payment', 'Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 2, 3500, '2024-04-08', 'NET_BANKING', 'TXN004', 'First installment', 'Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 2, 3500, '2024-04-09', 'CASH', 'TXN005', 'First installment', 'Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(9, 2, 3500, '2024-04-10', 'UPI', 'TXN006', 'First installment', 'Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(10, 2, 7000, '2024-04-11', 'CARD', 'TXN007', 'Full payment', 'Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================
-- EXAMINATIONS
-- ============================================
INSERT INTO examinations (name, exam_type, academic_year_id, start_date, end_date, description, published, created_at, updated_at)
VALUES
('Unit Test 1', 'UNIT_TEST', 2, '2024-06-01', '2024-06-10', 'First Unit Test', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Mid Term Examination', 'MID_TERM', 2, '2024-09-15', '2024-09-30', 'Mid Term Exam', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Unit Test 2', 'UNIT_TEST', 2, '2024-11-01', '2024-11-10', 'Second Unit Test', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Final Examination', 'FINAL', 2, '2025-02-15', '2025-03-05', 'Final Exam', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================
-- MARKS (Sample marks for some students in Unit Test 1)
-- ============================================
INSERT INTO marks (student_id, exam_id, subject_id, theory_marks, practical_marks, total_marks, grade, result, entered_by, created_at, updated_at)
VALUES
-- Student 1 (Aarav Kumar)
(1, 1, 1, 85, 0, 85, 'A', 'PASS', 'Teacher', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 1, 2, 78, 0, 78, 'B+', 'PASS', 'Teacher', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 1, 3, 92, 0, 92, 'A+', 'PASS', 'Teacher', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 1, 4, 88, 0, 88, 'A', 'PASS', 'Teacher', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 1, 5, 75, 0, 75, 'B', 'PASS', 'Teacher', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Student 2 (Ananya Sharma)
(2, 1, 1, 95, 0, 95, 'A+', 'PASS', 'Teacher', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 2, 90, 0, 90, 'A+', 'PASS', 'Teacher', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 3, 88, 0, 88, 'A', 'PASS', 'Teacher', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 4, 92, 0, 92, 'A+', 'PASS', 'Teacher', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 5, 85, 0, 85, 'A', 'PASS', 'Teacher', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Student 3 (Arjun Patel)
(3, 1, 1, 70, 0, 70, 'B', 'PASS', 'Teacher', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 1, 2, 68, 0, 68, 'C+', 'PASS', 'Teacher', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 1, 3, 75, 0, 75, 'B', 'PASS', 'Teacher', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 1, 4, 72, 0, 72, 'B', 'PASS', 'Teacher', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 1, 5, 65, 0, 65, 'C+', 'PASS', 'Teacher', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================
-- ATTENDANCE (Sample attendance for current month)
-- ============================================
-- Generating attendance records for students 1-5 for the last 10 days
INSERT INTO attendance (student_id, date, status, class_id, section_id, marked_by, created_at, updated_at)
VALUES
-- Today
(1, CURRENT_DATE, 'PRESENT', 1, 1, 'Teacher', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, CURRENT_DATE, 'PRESENT', 1, 1, 'Teacher', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, CURRENT_DATE, 'PRESENT', 1, 1, 'Teacher', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, CURRENT_DATE, 'PRESENT', 1, 1, 'Teacher', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, CURRENT_DATE, 'ABSENT', 1, 1, 'Teacher', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Yesterday
(1, CURRENT_DATE - 1, 'PRESENT', 1, 1, 'Teacher', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, CURRENT_DATE - 1, 'PRESENT', 1, 1, 'Teacher', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, CURRENT_DATE - 1, 'LATE', 1, 1, 'Teacher', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, CURRENT_DATE - 1, 'PRESENT', 1, 1, 'Teacher', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, CURRENT_DATE - 1, 'PRESENT', 1, 1, 'Teacher', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- 2 days ago
(1, CURRENT_DATE - 2, 'PRESENT', 1, 1, 'Teacher', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, CURRENT_DATE - 2, 'ABSENT', 1, 1, 'Teacher', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, CURRENT_DATE - 2, 'PRESENT', 1, 1, 'Teacher', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, CURRENT_DATE - 2, 'PRESENT', 1, 1, 'Teacher', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, CURRENT_DATE - 2, 'PRESENT', 1, 1, 'Teacher', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================
-- HOMEWORK
-- ============================================
INSERT INTO homework (teacher_id, subject_id, class_id, section_id, title, description, due_date, priority, created_at, updated_at)
VALUES
(1, 1, 1, 1, 'Chapter 1 Exercises', 'Complete exercises 1.1 to 1.5 from Mathematics textbook', CURRENT_DATE + 2, 'NORMAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 2, 1, 1, 'Essay Writing', 'Write an essay on "My School" (minimum 200 words)', CURRENT_DATE + 3, 'IMPORTANT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 3, 1, 1, 'Science Project', 'Prepare a model of Solar System', CURRENT_DATE + 7, 'URGENT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 4, 1, 1, 'Map Reading', 'Draw and label political map of India', CURRENT_DATE + 4, 'NORMAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 1, 2, 3, 'Multiplication Tables', 'Learn multiplication tables 11 to 15', CURRENT_DATE + 3, 'IMPORTANT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================
-- NOTICES
-- ============================================
INSERT INTO notices (title, description, notice_type, target_audience, published, send_sms, send_email, created_by, created_at, updated_at)
VALUES
('Summer Vacation Notice', 'School will remain closed for summer vacation from May 15 to June 15. School will reopen on June 16, 2024.', 'HOLIDAY', 'ALL', true, true, true, 'Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Parent-Teacher Meeting', 'Parent-Teacher meeting is scheduled on March 15, 2024 from 9 AM to 1 PM. All parents are requested to attend.', 'EVENT', 'ALL', true, true, true, 'Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Fee Payment Reminder', 'This is a reminder to pay the pending school fees before March 31, 2024. Late fee will be applicable after due date.', 'FEE', 'ALL', true, true, false, 'Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Annual Sports Day', 'Annual Sports Day will be conducted on April 20, 2024. All students must participate. Parents are welcome to attend.', 'EVENT', 'ALL', true, false, true, 'Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Mid-Term Examination Schedule', 'Mid-term examinations will be conducted from September 15 to September 30, 2024. Detailed schedule will be shared soon.', 'EXAM', 'ALL', true, true, true, 'Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================
-- EVENTS
-- ============================================
INSERT INTO events (title, description, event_date, event_time, event_type, venue, published, created_by, created_at, updated_at)
VALUES
('Independence Day Celebration', 'Independence Day celebration with flag hoisting and cultural programs', '2024-08-15', '08:00:00', 'CULTURAL', 'School Ground', true, 'Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Annual Sports Day', 'Annual Sports Day with various sports events and competitions', '2024-04-20', '09:00:00', 'SPORTS', 'School Ground', true, 'Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Science Exhibition', 'Science project exhibition by students of grades 5-10', '2024-11-05', '10:00:00', 'ACADEMIC', 'School Auditorium', true, 'Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Parent-Teacher Meeting', 'General parent-teacher meeting for all classes', '2024-03-15', '09:00:00', 'MEETING', 'School Classrooms', true, 'Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Annual Day Celebration', 'Annual day celebration with cultural programs and prize distribution', '2024-12-20', '16:00:00', 'CULTURAL', 'School Auditorium', true, 'Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================
-- SCHOOL PROFILE
-- ============================================
INSERT INTO school_profile (name, address, contact, email, code, affiliation, principal_name, website, description, created_at, updated_at)
VALUES
('Bright Future International School',
 '123 Education Street, Knowledge City, State - 500001',
 '+91-9876543210',
 'contact@brightfuture.school',
 'BFIS2024',
 'CBSE Affiliation No. 123456',
 'Dr. Rajesh Kumar',
 'www.brightfuture.school',
 'A premier educational institution committed to excellence in education and overall development of students.',
 CURRENT_TIMESTAMP,
 CURRENT_TIMESTAMP);

-- ============================================
-- USER ACCOUNTS FOR TESTING (Teachers)
-- ============================================
-- Note: Password for all teacher users is 'teacher123' (you'll need to encode this with BCrypt)
-- For now, you can create these users through the Admin Web interface
-- Or use the admin account to assign subjects to teachers

-- ============================================
-- TEACHER SUBJECT ASSIGNMENTS
-- ============================================
INSERT INTO teacher_subject_assignments (teacher_id, subject_id, class_id, section_id, academic_year_id, created_at, updated_at)
VALUES
-- John Smith (Math teacher) - Teaching Grade 1 & 2
(1, 1, 1, 1, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 1, 1, 2, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 1, 2, 3, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Sarah Johnson (English teacher) - Teaching Grade 1 & 2
(2, 2, 1, 1, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 2, 1, 2, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 2, 2, 3, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Michael Brown (Science teacher) - Teaching Grade 1, 2, 3
(3, 3, 1, 1, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 3, 2, 3, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 3, 3, 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Emily Davis (Science/Chemistry) - Teaching Grade 5+
(4, 3, 5, 7, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 8, 9, 12, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Robert Wilson (Computer Science) - Teaching Grade 5+
(5, 6, 5, 7, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 6, 9, 12, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Lisa Anderson (Hindi) - Teaching Grade 1-3
(6, 5, 1, 1, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 5, 2, 3, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 5, 3, 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- David Martinez (Social Studies) - Teaching Grade 1-5
(7, 4, 1, 1, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 4, 3, 5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 4, 5, 7, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================
-- COMPLETION
-- ============================================
-- Dummy data insertion completed successfully!
--
-- Summary of data inserted:
-- - 3 Academic Years
-- - 10 Classes (Grade 1-10)
-- - 13 Sections
-- - 10 Subjects
-- - 8 Teachers
-- - 20 Students
-- - 20 Parent records
-- - 10 Fee Structures
-- - 7 Fee Payments
-- - 4 Examinations
-- - 15 Mark entries
-- - 15 Attendance records
-- - 5 Homework assignments
-- - 5 Notices
-- - 5 Events
-- - 1 School Profile
-- - 15 Teacher Subject Assignments
--
-- You can now test the system with this data!
-- Login with: admin / admin123
-- ============================================
