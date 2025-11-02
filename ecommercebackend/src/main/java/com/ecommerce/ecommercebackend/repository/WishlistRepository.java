package com.ecommerce.ecommercebackend.repository;

import com.ecommerce.ecommercebackend.entity.Wishlist;
import com.ecommerce.ecommercebackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    List<Wishlist> findByUser(User u);
    void deleteByUserAndProduct(User u, com.ecommerce.ecommercebackend.entity.Product p);
}
