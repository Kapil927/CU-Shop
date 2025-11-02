package com.ecommerce.ecommercebackend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewRequest {
    private Long productId;
    private Integer rating;   // ✅ now nullable
    private String comment;
}
