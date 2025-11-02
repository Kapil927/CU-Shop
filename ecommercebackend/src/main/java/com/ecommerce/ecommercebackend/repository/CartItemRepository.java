package com.ecommerce.ecommercebackend.repository;

import com.ecommerce.ecommercebackend.entity.CartItem;
import com.ecommerce.ecommercebackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUser(User u);
    void deleteByUserAndProduct(User u, com.ecommerce.ecommercebackend.entity.Product p);
}
