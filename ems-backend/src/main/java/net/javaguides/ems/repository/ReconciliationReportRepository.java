package net.javaguides.ems.repository;

import net.javaguides.ems.entity.ReconciliationReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReconciliationReportRepository extends JpaRepository<ReconciliationReport, Long> {

    List<ReconciliationReport> findAllByOrderByReconciledAtDesc();
}
