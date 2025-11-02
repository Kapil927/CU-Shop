package com.ecommerce.ecommercebackend.repository;

import com.ecommerce.ecommercebackend.entity.Review;
import com.ecommerce.ecommercebackend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProduct(Product p);
}
