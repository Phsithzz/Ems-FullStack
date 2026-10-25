package net.javaguides.ems.controllers;

import net.javaguides.ems.dto.ObservabilitySummaryDto;
import net.javaguides.ems.entity.ReconciliationReport;
import net.javaguides.ems.listener.PaymentEventListener;
import net.javaguides.ems.services.ReconciliationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/reconciliation")
public class ReconciliationController {

    private final ReconciliationService reconciliationService;
    private final PaymentEventListener paymentEventListener;

    public ReconciliationController(
            ReconciliationService reconciliationService,
            PaymentEventListener paymentEventListener
    ) {
        this.reconciliationService = reconciliationService;
        this.paymentEventListener = paymentEventListener;
    }

    @PostMapping("/run")
    public ResponseEntity<ReconciliationReport> runBatchReconciliation(Authentication authentication) {
        String triggeredBy = (authentication != null && authentication.isAuthenticated())
                ? authentication.getName() : "ADMIN_PORTAL";
        ReconciliationReport report = reconciliationService.runBatchReconciliation(triggeredBy);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/reports")
    public ResponseEntity<List<ReconciliationReport>> getRecentReports() {
        return ResponseEntity.ok(reconciliationService.getRecentReports());
    }

    @GetMapping("/events")
    public ResponseEntity<List<Object>> getLiveKafkaEvents() {
        return ResponseEntity.ok(paymentEventListener.getRecentKafkaEvents());
    }

    @GetMapping("/metrics")
    public ResponseEntity<ObservabilitySummaryDto> getObservabilitySummary() {
        return ResponseEntity.ok(reconciliationService.getObservabilitySummary());
    }
}
