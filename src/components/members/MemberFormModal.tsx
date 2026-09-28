import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import type { Member, MemberStatus } from '../../types/member';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { createMember, updateMember } from '../../services/memberService';
import { enrollMemberInPlan } from '../../services/bhishiService';
import { INDIAN_STATES } from '../../constants/indianStates';
import { UserPlus, UserCheck } from 'lucide-react';

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit?: Member | null;
  onSuccess?: (member: Member) => void;
}

export const MemberFormModal: React.FC<MemberFormModalProps> = ({
  isOpen,
  onClose,
  memberToEdit,
  onSuccess,
}) => {
  const { plans, refreshAll } = useData();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [alternateMobile, setAlternateMobile] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [villageCity, setVillageCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [idProofType, setIdProofType] = useState<'Aadhaar' | 'PAN' | 'Voter ID' | 'Driving License'>('Aadhaar');
  const [idProofRef, setIdProofRef] = useState('');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState<number>(5000);
  const [paymentDueDay, setPaymentDueDay] = useState<number>(10);
  const [status, setStatus] = useState<MemberStatus>('active');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (memberToEdit) {
      setFullName(memberToEdit.fullName);
      setMobile(memberToEdit.mobile);
      setAlternateMobile(memberToEdit.alternateMobile || '');
      setEmail(memberToEdit.email || '');
      setDob(memberToEdit.dob || '');
      setAddress(memberToEdit.address);
      setVillageCity(memberToEdit.villageCity);
      setPincode(memberToEdit.pincode);
      setIdProofType(memberToEdit.idProofType || 'Aadhaar');
      setIdProofRef(memberToEdit.idProofRef || '');
      setJoiningDate(memberToEdit.joiningDate);
      setSelectedPlanId(memberToEdit.bhishiPlanId || '');
      setMonthlyContribution(memberToEdit.monthlyContribution || 5000);
      setPaymentDueDay(memberToEdit.paymentDueDay || 10);
      setStatus(memberToEdit.status);
      setNotes(memberToEdit.notes || '');
    } else {
      // Reset defaults
      setFullName('');
      setMobile('');
      setAlternateMobile('');
      setEmail('');
      setDob('');
      setAddress('');
      setVillageCity('');
      setPincode('');
      setIdProofRef('');
      setJoiningDate(new Date().toISOString().slice(0, 10));
      setSelectedPlanId(plans[0]?.id || '');
      setMonthlyContribution(plans[0]?.monthlyContribution || 5000);
      setPaymentDueDay(plans[0]?.paymentDueDay || 10);
      setStatus('active');
      setNotes('');
    }
    setErrors({});
  }, [memberToEdit, plans, isOpen]);

  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId);
    const selected = plans.find((p) => p.id === planId);
    if (selected) {
      setMonthlyContribution(selected.monthlyContribution);
      setPaymentDueDay(selected.paymentDueDay);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Member full name is required';
    if (!mobile.trim()) {
      errs.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(mobile.replace(/\s+/g, ''))) {
      errs.mobile = 'Please enter a valid 10-digit mobile number';
    }
    if (monthlyContribution <= 0) {
      errs.monthlyContribution = 'Monthly contribution must be greater than ₹0';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const selectedPlan = plans.find((p) => p.id === selectedPlanId);

      if (memberToEdit) {
        const updated = await updateMember(memberToEdit.id, {
          fullName,
          mobile,
          alternateMobile,
          email,
          dob,
          address,
          villageCity,
          pincode,
          idProofType,
          idProofRef,
          joiningDate,
          bhishiPlanId: selectedPlanId || undefined,
          bhishiPlanName: selectedPlan?.planName || undefined,
          monthlyContribution,
          paymentDueDay,
          status,
          notes,
        });

        await refreshAll();
        success('Member Updated', `${fullName}'s details updated successfully.`);
        if (onSuccess) onSuccess(updated);
        onClose();
      } else {
        const created = await createMember({
          memberCode: '',
          fullName,
          mobile,
          alternateMobile,
          email,
          dob,
          address,
          villageCity,
          pincode,
          idProofType,
          idProofRef,
          joiningDate,
          bhishiPlanId: selectedPlanId || undefined,
          bhishiPlanName: selectedPlan?.planName || undefined,
          monthlyContribution,
          paymentDueDay,
          status,
          notes,
        });

        // If enrolled in a plan, enroll member
        if (selectedPlan) {
          await enrollMemberInPlan(
            created.id,
            created.fullName,
            created.memberCode,
            selectedPlan,
            joiningDate
          );
        }

        await refreshAll();
        success('Member Added', `${fullName} enrolled with Member ID ${created.memberCode}`);
        if (onSuccess) onSuccess(created);
        onClose();
      }
    } catch (err: any) {
      error('Failed to save member', err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={memberToEdit ? 'Edit Member Profile' : 'Add New Member'}
      subtitle={memberToEdit ? `Member ID: ${memberToEdit.memberCode}` : 'Fill in customer and membership details'}
      size="xl"
      icon={memberToEdit ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            isLoading={loading}
            onClick={handleSubmit}
          >
            {memberToEdit ? 'Save Changes' : 'Enroll Member'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal & Contact */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 pb-1 border-b border-slate-100">
            1. Personal & Contact Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Full Name"
                placeholder="e.g. Ramesh Baburao Patil"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={errors.fullName}
              />
            </div>

            <div>
              <Input
                label="Mobile Number"
                type="tel"
                placeholder="10-digit mobile"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                error={errors.mobile}
              />
            </div>

            <div>
              <Input
                label="Alternate Mobile"
                type="tel"
                placeholder="Optional secondary phone"
                value={alternateMobile}
                onChange={(e) => setAlternateMobile(e.target.value)}
              />
            </div>

            <div>
              <Input
                label="Email Address"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <Input
                label="Date of Birth"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Address & ID Proof */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 pb-1 border-b border-slate-100">
            2. Address & Identity Reference (KYC)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Address / Landmark / Street"
                placeholder="Shop / House No, Street name"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div>
              <Input
                label="Village / City"
                placeholder="e.g. Nagpur / Wardha"
                value={villageCity}
                onChange={(e) => setVillageCity(e.target.value)}
              />
            </div>

            <div>
              <Input
                label="Pincode"
                placeholder="e.g. 440010"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />
            </div>

            <div>
              <Select
                label="ID Proof Type"
                value={idProofType}
                onChange={(e) => setIdProofType(e.target.value as any)}
                options={[
                  { value: 'Aadhaar', label: 'Aadhaar Card' },
                  { value: 'PAN', label: 'PAN Card' },
                  { value: 'Voter ID', label: 'Voter ID' },
                  { value: 'Driving License', label: 'Driving License' },
                ]}
              />
            </div>

            <div>
              <Input
                label="ID Number / Reference"
                placeholder="Masked Aadhaar / PAN"
                value={idProofRef}
                onChange={(e) => setIdProofRef(e.target.value)}
                helperText="Stored securely in encrypted database"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Bhishi Plan & Membership */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 pb-1 border-b border-slate-100">
            3. Bhishi Plan & Financial Setup
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Select
                label="Bhishi Savings Plan"
                value={selectedPlanId}
                onChange={(e) => handlePlanChange(e.target.value)}
                options={[
                  { value: '', label: '-- Select Bhishi Plan --' },
                  ...plans.map((p) => ({
                    value: p.id,
                    label: `${p.planName} (₹${p.monthlyContribution}/mo)`,
                  })),
                ]}
              />
            </div>

            <div>
              <Input
                label="Monthly Contribution (₹)"
                type="number"
                prefixText="₹"
                required
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                error={errors.monthlyContribution}
              />
            </div>

            <div>
              <Input
                label="Payment Due Day of Month"
                type="number"
                min={1}
                max={31}
                value={paymentDueDay}
                onChange={(e) => setPaymentDueDay(Number(e.target.value))}
                helperText="e.g. 10th of every month"
              />
            </div>

            <div>
              <Input
                label="Joining Date"
                type="date"
                required
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
              />
            </div>

            <div>
              <Select
                label="Membership Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as MemberStatus)}
                options={[
                  { value: 'active', label: 'Active Member' },
                  { value: 'inactive', label: 'Inactive / On-Hold' },
                  { value: 'completed', label: 'Completed Plan' },
                  { value: 'suspended', label: 'Suspended' },
                ]}
              />
            </div>

            <div className="sm:col-span-2 md:col-span-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Admin Notes / Verification Remarks
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add special notes about business background, guarantor, or payment preference..."
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};
