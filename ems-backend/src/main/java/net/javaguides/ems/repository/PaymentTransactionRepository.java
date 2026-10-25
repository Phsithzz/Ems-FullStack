package net.javaguides.ems.repository;

import net.javaguides.ems.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    Optional<PaymentTransaction> findByIdempotencyKey(String idempotencyKey);

    Optional<PaymentTransaction> findByTransactionReference(String transactionReference);

    List<PaymentTransaction> findAllByOrderByCreatedAtDesc();

    List<PaymentTransaction> findBySourceWalletIdOrTargetWalletIdOrderByCreatedAtDesc(Long sourceWalletId, Long targetWalletId);
}
