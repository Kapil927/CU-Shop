package com.ecommerce.ecommercebackend.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;

    private BigDecimal total = BigDecimal.ZERO;

    private String status = "CREATED";

    private LocalDateTime createdAt = LocalDateTime.now();

    // ✅ Use LAZY loading for performance, not EAGER
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference  // ✅ prevents infinite recursion
    private List<OrderItem> items;
}
