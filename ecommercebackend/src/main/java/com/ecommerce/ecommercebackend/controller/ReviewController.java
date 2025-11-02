package com.ecommerce.ecommercebackend.controller;

import com.ecommerce.ecommercebackend.dto.ReviewRequest;
import com.ecommerce.ecommercebackend.entity.Product;
import com.ecommerce.ecommercebackend.entity.Review;
import com.ecommerce.ecommercebackend.entity.User;
import com.ecommerce.ecommercebackend.repository.ProductRepository;
import com.ecommerce.ecommercebackend.repository.ReviewRepository;
import com.ecommerce.ecommercebackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewRepository reviewRepo;
    private final UserRepository userRepo;
    private final ProductRepository productRepo;

    // ✅ Get all reviews
    @GetMapping
    public List<Review> getAll() {
        return reviewRepo.findAll();
    }

    // ✅ Add review
    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody ReviewRequest req, Principal principal) {
        try {
            if (req.getRating() < 1 || req.getRating() > 5) {
                return ResponseEntity.badRequest().body("Rating must be between 1 and 5");
            }

            User user = userRepo.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Product product = productRepo.findById(req.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            Review review = new Review();
            review.setUser(user);
            review.setProduct(product);
            review.setRating(req.getRating());
            review.setComment(req.getComment());

            Review saved = reviewRepo.save(review);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    // ✅ Update existing review (only by owner)
    @PutMapping("/update/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody ReviewRequest req, Principal principal) {
        try {
            User user = userRepo.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Review existing = reviewRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Review not found"));

            if (!existing.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body("Not allowed to edit this review");
            }

            if (req.getRating() != null) existing.setRating(req.getRating());
            if (req.getComment() != null && !req.getComment().isBlank()) {
                existing.setComment(req.getComment());
            }

            Review updated = reviewRepo.save(existing);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    // ✅ Delete review (only by owner)
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, Principal principal) {
        try {
            User user = userRepo.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Review existing = reviewRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Review not found"));

            if (!existing.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body("Not allowed to delete this review");
            }

            reviewRepo.delete(existing);
            return ResponseEntity.ok("Review deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
}