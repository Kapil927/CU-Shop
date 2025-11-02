package com.ecommerce.ecommercebackend.repository;

import com.ecommerce.ecommercebackend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    // 🔍 Search query (for /api/products/search)
    @Query("SELECT p FROM Product p " +
           "WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "   OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "   OR LOWER(p.category.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Product> searchProducts(@Param("keyword") String keyword);

    // 🎯 Filter query (for /api/products/filter)
    @Query("SELECT p FROM Product p " +
           "WHERE (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.price <= :maxPrice) " +
           "AND (:minRating IS NULL OR p.avgRating >= :minRating)")
    List<Product> filterProducts(@Param("categoryId") Long categoryId,
                                 @Param("minPrice") Double minPrice,
                                 @Param("maxPrice") Double maxPrice,
                                 @Param("minRating") Double minRating);
}
