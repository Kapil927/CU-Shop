package com.ecommerce.ecommercebackend.controller;

import com.ecommerce.ecommercebackend.entity.Order;
import com.ecommerce.ecommercebackend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService service;

    @PostMapping("/checkout")
    public Order checkout(Principal principal) {
        return service.checkout(principal.getName());
    }

    @GetMapping("/history")
    public List<Order> history(Principal principal) {
        return service.history(principal.getName());
    }
}
