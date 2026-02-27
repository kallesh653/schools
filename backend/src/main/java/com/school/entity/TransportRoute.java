package com.school.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "transport_routes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class TransportRoute extends BaseEntity {

    @Column(name = "route_name", nullable = false, length = 100)
    private String routeName;

    @Column(name = "route_code", unique = true, length = 20)
    private String routeCode;

    @Column(name = "from_location", length = 200)
    private String fromLocation;

    @Column(name = "to_location", length = 200)
    private String toLocation;

    @Column(name = "distance_km")
    private Double distanceKm;

    @Column(name = "monthly_fee", nullable = false)
    private Double monthlyFee;

    @Column(name = "annual_fee")
    private Double annualFee;

    @Column(name = "vehicle_number", length = 30)
    private String vehicleNumber;

    @Column(name = "driver_name", length = 100)
    private String driverName;

    @Column(name = "driver_phone", length = 20)
    private String driverPhone;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private Boolean active = true;
}
