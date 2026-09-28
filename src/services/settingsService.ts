import { BusinessSettings, FinanceSettings, AuditLog } from '../types/settings';
import { DEFAULT_BUSINESS_SETTINGS, DEFAULT_FINANCE_SETTINGS } from '../constants/defaultSettings';
import { fetchCollection, fetchDocById, saveDoc } from '../firebase/firestore';

const SETTINGS_COLLECTION = 'settings';
const AUDIT_COLLECTION = 'auditLogs';

export async function getBusinessSettings(): Promise<BusinessSettings> {
  const doc = await fetchDocById<{ id: string } & BusinessSettings>(SETTINGS_COLLECTION, 'business');
  if (doc) {
    const { id, ...settings } = doc;
    return settings as BusinessSettings;
  }
  return DEFAULT_BUSINESS_SETTINGS;
}

export async function saveBusinessSettings(settings: BusinessSettings, adminName = 'Admin'): Promise<BusinessSettings> {
  await saveDoc(SETTINGS_COLLECTION, {
    id: 'business',
    ...settings,
    updatedAt: new Date().toISOString(),
  });

  await logAuditEvent({
    action: 'Update Business Settings',
    module: 'settings',
    details: `Updated company profile details for ${settings.businessName}`,
    entityId: 'business',
    entityType: 'Settings',
    performedBy: adminName,
  });

  return settings;
}

export async function getFinanceSettings(): Promise<FinanceSettings> {
  const doc = await fetchDocById<{ id: string } & FinanceSettings>(SETTINGS_COLLECTION, 'finance');
  if (doc) {
    const { id, ...settings } = doc;
    return settings as FinanceSettings;
  }
  return DEFAULT_FINANCE_SETTINGS;
}

export async function saveFinanceSettings(settings: FinanceSettings, adminName = 'Admin'): Promise<FinanceSettings> {
  await saveDoc(SETTINGS_COLLECTION, {
    id: 'finance',
    ...settings,
    updatedAt: new Date().toISOString(),
  });

  await logAuditEvent({
    action: 'Update Finance Rules',
    module: 'settings',
    details: `Updated default return rate (${settings.defaultAnnualReturnRate}%) and loan interest (${settings.defaultMonthlyLoanInterestRate}%/mo)`,
    entityId: 'finance',
    entityType: 'Settings',
    performedBy: adminName,
  });

  return settings;
}

export async function logAuditEvent(entry: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
  try {
    const log: AuditLog = {
      ...entry,
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    await saveDoc(AUDIT_COLLECTION, log);
  } catch (err) {
    console.warn('Failed to record audit log:', err);
  }
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  const logs = await fetchCollection<AuditLog>(AUDIT_COLLECTION);
  return logs.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
}
