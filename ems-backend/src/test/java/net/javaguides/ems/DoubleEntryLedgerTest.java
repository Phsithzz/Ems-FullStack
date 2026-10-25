package net.javaguides.ems;

import net.javaguides.ems.dto.LedgerSummaryDto;
import net.javaguides.ems.entity.JournalEntry;
import net.javaguides.ems.entity.LedgerEntry;
import net.javaguides.ems.entity.Wallet;
import net.javaguides.ems.exception.LedgerImbalanceException;
import net.javaguides.ems.repository.JournalEntryRepository;
import net.javaguides.ems.repository.LedgerEntryRepository;
import net.javaguides.ems.services.LedgerService;
import net.javaguides.ems.services.impl.LedgerServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class DoubleEntryLedgerTest {

    private JournalEntryRepository journalEntryRepository;
    private LedgerEntryRepository ledgerEntryRepository;
    private LedgerService ledgerService;

    @BeforeEach
    void setUp() {
        journalEntryRepository = mock(JournalEntryRepository.class);
        ledgerEntryRepository = mock(LedgerEntryRepository.class);
        ledgerService = new LedgerServiceImpl(journalEntryRepository, ledgerEntryRepository);
    }

    @Test
    @DisplayName("Should successfully record balanced double-entry with sum(Debit) == sum(Credit)")
    void shouldRecordBalancedDoubleEntry() {
        Wallet source = new Wallet();
        source.setId(1L);
        source.setAccountNumber("WAL-SOURCE");
        source.setCurrency("USDT");
        source.setBalance(new BigDecimal("1000.00"));

        Wallet target = new Wallet();
        target.setId(2L);
        target.setAccountNumber("WAL-TARGET");
        target.setCurrency("USDT");
        target.setBalance(new BigDecimal("500.00"));

        when(journalEntryRepository.save(any(JournalEntry.class))).thenAnswer(i -> i.getArgument(0));

        JournalEntry journal = ledgerService.recordDoubleEntry(
                null,
                "TRANSFER",
                "Bonus payout",
                source,
                target,
                new BigDecimal("250.00")
        );

        assertNotNull(journal);
        assertEquals(new BigDecimal("250.00"), journal.getTotalDebit());
        assertEquals(new BigDecimal("250.00"), journal.getTotalCredit());
        assertEquals(2, journal.getEntries().size());

        LedgerEntry debitLeg = journal.getEntries().stream()
                .filter(e -> "DEBIT".equals(e.getDirection()))
                .findFirst().orElseThrow();
        assertEquals(new BigDecimal("250.00"), debitLeg.getAmount());

        LedgerEntry creditLeg = journal.getEntries().stream()
                .filter(e -> "CREDIT".equals(e.getDirection()))
                .findFirst().orElseThrow();
        assertEquals(new BigDecimal("250.00"), creditLeg.getAmount());

        verify(journalEntryRepository, times(1)).save(any(JournalEntry.class));
    }

    @Test
    @DisplayName("Should reject zero or negative amount in ledger entry")
    void shouldRejectNonPositiveAmount() {
        Wallet source = new Wallet();
        Wallet target = new Wallet();

        assertThrows(IllegalArgumentException.class, () ->
                ledgerService.recordDoubleEntry(null, "TRANSFER", "Invalid", source, target, BigDecimal.ZERO)
        );

        assertThrows(IllegalArgumentException.class, () ->
                ledgerService.recordDoubleEntry(null, "TRANSFER", "Invalid", source, target, new BigDecimal("-50.00"))
        );
    }

    @Test
    @DisplayName("Should calculate audit summary with zero discrepancy when debits equal credits")
    void shouldCalculateAuditSummaryCorrectly() {
        when(journalEntryRepository.sumTotalDebit()).thenReturn(new BigDecimal("500000.0000"));
        when(journalEntryRepository.sumTotalCredit()).thenReturn(new BigDecimal("500000.0000"));
        when(journalEntryRepository.count()).thenReturn(42L);

        LedgerSummaryDto summary = ledgerService.getLedgerAuditSummary();

        assertTrue(summary.isBalanced());
        assertEquals(0, summary.getDiscrepancy().compareTo(BigDecimal.ZERO));
        assertEquals(42L, summary.getTotalJournalEntries());
    }
}
