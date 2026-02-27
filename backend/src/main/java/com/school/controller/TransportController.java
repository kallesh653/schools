package com.school.controller;

import com.school.dto.MessageResponse;
import com.school.entity.Student;
import com.school.entity.TransportRoute;
import com.school.exception.ResourceNotFoundException;
import com.school.repository.StudentRepository;
import com.school.repository.TransportRouteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/transport")
@CrossOrigin(origins = "*")
public class TransportController {

    @Autowired private TransportRouteRepository routeRepository;
    @Autowired private StudentRepository studentRepository;

    // ---- Route CRUD ----

    @GetMapping("/routes")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<TransportRoute>> getAllRoutes() {
        return ResponseEntity.ok(routeRepository.findAll());
    }

    @GetMapping("/routes/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PARENT')")
    public ResponseEntity<List<TransportRoute>> getActiveRoutes() {
        return ResponseEntity.ok(routeRepository.findByActiveTrue());
    }

    @GetMapping("/routes/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<TransportRoute> getRouteById(@PathVariable Long id) {
        TransportRoute route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TransportRoute", "id", id));
        return ResponseEntity.ok(route);
    }

    @PostMapping("/routes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TransportRoute> createRoute(@RequestBody TransportRoute route) {
        if (route.getAnnualFee() == null && route.getMonthlyFee() != null) {
            route.setAnnualFee(route.getMonthlyFee() * 12);
        }
        return ResponseEntity.ok(routeRepository.save(route));
    }

    @PutMapping("/routes/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TransportRoute> updateRoute(@PathVariable Long id, @RequestBody TransportRoute route) {
        TransportRoute existing = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TransportRoute", "id", id));
        existing.setRouteName(route.getRouteName());
        existing.setRouteCode(route.getRouteCode());
        existing.setFromLocation(route.getFromLocation());
        existing.setToLocation(route.getToLocation());
        existing.setDistanceKm(route.getDistanceKm());
        existing.setMonthlyFee(route.getMonthlyFee());
        existing.setAnnualFee(route.getAnnualFee());
        existing.setVehicleNumber(route.getVehicleNumber());
        existing.setDriverName(route.getDriverName());
        existing.setDriverPhone(route.getDriverPhone());
        existing.setDescription(route.getDescription());
        existing.setActive(route.getActive());
        return ResponseEntity.ok(routeRepository.save(existing));
    }

    @DeleteMapping("/routes/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteRoute(@PathVariable Long id) {
        TransportRoute route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TransportRoute", "id", id));
        // Remove route assignment from students first
        List<Student> students = studentRepository.findByTransportRoute(route);
        students.forEach(s -> s.setTransportRoute(null));
        studentRepository.saveAll(students);
        routeRepository.delete(route);
        return ResponseEntity.ok(new MessageResponse("Route deleted successfully"));
    }

    // ---- Student-Route Assignment ----

    @GetMapping("/routes/{routeId}/students")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Student>> getStudentsByRoute(@PathVariable Long routeId) {
        TransportRoute route = routeRepository.findById(routeId)
                .orElseThrow(() -> new ResourceNotFoundException("TransportRoute", "id", routeId));
        return ResponseEntity.ok(studentRepository.findByTransportRoute(route));
    }

    @PutMapping("/students/{studentId}/route")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Student> assignRouteToStudent(
            @PathVariable Long studentId,
            @RequestBody Map<String, Object> body) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));
        Object routeIdObj = body.get("routeId");
        if (routeIdObj == null) {
            student.setTransportRoute(null);
        } else {
            Long routeId = Long.valueOf(routeIdObj.toString());
            TransportRoute route = routeRepository.findById(routeId)
                    .orElseThrow(() -> new ResourceNotFoundException("TransportRoute", "id", routeId));
            student.setTransportRoute(route);
        }
        return ResponseEntity.ok(studentRepository.save(student));
    }

    @DeleteMapping("/students/{studentId}/route")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> removeRouteFromStudent(@PathVariable Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));
        student.setTransportRoute(null);
        studentRepository.save(student);
        return ResponseEntity.ok(new MessageResponse("Route removed from student"));
    }
}
