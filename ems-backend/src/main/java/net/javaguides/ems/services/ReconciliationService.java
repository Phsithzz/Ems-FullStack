package net.javaguides.ems.services;

import net.javaguides.ems.dto.ObservabilitySummaryDto;
import net.javaguides.ems.entity.ReconciliationReport;

import java.util.List;

public interface ReconciliationService {

    /**
     * Executes automated batch financial reconciliation:
     * Compares all payment transactions against the general ledger journal & entries.
     */
    ReconciliationReport runBatchReconciliation(String triggeredBy);

    List<ReconciliationReport> getRecentReports();

    ObservabilitySummaryDto getObservabilitySummary();
}
