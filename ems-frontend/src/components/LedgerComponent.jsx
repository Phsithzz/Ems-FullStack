import React, { useState, useEffect } from "react";
import { getLedgerJournals, getLedgerAudit } from "../services/FintechService";

const LedgerComponent = () => {
  const [journals, setJournals] = useState([]);
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jRes, aRes] = await Promise.all([getLedgerJournals(), getLedgerAudit()]);
      setJournals(jRes.data || []);
      setAudit(aRes.data || null);
    } catch (err) {
      console.error("Failed to fetch ledger audit data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 md:p-8 rounded-2xl text-white shadow-xl border border-indigo-500/20">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Double-Entry Bookkeeping
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Zero-Discrepancy Invariant
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Financial Ledger & Audit Trail
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Mathematical zero-discrepancy double-entry ledger ensuring Sum(Debit) equals Sum(Credit) across all accounts.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl border border-slate-700 shadow-md transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.03 8.03 0 01-15.357-2m15.357 2H15" />
          </svg>
          Re-verify Audit
        </button>
      </div>

      {/* Audit Status Metric Cards */}
      {audit && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Audit Status</span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-sm font-bold text-emerald-700">
                {audit.isBalanced ? "100% Balanced" : "Imbalanced"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{audit.statusMessage}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Total Debits</span>
            <div className="font-mono text-lg font-extrabold text-slate-900">
              ${parseFloat(audit.totalDebits || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-400">All posted debit entries</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Total Credits</span>
            <div className="font-mono text-lg font-extrabold text-slate-900">
              ${parseFloat(audit.totalCredits || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-400">All posted credit entries</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Discrepancy</span>
            <div className="font-mono text-lg font-extrabold text-emerald-600">
              ${parseFloat(audit.discrepancy || 0).toFixed(4)}
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold">Zero Variance Invariant</span>
          </div>
        </div>
      )}

      {/* Journal Entries List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-slate-800 text-base">General Ledger Journal Entries</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {journals.length} journals
            </span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {journals.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              No journal records found. Transfers and card settlements will automatically generate double-entry records.
            </div>
          ) : (
            journals.map((j) => (
              <div key={j.id} className="transition-colors hover:bg-slate-50/50">
                <div
                  onClick={() => toggleExpand(j.id)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                      📖
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {j.journalReference}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {j.entryType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{j.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 self-end md:self-center">
                    <div className="text-right">
                      <div className="font-mono font-extrabold text-slate-900 text-sm">
                        ${parseFloat(j.totalDebit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {j.postedAt ? new Date(j.postedAt).toLocaleString() : ""}
                      </span>
                    </div>

                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold">
                      {expandedId === j.id ? "▲" : "▼"}
                    </div>
                  </div>
                </div>

                {/* Expanded Legs */}
                {expandedId === j.id && (
                  <div className="bg-slate-50 p-5 border-t border-slate-100 space-y-3 animate-fadeIn">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Double-Entry Breakdown
                    </div>
                    <div className="space-y-2">
                      {j.entries &&
                        j.entries.map((leg) => {
                          const isDebit = leg.direction === "DEBIT";
                          return (
                            <div
                              key={leg.id}
                              className="bg-white p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className={`px-2 py-1 rounded-md text-[10px] font-extrabold uppercase ${
                                    isDebit
                                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  }`}
                                >
                                  {leg.direction}
                                </span>
                                <div>
                                  <div className="text-xs font-bold text-slate-800">
                                    {leg.wallet?.walletName || "Account"} ({leg.wallet?.accountNumber})
                                  </div>
                                  <div className="text-[11px] text-slate-400">{leg.description}</div>
                                </div>
                              </div>

                              <div className="text-right">
                                <div
                                  className={`font-mono font-bold text-sm ${
                                    isDebit ? "text-rose-600" : "text-emerald-600"
                                  }`}
                                >
                                  {isDebit ? "-" : "+"}$
                                  {parseFloat(leg.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  Balance After: ${parseFloat(leg.balanceAfter).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LedgerComponent;
