package com.ecommerce.ecommercebackend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private String name;

    @Column(length = 1000)
    private String description;

    private BigDecimal price = BigDecimal.ZERO;

    private Integer qty = 0;

    @Column(length = 500)
    private String imageUrl;

    private Double avgRating = 0.0;

    @ManyToOne
    private Category category;
}
