Write-Host "=== Upgrading Ecommerce Backend (Session Auth + Full Features) ===`n"

# Define paths
$base = "src/main/java/com/ecommerce/ecommercebackend"
$res = "src/main/resources"

# === Create folder structure ===
$folders = @(
    "$base/config",
    "$base/controller",
    "$base/entity",
    "$base/repository",
    "$base/service",
    "$base/exception",
    "$base/dto",
    "$res"
)

foreach ($f in $folders) {
    if (!(Test-Path $f)) {
        New-Item -ItemType Directory -Force -Path $f | Out-Null
        Write-Host "Created folder: $f"
    }
}

# === Create or update application.properties ===
@"
# Server
server.port=8080

# H2 (dev)
spring.datasource.url=jdbc:h2:mem:ecomdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
spring.datasource.username=sa
spring.datasource.password=
spring.datasource.driverClassName=org.h2.Driver
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# Swagger
springdoc.api-docs.path=/v3/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
"@ | Set-Content "$res\application.properties" -Encoding UTF8
Write-Host "Created/Updated: application.properties"

# === Security Config ===
@"
package com.ecommerce.ecommercebackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    @Bean
    public PasswordEncoder pwd() { return new BCryptPasswordEncoder(); }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
          .cors(Customizer.withDefaults())
          .csrf().disable()
          .authorizeHttpRequests(auth -> auth
              .requestMatchers("/api/auth/**","/api/public/**","/swagger-ui.html","/v3/api-docs/**","/swagger-ui/**","/h2-console/**").permitAll()
              .requestMatchers("/api/admin/**").hasRole("ADMIN")
              .anyRequest().authenticated()
          )
          .formLogin(form -> form
              .loginProcessingUrl("/api/auth/login")
              .successHandler((req, res, auth) -> res.setStatus(200))
              .failureHandler((req, res, ex) -> res.setStatus(401))
              .permitAll()
          )
          .logout(logout -> logout.logoutUrl("/api/auth/logout").logoutSuccessHandler((req,res,auth)->res.setStatus(200)));
        http.headers().frameOptions().disable();
        return http.build();
    }
}
"@ | Set-Content "$base\config\SecurityConfig.java" -Encoding UTF8
Write-Host "Created: SecurityConfig.java"

# === Basic Entities ===
$entities = @("User.java","Category.java","Product.java","CartItem.java","Order.java","OrderItem.java","Wishlist.java","Review.java")
foreach ($e in $entities) {
    New-Item -Path "$base\entity\$e" -ItemType File -Force | Out-Null
}
Write-Host "Entity files created (empty skeletons)."

# === Controllers ===
$controllers = @("AuthController.java","ProductController.java","CartController.java","OrderController.java","PaymentController.java","WishlistController.java","ReviewController.java","AdminController.java")
foreach ($c in $controllers) {
    New-Item -Path "$base\controller\$c" -ItemType File -Force | Out-Null
}
Write-Host "Controller files created."

# === Services & Repositories placeholders ===
New-Item -Path "$base\service\placeholder.txt" -ItemType File -Force | Out-Null
New-Item -Path "$base\repository\placeholder.txt" -ItemType File -Force | Out-Null
New-Item -Path "$base\exception\GlobalExceptionHandler.java" -ItemType File -Force | Out-Null
Write-Host "Service, Repository, and Exception placeholders created."

# === Reminder ===
Write-Host "`n=== Reminder: Add these dependencies in pom.xml (if missing) ==="
Write-Host "
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
<dependency>
  <groupId>com.h2database</groupId>
  <artifactId>h2</artifactId>
  <scope>runtime</scope>
</dependency>
<dependency>
  <groupId>org.springdoc</groupId>
  <artifactId>springdoc-openapi-ui</artifactId>
  <version>1.7.0</version>
</dependency>
"

Write-Host "`n=== Backend upgrade structure created successfully! ==="
Write-Host "Next Steps:"
Write-Host "1. Paste the full Java code (from ChatGPT) into these generated files."
Write-Host "2. Run:  mvn clean package"
Write-Host "3. Start app: mvn spring-boot:run"
Write-Host "4. Visit: http://localhost:8080/swagger-ui.html  or  http://localhost:8080/h2-console"
