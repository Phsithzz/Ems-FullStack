package net.javaguides.ems.repository;

import net.javaguides.ems.entity.CorporateCard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CorporateCardRepository extends JpaRepository<CorporateCard, Long> {

    Optional<CorporateCard> findByCardNumber(String cardNumber);

    List<CorporateCard> findAllByOrderByCreatedAtDesc();

    List<CorporateCard> findByEmployeeId(Long employeeId);
}
