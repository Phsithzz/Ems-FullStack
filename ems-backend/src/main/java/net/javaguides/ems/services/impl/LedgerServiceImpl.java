package net.javaguides.ems.services.impl;

import net.javaguides.ems.dto.LedgerSummaryDto;
import net.javaguides.ems.entity.JournalEntry;
import net.javaguides.ems.entity.LedgerEntry;
import net.javaguides.ems.entity.PaymentTransaction;
import net.javaguides.ems.entity.Wallet;
import net.javaguides.ems.exception.LedgerImbalanceException;
import net.javaguides.ems.repository.JournalEntryRepository;
import net.javaguides.ems.repository.LedgerEntryRepository;
import net.javaguides.ems.services.LedgerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class LedgerServiceImpl implements LedgerService {

    private static final Logger log = LoggerFactory.getLogger(LedgerServiceImpl.class);

    private final JournalEntryRepository journalEntryRepository;
    private final LedgerEntryRepository ledgerEntryRepository;

    public LedgerServiceImpl(JournalEntryRepository journalEntryRepository, LedgerEntryRepository ledgerEntryRepository) {
        this.journalEntryRepository = journalEntryRepository;
        this.ledgerEntryRepository = ledgerEntryRepository;
    }

    @Override
    @Transactional
    public JournalEntry recordDoubleEntry(
            PaymentTransaction transaction,
            String entryType,
            String description,
            Wallet debitWallet,
            Wallet creditWallet,
            BigDecimal amount
    ) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Ledger transaction amount must be positive");
        }

        // Create Journal header
        JournalEntry journal = new JournalEntry();
        journal.setJournalReference("JRN-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        journal.setTransaction(transaction);
        journal.setEntryType(entryType);
        journal.setDescription(description);
        journal.setTotalDebit(amount);
        journal.setTotalCredit(amount);
        journal.setPostedAt(LocalDateTime.now());

        // 1. Debit Entry (Source account decrease / debit balance)
        LedgerEntry debitEntry = new LedgerEntry();
        debitEntry.setJournalEntry(journal);
        debitEntry.setWallet(debitWallet);
        debitEntry.setDirection("DEBIT");
        debitEntry.setAmount(amount);
        debitEntry.setBalanceAfter(debitWallet.getBalance());
        debitEntry.setDescription("Debit from wallet " + debitWallet.getAccountNumber() + ": " + description);
        debitEntry.setCreatedAt(LocalDateTime.now());
        journal.addEntry(debitEntry);

        // 2. Credit Entry (Target account increase / credit balance)
        LedgerEntry creditEntry = new LedgerEntry();
        creditEntry.setJournalEntry(journal);
        creditEntry.setWallet(creditWallet);
        creditEntry.setDirection("CREDIT");
        creditEntry.setAmount(amount);
        creditEntry.setBalanceAfter(creditWallet.getBalance());
        creditEntry.setDescription("Credit to wallet " + creditWallet.getAccountNumber() + ": " + description);
        creditEntry.setCreatedAt(LocalDateTime.now());
        journal.addEntry(creditEntry);

        // Core Invariant Check: Sum(Debit) == Sum(Credit)
        BigDecimal sumDebit = journal.getEntries().stream()
                .filter(e -> "DEBIT".equalsIgnoreCase(e.getDirection()))
                .map(LedgerEntry::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal sumCredit = journal.getEntries().stream()
                .filter(e -> "CREDIT".equalsIgnoreCase(e.getDirection()))
                .map(LedgerEntry::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (sumDebit.compareTo(sumCredit) != 0) {
            log.error("💥 [FATAL LEDGER IMBALANCE] Debit: {} != Credit: {}", sumDebit, sumCredit);
            throw new LedgerImbalanceException("Double-entry bookkeeping integrity violation: Debit (" + sumDebit + ") does not equal Credit (" + sumCredit + ")");
        }

        JournalEntry saved = journalEntryRepository.save(journal);
        log.info("📖 [LEDGER JOURNAL POSTED] Ref: {} | Sum: {} {} | Balanced: true",
                saved.getJournalReference(), sumDebit, debitWallet.getCurrency());
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public List<JournalEntry> getAllJournals() {
        return journalEntryRepository.findAllByOrderByPostedAtDesc();
    }

    @Override
    @Transactional(readOnly = true)
    public LedgerSummaryDto getLedgerAuditSummary() {
        BigDecimal totalDebits = journalEntryRepository.sumTotalDebit();
        BigDecimal totalCredits = journalEntryRepository.sumTotalCredit();
        if (totalDebits == null) totalDebits = BigDecimal.ZERO;
        if (totalCredits == null) totalCredits = BigDecimal.ZERO;

        BigDecimal discrepancy = totalDebits.subtract(totalCredits).abs();
        boolean isBalanced = discrepancy.compareTo(BigDecimal.ZERO) == 0;
        long totalEntries = journalEntryRepository.count();

        return LedgerSummaryDto.builder()
                .totalDebits(totalDebits)
                .totalCredits(totalCredits)
                .discrepancy(discrepancy)
                .isBalanced(isBalanced)
                .totalJournalEntries(totalEntries)
                .statusMessage(isBalanced ? "All ledger accounts in 100% mathematical balance (Zero Discrepancy)." : "DISCREPANCY DETECTED! Audit required.")
                .build();
    }
}
