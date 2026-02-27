# School Management System

A full-stack school management platform with a React.js admin web panel, Spring Boot REST API backend, and two React Native mobile apps (Parent App + Teacher App) built with Expo.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Complete Tech Stack](#2-complete-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Backend - Spring Boot API](#4-backend---spring-boot-api)
5. [SQL Database - Complete Schema](#5-sql-database---complete-schema)
6. [Admin Web Panel](#6-admin-web-panel)
7. [Parent App - Complete Details](#7-parent-app---complete-details)
8. [Teacher App - Complete Details](#8-teacher-app---complete-details)
9. [API Endpoints Reference](#9-api-endpoints-reference)
10. [Mobile App Deployment - Complete Guide](#10-mobile-app-deployment---complete-guide)
11. [Other Ways to Install on Mobile](#11-other-ways-to-install-on-mobile)
12. [VPS Deployment](#12-vps-deployment)
13. [Default Login Credentials](#13-default-login-credentials)
14. [Local Development](#14-local-development)

---

## 1. Project Overview

This system manages all operations of a school — students, teachers, parents, attendance, fees, exams, homework, and notices — through three interfaces:

| Interface | Technology | Users |
|-----------|-----------|-------|
| Admin Web Panel | React.js | School Administrators |
| Parent App | React Native (Expo) | Parents |
| Teacher App | React Native (Expo) | Teachers |
| Backend API | Spring Boot (Java) | All apps connect to this |

**Live API URL:** `https://schoolm.aksoftware.tech/api`

---

## 2. Complete Tech Stack

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Java | 17 | Programming language |
| Spring Boot | 3.2.2 | Web framework |
| Spring Security | 6.x | Authentication and authorization |
| Spring Data JPA | 3.x | Database ORM layer |
| Hibernate | 6.x | JPA implementation (auto-creates tables) |
| MySQL | 8.x | Primary database (production) |
| Oracle DB | 11g/12c/19c/21c | Alternative database (setup script provided) |
| JWT (jjwt) | 0.12.3 | Token-based authentication |
| Maven | 3.x | Build and dependency tool |
| Lombok | Latest | Removes boilerplate code (getters/setters) |
| ModelMapper | 3.2.0 | Maps Entity objects to DTOs |
| Apache POI | 5.2.5 | Excel file generation/export |
| iText | 8.0.2 | PDF generation/export |
| Spring Mail | 3.x | Email notifications via SMTP |
| BCrypt | built-in | Secure password hashing |

### Mobile Apps (Parent App + Teacher App)
| Technology | Version | Purpose |
|-----------|---------|---------|
| React Native | 0.81.5 | Mobile UI framework (cross-platform) |
| Expo SDK | ~54.0.33 | Build platform - no need for Android Studio/Xcode |
| JavaScript (ES6+) | - | Programming language |
| React Navigation | 6.x | Screen-to-screen navigation |
| Axios | 1.6.7 | HTTP API calls to backend |
| React Native Paper | 5.12.3 | Material Design UI components |
| AsyncStorage | 2.1.2 | Stores JWT token on device (like localStorage) |
| React Native Gesture Handler | 2.20.2 | Swipe and touch gesture support |
| React Native Screens | 4.4.0 | Native screen containers for performance |
| React Native Safe Area Context | 4.12.0 | Handles notch and status bar safely |
| React Native Vector Icons | 10.0.3 | Icon library (home, calendar, person icons) |
| date-fns | 3.3.1 | Date formatting (e.g. "April 1, 2024") |
| EAS CLI | 5.x | Expo build and Play Store submission tool |

### Admin Web Panel
| Technology | Version | Purpose |
|-----------|---------|---------|
| React.js | 18.2.0 | UI framework |
| JavaScript (ES6+) | - | Programming language |
| Material UI (MUI) | 5.15.10 | Component library (buttons, tables, forms) |
| MUI X Data Grid | 6.19.4 | Feature-rich data tables |
| MUI X Date Pickers | 6.19.4 | Date picker input components |
| React Router DOM | 6.22.0 | Page routing (SPA navigation) |
| Axios | 1.6.7 | API calls to backend |
| Chart.js | 4.4.1 | Dashboard charts and graphs |
| react-chartjs-2 | 5.2.0 | React wrapper for Chart.js |
| date-fns | 3.3.1 | Date formatting |

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| VPS (Ubuntu Linux) | Hosting server at IP 194.164.149.8 |
| Nginx | Reverse proxy and static file serving |
| SSL/TLS (Let's Encrypt) | HTTPS on domain schoolm.aksoftware.tech |
| JAR deployment | Backend runs as standalone Java process on port 8080 |

---

## 3. Project Structure

```
schoolmk1.0/
├── backend/                          # Spring Boot Java REST API
│   ├── src/main/java/com/school/
│   │   ├── config/                   # CORS, Security, ModelMapper config
│   │   ├── controller/               # 9 REST Controllers (HTTP endpoints)
│   │   ├── entity/                   # 25 JPA Entities = 25 database tables
│   │   ├── repository/               # 20+ Spring Data JPA Repositories
│   │   ├── service/                  # Business logic layer
│   │   ├── security/                 # JWT filter and token provider
│   │   ├── dto/                      # Request/Response data objects
│   │   ├── exception/                # Global exception handler
│   │   └── util/                     # DataInitializer (seed data)
│   ├── src/main/resources/
│   │   ├── application.properties    # DB, JWT, Mail configuration
│   │   └── dummy_data.sql            # MySQL sample data
│   ├── oracle_setup.sql              # Oracle DB setup (tablespace, user, sequences)
│   ├── oracle_dummy_data.sql         # Oracle sample data
│   └── pom.xml                       # Maven dependencies
│
├── parent-app/                       # React Native - Parent Mobile App
│   ├── src/
│   │   ├── screens/                  # 8 app screens
│   │   └── services/api.js           # All API calls
│   ├── App.js                        # Root component and navigation setup
│   ├── app.json                      # Expo config (package: com.school.parentapp)
│   ├── eas.json                      # EAS Build config for Play Store
│   └── metro.config.js               # Metro bundler (includes axios fix)
│
├── teacher-app/                      # React Native - Teacher Mobile App
│   ├── src/
│   │   ├── screens/                  # 7 app screens
│   │   └── services/api.js           # All API calls
│   ├── App.js                        # Root component and navigation setup
│   ├── app.json                      # Expo config (package: com.school.teacherapp)
│   ├── eas.json                      # EAS Build config for Play Store
│   └── metro.config.js               # Metro bundler config
│
└── admin-web/                        # React.js Admin Panel
    ├── src/
    │   ├── pages/                    # 10 management pages
    │   ├── components/Layout.js      # Sidebar + header layout
    │   ├── context/AuthContext.js    # Auth state (login/logout)
    │   └── services/api.js           # All API calls
    └── public/                       # Static assets
```

---

## 4. Backend - Spring Boot API

### How the Backend Works

1. Client sends HTTP request with `Authorization: Bearer <JWT_TOKEN>` header
2. `JwtAuthenticationFilter` intercepts every request and validates the token
3. `SecurityConfig` checks if the user's role has permission for that endpoint
4. Controller receives the request, validates input, calls the service layer
5. Service layer runs business logic and calls repositories
6. Repository queries MySQL database using JPA/Hibernate
7. Response returned as JSON to client

### Request Flow Diagram

```
Client App
    |
    | HTTP request + JWT token
    v
JwtAuthenticationFilter  (validates token, sets user in SecurityContext)
    |
    v
SecurityConfig  (checks ROLE_ADMIN / ROLE_TEACHER / ROLE_PARENT permission)
    |
    v
Controller  (maps URL to Java method, validates request body)
    |
    v
Service  (business logic, validation)
    |
    v
Repository  (Spring Data JPA - queries MySQL)
    |
    v
MySQL Database
```

### Key Configuration (application.properties)

```properties
# Server
server.port=8080
server.servlet.context-path=/api

# MySQL Database
spring.datasource.url=jdbc:mysql://localhost:3306/school_db
spring.datasource.username=school_admin
spring.datasource.password=school_admin123
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA / Hibernate
spring.jpa.hibernate.ddl-auto=update       # Auto-creates and updates tables
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# JWT Security
jwt.secret=5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437
jwt.expiration=86400000                     # Token valid for 24 hours

# File Upload
spring.servlet.multipart.max-file-size=10MB

# Email (configure your SMTP details)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
```

### JWT Login Response

Every login returns this JSON:

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "id": 4,
  "username": "parent1",
  "email": "parent1@email.com",
  "role": "PARENT",
  "fullName": "Robert Williams",
  "entityId": 1,
  "entityType": "PARENT"
}
```

**CRITICAL:** `entityId` is the Parent/Teacher entity ID, NOT the User ID.
Always use `entityId` when fetching students or subjects. Never use `id` (the user ID) for these calls.

### 9 REST Controllers

| Controller | File | Endpoints |
|-----------|------|----------|
| AuthController | `AuthController.java` | Login |
| StudentController | `StudentController.java` | Student CRUD |
| TeacherController | `TeacherController.java` | Teacher CRUD, subjects |
| AttendanceController | `AttendanceController.java` | Mark/view attendance, leaves |
| AcademicController | `AcademicController.java` | Classes, sections, subjects |
| FeeController | `FeeController.java` | Fee structure, payments |
| ExaminationController | `ExaminationController.java` | Exams, schedules, marks |
| HomeworkController | `HomeworkController.java` | Assign/view homework |
| NoticeController | `NoticeController.java` | Notices/announcements |

---

## 5. SQL Database - Complete Schema

**Primary Database:** MySQL 8.x
**Alternative Database:** Oracle 11g / 12c / 19c / 21c (setup SQL provided)
**Table Creation:** Hibernate auto-creates all 25 tables on first startup (`ddl-auto=update`)
**Total Tables:** 25

---

### Oracle Sequences (for Oracle DB primary keys)

```sql
CREATE SEQUENCE user_seq       START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE student_seq    START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE teacher_seq    START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE parent_seq     START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE class_seq      START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE section_seq    START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE subject_seq    START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE attendance_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE fee_seq        START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE exam_seq       START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE marks_seq      START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE homework_seq   START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE notice_seq     START WITH 1 INCREMENT BY 1;
```

---

### TABLE 1: `users`
Stores login credentials for all users (admin, teachers, parents).

| Column | Type | Null | Description |
|--------|------|------|-------------|
| `id` | BIGINT | PK | Auto-generated primary key |
| `username` | VARCHAR(255) | NOT NULL UNIQUE | Login username |
| `password` | VARCHAR(255) | NOT NULL | BCrypt hashed password |
| `email` | VARCHAR(255) | UNIQUE | Email address |
| `role` | VARCHAR(20) | NOT NULL | ADMIN / TEACHER / PARENT |
| `first_name` | VARCHAR(100) | NOT NULL | First name |
| `last_name` | VARCHAR(100) | NOT NULL | Last name |
| `phone` | VARCHAR(20) | | Phone number |
| `is_active` | BOOLEAN | NOT NULL | Account enabled flag |
| `created_date` | TIMESTAMP | NOT NULL | Record creation time |
| `updated_date` | TIMESTAMP | NOT NULL | Last update time |

**Sample data:**
```sql
-- Admin (password: admin123)
INSERT INTO users VALUES (1, 'admin', '$2a$10$slYQ...', 'admin@school.com', 'ADMIN', 'System', 'Administrator', '1234567890', 1, NOW(), NOW());

-- Teacher (password: teacher123)
INSERT INTO users VALUES (2, 'teacher1', '$2a$10$slYQ...', 'teacher1@school.com', 'TEACHER', 'John', 'Smith', '1234567891', 1, NOW(), NOW());

-- Parent (password: parent123)
INSERT INTO users VALUES (4, 'parent1', '$2a$10$slYQ...', 'parent1@email.com', 'PARENT', 'Robert', 'Williams', '1234567893', 1, NOW(), NOW());
```

---

### TABLE 2: `teachers`
Teacher profile — linked to a user account via `user_id`.

| Column | Type | Null | Description |
|--------|------|------|-------------|
| `id` | BIGINT | PK | Auto-generated primary key |
| `user_id` | BIGINT | FK → users | Linked login account |
| `employee_id` | VARCHAR(50) | UNIQUE | Employee code (e.g. TCH001) |
| `qualification` | VARCHAR(255) | | Educational qualification |
| `specialization` | VARCHAR(255) | | Subject specialization |
| `date_of_joining` | DATE | | Joining date |
| `salary` | DECIMAL(10,2) | | Monthly salary |
| `address` | TEXT | | Home address |
| `created_date` | TIMESTAMP | NOT NULL | Record creation time |
| `updated_date` | TIMESTAMP | NOT NULL | Last update time |

**Sample data:**
```sql
INSERT INTO teachers VALUES (1, 2, 'TCH001', 'M.Sc Mathematics', 'Mathematics', '2020-06-01', 45000, '123 Main St, City', NOW(), NOW());
INSERT INTO teachers VALUES (2, 3, 'TCH002', 'M.Sc Science', 'Science', '2021-07-15', 42000, '456 Oak Ave, City', NOW(), NOW());
```

---

### TABLE 3: `parents`
Parent profile — linked to a user account via `user_id`.

| Column | Type | Null | Description |
|--------|------|------|-------------|
| `id` | BIGINT | PK | Auto-generated primary key |
| `user_id` | BIGINT | FK → users | Linked login account |
| `occupation` | VARCHAR(255) | | Parent's occupation |
| `annual_income` | DECIMAL(12,2) | | Annual income |
| `address` | TEXT | | Home address |
| `created_date` | TIMESTAMP | NOT NULL | Record creation time |
| `updated_date` | TIMESTAMP | NOT NULL | Last update time |

**Sample data:**
```sql
INSERT INTO parents VALUES (1, 4, 'Engineer', 800000, '789 Pine Road, City', NOW(), NOW());
INSERT INTO parents VALUES (2, 5, 'Doctor', 1200000, '321 Elm Street, City', NOW(), NOW());
```

---

### TABLE 4: `classes`
School classes (Class 1, Class 2, ... Class 10).

| Column | Type | Null | Description |
|--------|------|------|-------------|
| `id` | BIGINT | PK | Auto-generated primary key |
| `name` | VARCHAR(100) | NOT NULL | Class name (e.g. "Class 5") |
| `description` | VARCHAR(255) | | Description (e.g. "Fifth Grade") |
| `created_date` | TIMESTAMP | NOT NULL | Record creation time |
| `updated_date` | TIMESTAMP | NOT NULL | Last update time |

**Sample data:**
```sql
INSERT INTO classes VALUES (1, 'Class 1', 'First Grade', NOW(), NOW());
INSERT INTO classes VALUES (2, 'Class 2', 'Second Grade', NOW(), NOW());
INSERT INTO classes VALUES (3, 'Class 3', 'Third Grade', NOW(), NOW());
```

---

### TABLE 5: `sections`
Divisions within a class (Section A, B, C).

| Column | Type | Null | Description |
|--------|------|------|-------------|
| `id` | BIGINT | PK | Auto-generated primary key |
| `name` | VARCHAR(10) | NOT NULL | Section name (A / B / C) |
| `capacity` | INT | | Maximum student capacity |
| `class_id` | BIGINT | FK → classes | Parent class |
| `created_date` | TIMESTAMP | NOT NULL | Record creation time |
| `updated_date` | TIMESTAMP | NOT NULL | Last update time |

**Sample data:**
```sql
INSERT INTO sections VALUES (1, 'A', 40, 1, NOW(), NOW());  -- Class 1 - A
INSERT INTO sections VALUES (2, 'B', 40, 1, NOW(), NOW());  -- Class 1 - B
INSERT INTO sections VALUES (3, 'A', 40, 2, NOW(), NOW());  -- Class 2 - A
```

---

### TABLE 6: `subjects`
Academic subjects taught in school.

| Column | Type | Null | Description |
|--------|------|------|-------------|
| `id` | BIGINT | PK | Auto-generated primary key |
| `name` | VARCHAR(100) | NOT NULL | Subject name (e.g. Mathematics) |
| `code` | VARCHAR(20) | UNIQUE | Short code (e.g. MATH) |
| `type` | VARCHAR(20) | | CORE / ELECTIVE |
| `theory_max_marks` | INT | | Maximum theory marks |
| `practical_max_marks` | INT | | Maximum practical marks |
| `pass_marks` | INT | | Minimum passing marks |
| `created_date` | TIMESTAMP | NOT NULL | Record creation time |
| `updated_date` | TIMESTAMP | NOT NULL | Last update time |

**Sample data:**
```sql
INSERT INTO subjects VALUES (1, 'Mathematics', 'MATH', 'CORE', 100, 0, 40, NOW(), NOW());
INSERT INTO subjects VALUES (2, 'Science', 'SCI', 'CORE', 80, 20, 40, NOW(), NOW());
INSERT INTO subjects VALUES (3, 'English', 'ENG', 'CORE', 100, 0, 40, NOW(), NOW());
INSERT INTO subjects VALUES (4, 'Social Studies', 'SST', 'CORE', 100, 0, 40, NOW(), NOW());
INSERT INTO subjects VALUES (5, 'Computer Science', 'CS', 'ELECTIVE', 60, 40, 40, NOW(), NOW());
```

---

### TABLE 7: `academic_years`
Academic year records (e.g. 2024-2025).

| Column | Type | Null | Description |
|--------|------|------|-------------|
| `id` | BIGINT | PK | Auto-generated primary key |
| `name` | VARCHAR(20) | NOT NULL | Year label (e.g. "2024-2025") |
| `start_date` | DATE | NOT NULL | Start date (e.g. 2024-04-01) |
| `end_date` | DATE | NOT NULL | End date (e.g. 2025-03-31) |
| `is_active` | BOOLEAN | NOT NULL | Currently active year flag |
| `created_date` | TIMESTAMP | NOT NULL | Record creation time |
| `updated_date` | TIMESTAMP | NOT NULL | Last update time |

**Sample data:**
```sql
INSERT INTO academic_years VALUES (1, '2024-2025', '2024-04-01', '2025-03-31', 1, NOW(), NOW());
INSERT INTO academic_years VALUES (2, '2023-2024', '2023-04-01', '2024-03-31', 0, NOW(), NOW());
```

---

### TABLE 8: `students`
Student records with all personal and academic information.

| Column | Type | Null | Description |
|--------|------|------|-------------|
| `id` | BIGINT | PK | Auto-generated primary key |
| `admission_number` | VARCHAR(50) | NOT NULL UNIQUE | Admission ID (e.g. STU2024001) |
| `first_name` | VARCHAR(100) | NOT NULL | Student first name |
| `last_name` | VARCHAR(100) | NOT NULL | Student last name |
| `date_of_birth` | DATE | | Date of birth |
| `gender` | VARCHAR(10) | | MALE / FEMALE |
| `blood_group` | VARCHAR(5) | | Blood group (O+, A+, B+, etc.) |
| `address` | TEXT | | Home address |
| `parent_id` | BIGINT | FK → parents | Linked parent |
| `class_id` | BIGINT | FK → classes | Enrolled class |
| `section_id` | BIGINT | FK → sections | Enrolled section |
| `academic_year_id` | BIGINT | FK → academic_years | Current academic year |
| `admission_date` | DATE | | Date of admission |
| `status` | VARCHAR(20) | | ACTIVE / INACTIVE / TRANSFERRED |
| `created_date` | TIMESTAMP | NOT NULL | Record creation time |
| `updated_date` | TIMESTAMP | NOT NULL | Last update time |

**Sample data:**
```sql
INSERT INTO students VALUES (1, 'STU2024001', 'Michael', 'Williams', '2014-05-15', 'MALE', 'O+', '789 Pine Road', 1, 1, 1, 1, '2024-04-01', 'ACTIVE', NOW(), NOW());
INSERT INTO students VALUES (2, 'STU2024002', 'Emily', 'Williams', '2015-08-22', 'FEMALE', 'A+', '789 Pine Road', 1, 2, 3, 1, '2024-04-01', 'ACTIVE', NOW(), NOW());
INSERT INTO students VALUES (3, 'STU2024003', 'James', 'Brown', '2014-03-10', 'MALE', 'B+', '321 Elm Street', 2, 1, 1, 1, '2024-04-01', 'ACTIVE', NOW(), NOW());
```

---

### TABLE 9: `teacher_subject_assignments`
Maps which teacher teaches which subject in which class and section.

| Column | Type | Null | Description |
|--------|------|------|-------------|
| `id` | BIGINT | PK | Auto-generated primary key |
| `teacher_id` | BIGINT | FK → teachers | Assigned teacher |
| `subject_id` | BIGINT | FK → subjects | Assigned subject |
| `class_id` | BIGINT | FK → classes | Class assigned to |
| `section_id` | BIGINT | FK → sections | Section assigned to |
| `academic_year_id` | BIGINT | FK → academic_years | Academic year |
| `created_date` | TIMESTAMP | NOT NULL | Record creation time |
| `updated_date` | TIMESTAMP | NOT NULL | Last update time |

---

### TABLE 10: `attendance`
Daily student attendance records marked by teachers.

| Column | Type | Null | Description |
|--------|------|------|-------------|
| `id` | BIGINT | PK | Auto-generated primary key |
| `student_id` | BIGINT | FK → students | Student |
| `class_id` | BIGINT | FK → classes | Student's class |
| `section_id` | BIGINT | FK → sections | Student's section |
| `date` | DATE | NOT NULL | Attendance date |
| `status` | VARCHAR(20) | NOT NULL | PRESENT / ABSENT / LATE / HALF_DAY |
| `marked_by_id` | BIGINT | FK → users | Teacher who marked attendance |
| `remarks` | TEXT | | Optional teacher note |
| `created_date` | TIMESTAMP | NOT NULL | Record creation time |
| `updated_date` | TIMESTAMP | NOT NULL | Last update time |

---

### TABLE 11: `leave_applications`
Student leave requests submitted by parents.

| Column | Type | Null | Description |
|--------|------|------|-------------|
| `id` | BIGINT | PK | Auto-generated primary key |
| `student_id` | BIGINT | FK → students | Student applying for leave |
| `parent_id` | BIGINT | FK → parents | Parent submitting request |
| `from_date` | DATE | NOT NULL | Leave start date |
| `to_date` | DATE | NOT NULL | Leave end date |
| `reason` | TEXT | NOT NULL | Reason for leave |
| `status` | VARCHAR(20) | | PENDING / APPROVED / REJECTED |
| `approved_by_id` | BIGINT | FK → users | Who approved/rejected |
| `created_date` | TIMESTAMP | NOT NULL | Record creation time |
| `updated_date` | TIMESTAMP | NOT NULL | Last update time |

---

### TABLE 12: `fee_structures`
Fee amounts defined per class per academic year.

| Column | Type | Null | Description |
|--------|------|------|-------------|
| `id` | BIGINT | PK | Auto-generated primary key |
| `class_id` | BIGINT | FK → classes | Class this applies to |
| `academic_year_id` | BIGINT | FK → academic_years | Academic year |
| `tuition_fee` | DECIMAL(10,2) | | Tuition fee amount |
| `transport_fee` | DECIMAL(10,2) | | Transport fee amount |
| `library_fee` | DECIMAL(10,2) | | Library fee amount |
| `lab_fee` | DECIMAL(10,2) | | Laboratory fee amount |
| `sports_fee` | DECIMAL(10,2) | | Sports fee amount |
| `other_fee` | DECIMAL(10,2) | | Miscellaneous fees |
| `total_fee` | DECIMAL(10,2) | | Total of all fees |
| `created_date` | TIMESTAMP | NOT NULL | Record creation time |
| `updated_date` | TIMESTAMP | NOT NULL | Last update time |

**Sample data:**
```sql
INSERT INTO fee_structures VALUES (1, 1, 1, 25000, 5000, 1000, 2000, 1500, 500, 35000, NOW(), NOW());
INSERT INTO fee_structures VALUES (2, 2, 1, 27000, 5000, 1200, 2200, 1500, 600, 37500, NOW(), NOW());
```

---

### TABLE 13: `fee_payments`
Records of actual fee payments made by parents.

| Column | Type | Null | Description |
|--------|------|------|-------------|
| `id` | BIGINT | PK | Auto-generated primary key |
| `student_id` | BIGINT | FK → students | Student |
| `fee_structure_id` | BIGINT | FK → fee_structures | Applied fee structure |
| `amount_paid` | DECIMAL(10,2) | NOT NULL | Amount paid |
| `payment_date` | DATE | NOT NULL | Date of payment |
| `payment_mode` | VARCHAR(20) | | CASH / ONLINE / CHEQUE |
| `receipt_number` | VARCHAR(50) | UNIQUE | Payment receipt number |
| `status` | VARCHAR(20) | | PAID / PENDING / PARTIAL |
| `created_date` | TIMESTAMP | NOT NULL | Record creation time |
| `updated_date` | TIMESTAMP | NOT NULL | Last update time |

---

### TABLE 14: `fee_receipts`
Receipt generated after fee payment is recorded.

| Column | Type | Null | Description |
|--------|------|------|-------------|
| `id` | BIGINT | PK | Auto-generated primary key |
| `payment_id` | BIGINT | FK → fee_payments | Linked payment |
| `receipt_number` | VARCHAR(50) | UNIQUE | Unique receipt number |
| `generated_date` | TIMESTAMP | | When receipt was generated |
| `created_date` | TIMESTAMP | NOT NULL | Record creation time |
| `updated_date` | TIMESTAMP | NOT NULL | Last update time |

---

### TABLE 15: `examinations`
Exam events (Unit Test, Mid Term, Final Term, Annual).

| Column | Type | Null | Description |
|--------|------|------|-------------|
| `id` | BIGINT | PK | Auto-generated primary key |
| `name` | VARCHAR(200) | NOT NULL | Exam name |
| `type` | VARCHAR(20) | | UNIT_TEST / MIDTERM / FINAL / ANNUAL |
| `academic_year_id` | BIGINT | FK → academic_years | Academic year |
| `start_date` | DATE | | Exam period start |
| `end_date` | DATE | | Exam period end |
| `result_publish_date` | DATE | | Result announcement date |
| `is_published` | BOOLEAN | | Whether results are published |
| `created_date` | TIMESTAMP | NOT NULL | Record creation time |
| `updated_date` | TIMESTAMP | NOT NULL | Last update time |

**Sample data:**
```sql
INSERT INTO examinations VALUES (1, 'First Terminal Exam 2024', 'UNIT_TEST', 1, '2024-07-15', '2024-07-25', '2024-08-01', 1, NOW(), NOW());
INSERT INTO examinations VALUES (2, 'Mid Term Exam 2024', 'MIDTERM', 1, '2024-10-01', '2024-10-15', '2024-10-25', 0, NOW(), NOW());
```

---

### TABLE 16: `exam_schedules`
Subject-wise timetable for each exam.

| Column | Type | Null | Description |
|--------|------|------|-------------|
| `id` | BIGINT | PK | Auto-generated primary key |
| `examination_id` | BIGINT | FK → examinations | Exam event |
| `subject_id` | BIGINT | FK → subjects | Subject being tested |
| `class_id` | BIGINT | FK → classes | Class |
| `exam_date` | DATE | | Date of this subject's exam |
| `start_time` | TIME | | Exam start time |
| `end_time` | TIME | | Exam end time |
| `room_number` | VARCHAR(20) | | Exam room/hall |
| `created_date` | TIMESTAMP | NOT NULL | Record creation time |
| `updated_date` | TIMESTAMP | NOT NULL | Last update time |

---

### TABLE 17: `marks`
Student marks for each subject in each exam.

| Column | Type | Null | Description |
|--------|------|------|-------------|
| `id` | BIGINT | PK | Auto-generated primary key |
| `examination_id` | BIGINT | FK → examinations | Exam event |
| `student_id` | BIGINT | FK → students | Student |
| `subject_id` | BIGINT | FK → subjects | Subject |
| `theory_marks` | DECIMAL(5,2) | | Theory marks obtained |
| `practical_marks` | DECIMAL(5,2) | | Practical marks obtained |
| `total_marks` | DECIMAL(5,2) | | Total marks (theory + practical) |
| `grade` | VARCHAR(5) | | A+ / A / B+ / B / C / D / F |
| `remarks` | TEXT | | Teacher remarks |
| `entered_by_id` | BIGINT | FK → users | Who entered the marks |
| `created_date` | TIMESTAMP | NOT NULL | Record creation time |
| `updated_date` | TIMESTAMP | NOT NULL | Last update time |

---

### TABLE 18: `homework`
Homework assignments created by teachers.

| Column | Type | Null | Description |
|--------|------|------|-------------|
| `id` | BIGINT | PK | Auto-generated primary key |
| `title` | VARCHAR(200) | NOT NULL | Homework title |
| `description` | TEXT | | Detailed instructions |
| `subject_id` | BIGINT | FK → subjects | Subject |
| `class_id` | BIGINT | FK → classes | Assigned class |
| `section_id` | BIGINT | FK → sections | Assigned section |
| `assigned_by_id` | BIGINT | FK → users | Teacher who assigned |
| `assigned_date` | DATE | | Date assigned |
| `due_date` | DATE | | Submission deadline |
| `status` | VARCHAR(20) | | ACTIVE / COMPLETED |
| `created_date` | TIMESTAMP | NOT NULL | Record creation time |
| `updated_date` | TIMESTAMP | NOT NULL | Last update time |

---

### TABLE 19: `notices`
School notices and announcements.

| Column | Type | Null | Description |
|--------|------|------|-------------|
| `id` | BIGINT | PK | Auto-generated primary key |
| `title` | VARCHAR(200) | NOT NULL | Notice title |
| `content` | TEXT | NOT NULL | Notice body text |
| `type` | VARCHAR(20) | | GENERAL / FEE / EVENT / EXAM / HOLIDAY |
| `priority` | VARCHAR(10) | | LOW / NORMAL / HIGH / URGENT |
| `target_audience` | VARCHAR(20) | | ALL / PARENTS / TEACHERS / STUDENTS |
| `publish_date` | DATE | | When to show notice |
| `expiry_date` | DATE | | When notice expires |
| `published_by_id` | BIGINT | FK → users | Admin who created it |
| `is_active` | BOOLEAN | | Currently visible |
| `created_date` | TIMESTAMP | NOT NULL | Record creation time |
| `updated_date` | TIMESTAMP | NOT NULL | Last update time |

**Sample data:**
```sql
INSERT INTO notices VALUES (1, 'School Reopening Notice', 'School will reopen on 1st April 2024...', 'GENERAL', 'HIGH', 'ALL', '2024-03-25', '2024-04-05', 1, 1, NOW(), NOW());
INSERT INTO notices VALUES (2, 'Fee Payment Reminder', 'Parents are requested to pay fees by 15th April...', 'FEE', 'URGENT', 'PARENTS', '2024-04-01', '2024-04-15', 1, 1, NOW(), NOW());
```

---

### TABLE 20: `notifications`
In-app push notifications for individual users.

| Column | Type | Null | Description |
|--------|------|------|-------------|
| `id` | BIGINT | PK | Auto-generated primary key |
| `user_id` | BIGINT | FK → users | Target user |
| `title` | VARCHAR(200) | NOT NULL | Notification title |
| `message` | TEXT | NOT NULL | Notification body |
| `type` | VARCHAR(50) | | Notification category |
| `is_read` | BOOLEAN | | Whether user has read it |
| `created_date` | TIMESTAMP | NOT NULL | Sent at |
| `updated_date` | TIMESTAMP | NOT NULL | Last update time |

---

### TABLE 21: `messages`
Internal messaging between users.

| Column | Type | Null | Description |
|--------|------|------|-------------|
| `id` | BIGINT | PK | Auto-generated primary key |
| `sender_id` | BIGINT | FK → users | Sender |
| `receiver_id` | BIGINT | FK → users | Receiver |
| `subject` | VARCHAR(200) | | Message subject |
| `body` | TEXT | NOT NULL | Message content |
| `is_read` | BOOLEAN | | Read status |
| `sent_at` | TIMESTAMP | | When sent |
| `created_date` | TIMESTAMP | NOT NULL | Record creation time |
| `updated_date` | TIMESTAMP | NOT NULL | Last update time |

---

### TABLE 22: `events`
School calendar events (holidays, sports day, cultural events).

| Column | Type | Null | Description |
|--------|------|------|-------------|
| `id` | BIGINT | PK | Auto-generated primary key |
| `title` | VARCHAR(200) | NOT NULL | Event title |
| `description` | TEXT | | Event description |
| `event_date` | DATE | NOT NULL | Event date |
| `event_type` | VARCHAR(30) | | HOLIDAY / SPORTS / CULTURAL / EXAM |
| `created_by_id` | BIGINT | FK → users | Created by admin |
| `created_date` | TIMESTAMP | NOT NULL | Record creation time |
| `updated_date` | TIMESTAMP | NOT NULL | Last update time |

---

### TABLE 23: `timetables`
Weekly class schedule per class/section.

| Column | Type | Null | Description |
|--------|------|------|-------------|
| `id` | BIGINT | PK | Auto-generated primary key |
| `class_id` | BIGINT | FK → classes | Class |
| `section_id` | BIGINT | FK → sections | Section |
| `subject_id` | BIGINT | FK → subjects | Subject in this period |
| `teacher_id` | BIGINT | FK → teachers | Teaching teacher |
| `day_of_week` | VARCHAR(10) | NOT NULL | MON / TUE / WED / THU / FRI / SAT |
| `start_time` | TIME | NOT NULL | Period start time |
| `end_time` | TIME | NOT NULL | Period end time |
| `room_number` | VARCHAR(20) | | Classroom |
| `academic_year_id` | BIGINT | FK → academic_years | Academic year |
| `created_date` | TIMESTAMP | NOT NULL | Record creation time |
| `updated_date` | TIMESTAMP | NOT NULL | Last update time |

---

### TABLE 24: `school_profile`
Global school configuration and information.

| Column | Type | Null | Description |
|--------|------|------|-------------|
| `id` | BIGINT | PK | Auto-generated primary key |
| `name` | VARCHAR(200) | NOT NULL | School name |
| `address` | TEXT | | School address |
| `phone` | VARCHAR(20) | | Contact number |
| `email` | VARCHAR(100) | | Contact email |
| `website` | VARCHAR(200) | | School website URL |
| `principal_name` | VARCHAR(100) | | Principal's name |
| `logo_url` | VARCHAR(500) | | Logo image path |
| `created_date` | TIMESTAMP | NOT NULL | Record creation time |
| `updated_date` | TIMESTAMP | NOT NULL | Last update time |

---

### TABLE 25: `roles`
Role definitions used by Spring Security.

| Column | Type | Null | Description |
|--------|------|------|-------------|
| `id` | BIGINT | PK | Auto-generated primary key |
| `name` | VARCHAR(50) | NOT NULL UNIQUE | ROLE_ADMIN / ROLE_TEACHER / ROLE_PARENT |

---

### Database Relationships (ERD Summary)

```
users ──────────────── teachers          (one-to-one via user_id)
users ──────────────── parents           (one-to-one via user_id)
parents ────────────── students          (one-to-many: parent has multiple children)
classes ────────────── sections          (one-to-many: class has A, B, C sections)
students ───────────── attendance        (one-to-many: student has many attendance records)
students ───────────── marks             (one-to-many: student has marks for each subject)
students ───────────── fee_payments      (one-to-many: student has many payment records)
examinations ──────── marks             (one-to-many: exam has marks for all students)
examinations ──────── exam_schedules    (one-to-many: exam has schedule per subject)
teachers ───────────── teacher_subject_assignments (one-to-many)
classes + sections ─── homework         (homework is assigned to a class/section)
users ──────────────── notifications    (one-to-many: user has many notifications)
users ──────────────── messages         (sender and receiver both FK to users)
```

---

### Oracle Database Setup Commands

Run these as SYSTEM/DBA user:

```sql
-- Step 1: Create tablespace (500MB, auto-extends)
CREATE TABLESPACE school_data
    DATAFILE 'school_data.dbf'
    SIZE 500M
    AUTOEXTEND ON
    NEXT 100M
    MAXSIZE UNLIMITED;

CREATE TEMPORARY TABLESPACE school_temp
    TEMPFILE 'school_temp.dbf'
    SIZE 100M
    AUTOEXTEND ON;

-- Step 2: Create user
CREATE USER school_admin IDENTIFIED BY school_admin
    DEFAULT TABLESPACE school_data
    TEMPORARY TABLESPACE school_temp
    QUOTA UNLIMITED ON school_data;

-- Step 3: Grant permissions
GRANT CONNECT, RESOURCE, CREATE VIEW, CREATE SEQUENCE TO school_admin;
GRANT UNLIMITED TABLESPACE TO school_admin;

-- Step 4: Run oracle_setup.sql (creates sequences)
-- Step 5: Start Spring Boot (Hibernate auto-creates all 25 tables)
-- Step 6: Run oracle_dummy_data.sql (inserts sample data)
```

---

## 6. Admin Web Panel

**URL:** `https://schoolm.aksoftware.tech` (or `http://localhost:3000` for local)
**Login:** Username: `admin` | Password: `admin123`

### 10 Admin Pages

| Page | File | What It Does |
|------|------|-------------|
| Login | `Login.js` | Admin authentication |
| Dashboard | `Dashboard.js` | Overview stats, charts, quick access |
| Student Management | `StudentManagement.js` | Add, edit, delete, search students |
| Teacher Management | `TeacherManagement.js` | Add, edit, delete, search teachers |
| Academic Management | `AcademicManagement.js` | Manage classes, sections, subjects, years |
| Attendance Management | `AttendanceManagement.js` | View attendance reports by class/date |
| Fee Management | `FeeManagement.js` | Set fee structures, record payments |
| Examination Management | `ExaminationManagement.js` | Create exams, schedules, enter/view marks |
| Homework Management | `HomeworkManagement.js` | View and manage homework assignments |
| Notice Management | `NoticeManagement.js` | Create, publish, manage notices |

---

## 7. Parent App - Complete Details

### What Is It?

The Parent App is a React Native mobile application built with Expo. Parents can monitor their child's school life — attendance, exam marks, fees, homework, and school notices — all from their smartphone.

- **Package Name:** `com.school.parentapp`
- **Version:** 1.0.0
- **Platforms:** Android, iOS, Web

---

### 8 Screens in Parent App

#### Screen 1: LoginScreen (`src/screens/LoginScreen.js`)
- Username and password input fields
- Calls `POST /api/auth/login`
- Saves JWT token to AsyncStorage (persistent on device)
- Saves `entityId` (the parent's entity ID) and `entityType` to AsyncStorage
- On success: navigates to Dashboard

#### Screen 2: DashboardScreen (`src/screens/DashboardScreen.js`)
- Home screen after login
- Summary cards: number of children, today's homework, pending fees, recent notices
- Fetches children using `GET /api/students/parent/{entityId}`
- Bottom tab navigator hub linking to all other screens

#### Screen 3: AttendanceScreen (`src/screens/AttendanceScreen.js`)
- Shows attendance record for each child by date
- PRESENT shown in green, ABSENT in red, LATE in orange
- Calculates and shows monthly attendance percentage
- Leave application form to request leave (`POST /api/attendance/leaves`)
- View leave application status (PENDING / APPROVED / REJECTED)
- API: `GET /api/attendance/student/{studentId}`

#### Screen 4: MarksScreen (`src/screens/MarksScreen.js`)
- Lists all exams (Unit Test, Mid Term, Final)
- Shows subject-wise marks: theory, practical, total
- Shows grade (A+, A, B+, B, C, D, F) for each subject
- Pass/fail status per subject
- API: `GET /api/examinations/{examId}/student/{studentId}/marks`

#### Screen 5: FeeScreen (`src/screens/FeeScreen.js`)
- Shows fee structure: tuition, transport, library, lab, sports
- Shows total fee due for the academic year
- Payment history: date, amount, mode, receipt number
- Outstanding balance calculation
- API: `GET /api/fees/student/{studentId}`

#### Screen 6: HomeworkScreen (`src/screens/HomeworkScreen.js`)
- Lists all homework assigned to child's class/section
- Shows: subject name, title, description, assigned date, due date
- Color-coded by status: ACTIVE (yellow), COMPLETED (green)
- API: `GET /api/homework/section/{sectionId}`

#### Screen 7: NoticeScreen (`src/screens/NoticeScreen.js`)
- Shows all school notices targeted to PARENTS and ALL
- Priority badge: URGENT (red), HIGH (orange), NORMAL (blue), LOW (grey)
- Notice type: GENERAL, FEE, EVENT, EXAM, HOLIDAY
- Shows publish date and expiry date
- API: `GET /api/notices`

#### Screen 8: ProfileScreen (`src/screens/ProfileScreen.js`)
- Shows parent's personal details (name, email, phone, occupation)
- Lists all linked children with their class/section
- Logout button (clears all AsyncStorage data)
- API: `GET /api/parents/{entityId}`

---

### Navigation Structure (Parent App)

```
App.js
│
├── AuthStack (shown when NOT logged in)
│   └── LoginScreen
│
└── MainStack (shown when logged in - JWT found in AsyncStorage)
    ├── Bottom Tab Navigator
    │   ├── Tab 1: Dashboard (Home icon)
    │   ├── Tab 2: Attendance (Calendar icon)
    │   ├── Tab 3: Marks (Chart icon)
    │   ├── Tab 4: Fees (Wallet icon)
    │   ├── Tab 5: Homework (Book icon)
    │   └── Tab 6: Notices (Bell icon)
    │
    └── ProfileScreen (accessed from top-right header icon)
```

---

### Why Each Package Is Used (Parent App)

| Package | Why It's Needed |
|---------|----------------|
| `expo` | Core platform — lets you build Android/iOS apps without native code or Android Studio |
| `@react-navigation/native` | Core library for all navigation |
| `@react-navigation/bottom-tabs` | The bottom tab bar (Dashboard, Attendance, Marks, etc.) |
| `@react-navigation/stack` | Allows navigating deeper into screens (Login → Dashboard) |
| `axios` | Makes HTTP calls to the backend API with proper headers |
| `@react-native-async-storage/async-storage` | Stores the JWT token on device so user stays logged in |
| `react-native-paper` | Ready-made UI components: Card, Button, TextInput, Chip |
| `react-native-gesture-handler` | Required by React Navigation for swipe and touch |
| `react-native-safe-area-context` | Prevents content hiding behind notch or navigation bar |
| `react-native-screens` | Uses native OS screen management for better performance |
| `react-native-vector-icons` | Icons used in tab bar and throughout the app |
| `date-fns` | Formats dates like "April 15, 2024" or "Mon, 15 Apr" |
| `@react-native-picker/picker` | Dropdown picker (for selecting student/class/exam) |

---

## 8. Teacher App - Complete Details

### What Is It?

The Teacher App allows teachers to manage their day-to-day school activities: mark student attendance, enter exam marks, assign homework, and view their class schedule.

- **Package Name:** `com.school.teacherapp`
- **Version:** 1.0.0
- **Platforms:** Android, iOS, Web

---

### 7 Screens in Teacher App

#### Screen 1: LoginScreen (`src/screens/LoginScreen.js`)
- Same login flow as Parent App
- Role = TEACHER, `entityId` = teacher's entity ID (NOT user ID)
- Saves token and entityId to AsyncStorage
- Navigates to Teacher Dashboard

#### Screen 2: DashboardScreen (`src/screens/DashboardScreen.js`)
- Shows teacher's name and employee ID
- Today's class schedule (from timetable)
- Quick-action buttons: Mark Attendance, Enter Marks, Add Homework
- Summary: total classes, total students
- API: `GET /api/teachers/{entityId}/subjects`

#### Screen 3: AttendanceScreen (`src/screens/AttendanceScreen.js`)
- Shows student list for the teacher's assigned class/section
- Select date → tap each student to mark PRESENT / ABSENT / LATE
- Submit all markings at once with one button
- API: `POST /api/attendance` (submit) | `GET /api/attendance/section/{sectionId}` (view)
- View leave applications: `GET /api/attendance/leaves`
- Approve/reject leave requests

#### Screen 4: MarksScreen (`src/screens/MarksScreen.js`)
- Step 1: Select exam from list
- Step 2: Select subject
- Step 3: Enter marks for each student (theory + practical separately)
- System auto-calculates total and grade
- Submit: `POST /api/examinations/{examId}/student/{studentId}/marks`
- View previously entered marks

#### Screen 5: HomeworkScreen (`src/screens/HomeworkScreen.js`)
- Create new homework: title, subject, class, section, due date, description
- View all homework previously assigned by this teacher
- Filter by class/section/subject
- API: `POST /api/homework` | `GET /api/homework/teacher/{teacherId}`

#### Screen 6: NoticeScreen (`src/screens/NoticeScreen.js`)
- Views notices targeted to TEACHERS and ALL
- Same display as Parent App
- Color-coded by priority

#### Screen 7: ProfileScreen (`src/screens/ProfileScreen.js`)
- Teacher's profile: name, employee ID, email, phone
- Qualification and specialization
- List of assigned subjects and classes
- Joining date
- Logout button
- API: `GET /api/teachers/{entityId}`

---

### Navigation Structure (Teacher App)

```
App.js
│
├── AuthStack (shown when NOT logged in)
│   └── LoginScreen
│
└── MainStack (shown when logged in)
    ├── Bottom Tab Navigator
    │   ├── Tab 1: Dashboard (Home icon)
    │   ├── Tab 2: Attendance (Calendar icon)
    │   ├── Tab 3: Marks (Edit icon)
    │   ├── Tab 4: Homework (Book icon)
    │   └── Tab 5: Notices (Bell icon)
    │
    └── ProfileScreen (accessed from header)
```

---

## 9. API Endpoints Reference

**Base URL:** `https://schoolm.aksoftware.tech/api`
**Header Required (all except login):** `Authorization: Bearer <JWT_TOKEN>`

| Method | Endpoint | Used By | Description |
|--------|----------|---------|-------------|
| POST | `/auth/login` | All apps | Login, returns JWT and user info |
| GET | `/students/parent/{parentId}` | Parent App | Get all children of a parent |
| GET | `/students/{id}` | Admin | Get student details |
| POST | `/students` | Admin | Create new student |
| PUT | `/students/{id}` | Admin | Update student |
| DELETE | `/students/{id}` | Admin | Delete student |
| GET | `/attendance/student/{studentId}` | Parent App | View attendance for a student |
| GET | `/attendance/section/{sectionId}` | Teacher App | View section attendance |
| POST | `/attendance` | Teacher App | Submit attendance markings |
| GET | `/attendance/leaves` | Both apps | Get leave applications |
| POST | `/attendance/leaves` | Parent App | Submit leave request |
| PUT | `/attendance/leaves/{id}` | Teacher App | Approve/reject leave |
| GET | `/academic/classes` | Admin, Teacher | Get all classes |
| GET | `/academic/sections/class/{classId}` | Admin | Get sections of a class |
| GET | `/academic/subjects` | Admin, Teacher | Get all subjects |
| GET | `/fees/student/{studentId}` | Parent App | Fee details for a student |
| POST | `/fees/structures` | Admin | Create fee structure |
| POST | `/fees/payments` | Admin | Record fee payment |
| GET | `/examinations` | All | Get all exams |
| GET | `/examinations/{examId}/student/{studentId}/marks` | Parent App | Get student's marks |
| POST | `/examinations/{examId}/student/{studentId}/marks` | Teacher App | Enter marks |
| GET | `/homework/section/{sectionId}` | Parent App | Get homework for section |
| GET | `/homework/teacher/{teacherId}` | Teacher App | Get teacher's homework |
| POST | `/homework` | Teacher App | Create homework |
| GET | `/notices` | Both apps | Get all active notices |
| POST | `/notices` | Admin | Create notice |
| GET | `/teachers/{teacherId}` | Teacher App | Get teacher profile |
| GET | `/teachers/{teacherId}/subjects` | Teacher App | Teacher's assigned subjects |
| GET | `/parents/{parentId}` | Parent App | Get parent profile |

---

## 10. Mobile App Deployment - Complete Guide

This section covers the full professional process to deploy the Parent App and Teacher App — from first-time setup all the way to going live on the Google Play Store.

---

### PHASE 1 — One-Time Account Setup (Do This Only Once)

#### Step 1.1 — Create a Free Expo Account

1. Go to **expo.dev**
2. Click **Sign Up** — completely free
3. Verify your email address
4. Remember your username and password — needed for every build

#### Step 1.2 — Create Google Play Developer Account

1. Go to **play.google.com/console**
2. Sign in with the **school's official Google account** (not personal)
3. Click **Get started**
4. Accept the Developer Distribution Agreement
5. Pay the **one-time USD 25 registration fee** by debit/credit card
6. Fill developer details:
   - Developer name: Your school name (e.g. Kallesh Public School)
   - Email: School official email
   - Phone: School contact number
7. Account approval takes **24 to 48 hours** — email sent when ready

#### Step 1.3 — Install EAS CLI on Your Computer

```bash
# Check Node.js is installed (must be v18 or higher)
node --version

# Install Expo EAS CLI globally
npm install -g eas-cli

# Verify
eas --version
```

#### Step 1.4 — Login to EAS

```bash
eas login
# Enter your expo.dev email and password
# You will see: Logged in as your-username
```

---

### PHASE 2 — Configure Both Apps Before Building

#### Step 2.1 — Choose Your Package Names (PERMANENT — Cannot Change After Publishing)

The package name is the permanent unique ID of your app on all Android devices.

| App | Recommended Format | Example |
|-----|-------------------|---------|
| Parent App | com.schoolname.parentapp | com.kalleshschool.parentapp |
| Teacher App | com.schoolname.teacherapp | com.kalleshschool.teacherapp |

**Rules:**
- Only lowercase letters, numbers, and dots
- No spaces, no hyphens, no underscores
- Must be globally unique — no other app can share it
- Once published — it can NEVER be changed

#### Step 2.2 — Update Parent App: parent-app/app.json

```json
{
  "expo": {
    "name": "Kallesh School Parent",
    "slug": "kallesh-school-parent",
    "version": "1.0.0",
    "orientation": "portrait",
    "platforms": ["android", "ios"],
    "android": {
      "package": "com.kalleshschool.parentapp",
      "versionCode": 1
    },
    "newArchEnabled": false
  }
}
```

| Field | Meaning |
|-------|---------|
| name | App name shown on phone home screen |
| version | Human-readable version shown in Play Store |
| versionCode | Internal build number — must increase by 1 with every update |
| package | Permanent unique ID — use your school name |

#### Step 2.3 — Update Teacher App: teacher-app/app.json

```json
{
  "expo": {
    "name": "Kallesh School Teacher",
    "slug": "kallesh-school-teacher",
    "version": "1.0.0",
    "orientation": "portrait",
    "platforms": ["android", "ios"],
    "android": {
      "package": "com.kalleshschool.teacherapp",
      "versionCode": 1
    },
    "newArchEnabled": false
  }
}
```

#### Step 2.4 — EAS Build Config (Already Ready in Both Apps)

Both apps already have eas.json configured correctly:

```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "preview":    { "android": { "buildType": "apk" } },
    "production": { "android": { "buildType": "app-bundle" } }
  },
  "submit": { "production": {} }
}
```

| Profile | Output File | Purpose |
|---------|------------|---------|
| preview | .apk | Direct install on phone for testing |
| production | .aab (App Bundle) | Upload to Google Play Store |

---

### PHASE 3 — Build Parent App

#### Step 3.1 — Link Project to Expo Account

```bash
cd parent-app
eas build:configure
```

When prompted:
- "Create an EAS project?" → **Yes**
- This adds projectId to app.json and links to your expo.dev account

#### Step 3.2 — Build Test APK (Install Directly on Phone)

**Always test with APK before building for Play Store.**

```bash
cd parent-app
eas build --platform android --profile preview
```

Process:
1. EAS uploads your code to Expo cloud
2. Build runs on cloud servers — takes **10 to 15 minutes**
3. Download link appears in terminal and at expo.dev
4. Download .apk to your computer
5. Transfer to Android phone (USB, WhatsApp, email, Google Drive)
6. On phone: Settings → Security → Enable **Install from unknown sources**
7. Open APK file → Install
8. Test all screens: Login, Dashboard, Attendance, Marks, Fees, Homework, Notices

#### Step 3.3 — Build Production AAB (For Play Store Upload)

Only build this after APK testing is successful.

```bash
cd parent-app
eas build --platform android --profile production
```

1. Build takes 10 to 15 minutes on Expo cloud
2. Download the **.aab file** from the link provided
3. Save this file — you will upload it to Google Play Console

---

### PHASE 4 — Set Up Parent App in Google Play Console

#### Step 4.1 — Create App Listing

1. Go to **play.google.com/console**
2. Click **Create app** (top right)

| Field | Enter This |
|-------|-----------|
| App name | Kallesh School Parent |
| Default language | English (United States) |
| App or game | App |
| Free or paid | Free |

3. Tick both declaration checkboxes
4. Click **Create app**

#### Step 4.2 — Fill Store Listing

Left menu → **Store presence** → **Main store listing**

**App name:** Kallesh School Parent

**Short description (max 80 characters):**
```
Track your child's attendance, marks, fees, homework and school notices
```

**Full description (max 4000 characters):**
```
Kallesh School Parent App keeps parents connected to their child's school life.

FEATURES:
• Attendance Tracking — View daily attendance and absence history
• Exam Results — Check subject-wise marks and grades for every exam
• Fee Management — View fee dues, payment history and outstanding balance
• Homework — View all homework assignments with due dates
• Leave Application — Apply for student leave directly from the app
• School Notices — Instant access to all school announcements and circulars
• Student Profile — View your child's complete academic profile

SECURE AND PRIVATE:
All data is stored on the school's private server.
Only authorized parents can view their own children's information.
All connections are encrypted with HTTPS.

HOW TO GET ACCESS:
Login credentials are provided by the school administration.
Contact your school office to get your username and password.

Download now and stay connected with your child's school every day.
```

#### Step 4.3 — Upload Graphics Assets

| Asset | Size | Format | Requirements |
|-------|------|--------|-------------|
| App icon | 512 × 512 px | PNG | No transparency. Solid background color. |
| Feature graphic | 1024 × 500 px | PNG or JPG | Banner image at top of store page |
| Phone screenshots | 1080 × 1920 px | PNG or JPG | Minimum 2, maximum 8 |

**How to take screenshots:**
1. Install preview APK on your phone
2. Login and navigate to each screen
3. Take screenshots of: Login, Dashboard, Attendance, Marks, Fees

In Play Console:
- Main store listing → scroll to **Graphics** section
- Upload icon → Upload feature graphic → Upload screenshots
- Click **Save**

#### Step 4.4 — Set Content Rating

Left menu → Policy → App content → **Content rating**

1. Click **Start questionnaire**
2. Category: **Utility**
3. Answer all questions:

| Question | Your Answer |
|----------|------------|
| Violence or graphic content | No |
| Sexual content | No |
| Profanity | No |
| Controlled substances | No |
| User-generated content | No |
| Location sharing | No |

4. Click **Submit**
5. Rating result: **Everyone** (suitable for all ages)

#### Step 4.5 — Set Target Audience

Left menu → Policy → App content → **Target audience and content**

1. Click **Manage**
2. Target age: Select **18 and over** (app is for adult parents, not children)
3. Does app appeal to children? → **No**
4. Click Next → **Save**

#### Step 4.6 — Add Privacy Policy

You must host a privacy policy page on a real URL.

**Minimum content required:**
- What data the app collects (login credentials, student info from school server)
- Data stored on school's private server only
- Not shared with any third parties
- Only authenticated parents can see their own children's data
- Contact information for privacy requests

**In Play Console:**
- Left menu → Policy → App content → **Privacy policy**
- Click Manage → Paste your privacy policy URL → Click **Save**

#### Step 4.7 — Fill Data Safety Form

Left menu → Policy → App content → **Data safety**

| Question | Answer |
|----------|--------|
| Does app collect or share data? | Yes |
| Personal info (name) collected | Yes — required for account |
| App activity collected | Yes — to show content |
| Is data encrypted in transit? | Yes (HTTPS) |
| Can users request deletion? | Yes (contact school) |

Click **Save**

---

### PHASE 5 — Upload and Release Parent App

#### Step 5.1 — Create Production Release

Left menu → Release → **Production** → Releases

1. Click **Create new release**
2. Under App bundles, click **Upload**
3. Select your **.aab file** downloaded from EAS
4. Wait 1–2 minutes for upload and processing

#### Step 5.2 — Fill Release Details

| Field | Value |
|-------|-------|
| Release name | Auto-filled (e.g. 1 — 1.0.0) |
| Release notes (What's new) | Initial release of Kallesh School Parent App |

#### Step 5.3 — Review and Submit

1. Click **Save**
2. Click **Review release**
3. Fix any **errors** (red) — these block release
4. Fix warnings (yellow) where possible
5. When no errors: Click **Start rollout to Production**
6. Confirm popup: Click **Rollout**

#### Step 5.4 — Google Review Timelines

| Submission | Wait Time |
|-----------|-----------|
| First submission ever | 1 to 3 business days |
| App updates | A few hours to 1 day |
| After rejection and fix | 1 to 2 days |

You receive an email when approved or rejected. If rejected, the email explains why — fix the issue and resubmit.

---

### PHASE 6 — Build and Release Teacher App

#### Step 6.1 — Build Teacher App

```bash
# Test APK first
cd teacher-app
eas build:configure
eas build --platform android --profile preview

# After successful testing — production build
eas build --platform android --profile production
```

#### Step 6.2 — Create Separate Listing in Play Console

Go to Play Console → Click **Create app** (this is a separate app from Parent App)

| Field | Value |
|-------|-------|
| App name | Kallesh School Teacher |
| Default language | English |
| App or game | App |
| Free or paid | Free |

Follow Phases 4 and 5 exactly as done for the Parent App.

**Teacher App Short Description:**
```
Mark attendance, enter marks, assign homework and manage your classes
```

**Teacher App Full Description:**
```
Kallesh School Teacher App — Complete classroom management in your pocket.

FEATURES:
• Attendance Marking — Mark each student Present, Absent or Late with one tap
• Marks Entry — Enter theory and practical marks for every student per subject
• Homework Assignment — Create homework assignments with due dates and descriptions
• Leave Management — Review and approve or reject student leave applications
• School Notices — View all notices and circulars from school administration
• Teacher Profile — View your employee ID, qualification, assigned subjects and classes

DESIGNED FOR TEACHERS:
- Mark attendance for your full class in under 2 minutes
- Enter marks for multiple students at once
- See your class schedule and subject assignments at a glance

Login credentials provided by school administration.
Contact your school office if you need your login details.
```

---

### PHASE 7 — Releasing App Updates

When you fix bugs or add new features to the app:

**Step 1 — Increase version numbers in app.json:**

```json
{
  "expo": {
    "version": "1.1.0",
    "android": {
      "versionCode": 2
    }
  }
}
```

**Versioning rules:**
- versionCode MUST always increase — never reuse a number (1, 2, 3, 4...)
- version is the human-readable label (1.0.0, 1.1.0, 2.0.0)

**Step 2 — Build new AAB:**

```bash
eas build --platform android --profile production
```

**Step 3 — Upload in Play Console:**
Production → Releases → Create new release → Upload new .aab → Write what changed → Submit

---

### Complete Pre-Submission Checklist

```
ACCOUNTS
[ ] Google Play Developer account approved (USD 25 paid, email confirmed)
[ ] Expo account created and verified (expo.dev — free)
[ ] EAS CLI installed: npm install -g eas-cli
[ ] Logged into EAS: eas login — shows your username

APP CONFIGURATION
[ ] Package name set (com.yourschoolname.parentapp) — school name, no spaces
[ ] App display name updated (e.g. Kallesh School Parent)
[ ] version set to 1.0.0 and versionCode set to 1 in app.json
[ ] eas build:configure run inside the app folder

TESTING
[ ] Preview APK built successfully
[ ] APK installed on Android phone (unknown sources enabled)
[ ] Login works with real backend credentials
[ ] Dashboard loads with student data
[ ] Attendance screen shows records
[ ] Marks screen displays exam results
[ ] Fees screen shows payment info
[ ] Homework screen shows assignments
[ ] Notices screen shows announcements
[ ] Logout clears session and returns to login

ASSETS READY
[ ] App icon — 512x512 PNG, no transparency, solid background
[ ] Feature graphic — 1024x500 PNG or JPG
[ ] Phone screenshots — minimum 2, size 1080x1920

PLAY CONSOLE COMPLETED
[ ] App created in Play Console
[ ] App name filled
[ ] Short description filled (max 80 chars)
[ ] Full description filled (max 4000 chars)
[ ] App icon uploaded
[ ] Feature graphic uploaded
[ ] At least 2 phone screenshots uploaded
[ ] Content rating questionnaire completed — rated Everyone
[ ] Target audience set to 18 and over
[ ] Privacy policy URL added (hosted on real website)
[ ] Data safety form filled and saved
[ ] Production AAB uploaded to release
[ ] Release notes written
[ ] No red errors in review screen
[ ] Submitted for review — waiting for Google approval
```

---

## 11. Other Ways to Install on Mobile

There are 5 ways to install the app on a phone. Play Store is the most professional, but there are faster options for school-internal use.

---

### Method 1 — Direct APK Install (Fastest, Free, No Accounts Needed)

**Best for:** Internal school use, quick distribution to staff, testing

```bash
# Build APK for Parent App
cd parent-app
eas build --platform android --profile preview

# Build APK for Teacher App
cd teacher-app
eas build --platform android --profile preview
```

**How to distribute the APK to phones:**

Option A — Share via WhatsApp:
1. Download .apk file to your computer
2. Send the .apk file in WhatsApp (as a document, not photo)
3. Person taps the file in WhatsApp to download
4. Taps Install

Option B — Share via Google Drive:
1. Upload .apk to Google Drive
2. Set sharing to Anyone with link
3. Share the link with parents/teachers
4. They open link on phone → Download → Install

Option C — USB Transfer:
1. Connect phone to computer via USB cable
2. Copy .apk file to phone's Downloads folder
3. Open file manager on phone
4. Tap the .apk → Install

**Enabling installation on Android phone (one-time setup):**
- Android 8 and above: Settings → Apps → Special app access → Install unknown apps → Select your browser or file manager → Allow
- Android 7 and below: Settings → Security → Unknown sources → Enable

**Advantages:**
- Free — no USD 25 Play Store fee
- No review wait — works in minutes
- Anyone can receive it via WhatsApp or Drive
- Update by sharing new APK

**Disadvantages:**
- No automatic updates — must share new APK each time
- Users must enable unknown sources once
- No ratings or reviews system

---

### Method 2 — Expo Go App (For Development Testing Only)

**Best for:** Developers testing the app in real-time — NOT for actual school users

**On the developer's computer:**
```bash
cd parent-app
npx expo start --lan --port 8081
```

**On the tester's phone:**
1. Install **Expo Go** app from Google Play Store (search "Expo Go" by Expo)
2. Open Expo Go
3. Tap **Scan QR code**
4. Scan the QR code shown in the terminal on the developer's computer
5. App loads instantly on phone

**Advantages:**
- No build needed — instant load
- Code changes appear on phone automatically
- Free — no account needed

**Disadvantages:**
- Phone and computer must be on same WiFi
- App disappears when developer closes terminal
- Requires Expo Go to be installed separately
- Not suitable for real parents or teachers

---

### Method 3 — Google Play Internal Testing Track (Private, Up to 100 Testers)

**Best for:** Sharing with selected parents and teachers before public launch

**How to set up:**

Step 1 — Build production AAB:
```bash
eas build --platform android --profile production
```

Step 2 — In Play Console:
- Left menu → Release → Testing → **Internal testing**
- Click Create new release
- Upload .aab file
- Click Save → Review → **Start rollout to Internal testing**

Step 3 — Add testers:
- Left menu → Internal testing → **Testers tab**
- Click Create email list → Add emails of testers → Save
- Up to **100 testers** allowed

Step 4 — Share opt-in link:
- Play Console shows a link like: play.google.com/apps/internaltest/...
- Share this link with testers via WhatsApp or email
- Testers open link on Android phone → Tap **Become a tester** → Download from Play Store

**Advantages:**
- Real Play Store experience for testers
- No unknown sources needed
- Automatic updates pushed to testers
- Professional look and feel

**Disadvantages:**
- Requires Google Play Developer account (USD 25)
- Testers must have a Google account
- Maximum 100 testers on internal track

---

### Method 4 — Play Store Open Testing / Beta

**Best for:** Wider testing with volunteer parents before full public launch

**How to set up:**

1. In Play Console:
   - Left menu → Release → Testing → **Open testing**
   - Create new release → Upload .aab → Submit for review
   - Review takes a few hours

2. Once approved, any user can opt in:
   - They visit your Play Store listing
   - Tap **Join beta** → Download and install

3. When ready for full launch:
   - Promote same build to **Production**
   - Or create a fresh Production release

**Advantages:**
- Real users test before official launch
- Feedback via Play Store reviews
- Smooth path to Production release

---

### Method 5 — Play Store Production (Official Public Release)

**Best for:** Full deployment — all parents and teachers download from Play Store

This is Phases 1 through 6 described above in full detail.

**Advantages:**
- Professional — looks like any other app on Play Store
- Automatic updates to all users
- Users trust Play Store apps more than APKs
- No unknown sources warning
- Reach anyone with Android phone

---

### Which Method Should You Use?

| Situation | Recommended Method |
|-----------|-------------------|
| Testing during development | Expo Go or Direct APK |
| Sharing with 5-10 school staff for feedback | Direct APK via WhatsApp |
| Private testing with 20-50 parents or teachers | Internal Testing Track |
| Soft launch before going fully public | Open Beta Testing |
| Official deployment for entire school | Production Play Store |
| School with no internet for testing | Direct APK via USB |

**Recommended rollout plan for a new school deployment:**

```
Week 1: Build preview APK → Test with principal and 2-3 teachers
Week 2: Fix issues → Build internal test → Share with 10 parents and teachers
Week 3: Collect feedback → Fix issues → Build production AAB
Week 4: Submit to Play Store → Wait for approval → Announce to all parents and teachers
```


## 12. VPS Deployment

**Server:** 194.164.149.8 (Ubuntu Linux)
**Domain:** schoolm.aksoftware.tech

### Services Running

| Service | Port | How to Check |
|---------|------|-------------|
| Backend (Java JAR) | 8080 | `netstat -tlnp \| grep 8080` |
| Nginx | 80, 443 | `systemctl status nginx` |
| MySQL | 3306 | `systemctl status mysql` |

### Nginx Routing

```
https://schoolm.aksoftware.tech/api/*  →  localhost:8080  (Spring Boot backend)
https://schoolm.aksoftware.tech/*      →  /var/www/school-admin  (React admin web)
```

Nginx config location: `/etc/nginx/sites-enabled/`

### Start Backend on VPS

```bash
ssh root@194.164.149.8
java -jar /opt/school-management/backend/target/school-management-system-1.0.0.jar &
```

### Rebuild and Deploy Backend

```bash
ssh root@194.164.149.8
cd /opt/school-management/backend
/usr/bin/mvn clean package -DskipTests
java -jar target/school-management-system-1.0.0.jar &
```

---

## 13. Default Login Credentials

> Change these passwords immediately before real use!

| Role | Username | Password | App to Use |
|------|----------|----------|-----------|
| Admin | `admin` | `admin123` | Admin Web Panel |
| Teacher | `teacher1` | `teacher123` | Teacher App |
| Teacher | `teacher2` | `teacher123` | Teacher App |
| Parent | `parent1` | `parent123` | Parent App |
| Parent | `parent2` | `parent123` | Parent App |

**Linked students:**
- parent1 has children: Michael Williams (Class 1-A), Emily Williams (Class 2-A)
- parent2 has children: James Brown (Class 1-A)

**Linked teachers:**
- teacher1 (John Smith) — Specialization: Mathematics, Employee ID: TCH001
- teacher2 (Sarah Johnson) — Specialization: Science, Employee ID: TCH002

---

## 14. Local Development

### 1. Start MySQL Database

```bash
# Make sure MySQL is running on port 3306
# Create database:
mysql -u root -p
CREATE DATABASE school_db;
CREATE USER 'school_admin'@'localhost' IDENTIFIED BY 'school_admin123';
GRANT ALL ON school_db.* TO 'school_admin'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Start Backend

```bash
cd backend
./mvnw spring-boot:run
# Backend starts at http://localhost:8080/api
# Hibernate creates all 25 tables automatically on first run
```

### 3. Load Sample Data (optional)

```bash
mysql -u school_admin -p school_db < backend/src/main/resources/dummy_data.sql
```

### 4. Start Admin Web

```bash
cd admin-web
npm install
npm start
# Opens at http://localhost:3000
```

### 5. Start Parent App

```bash
cd parent-app
npm install
npx expo start --lan --port 8081
# Scan QR code with Expo Go app on your Android/iOS phone
```

### 6. Start Teacher App

```bash
cd teacher-app
npm install
npx expo start --lan --port 8082
# Scan QR code with Expo Go app on your Android/iOS phone
```

---

*School Management System v1.0.0 — Spring Boot 3.2.2 + React Native (Expo 54) + React.js 18*
