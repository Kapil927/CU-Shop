package com.ecommerce.ecommercebackend.repository;

import com.ecommerce.ecommercebackend.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}
