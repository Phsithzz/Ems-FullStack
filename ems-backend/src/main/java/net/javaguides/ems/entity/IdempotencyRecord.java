package net.javaguides.ems.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "idempotency_records", indexes = {
        @Index(name = "idx_idemp_key", columnList = "idempotency_key", unique = true)
})
public class IdempotencyRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "idempotency_key", nullable = false, unique = true, length = 128)
    private String idempotencyKey;

    @Column(nullable = false, length = 255)
    private String endpoint;

    @Column(name = "request_hash", length = 64)
    private String requestHash;

    @Column(nullable = false, length = 32)
    private String status; // PROCESSING, RESOLVED, FAILED

    @Column(name = "status_code")
    private Integer statusCode;

    @Column(name = "response_body", columnDefinition = "TEXT")
    private String responseBody;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;
}
