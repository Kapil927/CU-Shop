package com.ecommerce.ecommercebackend.controller;

import com.ecommerce.ecommercebackend.entity.Product;
import com.ecommerce.ecommercebackend.entity.User;
import com.ecommerce.ecommercebackend.entity.Wishlist;
import com.ecommerce.ecommercebackend.repository.ProductRepository;
import com.ecommerce.ecommercebackend.repository.UserRepository;
import com.ecommerce.ecommercebackend.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistRepository wishlistRepo;
    private final ProductRepository productRepo;
    private final UserRepository userRepo;

    // ✅ Add to wishlist
    @PostMapping("/add")
    public ResponseEntity<?> addToWishlist(@RequestParam Long productId, Principal principal) {
        User user = userRepo.findByUsername(principal.getName()).orElseThrow();
        Product product = productRepo.findById(productId).orElseThrow();

        Wishlist w = new Wishlist();
        w.setUser(user);
        w.setProduct(product);
        wishlistRepo.save(w);

        return ResponseEntity.ok("Product added to wishlist");
    }

    // ✅ Get wishlist
    @GetMapping
    public List<Wishlist> getWishlist(Principal principal) {
        User user = userRepo.findByUsername(principal.getName()).orElseThrow();
        return wishlistRepo.findByUser(user);
    }

    // ✅ Remove from wishlist
    @DeleteMapping("/remove/{id}")
    public ResponseEntity<?> removeItem(@PathVariable Long id) {
        wishlistRepo.deleteById(id);
        return ResponseEntity.ok("Item removed from wishlist");
    }
}
