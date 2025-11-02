package com.ecommerce.ecommercebackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull; // ✅ Add this import

@Configuration
public class CorsConfig {

    private static final Logger log = LoggerFactory.getLogger(CorsConfig.class);

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(@NonNull CorsRegistry registry) { // ✅ Add @NonNull

                log.info("🚀 Initializing Global CORS Configuration...");

                registry.addMapping("/**")
                        .allowedOrigins(
                                "http://localhost:3000",
                                "https://your-frontend-domain.com"
                        )
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .exposedHeaders("Authorization", "Content-Type")
                        .allowCredentials(true)
                        .maxAge(3600);

                log.info("✅ CORS setup complete. Allowed origins: http://localhost:3000, https://your-frontend-domain.com");
            }
        };
    }
}
