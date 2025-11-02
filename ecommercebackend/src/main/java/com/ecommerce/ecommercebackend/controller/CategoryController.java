package com.ecommerce.ecommercebackend.controller;

import com.ecommerce.ecommercebackend.entity.Category;
import com.ecommerce.ecommercebackend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepo;

    // ✅ 1. Add a new category
    @PostMapping
    public ResponseEntity<?> addCategory(@RequestBody Category category) {
        // Prevent duplicate names
        Optional<Category> existing = categoryRepo.findAll()
                .stream()
                .filter(c -> c.getName().equalsIgnoreCase(category.getName()))
                .findFirst();

        if (existing.isPresent()) {
            return ResponseEntity.badRequest().body("Category already exists");
        }

        Category saved = categoryRepo.save(category);
        return ResponseEntity.ok(saved);
    }

    // ✅ 2. Get all categories
    @GetMapping
    public List<Category> getAllCategories() {
        return categoryRepo.findAll();
    }

    // ✅ 3. Get a category by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getCategory(@PathVariable Long id) {
        return categoryRepo.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ✅ 4. Update category name
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody Category updated) {
        return categoryRepo.findById(id)
                .map(c -> {
                    c.setName(updated.getName());
                    categoryRepo.save(c);
                    return ResponseEntity.ok("Category updated successfully");
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ✅ 5. Delete category
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        if (!categoryRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        categoryRepo.deleteById(id);
        return ResponseEntity.ok("Category deleted successfully");
    }
}
