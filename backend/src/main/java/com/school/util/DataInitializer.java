package com.school.util;

import com.school.entity.*;
import com.school.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AcademicYearRepository academicYearRepository;

    @Autowired
    private SchoolClassRepository schoolClassRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ParentRepository parentRepository;

    @Autowired
    private NoticeRepository noticeRepository;

    @Autowired
    private FeeStructureRepository feeStructureRepository;

    @Autowired
    private ExaminationRepository examinationRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Create roles if they don't exist
        createRoleIfNotExists(Role.ADMIN, "Administrator with full access");
        createRoleIfNotExists(Role.TEACHER, "Teacher with limited access");
        createRoleIfNotExists(Role.PARENT, "Parent with read-only access");

        // Create default admin user if not exists
        createDefaultAdmin();

        // Initialize sample data
        initializeSampleData();

        System.out.println("Data initialization completed!");
        System.out.println("===========================================");
        System.out.println("School Management System Started Successfully!");
        System.out.println("API Base URL: http://localhost:8080/api");
        System.out.println("===========================================");
    }

    private void createRoleIfNotExists(String roleName, String description) {
        if (roleRepository.findByName(roleName).isEmpty()) {
            Role role = new Role();
            role.setName(roleName);
            role.setDescription(description);
            roleRepository.save(role);
            System.out.println("Created role: " + roleName);
        }
    }

    private void createDefaultAdmin() {
        if (userRepository.findByUsername("admin").isEmpty()) {
            Role adminRole = roleRepository.findByName(Role.ADMIN)
                    .orElseThrow(() -> new RuntimeException("Admin role not found"));

            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setEmail("admin@school.com");
            admin.setFullName("System Administrator");
            admin.setContact("1234567890");
            admin.setRole(adminRole);
            admin.setActive(true);
            admin.setEntityType("ADMIN");

            userRepository.save(admin);
            System.out.println("Created default admin user - Username: admin, Password: admin123");
        }
    }

    private void initializeSampleData() {
        // Only initialize if no academic years exist
        if (academicYearRepository.count() > 0) {
            System.out.println("Sample data already exists, skipping initialization.");
            return;
        }

        System.out.println("Initializing sample data...");

        // Create Academic Years
        AcademicYear currentYear = new AcademicYear();
        currentYear.setName("2025-2026");
        currentYear.setStartDate(LocalDate.of(2025, 4, 1));
        currentYear.setEndDate(LocalDate.of(2026, 3, 31));
        currentYear.setIsActive(true);
        currentYear = academicYearRepository.save(currentYear);
        System.out.println("Created academic year: 2025-2026");

        AcademicYear previousYear = new AcademicYear();
        previousYear.setName("2024-2025");
        previousYear.setStartDate(LocalDate.of(2024, 4, 1));
        previousYear.setEndDate(LocalDate.of(2025, 3, 31));
        previousYear.setIsActive(false);
        academicYearRepository.save(previousYear);

        // Create Classes
        String[] classNames = {"Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
                               "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"};

        for (int i = 0; i < classNames.length; i++) {
            SchoolClass schoolClass = new SchoolClass();
            schoolClass.setName(classNames[i]);
            schoolClass.setCode("CLASS_" + (i + 1));
            schoolClass.setGrade(i + 1);
            schoolClass.setCapacity(120);
            schoolClass.setDescription("Grade " + (i + 1) + " students");
            schoolClass = schoolClassRepository.save(schoolClass);

            // Create Sections for each class
            String[] sectionNames = {"A", "B", "C"};
            for (String sectionName : sectionNames) {
                Section section = new Section();
                section.setName(sectionName);
                section.setSchoolClass(schoolClass);
                section.setCapacity(40);
                sectionRepository.save(section);
            }
        }
        System.out.println("Created classes with sections");

        // Create Subjects
        String[][] subjectData = {
            {"Mathematics", "MATH", "Core mathematics curriculum"},
            {"English", "ENG", "English language and literature"},
            {"Science", "SCI", "General science"},
            {"Social Studies", "SOC", "History, geography, and civics"},
            {"Hindi", "HIN", "Hindi language"},
            {"Computer Science", "CS", "Basic computer education"},
            {"Physical Education", "PE", "Sports and physical activities"},
            {"Art", "ART", "Drawing and painting"}
        };

        for (String[] data : subjectData) {
            Subject subject = new Subject();
            subject.setName(data[0]);
            subject.setCode(data[1]);
            subject.setDescription(data[2]);
            subject.setMaxMarks(100);
            subject.setTheoryMaxMarks(80);
            subject.setPracticalMaxMarks(20);
            subject.setPassMarks(35);
            subjectRepository.save(subject);
        }
        System.out.println("Created subjects");

        // Create Teachers
        Role teacherRole = roleRepository.findByName(Role.TEACHER)
                .orElseThrow(() -> new RuntimeException("Teacher role not found"));

        String[][] teacherData = {
            {"John Smith", "john.smith@school.com", "9876543210", "Mathematics"},
            {"Emily Johnson", "emily.johnson@school.com", "9876543211", "English"},
            {"Robert Brown", "robert.brown@school.com", "9876543212", "Science"},
            {"Sarah Davis", "sarah.davis@school.com", "9876543213", "Social Studies"},
            {"Michael Wilson", "michael.wilson@school.com", "9876543214", "Hindi"}
        };

        int empId = 1001;
        for (String[] data : teacherData) {
            // Create user for teacher
            User user = new User();
            user.setUsername(data[1].split("@")[0]);
            user.setPassword(passwordEncoder.encode("teacher123"));
            user.setEmail(data[1]);
            user.setFullName(data[0]);
            user.setContact(data[2]);
            user.setRole(teacherRole);
            user.setActive(true);
            user.setEntityType("TEACHER");
            user = userRepository.save(user);

            // Create teacher
            Teacher teacher = new Teacher();
            teacher.setEmployeeId("EMP" + empId++);
            teacher.setFirstName(data[0].split(" ")[0]);
            teacher.setLastName(data[0].split(" ")[1]);
            teacher.setEmail(data[1]);
            teacher.setPhone(data[2]);
            teacher.setSpecialization(data[3]);
            teacher.setQualification("M.Ed, B.Ed");
            teacher.setJoiningDate(LocalDate.now().minusYears(2));
            teacher.setGender("Male");
            teacher.setAddress("123 Teacher Street");
            teacher.setUser(user);
            teacherRepository.save(teacher);

            user.setEntityId(teacher.getId());
            userRepository.save(user);
        }
        System.out.println("Created teachers");

        // Create Students and Parents
        Role parentRole = roleRepository.findByName(Role.PARENT)
                .orElseThrow(() -> new RuntimeException("Parent role not found"));

        List<SchoolClass> classes = schoolClassRepository.findAll();
        SchoolClass class1 = classes.get(0);
        List<Section> sections = sectionRepository.findBySchoolClass(class1);
        Section sectionA = sections.get(0);

        String[][] studentData = {
            {"Rahul Kumar", "rahul.kumar", "Male", "Rajesh Kumar", "rajesh.kumar"},
            {"Priya Sharma", "priya.sharma", "Female", "Suresh Sharma", "suresh.sharma"},
            {"Amit Singh", "amit.singh", "Male", "Vijay Singh", "vijay.singh"},
            {"Neha Gupta", "neha.gupta", "Female", "Rakesh Gupta", "rakesh.gupta"},
            {"Vikram Patel", "vikram.patel", "Male", "Mukesh Patel", "mukesh.patel"}
        };

        int admNo = 2025001;
        for (String[] data : studentData) {
            // Create parent
            Parent parent = new Parent();
            parent.setFatherName(data[3]);
            parent.setFatherPhone("98765432" + (admNo % 100));
            parent.setFatherEmail(data[4] + "@email.com");
            parent.setFatherOccupation("Business");
            parent.setMotherName("Mrs. " + data[3].split(" ")[1]);
            parent.setMotherPhone("98765433" + (admNo % 100));
            parent.setAddress("123 Parent Street, City");
            parent = parentRepository.save(parent);

            // Create parent user
            User parentUser = new User();
            parentUser.setUsername(data[4]);
            parentUser.setPassword(passwordEncoder.encode("parent123"));
            parentUser.setEmail(data[4] + "@email.com");
            parentUser.setFullName(data[3]);
            parentUser.setContact("98765432" + (admNo % 100));
            parentUser.setRole(parentRole);
            parentUser.setActive(true);
            parentUser.setEntityType("PARENT");
            parentUser.setEntityId(parent.getId());
            userRepository.save(parentUser);

            // Create student
            Student student = new Student();
            student.setAdmissionNo("ADM" + admNo++);
            student.setFirstName(data[0].split(" ")[0]);
            student.setLastName(data[0].split(" ")[1]);
            student.setEmail(data[1] + "@student.school.com");
            student.setPhone("98765431" + (admNo % 100));
            student.setGender(data[2]);
            student.setDateOfBirth(LocalDate.of(2015, 5, 15));
            student.setAddress("123 Student Lane, City");
            student.setSchoolClass(class1);
            student.setSection(sectionA);
            student.setAcademicYear(currentYear);
            student.setParent(parent);
            student.setAdmissionDate(LocalDate.now().minusMonths(6));
            student.setBloodGroup("O+");
            studentRepository.save(student);
        }
        System.out.println("Created students and parents");

        // Create Notices
        String[][] noticeData = {
            {"Annual Day Celebration", "All students are invited to the Annual Day celebration on March 15th. Parents are welcome.", "EVENT"},
            {"Summer Vacation Notice", "Summer vacation will commence from May 1st to June 15th. School will reopen on June 16th.", "ANNOUNCEMENT"},
            {"Parent-Teacher Meeting", "PTM scheduled for Saturday. Please confirm your attendance.", "MEETING"},
            {"Sports Day", "Annual Sports Day will be held on April 20th. All students must participate.", "EVENT"},
            {"Fee Payment Reminder", "Last date for fee payment is March 31st. Please clear all dues.", "REMINDER"}
        };

        for (String[] data : noticeData) {
            Notice notice = new Notice();
            notice.setTitle(data[0]);
            notice.setContent(data[1]);
            notice.setNoticeType(data[2]);
            notice.setPublishDate(LocalDate.now());
            notice.setExpiryDate(LocalDate.now().plusDays(30));
            notice.setTargetAudience("ALL");
            notice.setPublished(true);
            notice.setPriority("NORMAL");
            noticeRepository.save(notice);
        }
        System.out.println("Created notices");

        // Create Fee Structure
        for (SchoolClass schoolClass : classes.subList(0, 5)) {
            FeeStructure feeStructure = new FeeStructure();
            feeStructure.setSchoolClass(schoolClass);
            feeStructure.setAcademicYear(currentYear);
            feeStructure.setTuitionFee(15000.0);
            feeStructure.setAdmissionFee(5000.0);
            feeStructure.setExamFee(2000.0);
            feeStructure.setTransportFee(3000.0);
            feeStructure.setLibraryFee(1000.0);
            feeStructure.setLabFee(1500.0);
            feeStructure.setSportsFee(1000.0);
            feeStructure.setTotalFee(28500.0);
            feeStructureRepository.save(feeStructure);
        }
        System.out.println("Created fee structures");

        // Create Examination
        Examination midTerm = new Examination();
        midTerm.setName("Mid-Term Examination 2025");
        midTerm.setExamType("MID_TERM");
        midTerm.setAcademicYear(currentYear);
        midTerm.setStartDate(LocalDate.now().plusDays(30));
        midTerm.setEndDate(LocalDate.now().plusDays(45));
        midTerm.setDescription("Mid-term examination for all classes");
        midTerm.setPublished(false);
        examinationRepository.save(midTerm);

        Examination finalExam = new Examination();
        finalExam.setName("Final Examination 2026");
        finalExam.setExamType("FINAL");
        finalExam.setAcademicYear(currentYear);
        finalExam.setStartDate(LocalDate.now().plusDays(90));
        finalExam.setEndDate(LocalDate.now().plusDays(105));
        finalExam.setDescription("Final examination for all classes");
        finalExam.setPublished(false);
        examinationRepository.save(finalExam);
        System.out.println("Created examinations");

        System.out.println("Sample data initialization completed!");
    }
}
