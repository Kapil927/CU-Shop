
# auto-upgrade-backend.ps1
# Auto-fill backend upgrade for Spring Boot ecommerce (session auth, H2, Lombok, Swagger)
# Run this from inside your ecommercebackend project folder:
# powershell -ExecutionPolicy Bypass -File .\auto-upgrade-backend.ps1

Write-Host "Starting auto-upgrade backend script..."

# Root paths
$srcRoot = "src\main\java\com\ecommerce\ecommercebackend"
$resRoot = "src\main\resources"

# Ensure directories
$list = @(
    $srcRoot,
    "$srcRoot\config",
    "$srcRoot\controller",
    "$srcRoot\entity",
    "$srcRoot\repository",
    "$srcRoot\service",
    "$srcRoot\exception",
    "$srcRoot\dto",
    $resRoot
)

foreach ($d in $list) {
    if (!(Test-Path $d)) {
        New-Item -ItemType Directory -Force -Path $d | Out-Null
        Write-Host "Created: $d"
    } else {
        Write-Host "Exists: $d"
    }
}

# Write application.properties
$appProps = @"
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
"@

$appProps | Out-File -FilePath "$resRoot\application.properties" -Encoding UTF8
Write-Host "Wrote: $resRoot\application.properties"

# Helper to write files
function Write-FileContent($path, $content) {
    $dir = Split-Path $path -Parent
    if (!(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    $content | Out-File -FilePath $path -Encoding UTF8
    Write-Host "Wrote: $path"
}

# ======================
# Config: SecurityConfig
# ======================
$sec = @"
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
    public PasswordEncoder pwd() {
        return new BCryptPasswordEncoder();
    }

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
"@

Write-FileContent "$srcRoot\config\SecurityConfig.java" $sec

# ======================
# Entity: User
# ======================
$user = @"
package com.ecommerce.ecommercebackend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique=true, nullable=false)
    private String username;

    @Column(nullable=false)
    private String password;

    @Column(unique=true)
    private String email;

    private String role = "USER";
}
"@

Write-FileContent "$srcRoot\entity\User.java" $user

# ======================
# Entity: Category
# ======================
$category = @"
package com.ecommerce.ecommercebackend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Category {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique=true)
    private String name;
}
"@
Write-FileContent "$srcRoot\entity\Category.java" $category

# ======================
# Entity: Product
# ======================
$product = @"
package com.ecommerce.ecommercebackend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private String name;

    @Column(length = 1000)
    private String description;

    private BigDecimal price = BigDecimal.ZERO;

    private Integer qty = 0;

    @Column(length = 500)
    private String imageUrl;

    private Double avgRating = 0.0;

    @ManyToOne
    private Category category;
}
"@
Write-FileContent "$srcRoot\entity\Product.java" $product

# ======================
# Entity: CartItem
# ======================
$cart = @"
package com.ecommerce.ecommercebackend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CartItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false)
    private User user;

    @ManyToOne(optional=false)
    private Product product;

    private Integer qty = 1;
}
"@
Write-FileContent "$srcRoot\entity\CartItem.java" $cart

# ======================
# Entity: Order
# ======================
$order = @"
package com.ecommerce.ecommercebackend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Table(name = "orders")
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;

    private BigDecimal total = BigDecimal.ZERO;

    private String status = "CREATED";

    private LocalDateTime createdAt = LocalDateTime.now();
}
"@
Write-FileContent "$srcRoot\entity\Order.java" $order

# ======================
# Entity: OrderItem
# ======================
$orderItem = @"
package com.ecommerce.ecommercebackend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class OrderItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Order order;

    @ManyToOne
    private Product product;

    private Integer qty;

    private BigDecimal price;
}
"@
Write-FileContent "$srcRoot\entity\OrderItem.java" $orderItem

# ======================
# Entity: Wishlist
# ======================
$wishlist = @"
package com.ecommerce.ecommercebackend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Wishlist {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;

    @ManyToOne
    private Product product;
}
"@
Write-FileContent "$srcRoot\entity\Wishlist.java" $wishlist

# ======================
# Entity: Review
# ======================
$review = @"
package com.ecommerce.ecommercebackend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Review {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;

    @ManyToOne
    private Product product;

    private Integer rating;

    @Column(length=2000)
    private String comment;

    private LocalDateTime createdAt = LocalDateTime.now();
}
"@
Write-FileContent "$srcRoot\entity\Review.java" $review

# ======================
# Repositories
# ======================
$prodRepo = @"
package com.ecommerce.ecommercebackend.repository;

import com.ecommerce.ecommercebackend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
}
"@
Write-FileContent "$srcRoot\repository\ProductRepository.java" $prodRepo

$userRepo = @"
package com.ecommerce.ecommercebackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ecommerce.ecommercebackend.entity.User;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String u);
    boolean existsByUsername(String u);
}
"@
Write-FileContent "$srcRoot\repository\UserRepository.java" $userRepo

$catRepo = @"
package com.ecommerce.ecommercebackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ecommerce.ecommercebackend.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
"@
Write-FileContent "$srcRoot\repository\CategoryRepository.java" $catRepo

$cartRepo = @"
package com.ecommerce.ecommercebackend.repository;

import com.ecommerce.ecommercebackend.entity.CartItem;
import com.ecommerce.ecommercebackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUser(User u);
    void deleteByUserAndProduct(User u, com.ecommerce.ecommercebackend.entity.Product p);
}
"@
Write-FileContent "$srcRoot\repository\CartItemRepository.java" $cartRepo

$orderRepo = @"
package com.ecommerce.ecommercebackend.repository;

import com.ecommerce.ecommercebackend.entity.Order;
import com.ecommerce.ecommercebackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser(User u);
}
"@
Write-FileContent "$srcRoot\repository\OrderRepository.java" $orderRepo

$oiRepo = @"
package com.ecommerce.ecommercebackend.repository;

import com.ecommerce.ecommercebackend.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}
"@
Write-FileContent "$srcRoot\repository\OrderItemRepository.java" $oiRepo

$wishRepo = @"
package com.ecommerce.ecommercebackend.repository;

import com.ecommerce.ecommercebackend.entity.Wishlist;
import com.ecommerce.ecommercebackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    List<Wishlist> findByUser(User u);
    void deleteByUserAndProduct(User u, com.ecommerce.ecommercebackend.entity.Product p);
}
"@
Write-FileContent "$srcRoot\repository\WishlistRepository.java" $wishRepo

$revRepo = @"
package com.ecommerce.ecommercebackend.repository;

import com.ecommerce.ecommercebackend.entity.Review;
import com.ecommerce.ecommercebackend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProduct(Product p);
}
"@
Write-FileContent "$srcRoot\repository\ReviewRepository.java" $revRepo

# ======================
# Services
# ======================
$cartSvc = @"
package com.ecommerce.ecommercebackend.service;

import com.ecommerce.ecommercebackend.entity.*;
import com.ecommerce.ecommercebackend.repository.*;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {
    private final CartItemRepository cartRepo;
    private final UserRepository userRepo;
    private final ProductRepository prodRepo;

    public List<CartItem> list(String username) {
        User u = userRepo.findByUsername(username).orElseThrow();
        return cartRepo.findByUser(u);
    }
    public CartItem add(String username, Long pid, int qty) {
        User u = userRepo.findByUsername(username).orElseThrow();
        Product p = prodRepo.findById(pid).orElseThrow();
        List<CartItem> items = cartRepo.findByUser(u);
        for (CartItem it: items) {
            if (it.getProduct().getId().equals(pid)) {
                it.setQty(it.getQty() + qty);
                return cartRepo.save(it);
            }
        }
        CartItem ci = new CartItem();
        ci.setUser(u);
        ci.setProduct(p);
        ci.setQty(qty);
        return cartRepo.save(ci);
    }
    public void remove(String username, Long pid) {
        User u = userRepo.findByUsername(username).orElseThrow();
        Product p = prodRepo.findById(pid).orElseThrow();
        cartRepo.deleteByUserAndProduct(u,p);
    }
}
"@
Write-FileContent "$srcRoot\service\CartService.java" $cartSvc

$orderSvc = @"
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
    private final ProductRepository prodRepo;

    @Transactional
    public Order checkout(String username) {
        User u = userRepo.findByUsername(username).orElseThrow();
        List<CartItem> items = cartRepo.findByUser(u);
        if (items.isEmpty()) throw new RuntimeException("cart empty");
        Order o = new Order();
        o.setUser(u);
        o.setStatus("CREATED");
        o = orderRepo.save(o);

        BigDecimal total = BigDecimal.ZERO;
        for (CartItem ci: items) {
            OrderItem oi = new OrderItem();
            oi.setOrder(o);
            oi.setProduct(ci.getProduct());
            oi.setQty(ci.getQty());
            oi.setPrice(ci.getProduct().getPrice());
            oiRepo.save(oi);
            total = total.add(ci.getProduct().getPrice().multiply(BigDecimal.valueOf(ci.getQty())));
        }
        o.setTotal(total);
        orderRepo.save(o);

        cartRepo.deleteAll(items);
        return o;
    }

    public List<Order> history(String username) {
        User u = userRepo.findByUsername(username).orElseThrow();
        return orderRepo.findByUser(u);
    }

    public Order markPaid(Long orderId) {
        Order o = orderRepo.findById(orderId).orElseThrow();
        o.setStatus("PAID");
        return orderRepo.save(o);
    }
}
"@
Write-FileContent "$srcRoot\service\OrderService.java" $orderSvc

$revSvc = @"
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
"@
Write-FileContent "$srcRoot\service\ReviewService.java" $revSvc

# ======================
# Controllers continued (Auth/Product/Cart/Order/Payment/Wishlist/Review/Admin)
# ======================
# (Already written above in previous block) - ensure consistency

# ======================
# Exception handler
# ======================
$ex = @"
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
"@
Write-FileContent "$srcRoot\exception\GlobalExceptionHandler.java" $ex

# ======================
# Update pom.xml (append dependencies if possible)
# ======================
$pomPath = "pom.xml"
if (Test-Path $pomPath) {
    $pom = Get-Content $pomPath -Raw
    if ($pom -notmatch "spring-boot-starter-security") {
        Write-Host "Adding dependencies to pom.xml..."
        if ($pom -match "</dependencies>") {
            $deps = @"
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
      <groupId>org.projectlombok</groupId>
      <artifactId>lombok</artifactId>
      <optional>true</optional>
    </dependency>
    <dependency>
      <groupId>org.springdoc</groupId>
      <artifactId>springdoc-openapi-ui</artifactId>
      <version>1.7.0</version>
    </dependency>
"@
            $newPom = $pom -replace "</dependencies>", "$deps`n  </dependencies>"
            $newPom | Out-File -FilePath $pomPath -Encoding UTF8
            Write-Host "pom.xml updated."
        } else {
            Write-Host "Could not find </dependencies> tag. Please add dependencies manually."
        }
    } else {
        Write-Host "pom.xml already contains security dependency. Skipping pom update."
    }
} else {
    Write-Host "pom.xml not found. Please run script from project root containing pom.xml."
}

Write-Host "`nAuto-upgrade completed."
Write-Host "Next steps:"
Write-Host "1) mvn clean package"
Write-Host "2) mvn spring-boot:run"
Write-Host "H2 console: http://localhost:8080/h2-console"
Write-Host "Swagger UI: http://localhost:8080/swagger-ui.html"
