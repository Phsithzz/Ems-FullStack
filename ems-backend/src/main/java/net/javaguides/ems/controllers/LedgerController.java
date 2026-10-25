package net.javaguides.ems.controllers;

import net.javaguides.ems.dto.LedgerSummaryDto;
import net.javaguides.ems.entity.JournalEntry;
import net.javaguides.ems.services.LedgerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/ledger")
public class LedgerController {

    private final LedgerService ledgerService;

    public LedgerController(LedgerService ledgerService) {
        this.ledgerService = ledgerService;
    }

    @GetMapping("/journals")
    public ResponseEntity<List<JournalEntry>> getAllJournals() {
        return ResponseEntity.ok(ledgerService.getAllJournals());
    }

    @GetMapping("/audit")
    public ResponseEntity<LedgerSummaryDto> getLedgerAudit() {
        return ResponseEntity.ok(ledgerService.getLedgerAuditSummary());
    }
}
