export type ApiStatus = "success" | "failed" | "error";

export interface User {
  _id: string;
  name: string;
  email: string;
  isEmailVerified: boolean;
  systemUser?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Account {
  _id: string;
  user: string | User;
  currency: string;
  status: "ACTIVE" | "FROZEN" | "CLOSED";
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  fromAccount: string | Account;
  toAccount: string | Account;
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REVERSED";
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface LedgerEntry {
  _id: string;
  account: string | Account;
  transaction: string | Transaction;
  amount: number;
  type: "CREDIT" | "DEBIT";
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiEnvelope<T> {
  message?: string;
  status?: ApiStatus;
  token?: string;
  user?: User;
  account?: Account;
  accounts?: Account[];
  transaction?: Transaction;
  transactions?: Transaction[];
  entry?: LedgerEntry;
  entries?: LedgerEntry[];
  recentLedgerEntries?: LedgerEntry[];
  ledgerEntries?: LedgerEntry[];
  [key: string]: unknown;
}

export interface ApiErrorPayload {
  message?: string;
  status?: ApiStatus;
  error?: string;
}
