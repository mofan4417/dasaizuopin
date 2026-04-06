package com.xiangzhuqiao.model;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    private String phone;

    @Column(nullable = false)
    private String password;

    private Integer level = 1;

    private String avatar;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime lastLogin;
}
