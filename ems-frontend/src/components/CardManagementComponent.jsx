import React, { useState, useEffect } from "react";
import {
  useCards,
  useWallets,
  useCardStatusMutation,
  useCardAuthorizeMutation,
  useCreateCardMutation,
} from "../hooks/useFintechQueries";
import { useEmployees } from "../hooks/useEmployeeQueries";
import { settleCard } from "../services/FintechService";

const generateUUID = () => {
  return "idemp-card-" + ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
  );
};

const CardManagementComponent = () => {
  const { data: cards = [], isLoading: cardsLoading } = useCards();
  const { data: wallets = [] } = useWallets();
  const { data: employees = [] } = useEmployees();

  const cardStatusMutation = useCardStatusMutation();
  const cardAuthorizeMutation = useCardAuthorizeMutation();
  const createCardMutation = useCreateCardMutation();

  // Swipe / POS Simulation Modal
  const [selectedCardForSwipe, setSelectedCardForSwipe] = useState(null);
  const [merchantName, setMerchantName] = useState("AWS Cloud Services");
  const [swipeAmount, setSwipeAmount] = useState("49.99");
  const [swipeResult, setSwipeResult] = useState(null);

  // Issue Card Modal
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueEmployeeId, setIssueEmployeeId] = useState("");
  const [issueWalletId, setIssueWalletId] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardType, setCardType] = useState("WORKPAY_BLACK_VIRTUAL");
  const [dailyLimit, setDailyLimit] = useState("5000.00");

  useEffect(() => {
    if (wallets.length > 0 && !issueWalletId) {
      setIssueWalletId(wallets[0].id);
    }
  }, [wallets, issueWalletId]);

  const handleToggleFreeze = (card) => {
    const nextStatus = card.cardStatus === "ACTIVE" ? "FROZEN" : "ACTIVE";
    cardStatusMutation.mutate(
      { cardId: card.id, status: nextStatus },
      {
        onError: (err) => {
          alert("Failed to update card status: " + err.message);
        },
      }
    );
  };

  const handleSimulateSwipe = () => {
    if (!selectedCardForSwipe) return;
    setSwipeResult(null);

    const idempKey = generateUUID();
    cardAuthorizeMutation.mutate(
      {
        cardId: selectedCardForSwipe.id,
        data: {
          merchantName,
          amount: parseFloat(swipeAmount),
          currency: "USD",
        },
        idempotencyKey: idempKey,
      },
      {
        onSuccess: (res) => {
          setSwipeResult(res.data);
        },
        onError: (err) => {
          const msg = err.response?.data?.message || err.message;
          setSwipeResult({
            status: "DECLINED",
            declineReason: String(msg),
          });
        },
      }
    );
  };

  const handleIssueCard = (e) => {
    e.preventDefault();
    if (!cardHolderName) {
      alert("Please enter cardholder name");
      return;
    }

    createCardMutation.mutate(
      {
        employeeId: issueEmployeeId ? parseInt(issueEmployeeId) : null,
        walletId: parseInt(issueWalletId),
        cardHolderName,
        cardType,
        dailyLimit: parseFloat(dailyLimit),
        monthlyLimit: parseFloat(dailyLimit) * 10,
      },
      {
        onSuccess: () => {
          setShowIssueModal(false);
          setCardHolderName("");
        },
        onError: (err) => {
          alert("Failed to issue card: " + (err.response?.data?.message || err.message));
        },
      }
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-zinc-900 to-black p-6 md:p-8 rounded-2xl text-white shadow-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              WorkPay Corporate Cards
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Virtual Visa/Mastercard Emulation
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Corporate Expense & Virtual Cards
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Real-time balance holds, dynamic spend limits, zero-downtime card freeze, and TanStack Query state synchronization.
          </p>
        </div>

        <button
          onClick={() => setShowIssueModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Issue Corporate Card
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const isBlack = card.cardType.includes("BLACK");
          const isFrozen = card.cardStatus === "FROZEN";

          return (
            <div
              key={card.id}
              className={`rounded-3xl p-6 transition-all duration-300 relative overflow-hidden shadow-xl border ${
                isBlack
                  ? "bg-gradient-to-br from-slate-900 via-zinc-900 to-black text-white border-slate-700/60"
                  : "bg-gradient-to-br from-amber-900 via-amber-800 to-zinc-900 text-white border-amber-600/50"
              } ${isFrozen ? "opacity-75 grayscale-[40%]" : ""}`}
            >
              {/* Holographic / Chip Pattern */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-7 bg-amber-400/90 rounded-md border border-amber-300/40 relative shadow-inner">
                    <div className="absolute inset-1 border border-amber-700/40 rounded-xs"></div>
                  </div>
                  {/* Contactless waves icon */}
                  <svg className="w-5 h-5 text-slate-400 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                  </svg>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      isFrozen
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    }`}
                  >
                    {card.cardStatus}
                  </span>
                  <span className="font-extrabold text-xs tracking-wider text-indigo-400">
                    WORKPAY
                  </span>
                </div>
              </div>

              {/* Card Number */}
              <div className="mb-6 font-mono text-lg md:text-xl font-bold tracking-widest text-slate-100">
                {card.cardNumber}
              </div>

              {/* Card Details Footer */}
              <div className="flex items-end justify-between mb-5">
                <div>
                  <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    Cardholder
                  </div>
                  <div className="text-sm font-bold tracking-wide text-white uppercase truncate max-w-[170px]">
                    {card.cardHolderName}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    Expires
                  </div>
                  <div className="text-sm font-mono font-bold text-slate-200">
                    {String(card.expiryMonth).padStart(2, "0")}/{String(card.expiryYear).slice(-2)}
                  </div>
                </div>
              </div>

              {/* Spend Limit Progress Bar */}
              <div className="pt-3 border-t border-slate-700/50 space-y-1.5 mb-5">
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>Daily Spent:</span>
                  <span className="font-mono font-bold">
                    ${parseFloat(card.dailySpent).toFixed(2)} / ${parseFloat(card.dailyLimit).toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-400 h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        (parseFloat(card.dailySpent) / parseFloat(card.dailyLimit)) * 100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleFreeze(card)}
                  disabled={cardStatusMutation.isPending}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 ${
                    isFrozen
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  }`}
                >
                  {isFrozen ? "🔓 Unfreeze Card" : "❄️ Freeze Card"}
                </button>

                <button
                  onClick={() => {
                    setSelectedCardForSwipe(card);
                    setSwipeResult(null);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all cursor-pointer"
                >
                  💳 Swipe (POS)
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* POS Swipe Simulation Modal */}
      {selectedCardForSwipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Simulate Card Swipe (POS)</h3>
                <p className="text-xs text-slate-500 mt-0.5">Card: {selectedCardForSwipe.cardNumber}</p>
              </div>
              <button
                onClick={() => setSelectedCardForSwipe(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                ✕
              </button>
            </div>

            {swipeResult && (
              <div
                className={`p-4 rounded-2xl text-xs font-medium space-y-1.5 ${
                  swipeResult.status === "AUTHORIZED" || swipeResult.status === "SETTLED"
                    ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                    : "bg-rose-50 text-rose-900 border border-rose-200"
                }`}
              >
                <div className="font-bold text-sm flex items-center gap-1.5">
                  {swipeResult.status === "AUTHORIZED" ? "✅ Authorization Approved" : "❌ Authorization Declined"}
                </div>
                {swipeResult.authorizationCode && (
                  <div>
                    Approval Code: <span className="font-mono font-bold">{swipeResult.authorizationCode}</span>
                  </div>
                )}
                {swipeResult.declineReason && <div>Reason: {swipeResult.declineReason}</div>}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Merchant Name</label>
                <input
                  type="text"
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Amount ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={swipeAmount}
                  onChange={(e) => setSwipeAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={cardAuthorizeMutation.isPending}
                onClick={handleSimulateSwipe}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
              >
                {cardAuthorizeMutation.isPending ? "Contacting Network..." : "Simulate POS Terminal Authorization"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Issue Card Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Issue Corporate Virtual Card</h3>
              <button
                onClick={() => setShowIssueModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueCard} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="e.g. Satoshi Nakamoto"
                  value={cardHolderName}
                  onChange={(e) => setCardHolderName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Backing Funding Wallet</label>
                <select
                  value={issueWalletId}
                  onChange={(e) => setIssueWalletId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.walletName} ({parseFloat(w.availableBalance).toLocaleString()} {w.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assign to Employee (Optional)</label>
                <select
                  value={issueEmployeeId}
                  onChange={(e) => setIssueEmployeeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">None (Corporate Executive)</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Card Tier</label>
                <select
                  value={cardType}
                  onChange={(e) => setCardType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="WORKPAY_BLACK_VIRTUAL">WorkPay Black Virtual (Tier 1)</option>
                  <option value="WORKPAY_PLATINUM_DEBIT">WorkPay Platinum Corporate (Tier 2)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Daily Spend Limit ($)</label>
                <input
                  type="number"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={createCardMutation.isPending}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  {createCardMutation.isPending ? "Issuing Card..." : "Generate & Activate Virtual Card"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardManagementComponent;
