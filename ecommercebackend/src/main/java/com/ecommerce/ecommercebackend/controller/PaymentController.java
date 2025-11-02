package com.ecommerce.ecommercebackend.controller;

import com.ecommerce.ecommercebackend.entity.Order;
import com.ecommerce.ecommercebackend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final OrderRepository orderRepo;

    // ✅ Simple, idempotent fake payment endpoint
    @PostMapping("/process/{orderId}")
    public ResponseEntity<?> processPayment(@PathVariable Long orderId) {
        Order o = orderRepo.findById(orderId).orElseThrow();

        if (!"PAID".equalsIgnoreCase(o.getStatus())) {
            o.setStatus("PAID");
            orderRepo.save(o);
            return ResponseEntity.ok("✅ Payment successful for order " + orderId);
        }

        // ✅ Return 200 OK even if already paid (idempotent)
        return ResponseEntity.ok("ℹ️ Order " + orderId + " is already paid");
    }
}
