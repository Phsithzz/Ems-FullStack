import axios from "axios";

const REST_API_BASE_URL = "http://localhost:8080/api";

// Auto-attach JWT token if present in localStorage
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getWallets = () => axios.get(`${REST_API_BASE_URL}/wallets`);

export const getWalletById = (id) => axios.get(`${REST_API_BASE_URL}/wallets/${id}`);

export const transferFunds = (data, idempotencyKey) => {
  const headers = {};
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }
  return axios.post(`${REST_API_BASE_URL}/wallets/transfer`, data, { headers });
};

export const getTransactions = () => axios.get(`${REST_API_BASE_URL}/payments/transactions`);

export const getCards = () => axios.get(`${REST_API_BASE_URL}/cards`);

export const createCard = (data) => axios.post(`${REST_API_BASE_URL}/cards`, data);

export const updateCardStatus = (cardId, status) =>
  axios.put(`${REST_API_BASE_URL}/cards/${cardId}/status`, { status });

export const authorizeCard = (cardId, data, idempotencyKey) => {
  const headers = {};
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }
  return axios.post(`${REST_API_BASE_URL}/cards/${cardId}/authorize`, data, { headers });
};

export const settleCard = (txnId) =>
  axios.post(`${REST_API_BASE_URL}/cards/transactions/${txnId}/settle`);

export const getLedgerJournals = () => axios.get(`${REST_API_BASE_URL}/ledger/journals`);

export const getLedgerAudit = () => axios.get(`${REST_API_BASE_URL}/ledger/audit`);
