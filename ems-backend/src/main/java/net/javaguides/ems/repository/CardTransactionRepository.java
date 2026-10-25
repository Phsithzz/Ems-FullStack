package net.javaguides.ems.repository;

import net.javaguides.ems.entity.CardTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CardTransactionRepository extends JpaRepository<CardTransaction, Long> {

    List<CardTransaction> findByCorporateCardIdOrderByCreatedAtDesc(Long cardId);

    List<CardTransaction> findAllByOrderByCreatedAtDesc();
}
