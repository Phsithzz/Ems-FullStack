package net.javaguides.ems.repository;

import jakarta.persistence.LockModeType;
import net.javaguides.ems.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WalletRepository extends JpaRepository<Wallet, Long> {

    Optional<Wallet> findByAccountNumber(String accountNumber);

    List<Wallet> findByUserId(Long userId);

    List<Wallet> findByEmployeeId(Long employeeId);

    /**
     * Acquires a row-level PESSIMISTIC_WRITE lock (SELECT ... FOR UPDATE in MySQL)
     * to protect against race conditions during balance deductions.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT w FROM Wallet w WHERE w.id = :id")
    Optional<Wallet> findByIdForUpdate(@Param("id") Long id);

    /**
     * Locks multiple wallets in strictly ascending ID order to prevent deadlock cycles
     * when concurrent transfers occur simultaneously in opposite directions (A->B and B->A).
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT w FROM Wallet w WHERE w.id IN :ids ORDER BY w.id ASC")
    List<Wallet> findAllByIdForUpdate(@Param("ids") List<Long> ids);
}
