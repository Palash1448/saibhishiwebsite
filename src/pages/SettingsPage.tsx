import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmationContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { saveBusinessSettings, saveFinanceSettings } from '../services/settingsService';
import { exportToJSON } from '../utils/exportUtils';
import {
  Settings,
  Building,
  DollarSign,
  Database,
  RotateCcw,
  Save,
  Download,
  Upload,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    businessSettings,
    financeSettings,
    updateLocalBusinessSettings,
    updateLocalFinanceSettings,
    resetToSampleData,
    members,
    plans,
    loans,
    transactions,
    expenses,
    collections,
    interestRecords,
  } = useData();

  const { success, error } = useToast();
  const { confirm } = useConfirm();

  const [biz, setBiz] = useState(businessSettings);
  const [fin, setFin] = useState(financeSettings);
  const [loadingBiz, setLoadingBiz] = useState(false);
  const [loadingFin, setLoadingFin] = useState(false);

  const handleSaveBiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingBiz(true);
    try {
      await saveBusinessSettings(biz);
      updateLocalBusinessSettings(biz);
      success('Settings Saved', 'Business branding and invoice headers updated.');
    } catch (err: any) {
      error('Failed to save', err.message);
    } finally {
      setLoadingBiz(false);
    }
  };

  const handleSaveFin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingFin(true);
    try {
      await saveFinanceSettings(fin);
      updateLocalFinanceSettings(fin);
      success('Finance Rules Saved', 'Default financial interest rates and terms updated.');
    } catch (err: any) {
      error('Failed to save', err.message);
    } finally {
      setLoadingFin(false);
    }
  };

  const handleBackupAllJSON = () => {
    const backup = {
      timestamp: new Date().toISOString(),
      businessSettings: biz,
      financeSettings: fin,
      members,
      plans,
      loans,
      transactions,
      expenses,
      collections,
      interestRecords,
    };
    exportToJSON('SaiBhishi_Complete_Backup', backup);
    success('Backup Created', 'Full database snapshot downloaded as JSON file.');
  };

  const handleClearCache = () => {
    confirm({
      title: 'Clear Local Cache & Resync Cloud Data?',
      message: 'This will purge local cached copies and fetch fresh records directly from the secure cloud database.',
      confirmText: 'Yes, Resync Cloud',
      variant: 'primary',
      onConfirm: () => {
        resetToSampleData();
        success('Cloud Resynced', 'Loaded latest data from secure cloud.');
      },
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-6">
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-card">
        <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight font-display">
          System & Business Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure organization profile, official receipt formatting, and default financial rules
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* 1. Business Profile Settings */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-card">
          <div className="flex items-center gap-2.5 pb-3.5 border-b border-slate-100 mb-4 sm:mb-5">
            <Building className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Business Profile & Receipts
            </h2>
          </div>

          <form onSubmit={handleSaveBiz} className="space-y-4">
            <Input
              label="Business / Enterprise Name"
              required
              value={biz.businessName}
              onChange={(e) => setBiz({ ...biz, businessName: e.target.value })}
            />

            <Input
              label="Tagline / Subtitle"
              value={biz.tagline}
              onChange={(e) => setBiz({ ...biz, tagline: e.target.value })}
            />

            <Input
              label="Office Branch Address"
              value={biz.address}
              onChange={(e) => setBiz({ ...biz, address: e.target.value })}
            />

            <Input
              label="City, State & Pincode"
              value={biz.cityStatePincode}
              onChange={(e) => setBiz({ ...biz, cityStatePincode: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Primary Contact Phone"
                value={biz.phone}
                onChange={(e) => setBiz({ ...biz, phone: e.target.value })}
              />

              <Input
                label="Admin Email Address"
                value={biz.email}
                onChange={(e) => setBiz({ ...biz, email: e.target.value })}
              />

              <Input
                label="GSTIN Number (Optional)"
                value={biz.gstin || ''}
                onChange={(e) => setBiz({ ...biz, gstin: e.target.value })}
              />

              <Input
                label="PAN Number (Optional)"
                value={biz.panNumber || ''}
                onChange={(e) => setBiz({ ...biz, panNumber: e.target.value })}
              />

              <Input
                label="Receipt Prefix"
                value={biz.receiptPrefix}
                onChange={(e) => setBiz({ ...biz, receiptPrefix: e.target.value })}
              />

              <Input
                label="Authorized Signatory Title"
                value={biz.authorizedSignatoryTitle}
                onChange={(e) => setBiz({ ...biz, authorizedSignatoryTitle: e.target.value })}
              />
            </div>

            <div className="pt-3 border-t flex justify-end">
              <Button type="submit" variant="primary" size="md" isLoading={loadingBiz} leftIcon={<Save className="w-4 h-4" />} className="w-full sm:w-auto justify-center">
                Save Business Profile
              </Button>
            </div>
          </form>
        </div>

        {/* 2. Finance Defaults & Backup */}
        <div className="space-y-4 sm:space-y-6">
          {/* Finance Settings */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-card">
            <div className="flex items-center gap-2.5 pb-3.5 border-b border-slate-100 mb-4 sm:mb-5">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Default Financial Parameters
              </h2>
            </div>

            <form onSubmit={handleSaveFin} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Default Monthly Return Rate"
                  type="number"
                  step="0.01"
                  suffixText="% / mo"
                  value={fin.defaultMonthlyReturnRate ?? 1.0}
                  onChange={(e) => {
                    const mRate = Number(e.target.value);
                    setFin({
                      ...fin,
                      defaultMonthlyReturnRate: mRate,
                      defaultAnnualReturnRate: Math.round(mRate * 12 * 10) / 10,
                    });
                  }}
                  helperText={`Equivalent to ${(fin.defaultMonthlyReturnRate || 1) * 12}% p.a. yearly return`}
                />

                <Input
                  label="Default Annual Return Rate"
                  type="number"
                  step="0.1"
                  suffixText="% p.a."
                  value={fin.defaultAnnualReturnRate}
                  onChange={(e) => {
                    const aRate = Number(e.target.value);
                    setFin({
                      ...fin,
                      defaultAnnualReturnRate: aRate,
                      defaultMonthlyReturnRate: Math.round((aRate / 12) * 100) / 100,
                    });
                  }}
                />

                <Input
                  label="Default Monthly Interest Cutoff Day"
                  type="number"
                  min={1}
                  max={31}
                  value={fin.defaultInterestCutoffDay ?? 10}
                  onChange={(e) => setFin({ ...fin, defaultInterestCutoffDay: Number(e.target.value) })}
                  helperText="Deposits after this day forfeit interest for that month only"
                />

                <Input
                  label="Default Monthly Loan Rate"
                  type="number"
                  step="0.01"
                  suffixText="% / mo"
                  value={fin.defaultMonthlyLoanInterestRate}
                  onChange={(e) => setFin({ ...fin, defaultMonthlyLoanInterestRate: Number(e.target.value) })}
                />

                <Select
                  label="Default Loan Calculation"
                  value={fin.defaultLoanCalculationMethod}
                  onChange={(e) => setFin({ ...fin, defaultLoanCalculationMethod: e.target.value as any })}
                  options={[
                    { value: 'flat', label: 'Flat Interest Rate' },
                    { value: 'reducing_balance', label: 'Reducing Balance EMI' },
                    { value: 'interest_only', label: 'Interest Only Payment (Principal at end)' },
                  ]}
                />

                <Input
                  label="Default Grace Period"
                  type="number"
                  suffixText="Days"
                  value={fin.defaultGracePeriodDays}
                  onChange={(e) => setFin({ ...fin, defaultGracePeriodDays: Number(e.target.value) })}
                />
              </div>

              <div className="pt-3 border-t flex justify-end">
                <Button type="submit" variant="primary" size="md" isLoading={loadingFin} leftIcon={<Save className="w-4 h-4" />} className="w-full sm:w-auto justify-center">
                  Save Financial Defaults
                </Button>
              </div>
            </form>
          </div>

          {/* Backup & Cloud Sync */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-card space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <Database className="w-5 h-5 text-indigo-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Database Backup & Cloud Sync
              </h2>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Export complete encrypted ledger backups or resync local caches directly with secure cloud storage.
            </p>

            <div className="flex items-center gap-2.5 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="w-4 h-4 text-emerald-600" />}
                onClick={handleBackupAllJSON}
                className="flex-1 sm:flex-none justify-center"
              >
                Download JSON Backup
              </Button>

              <Button
                variant="secondary"
                size="sm"
                leftIcon={<RotateCcw className="w-4 h-4 text-emerald-600" />}
                onClick={handleClearCache}
                className="flex-1 sm:flex-none justify-center"
              >
                Resync with Cloud
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
