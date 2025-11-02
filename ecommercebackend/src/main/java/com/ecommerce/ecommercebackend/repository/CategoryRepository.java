package com.ecommerce.ecommercebackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ecommerce.ecommercebackend.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
