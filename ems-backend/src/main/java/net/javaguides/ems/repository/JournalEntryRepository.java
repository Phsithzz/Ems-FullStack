package net.javaguides.ems.repository;

import net.javaguides.ems.entity.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface JournalEntryRepository extends JpaRepository<JournalEntry, Long> {

    Optional<JournalEntry> findByJournalReference(String journalReference);

    List<JournalEntry> findAllByOrderByPostedAtDesc();

    @Query("SELECT COALESCE(SUM(j.totalDebit), 0) FROM JournalEntry j")
    BigDecimal sumTotalDebit();

    @Query("SELECT COALESCE(SUM(j.totalCredit), 0) FROM JournalEntry j")
    BigDecimal sumTotalCredit();
}
