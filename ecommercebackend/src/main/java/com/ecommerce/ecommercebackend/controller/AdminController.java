package com.ecommerce.ecommercebackend.controller;

import com.ecommerce.ecommercebackend.entity.Product;
import com.ecommerce.ecommercebackend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ProductRepository productRepo;

    // ✅ View all products
    @GetMapping("/products")
    public List<Product> allProducts() {
        return productRepo.findAll();
    }

    // ✅ Add new product
    @PostMapping("/products")
    public ResponseEntity<?> addProduct(@RequestBody Product p) {
        productRepo.save(p);
        return ResponseEntity.ok("✅ Product added successfully");
    }

    // ✅ Update existing product
    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product updated) {
        return productRepo.findById(id)
                .map(existing -> {
                    existing.setName(updated.getName());
                    existing.setDescription(updated.getDescription());
                    existing.setPrice(updated.getPrice());
                    existing.setQty(updated.getQty());
                    existing.setImageUrl(updated.getImageUrl());
                    existing.setCategory(updated.getCategory());
                    existing.setAvgRating(updated.getAvgRating());
                    productRepo.save(existing);
                    return ResponseEntity.ok("✅ Product updated successfully");
                })
                .orElseGet(() -> ResponseEntity.status(404).body("❌ Product not found"));
    }

    // ✅ Delete product by ID
    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        if (!productRepo.existsById(id)) {
            return ResponseEntity.status(404).body("❌ Product not found");
        }
        productRepo.deleteById(id);
        return ResponseEntity.ok("🗑️ Product deleted successfully");
    }
}
