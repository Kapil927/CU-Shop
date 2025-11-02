package com.ecommerce.ecommercebackend.controller;

import com.ecommerce.ecommercebackend.entity.CartItem;
import com.ecommerce.ecommercebackend.entity.Product;
import com.ecommerce.ecommercebackend.entity.User;
import com.ecommerce.ecommercebackend.repository.CartItemRepository;
import com.ecommerce.ecommercebackend.repository.ProductRepository;
import com.ecommerce.ecommercebackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartItemRepository cartRepo;
    private final ProductRepository productRepo;
    private final UserRepository userRepo;

    // ✅ Get current user's cart
    @GetMapping
    public List<CartItem> getCart(Principal principal) {
        User user = userRepo.findByUsername(principal.getName()).orElseThrow();
        return cartRepo.findByUser(user);
    }

    // ✅ Add item to cart
    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestParam Long productId, @RequestParam int qty, Principal principal) {
        User user = userRepo.findByUsername(principal.getName()).orElseThrow();
        Product product = productRepo.findById(productId).orElseThrow();

        // If product already exists in cart → increase qty
        List<CartItem> existingItems = cartRepo.findByUser(user);
        for (CartItem item : existingItems) {
            if (item.getProduct().getId().equals(productId)) {
                item.setQty(item.getQty() + qty);
                cartRepo.save(item);
                return ResponseEntity.ok("Quantity updated in cart");
            }
        }

        // Otherwise, add new item
        CartItem ci = new CartItem();
        ci.setUser(user);
        ci.setProduct(product);
        ci.setQty(qty);
        cartRepo.save(ci);
        return ResponseEntity.ok("Added to cart");
    }

    // ✅ Update cart item quantity (for +/- buttons)
    @PutMapping("/update/{cartItemId}")
    public ResponseEntity<?> updateQuantity(@PathVariable Long cartItemId,
                                            @RequestParam int qty,
                                            Principal principal) {
        if (qty < 1) {
            return ResponseEntity.badRequest().body("Quantity must be at least 1");
        }

        User user = userRepo.findByUsername(principal.getName()).orElseThrow();
        CartItem item = cartRepo.findById(cartItemId).orElse(null);

        if (item == null) {
            return ResponseEntity.status(404).body("❌ Cart item not found");
        }

        if (!item.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("❌ Not allowed to modify this item");
        }

        item.setQty(qty);
        cartRepo.save(item);
        return ResponseEntity.ok("✅ Quantity updated");
    }

    // ✅ Delete specific cart item
    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<?> removeCartItem(@PathVariable Long cartItemId, Principal principal) {
        User user = userRepo.findByUsername(principal.getName()).orElseThrow();
        CartItem item = cartRepo.findById(cartItemId).orElse(null);

        if (item == null) {
            return ResponseEntity.status(404).body("❌ Cart item not found");
        }

        if (!item.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("❌ Not allowed to delete this item");
        }

        cartRepo.delete(item);
        return ResponseEntity.ok("🗑️ Item removed from cart");
    }

    // ✅ Optional: Clear entire cart
    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(Principal principal) {
        User user = userRepo.findByUsername(principal.getName()).orElseThrow();
        List<CartItem> items = cartRepo.findByUser(user);

        if (items.isEmpty()) {
            return ResponseEntity.ok("Cart already empty");
        }

        cartRepo.deleteAll(items);
        return ResponseEntity.ok("🧹 Cart cleared successfully");
    }
}
