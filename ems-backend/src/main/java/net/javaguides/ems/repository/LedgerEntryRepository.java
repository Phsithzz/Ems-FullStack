package net.javaguides.ems.repository;

import net.javaguides.ems.entity.LedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, Long> {

    List<LedgerEntry> findByWalletIdOrderByCreatedAtDesc(Long walletId);

    List<LedgerEntry> findByJournalEntryId(Long journalId);
}
