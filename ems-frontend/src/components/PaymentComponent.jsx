import React, { useState, useEffect } from "react";
import { getWallets, transferFunds, getTransactions } from "../services/FintechService";

const generateUUID = () => {
  return "idemp-" + ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
  );
};

const PaymentComponent = () => {
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Transfer Form State
  const [sourceWalletId, setSourceWalletId] = useState("");
  const [targetWalletId, setTargetWalletId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState(generateUUID());
  const [transferLoading, setTransferLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [walletRes, txnRes] = await Promise.all([getWallets(), getTransactions()]);
      setWallets(walletRes.data || []);
      setTransactions(txnRes.data || []);
      if (walletRes.data && walletRes.data.length >= 2) {
        setSourceWalletId(walletRes.data[0].id);
        setTargetWalletId(walletRes.data[1].id);
      }
    } catch (err) {
      console.error("Failed to load fintech data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenTransfer = () => {
    setIdempotencyKey(generateUUID());
    setFeedbackMsg(null);
    setShowTransferModal(true);
  };

  const handleExecuteTransfer = async (isDuplicateTest = false) => {
    if (!amount || parseFloat(amount) <= 0) {
      setFeedbackMsg({ type: "error", text: "Please enter a valid transfer amount" });
      return;
    }
    if (sourceWalletId === targetWalletId) {
      setFeedbackMsg({ type: "error", text: "Source and target wallets must be distinct accounts" });
      return;
    }

    setTransferLoading(true);
    setFeedbackMsg(null);

    try {
      const payload = {
        sourceWalletId: parseInt(sourceWalletId),
        targetWalletId: parseInt(targetWalletId),
        amount: parseFloat(amount),
        currency: "USDT",
        description: description || "Binance Pay Instant Transfer",
      };

      const res = await transferFunds(payload, idempotencyKey);
      
      const successNotice = isDuplicateTest
        ? `🎯 [Idempotency Guard Active] Server returned cached transaction (No duplicate debit!): ${res.data.transactionReference}`
        : `✅ Transfer successful! Ref: ${res.data.transactionReference}`;

      setFeedbackMsg({ type: "success", text: successNotice });
      
      // Refresh wallets and transactions
      const [wRes, tRes] = await Promise.all([getWallets(), getTransactions()]);
      setWallets(wRes.data || []);
      setTransactions(tRes.data || []);

      if (!isDuplicateTest) {
        // Generate new key for the next payment
        setIdempotencyKey(generateUUID());
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.response?.data || "Transfer failed. Check balance or server connection.";
      setFeedbackMsg({ type: "error", text: String(errorMsg) });
    } finally {
      setTransferLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner / Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950/70 p-6 md:p-8 rounded-2xl text-white shadow-xl border border-amber-500/20">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Binance Pay Core Engine
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Pessimistic Row Lock & Idempotent
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Treasury & Payouts Engine
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            High-concurrency payout infrastructure with zero-deadlock row locks and UUID idempotency-key deduplication.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenTransfer}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Fast Transfer / Payout
          </button>
        </div>
      </div>

      {/* Wallets Grid */}
      <div>
        <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          Active Wallets & Balances
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {wallets.map((wallet) => (
            <div
              key={wallet.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">
                    {wallet.accountNumber}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      wallet.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        : "bg-rose-50 text-rose-600 border border-rose-200"
                    }`}
                  >
                    {wallet.status}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-sm mb-1">{wallet.walletName}</h3>
                <p className="text-xs text-slate-400 mb-3">{wallet.ownerName}</p>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500 font-medium">Available</span>
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-slate-900 font-mono">
                      {parseFloat(wallet.availableBalance || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 4,
                      })}
                    </span>
                    <span className="text-xs font-bold text-amber-600 ml-1.5">{wallet.currency}</span>
                  </div>
                </div>

                {parseFloat(wallet.lockedBalance || 0) > 0 && (
                  <div className="flex items-center justify-between text-[11px] text-amber-600 font-medium mt-1">
                    <span>Card Hold:</span>
                    <span>
                      {parseFloat(wallet.lockedBalance).toLocaleString()} {wallet.currency}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-slate-800 text-base">Payment & Transfer History</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {transactions.length} records
            </span>
          </div>

          <button
            onClick={fetchData}
            className="text-xs font-medium text-slate-500 hover:text-amber-600 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.03 8.03 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                <th className="py-3.5 px-5">Reference / Key</th>
                <th className="py-3.5 px-5">Type</th>
                <th className="py-3.5 px-5">Source Wallet</th>
                <th className="py-3.5 px-5">Target Wallet</th>
                <th className="py-3.5 px-5">Amount</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No transactions recorded yet. Click "Fast Transfer / Payout" to execute your first transfer!
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-mono text-xs font-bold text-slate-800">
                        {tx.transactionReference}
                      </div>
                      {tx.idempotencyKey && (
                        <div className="text-[11px] text-slate-400 font-mono truncate max-w-xs" title={tx.idempotencyKey}>
                          key: {tx.idempotencyKey}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-600 text-xs font-medium">
                      {tx.sourceWallet?.walletName || "External / Liquidity"}
                    </td>
                    <td className="py-4 px-5 text-slate-600 text-xs font-medium">
                      {tx.targetWallet?.walletName || "External / Payout"}
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-mono font-bold text-slate-900">
                        {parseFloat(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 ml-1">{tx.currency}</span>
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          tx.status === "SUCCESS"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            tx.status === "SUCCESS" ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                        ></span>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-400 font-mono">
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Execute Idempotent Transfer</h3>
                <p className="text-xs text-slate-500 mt-0.5">Protected with Row-level Lock & UUID deduplication</p>
              </div>
              <button
                onClick={() => setShowTransferModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                ✕
              </button>
            </div>

            {feedbackMsg && (
              <div
                className={`p-4 rounded-xl text-xs font-medium leading-relaxed ${
                  feedbackMsg.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {feedbackMsg.text}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Source Wallet</label>
                <select
                  value={sourceWalletId}
                  onChange={(e) => setSourceWalletId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.walletName} ({parseFloat(w.availableBalance).toLocaleString()} {w.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Wallet</label>
                <select
                  value={targetWalletId}
                  onChange={(e) => setTargetWalletId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.walletName} ({parseFloat(w.availableBalance).toLocaleString()} {w.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (USDT)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 1000.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="Payroll / Reimbursement"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Idempotency Key Section */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Idempotency-Key Header
                  </span>
                  <button
                    type="button"
                    onClick={() => setIdempotencyKey(generateUUID())}
                    className="text-[11px] text-amber-700 hover:text-amber-900 font-medium cursor-pointer underline"
                  >
                    Regenerate UUID
                  </button>
                </div>
                <div className="font-mono text-xs text-amber-950 font-bold break-all bg-white/70 px-2.5 py-1.5 rounded-lg border border-amber-200/50">
                  {idempotencyKey}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                disabled={transferLoading}
                onClick={() => handleExecuteTransfer(false)}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
              >
                {transferLoading ? "Processing Transfer..." : "Submit Payment Transfer"}
              </button>

              <button
                type="button"
                disabled={transferLoading}
                onClick={() => handleExecuteTransfer(true)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer border border-slate-200"
              >
                ⚡ Test Duplicate Submit with Same Idempotency-Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentComponent;
