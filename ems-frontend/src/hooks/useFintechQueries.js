import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWallets,
  getTransactions,
  getCards,
  createCard,
  updateCardStatus,
  authorizeCard,
  settleCard,
  getLedgerJournals,
  getLedgerAudit,
  transferFunds,
} from "../services/FintechService";

export const FINTECH_QUERY_KEYS = {
  wallets: ["wallets"],
  transactions: ["transactions"],
  cards: ["cards"],
  ledgerJournals: ["ledger-journals"],
  ledgerAudit: ["ledger-audit"],
};

export const useWallets = () => {
  return useQuery({
    queryKey: FINTECH_QUERY_KEYS.wallets,
    queryFn: async () => {
      const res = await getWallets();
      return res.data || [];
    },
  });
};

export const useTransactions = () => {
  return useQuery({
    queryKey: FINTECH_QUERY_KEYS.transactions,
    queryFn: async () => {
      const res = await getTransactions();
      return res.data || [];
    },
  });
};

export const useCards = () => {
  return useQuery({
    queryKey: FINTECH_QUERY_KEYS.cards,
    queryFn: async () => {
      const res = await getCards();
      return res.data || [];
    },
  });
};

export const useLedgerJournals = () => {
  return useQuery({
    queryKey: FINTECH_QUERY_KEYS.ledgerJournals,
    queryFn: async () => {
      const res = await getLedgerJournals();
      return res.data || [];
    },
  });
};

export const useLedgerAudit = () => {
  return useQuery({
    queryKey: FINTECH_QUERY_KEYS.ledgerAudit,
    queryFn: async () => {
      const res = await getLedgerAudit();
      return res.data || null;
    },
  });
};

export const useTransferMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, idempotencyKey }) => transferFunds(data, idempotencyKey),
    onSuccess: () => {
      // Invalidate relevant queries so balances and transaction feeds re-sync automatically
      queryClient.invalidateQueries({ queryKey: FINTECH_QUERY_KEYS.wallets });
      queryClient.invalidateQueries({ queryKey: FINTECH_QUERY_KEYS.transactions });
      queryClient.invalidateQueries({ queryKey: FINTECH_QUERY_KEYS.ledgerAudit });
      queryClient.invalidateQueries({ queryKey: FINTECH_QUERY_KEYS.ledgerJournals });
    },
  });
};

export const useCardStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, status }) => updateCardStatus(cardId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FINTECH_QUERY_KEYS.cards });
    },
  });
};

export const useCardAuthorizeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, data, idempotencyKey }) => authorizeCard(cardId, data, idempotencyKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FINTECH_QUERY_KEYS.cards });
      queryClient.invalidateQueries({ queryKey: FINTECH_QUERY_KEYS.wallets });
    },
  });
};

export const useCreateCardMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createCard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FINTECH_QUERY_KEYS.cards });
    },
  });
};
