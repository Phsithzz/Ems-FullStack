package net.javaguides.ems.services;

import net.javaguides.ems.dto.LedgerSummaryDto;
import net.javaguides.ems.entity.JournalEntry;
import net.javaguides.ems.entity.PaymentTransaction;
import net.javaguides.ems.entity.Wallet;

import java.math.BigDecimal;
import java.util.List;

public interface LedgerService {

    /**
     * Records a balanced double-entry journal entry with Debit and Credit legs.
     * Enforces the mathematical invariant: Sum(Debit) == Sum(Credit).
     */
    JournalEntry recordDoubleEntry(
            PaymentTransaction transaction,
            String entryType,
            String description,
            Wallet debitWallet,
            Wallet creditWallet,
            BigDecimal amount
    );

    List<JournalEntry> getAllJournals();

    LedgerSummaryDto getLedgerAuditSummary();
}
