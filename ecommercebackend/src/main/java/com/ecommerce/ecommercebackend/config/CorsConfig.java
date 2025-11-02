package com.ecommerce.ecommercebackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;

@Configuration
public class CorsConfig {

    private static final Logger log = LoggerFactory.getLogger(CorsConfig.class);

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(@NonNull CorsRegistry registry) {

                log.info("🚀 Initializing Global CORS Configuration...");

                registry.addMapping("/**")
                        .allowedOrigins(
                                // ✅ Local Development
                                "http://localhost:5173",

                                // ✅ Render Frontend (old)
                                "https://ecommerce-frontend-dmgg.onrender.com",

                                // ✅ Your custom production frontend
                                "https://cu-shop.bytexl.live",

                                // ✅ Your new backend domain on Render
                                "https://cu-shop.onrender.com"
                        )
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true)
                        .maxAge(3600);

                log.info("✅ CORS setup complete. Allowed origins: "
                        + "localhost:5173, ecommerce-frontend-dmgg.onrender.com, cu-shop.bytexl.live, cu-shop.onrender.com");
            }
        };
    }
}
