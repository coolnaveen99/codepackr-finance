import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseFirestore } from "@/lib/firebase";

export const ADMIN_SESSION_KEY = "codepackr_admin_session";
export const ADMIN_AUDIT_LOGS_KEY = "codepackr_admin_audit_logs";
export const GLOBAL_CONFIG_KEY = "codepackr_global_system_config";
export const TOOL_GOV_KEY = "codepackr_tool_gov_";

export const AUTHORIZED_ADMIN_EMAILS = [
  "tnavkum@gmail.com",
  "admin@codepackr.com",
];

export interface AdminUser {
  email: string;
  uid: string;
  isLocalSession: boolean;
}

export interface GlobalSystemConfig {
  globalBannerActive: boolean;
  globalBannerText: string;
  globalBannerType: "info" | "warning" | "success" | "danger";
  globalBannerLink: string;
  globalBannerLinkText: string;
  maintenanceMode: boolean;
  environment: string;
  lastUpdated: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  adminEmail: string;
  action: string;
  details?: Record<string, unknown>;
  reason?: string;
}

export const DEFAULT_GLOBAL_CONFIG: GlobalSystemConfig = {
  globalBannerActive: false,
  globalBannerText: "CodePackr Finance: High-performance, client-side private financial planning & calculator suite.",
  globalBannerType: "info",
  globalBannerLink: "",
  globalBannerLinkText: "Learn more",
  maintenanceMode: false,
  environment: "production",
  lastUpdated: new Date().toISOString(),
};

export function getStoredAdminUser(): AdminUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.email) return parsed;
    }
  } catch {}
  return null;
}

export function getStoredGlobalConfig(): GlobalSystemConfig {
  if (typeof window === "undefined") return DEFAULT_GLOBAL_CONFIG;
  try {
    const raw = localStorage.getItem(GLOBAL_CONFIG_KEY);
    if (raw) {
      return { ...DEFAULT_GLOBAL_CONFIG, ...JSON.parse(raw) };
    }
  } catch {}
  return DEFAULT_GLOBAL_CONFIG;
}

export function saveStoredGlobalConfig(cfg: Partial<GlobalSystemConfig>, adminEmail = "tnavkum@gmail.com") {
  if (typeof window === "undefined") return;
  const current = getStoredGlobalConfig();
  const updated: GlobalSystemConfig = {
    ...current,
    ...cfg,
    lastUpdated: new Date().toISOString(),
  };
  localStorage.setItem(GLOBAL_CONFIG_KEY, JSON.stringify(updated));

  // Also sync to Firestore if available
  const firestore = getFirebaseFirestore();
  if (firestore) {
    try {
      const docRef = doc(firestore, "system_config", "global_state");
      setDoc(docRef, updated, { merge: true }).catch(() => {});
    } catch {}
  }

  recordAuditLog({
    adminEmail,
    action: "update_global_config",
    details: cfg,
  });
}

export function getStoredAuditLogs(): AuditLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ADMIN_AUDIT_LOGS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return [];
}

export function recordAuditLog(entry: { adminEmail: string; action: string; details?: Record<string, unknown>; reason?: string }) {
  if (typeof window === "undefined") return;
  const logs = getStoredAuditLogs();
  const newEntry: AuditLogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  const updated = [newEntry, ...logs].slice(0, 100);
  try {
    localStorage.setItem(ADMIN_AUDIT_LOGS_KEY, JSON.stringify(updated));
  } catch {}

  const firestore = getFirebaseFirestore();
  if (firestore) {
    try {
      const docRef = doc(firestore, "admin_audit_logs", newEntry.id);
      setDoc(docRef, newEntry).catch(() => {});
    } catch {}
  }
}

export async function adminLogin(emailInput: string, passwordInput: string): Promise<AdminUser> {
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput.trim();

  if (!email || !password) {
    throw new Error("Please enter administrator email and password.");
  }

  const isAuthorizedAdmin = AUTHORIZED_ADMIN_EMAILS.includes(email);
  const auth = getFirebaseAuth();

  if (auth) {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const adminUser: AdminUser = {
        email: res.user.email || email,
        uid: res.user.uid,
        isLocalSession: false,
      };
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminUser));
      recordAuditLog({ adminEmail: email, action: "admin_login_firebase" });
      return adminUser;
    } catch (firebaseErr: unknown) {
      const errCode = (firebaseErr as { code?: string })?.code || "";
      if (errCode === "auth/invalid-credential" || errCode === "auth/user-not-found") {
        if (isAuthorizedAdmin && password.length >= 6) {
          try {
            const createRes = await createUserWithEmailAndPassword(auth, email, password);
            const adminUser: AdminUser = {
              email: createRes.user.email || email,
              uid: createRes.user.uid,
              isLocalSession: false,
            };
            localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminUser));
            recordAuditLog({ adminEmail: email, action: "admin_create_account" });
            return adminUser;
          } catch {
            // fallback to local owner session below
          }
        }
      }

      if (isAuthorizedAdmin && password.length >= 6) {
        const localUser: AdminUser = {
          email,
          uid: "owner-session",
          isLocalSession: true,
        };
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(localUser));
        recordAuditLog({ adminEmail: email, action: "admin_login_local_fallback" });
        return localUser;
      }

      throw firebaseErr;
    }
  }

  if (isAuthorizedAdmin && password.length >= 6) {
    const localUser: AdminUser = {
      email,
      uid: "owner-session",
      isLocalSession: true,
    };
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(localUser));
    recordAuditLog({ adminEmail: email, action: "admin_login_local" });
    return localUser;
  }

  throw new Error("Invalid administrator credentials. Must use authorized admin email.");
}

export async function adminLogout(): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }
  const auth = getFirebaseAuth();
  if (auth) {
    try {
      await firebaseSignOut(auth);
    } catch {}
  }
}
