package com.ecommerce.ecommercebackend.config;

import com.ecommerce.ecommercebackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserRepository userRepository;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ✅ Load user details from your MySQL database
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByUsername(username)
                .map(u -> org.springframework.security.core.userdetails.User
                        .withUsername(u.getUsername())
                        .password(u.getPassword())
                        .roles(u.getRole())  // "USER" or "ADMIN"
                        .build())
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())

            // ✅ Authorization Rules
            .authorizeHttpRequests(auth -> auth
                // 🌍 Public (no login required)
                .requestMatchers(
                    "/api/products/**",
                    "/api/reviews/**",
                    "/api/categories/**",
                    "/api/auth/**",
                    "/api/public/**",
                    "/swagger-ui.html",
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/h2-console/**"
                ).permitAll()

                // 🔐 Admin routes
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // 🔒 All other routes require login
                .anyRequest().authenticated()
            )

            // ✅ Login and Logout handling
            .formLogin(form -> form
                .loginProcessingUrl("/api/auth/login")
                .successHandler((req, res, auth) -> res.setStatus(200))
                .failureHandler((req, res, ex) -> res.setStatus(401))
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .logoutSuccessHandler((req, res, auth) -> res.setStatus(200))
            )

            // ✅ Session Control
            .sessionManagement(session -> session
                .maximumSessions(1)
                .maxSessionsPreventsLogin(false)
                .and()
                .sessionFixation().migrateSession()
            );

        // ✅ Allow Swagger & H2 Console frames
        http.headers(headers -> headers.frameOptions(frame -> frame.disable()));

        return http.build();
    }

}
