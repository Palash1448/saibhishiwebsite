import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import type { Member } from '../../types/member';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { createMember, updateMember } from '../../services/memberService';
import { UserPlus, UserCheck, User, Phone, MapPin, CreditCard } from 'lucide-react';

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
  const { refreshAll } = useData();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (memberToEdit) {
      setFullName(memberToEdit.fullName || '');
      setMobile(memberToEdit.mobile || '');
      setAddress(memberToEdit.address || '');
      setAadharNumber(memberToEdit.aadharNumber || memberToEdit.idProofRef || '');
    } else {
      setFullName('');
      setMobile('');
      setAddress('');
      setAadharNumber('');
    }
    setErrors({});
  }, [memberToEdit, isOpen]);

  // Format Aadhaar number with spacing (XXXX XXXX XXXX)
  const handleAadhaarChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '').slice(0, 12);
    const formatted = digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ');
    setAadharNumber(formatted);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) {
      errs.fullName = 'Member name is required';
    }

    const cleanPhone = mobile.replace(/\D/g, '');
    if (!cleanPhone) {
      errs.mobile = 'Phone number is required';
    } else if (cleanPhone.length !== 10) {
      errs.mobile = 'Please enter a valid 10-digit phone number';
    }

    if (!address.trim()) {
      errs.address = 'Address is required';
    }

    const cleanAadhaar = aadharNumber.replace(/\s+/g, '');
    if (!cleanAadhaar) {
      errs.aadharNumber = 'Aadhaar number is required';
    } else if (!/^\d{12}$/.test(cleanAadhaar)) {
      errs.aadharNumber = 'Please enter a valid 12-digit Aadhaar number';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const cleanPhone = mobile.replace(/\D/g, '');
      const cleanAadhaar = aadharNumber.trim();

      if (memberToEdit) {
        const updated = await updateMember(memberToEdit.id, {
          fullName: fullName.trim(),
          mobile: cleanPhone,
          address: address.trim(),
          aadharNumber: cleanAadhaar,
          idProofType: 'Aadhaar',
          idProofRef: cleanAadhaar,
        });

        await refreshAll();
        success('Member Updated', `${fullName}'s details updated successfully.`);
        if (onSuccess) onSuccess(updated);
        onClose();
      } else {
        const created = await createMember({
          memberCode: '',
          fullName: fullName.trim(),
          mobile: cleanPhone,
          address: address.trim(),
          aadharNumber: cleanAadhaar,
          idProofType: 'Aadhaar',
          idProofRef: cleanAadhaar,
          joiningDate: new Date().toISOString().slice(0, 10),
          status: 'active',
        });

        await refreshAll();
        success('Member Registered', `${fullName} registered with ID ${created.memberCode}`);
        if (onSuccess) onSuccess(created);
        onClose();
      }
    } catch (err: any) {
      error('Registration Failed', err.message || 'An error occurred while saving member details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={memberToEdit ? 'Edit Member Details' : 'Member Registration'}
      subtitle={memberToEdit ? `Member Code: ${memberToEdit.memberCode}` : 'Enter member details for registration'}
      size="md"
      icon={memberToEdit ? <UserCheck className="w-5 h-5 text-emerald-600" /> : <UserPlus className="w-5 h-5 text-emerald-600" />}
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
            {memberToEdit ? 'Save Changes' : 'Register Member'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <Input
            label="Full Name"
            placeholder="e.g. Ramesh Baburao Patil"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={errors.fullName}
            leftIcon={<User className="w-4 h-4 text-slate-400" />}
          />
        </div>

        {/* Phone Number */}
        <div>
          <Input
            label="Phone Number"
            type="tel"
            placeholder="10-digit mobile number"
            required
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            error={errors.mobile}
            leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Full Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative rounded-xl border border-slate-200 bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
            <div className="pointer-events-none absolute left-3.5 top-3 text-slate-400">
              <MapPin className="w-4 h-4" />
            </div>
            <textarea
              rows={3}
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House/Shop No, Street, Village/City, Pincode"
              className="w-full bg-transparent py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          {errors.address && (
            <p className="mt-1 text-xs text-rose-500">{errors.address}</p>
          )}
        </div>

        {/* Aadhaar Number */}
        <div>
          <Input
            label="Aadhaar Number"
            placeholder="12-digit Aadhaar Number (XXXX XXXX XXXX)"
            required
            value={aadharNumber}
            onChange={(e) => handleAadhaarChange(e.target.value)}
            error={errors.aadharNumber}
            helperText="12-digit Government UIDAI identity number"
            leftIcon={<CreditCard className="w-4 h-4 text-slate-400" />}
          />
        </div>
      </form>
    </Modal>
  );
};
