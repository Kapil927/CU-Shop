package com.ecommerce.ecommercebackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ecommerce.ecommercebackend.entity.User;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String u);
    boolean existsByUsername(String u);
}
