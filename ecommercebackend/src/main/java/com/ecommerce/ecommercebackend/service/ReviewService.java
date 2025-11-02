package com.ecommerce.ecommercebackend.service;

import com.ecommerce.ecommercebackend.entity.*;
import com.ecommerce.ecommercebackend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository rr;
    private final ProductRepository pr;

    public Review add(Review r) {
        Review saved = rr.save(r);
        List<Review> all = rr.findByProduct(r.getProduct());
        double avg = all.stream().mapToInt(Review::getRating).average().orElse(0);
        var p = r.getProduct();
        p.setAvgRating(avg);
        pr.save(p);
        return saved;
    }

    public List<Review> list(Product p) { return rr.findByProduct(p); }
}
