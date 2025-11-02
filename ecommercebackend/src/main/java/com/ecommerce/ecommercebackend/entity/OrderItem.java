package com.ecommerce.ecommercebackend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ This breaks the recursion
    @ManyToOne
    @JsonBackReference
    private Order order;

    @ManyToOne
    private Product product;

    private Integer qty;

    private BigDecimal price;
}
