package com.ecommerce.ecommercebackend.controller;

import com.ecommerce.ecommercebackend.entity.Product;
import com.ecommerce.ecommercebackend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductRepository repo;

    // ✅ 1️⃣ Get all products
    @GetMapping
    public List<Product> getAll() {
        return repo.findAll();
    }

    // ✅ 2️⃣ Add product (Admin)
    @PostMapping("/admin/add")
    public ResponseEntity<?> add(@RequestBody Product p) {
        repo.save(p);
        return ResponseEntity.ok("Product added successfully");
    }

    // ✅ 3️⃣ Search products by keyword (name, description, or category)
    @GetMapping("/search")
    public ResponseEntity<List<Product>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(repo.searchProducts(keyword));
    }

    // ✅ 4️⃣ Filter by category, price range, and rating (separate from search)
    @GetMapping("/filter")
    public ResponseEntity<List<Product>> filter(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Double minRating
    ) {
        List<Product> results = repo.filterProducts(categoryId, minPrice, maxPrice, minRating);
        return ResponseEntity.ok(results);
    }
}
