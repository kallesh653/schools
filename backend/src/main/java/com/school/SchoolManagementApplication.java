package com.school;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class SchoolManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(SchoolManagementApplication.class, args);
        System.out.println("===========================================");
        System.out.println("School Management System Started Successfully!");
        System.out.println("API Base URL: http://localhost:8080/api");
        System.out.println("===========================================");
    }
}
