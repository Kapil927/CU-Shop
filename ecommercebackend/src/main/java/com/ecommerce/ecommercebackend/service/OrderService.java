package com.ecommerce.ecommercebackend.service;

import com.ecommerce.ecommercebackend.entity.*;
import com.ecommerce.ecommercebackend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final CartItemRepository cartRepo;
    private final OrderRepository orderRepo;
    private final OrderItemRepository oiRepo;
    private final UserRepository userRepo;

    @Transactional
    public Order checkout(String username) {
        // 1️⃣ Find user
        User u = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2️⃣ Get cart items
        List<CartItem> items = cartRepo.findByUser(u);
        if (items.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // 3️⃣ Create order
        Order o = new Order();
        o.setUser(u);
        o.setStatus("PAID"); // ✅ Auto mark as paid
        o = orderRepo.save(o);

        // 4️⃣ Add order items + total
        BigDecimal total = BigDecimal.ZERO;
        for (CartItem ci : items) {
            OrderItem oi = new OrderItem();
            oi.setOrder(o);
            oi.setProduct(ci.getProduct());
            oi.setQty(ci.getQty());
            oi.setPrice(ci.getProduct().getPrice());
            oiRepo.save(oi);

            total = total.add(ci.getProduct().getPrice()
                    .multiply(BigDecimal.valueOf(ci.getQty())));
        }

        o.setTotal(total);
        orderRepo.save(o);

        // 5️⃣ Clear user cart
        cartRepo.deleteAll(items);

        // 6️⃣ Return order
        return o;
    }

    public List<Order> history(String username) {
        User u = userRepo.findByUsername(username).orElseThrow();
        return orderRepo.findByUser(u);
    }
}
