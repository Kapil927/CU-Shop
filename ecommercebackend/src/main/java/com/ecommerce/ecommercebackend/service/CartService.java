package com.ecommerce.ecommercebackend.service;

import com.ecommerce.ecommercebackend.entity.*;
import com.ecommerce.ecommercebackend.repository.*;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {
    private final CartItemRepository cartRepo;
    private final UserRepository userRepo;
    private final ProductRepository prodRepo;

    public List<CartItem> list(String username) {
        User u = userRepo.findByUsername(username).orElseThrow();
        return cartRepo.findByUser(u);
    }
    public CartItem add(String username, Long pid, int qty) {
        User u = userRepo.findByUsername(username).orElseThrow();
        Product p = prodRepo.findById(pid).orElseThrow();
        List<CartItem> items = cartRepo.findByUser(u);
        for (CartItem it: items) {
            if (it.getProduct().getId().equals(pid)) {
                it.setQty(it.getQty() + qty);
                return cartRepo.save(it);
            }
        }
        CartItem ci = new CartItem();
        ci.setUser(u);
        ci.setProduct(p);
        ci.setQty(qty);
        return cartRepo.save(ci);
    }
    public void remove(String username, Long pid) {
        User u = userRepo.findByUsername(username).orElseThrow();
        Product p = prodRepo.findById(pid).orElseThrow();
        cartRepo.deleteByUserAndProduct(u,p);
    }
}
