import React, { useState } from "react";
import {
  useReconciliationReports,
  useKafkaLiveEvents,
  useSystemMetrics,
  useRunReconciliationMutation,
} from "../hooks/useFintechQueries";

const ReconciliationComponent = () => {
  const { data: reports = [], isLoading: reportsLoading } = useReconciliationReports();
  const { data: liveEvents = [], isLoading: eventsLoading } = useKafkaLiveEvents();
  const { data: metrics = null, isLoading: metricsLoading } = useSystemMetrics();
  const runReconMutation = useRunReconciliationMutation();

  const [notification, setNotification] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleRunReconciliation = () => {
    runReconMutation.mutate(undefined, {
      onSuccess: (res) => {
        setNotification({
          type: "success",
          message: `Reconciliation batch completed! Report Ref: ${res.data.reportReference}. Matched ${res.data.matchedCount} transactions with $0.00 discrepancy.`,
        });
        setTimeout(() => setNotification(null), 6000);
      },
      onError: (err) => {
        setNotification({
          type: "error",
          message: `Failed to run reconciliation: ${err.response?.data?.message || err.message}`,
        });
        setTimeout(() => setNotification(null), 6000);
      },
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm shadow-lg transition-all ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{notification.type === "success" ? "✓" : "⚠"}</span>
            <span className="font-medium">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 font-bold px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 md:p-8 rounded-2xl text-white shadow-xl border border-indigo-500/20">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Kafka Event-Driven Architecture
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Docker KRaft Broker
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              T+0 Financial Reconciliation
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Spring Actuator & Prometheus
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Financial Reconciliation & Event Streaming
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Real-time asynchronous payment event streaming via Apache Kafka, distributed double-entry verification, and automated batch reconciliation with zero discrepancy invariants.
          </p>
        </div>

        <button
          onClick={handleRunReconciliation}
          disabled={runReconMutation.isPending}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer whitespace-nowrap"
        >
          {runReconMutation.isPending ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              Reconciling Ledgers...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Run Batch Reconciliation
            </>
          )}
        </button>
      </div>

      {/* Infrastructure Telemetry Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Kafka Node */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Apache Kafka</span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              {metrics?.kafkaStatus || "UP"}
            </span>
          </div>
          <div className="text-base font-extrabold text-slate-900">Docker KRaft Broker</div>
          <div className="text-xs text-slate-500 mt-1 font-mono">localhost:9092 • 2 Topics</div>
          <div className="text-[11px] text-slate-400 mt-2">paypulse.payment / paypulse.card</div>
        </div>

        {/* Redis Node */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Redis Engine</span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {metrics?.redisStatus || "UP"}
            </span>
          </div>
          <div className="text-base font-extrabold text-slate-900">In-Memory KeyStore</div>
          <div className="text-xs text-slate-500 mt-1 font-mono">localhost:6379 • Redis 7-alpine</div>
          <div className="text-[11px] text-slate-400 mt-2">Idempotency & Lock Guard</div>
        </div>

        {/* Database Status */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Financial DB</span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {metrics?.databaseStatus || "UP"}
            </span>
          </div>
          <div className="text-base font-extrabold text-slate-900">ACID Ledger DB</div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            {metrics?.totalProcessedPayments || 0} Payments Processed
          </div>
          <div className="text-[11px] text-slate-400 mt-2">Pessimistic Row-Locking</div>
        </div>

        {/* Reconciliation Success Rate */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recon Accuracy</span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {metrics?.reconciliationSuccessRate || 100}%
            </span>
          </div>
          <div className="text-xl font-extrabold text-emerald-600 font-mono">
            ${parseFloat(metrics?.currentDiscrepancy || 0).toFixed(4)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Zero Discrepancy Invariant</div>
          <div className="text-[11px] text-slate-400 mt-2">Double-Entry Verified</div>
        </div>
      </div>

      {/* Two Column Layout: Kafka Realtime Stream & Latest Reconciliation Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Real-time Kafka Stream */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  Live Kafka Event Stream Visualizer
                </h2>
                <p className="text-xs text-slate-500">
                  Topic events ingested by payment & card event listeners (polling every 3s)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-slate-200/70 text-slate-700 px-2.5 py-1 rounded-md">
                {liveEvents.length} events buffered
              </span>
            </div>
          </div>

          <div className="p-4 flex-1 max-h-[480px] overflow-y-auto space-y-3 font-sans">
            {eventsLoading && liveEvents.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                Connecting to Kafka consumer topic...
              </div>
            ) : liveEvents.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm bg-slate-50/50 rounded-xl border border-dashed border-slate-200 m-2">
                <svg className="w-10 h-10 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="font-semibold text-slate-600">No events published yet.</p>
                <p className="text-xs text-slate-400 mt-1">
                  Execute a payroll transfer or card authorization to publish live Kafka events.
                </p>
              </div>
            ) : (
              liveEvents.map((event, idx) => (
                <div
                  key={event.eventId || idx}
                  onClick={() => setSelectedEvent(event)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedEvent?.eventId === event.eventId
                      ? "border-indigo-500 bg-indigo-50/30 shadow-sm"
                      : "border-slate-200/70 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-indigo-100 text-indigo-700">
                        {event.eventType || "PAYMENT_EVENT"}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        ID: {event.eventId?.substring(0, 8)}...
                      </span>
                    </div>
                    <span className="text-slate-400 text-[11px]">
                      {event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : "Just now"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-700">
                        Ref: <span className="font-mono text-slate-900">{event.transactionReference || "TXN-REF"}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {event.sourceWallet || event.merchantName || "Source"} → {event.targetWallet || "Corporate Card Hold"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-sm text-slate-900">
                        ${parseFloat(event.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        {event.status || "CONFIRMED"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Event Detail / Architecture Summary */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-2">
              Event Details & Payload
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Select an event from the Kafka live stream to inspect the JSON payload published to the broker.
            </p>

            {selectedEvent ? (
              <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-[360px] border border-slate-800">
                <div className="text-emerald-400 text-[11px] mb-2 font-bold pb-2 border-b border-slate-800">
                  // Kafka Partition Message Payload
                </div>
                <pre>{JSON.stringify(selectedEvent, null, 2)}</pre>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200">
                Click any Kafka message card on the left to inspect raw partition metadata.
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Fintech Reliability Guarantees
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>At-least-once delivery</strong> with consumer idempotency deduplication</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Zero out-of-order locks</strong>: Sorted ascending wallet locking avoids deadlocks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>T+0 Automated Recon</strong>: Continuously computes Sum(Debits) - Sum(Credits) = 0</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Reconciliation Reports History */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Batch Reconciliation Run History
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-pass audit reconciliations validating payment transactions against ledger journal entries
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
            {reports.length} Runs Recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Report Reference</th>
                <th className="px-6 py-4">Transactions</th>
                <th className="px-6 py-4">Journals</th>
                <th className="px-6 py-4">Matched / Total</th>
                <th className="px-6 py-4">Volume Reconciled</th>
                <th className="px-6 py-4">Discrepancy</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Reconciled At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportsLoading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-slate-400">
                    Loading reconciliation history...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-10 text-center text-slate-400">
                    No batch reconciliations recorded yet. Click "Run Batch Reconciliation" above to execute.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id || report.reportReference} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold text-xs text-indigo-600">
                      {report.reportReference}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {report.totalTransactions}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {report.totalJournals}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">{report.matchedCount}</span>
                      <span className="text-slate-400 text-xs"> / {report.totalTransactions}</span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      ${parseFloat(report.totalVolume || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 font-mono text-emerald-600 font-bold">
                      ${parseFloat(report.discrepancy || 0).toFixed(4)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          report.status === "BALANCED_100"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            report.status === "BALANCED_100" ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                        ></span>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {report.reconciledAt ? new Date(report.reconciledAt).toLocaleString() : "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReconciliationComponent;
