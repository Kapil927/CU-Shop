package com.ecommerce.ecommercebackend.exception;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> all(Exception e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}
