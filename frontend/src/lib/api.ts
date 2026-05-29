import { ApiEnvelope, ApiErrorPayload, Account, LedgerEntry, Transaction, User } from "./types";

const PROXY_PREFIX = "/api/backend";

export class ApiError extends Error {
  status: number;
  payload?: ApiErrorPayload;

  constructor(message: string, status: number, payload?: ApiErrorPayload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  const response = await fetch(`${PROXY_PREFIX}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  const raw = await response.text();
  const payload = raw ? safeJsonParse(raw) : undefined;

  if (!response.ok) {
    const message = (payload as ApiErrorPayload | undefined)?.message || `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, payload as ApiErrorPayload | undefined);
  }

  return payload as T;
}

function safeJsonParse(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

export const authApi = {
  register(payload: { name: string; email: string; password: string }) {
    return apiRequest<ApiEnvelope<User>>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  login(payload: { email: string; password: string }) {
    return apiRequest<ApiEnvelope<User>>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  verifyEmail(payload: { email: string; otp: string }) {
    return apiRequest<ApiEnvelope<User>>("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  requestPasswordReset(payload: { email: string }) {
    return apiRequest<ApiEnvelope<null>>("/api/auth/request-password-reset", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  resetPassword(payload: { email: string; newPassword: string; otp?: string; token?: string }) {
    return apiRequest<ApiEnvelope<null>>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  resendVerification(payload: { email: string }) {
    return apiRequest<ApiEnvelope<User>>("/api/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  me() {
    return apiRequest<ApiEnvelope<User>>("/api/auth/me", { method: "GET" });
  },
  logout() {
    return apiRequest<ApiEnvelope<null>>("/api/auth/logout", { method: "POST" });
  },
};

export const accountApi = {
  list() {
    return apiRequest<ApiEnvelope<Account[]>>("/api/account/me", { method: "GET" });
  },
  others() {
    return apiRequest<ApiEnvelope<Account[]>>("/api/account/others", { method: "GET" });
  },
  all() {
    return apiRequest<ApiEnvelope<Account[]>>("/api/account/all", { method: "GET" });
  },
  create() {
    return apiRequest<ApiEnvelope<{ account: Account }>>("/api/account", { method: "POST" });
  },
  details(accountId: string) {
    return apiRequest<{ account: Account; recentLedgerEntries: LedgerEntry[] }>("/api/account/" + accountId, { method: "GET" });
  },
  balance(accountId: string) {
    return apiRequest<ApiEnvelope<number>>("/api/account/balance/" + accountId, { method: "GET" });
  },
};

export const transactionApi = {
  create(payload: { fromAccount: string; toAccount: string; amount: number; idempotencyKey: string }) {
    return apiRequest<ApiEnvelope<Transaction>>("/api/transaction", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  list(params?: { accountId?: string; type?: "sent" | "received"; from?: string; to?: string; limit?: number }) {
    const search = new URLSearchParams();
    if (params?.accountId) search.set("accountId", params.accountId);
    if (params?.type) search.set("type", params.type);
    if (params?.from) search.set("from", params.from);
    if (params?.to) search.set("to", params.to);
    if (params?.limit) search.set("limit", String(params.limit));
    const query = search.toString() ? `?${search.toString()}` : "";
    return apiRequest<ApiEnvelope<Transaction[]>>(`/api/transaction/me${query}`, { method: "GET" });
  },
  detail(transactionId: string) {
    return apiRequest<{ transaction: Transaction; ledgerEntries: LedgerEntry[] }>("/api/transaction/" + transactionId, { method: "GET" });
  },
  reverse(transactionId: string) {
    return apiRequest<ApiEnvelope<Transaction>>(`/api/transaction/${transactionId}/reverse`, { method: "POST" });
  },
  seedInitialFunds(payload: { toAccount: string; amount: number; idempotencyKey: string }) {
    return apiRequest<ApiEnvelope<Transaction>>("/api/transaction/system/initial-funds", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

export const ledgerApi = {
  list(params?: { accountId?: string; type?: "CREDIT" | "DEBIT"; from?: string; to?: string; search?: string; limit?: number }) {
    const search = new URLSearchParams();
    if (params?.accountId) search.set("accountId", params.accountId);
    if (params?.type) search.set("type", params.type);
    if (params?.from) search.set("from", params.from);
    if (params?.to) search.set("to", params.to);
    if (params?.search) search.set("search", params.search);
    if (params?.limit) search.set("limit", String(params.limit));
    const query = search.toString() ? `?${search.toString()}` : "";
    return apiRequest<ApiEnvelope<LedgerEntry[]>>(`/api/ledger/me${query}`, { method: "GET" });
  },
  detail(ledgerId: string) {
    return apiRequest<ApiEnvelope<LedgerEntry>>("/api/ledger/" + ledgerId, { method: "GET" });
  },
};

export async function fetchCurrentUser() {
  const response = await authApi.me();
  return response.user;
}
