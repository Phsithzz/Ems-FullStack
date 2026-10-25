import apiClient from "./apiClient";

export const getWallets = () => apiClient.get("/wallets");

export const getWalletById = (id) => apiClient.get(`/wallets/${id}`);

export const transferFunds = (data, idempotencyKey) => {
  const headers = {};
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }
  return apiClient.post("/wallets/transfer", data, { headers });
};

export const getTransactions = () => apiClient.get("/payments/transactions");

export const getCards = () => apiClient.get("/cards");

export const createCard = (data) => apiClient.post("/cards", data);

export const updateCardStatus = (cardId, status) =>
  apiClient.put(`/cards/${cardId}/status`, { status });

export const authorizeCard = (cardId, data, idempotencyKey) => {
  const headers = {};
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }
  return apiClient.post(`/cards/${cardId}/authorize`, data, { headers });
};

export const settleCard = (txnId) =>
  apiClient.post(`/cards/transactions/${txnId}/settle`);

export const getLedgerJournals = () => apiClient.get("/ledger/journals");

export const getLedgerAudit = () => apiClient.get("/ledger/audit");
