import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MemberFormModal } from '../../components/members/MemberFormModal';

export const AddMemberPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <MemberFormModal
      isOpen={true}
      onClose={() => navigate('/members')}
      onSuccess={() => navigate('/members')}
    />
  );
};
