import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IssueLoanModal } from '../../components/loans/IssueLoanModal';

export const IssueLoanPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <IssueLoanModal
      isOpen={true}
      onClose={() => navigate('/loans')}
      onSuccess={() => navigate('/loans')}
    />
  );
};
