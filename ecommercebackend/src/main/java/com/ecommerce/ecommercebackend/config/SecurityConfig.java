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

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserRepository userRepository;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

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
            // ✅ Enable the global CORS configuration (from CorsConfig.java)
            .cors(Customizer.withDefaults())
            // ✅ Disable CSRF for simplicity in REST APIs
            .csrf(csrf -> csrf.disable())

            // ✅ Authorization rules
            .authorizeHttpRequests(auth -> auth
                // Public APIs
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

                // Admin-only APIs
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // Everything else = user must be logged in
                .anyRequest().authenticated()
            )

            // ✅ Form login endpoints
            .formLogin(form -> form
                .loginProcessingUrl("/api/auth/login")
                .successHandler((req, res, auth) -> res.setStatus(200))
                .failureHandler((req, res, ex) -> res.setStatus(401))
                .permitAll()
            )

            // ✅ Logout endpoint
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .logoutSuccessHandler((req, res, auth) -> res.setStatus(200))
            )

            // ✅ Session management
            .sessionManagement(session -> session
                .maximumSessions(1)
                .maxSessionsPreventsLogin(false)
                .and()
                .sessionFixation().migrateSession()
            );

        // ✅ Allow frames for H2/Swagger
        http.headers(headers -> headers.frameOptions(frame -> frame.disable()));

        return http.build();
    }
}
