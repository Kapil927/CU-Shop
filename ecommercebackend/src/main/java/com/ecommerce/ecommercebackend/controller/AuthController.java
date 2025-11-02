package com.ecommerce.ecommercebackend.controller;

import com.ecommerce.ecommercebackend.dto.RegisterRequest;
import com.ecommerce.ecommercebackend.entity.User;
import com.ecommerce.ecommercebackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;

@PostMapping("/register")
public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
    System.out.println("📩 Register Request → " + req.getUsername() + " / " + req.getPassword() + " / " + req.getAddress());

    if (req.getUsername() == null || req.getUsername().isBlank()) {
        return ResponseEntity.badRequest().body("Username cannot be empty");
    }

    if (req.getPassword() == null || req.getPassword().isBlank()) {
        return ResponseEntity.badRequest().body("Password cannot be empty");
    }

    if (userRepo.findByUsername(req.getUsername()).isPresent()) {
        return ResponseEntity.badRequest().body("Username already exists");
    }

    // ✅ Create & save user entity
    User newUser = new User();
    newUser.setUsername(req.getUsername());
    newUser.setPassword(encoder.encode(req.getPassword()));
    newUser.setEmail(req.getEmail());
    newUser.setAddress(req.getAddress()); // 🆕 Save address
    newUser.setRole("USER");

    userRepo.save(newUser);

    return ResponseEntity.ok("User registered successfully ✅");
}


    @PostMapping("/login")
    public ResponseEntity<?> login() {
        return ResponseEntity.ok("Login successful");
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        try {
            if (authentication != null) {
                request.logout();
            }
            return ResponseEntity.ok("Logout successful");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error during logout: " + e.getMessage());
        }
    }
}
