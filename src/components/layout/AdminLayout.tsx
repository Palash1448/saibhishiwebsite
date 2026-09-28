import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileDrawer } from './MobileDrawer';
import { MobileBottomNav } from './MobileBottomNav';
import { GlobalSearchModal } from '../common/GlobalSearchModal';

// Modals
import { MemberFormModal } from '../members/MemberFormModal';
import { RecordCollectionModal } from '../collections/RecordCollectionModal';
import { IssueLoanModal } from '../loans/IssueLoanModal';
import { RecordRepaymentModal } from '../loans/RecordRepaymentModal';
import { AddExpenseModal } from '../expenses/AddExpenseModal';
import { ReceiptModal } from '../receipts/ReceiptModal';
import { ReceiptData } from '../../utils/receiptGenerator';

export const AdminLayout: React.FC = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);

  // Quick Action Modal states
  const [activeActionModal, setActiveActionModal] = useState<string | null>(null);

  // Generated receipt viewing modal
  const [currentReceipt, setCurrentReceipt] = useState<ReceiptData | null>(null);

  const handleOpenQuickAction = (actionType: string) => {
    setActiveActionModal(actionType);
  };

  const handleCloseModal = () => {
    setActiveActionModal(null);
  };

  const handleShowReceipt = (data: ReceiptData) => {
    setCurrentReceipt(data);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header
          onOpenMobileMenu={() => setMobileDrawerOpen(true)}
          onOpenGlobalSearch={() => setGlobalSearchOpen(true)}
          onOpenQuickAction={handleOpenQuickAction}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          <Outlet context={{ onOpenQuickAction: handleOpenQuickAction, onShowReceipt: handleShowReceipt }} />
        </main>

        <MobileBottomNav
          onOpenMore={() => setMobileDrawerOpen(true)}
          onOpenQuickAction={handleOpenQuickAction}
        />
      </div>

      {/* Global Search Dialog */}
      <GlobalSearchModal
        isOpen={globalSearchOpen}
        onClose={() => setGlobalSearchOpen(false)}
      />

      {/* Quick Action Modals */}
      {activeActionModal === 'add-member' && (
        <MemberFormModal
          isOpen={true}
          onClose={handleCloseModal}
        />
      )}

      {activeActionModal === 'record-collection' && (
        <RecordCollectionModal
          isOpen={true}
          onClose={handleCloseModal}
          onSuccessReceipt={handleShowReceipt}
        />
      )}

      {activeActionModal === 'issue-loan' && (
        <IssueLoanModal
          isOpen={true}
          onClose={handleCloseModal}
        />
      )}

      {activeActionModal === 'record-repayment' && (
        <RecordRepaymentModal
          isOpen={true}
          onClose={handleCloseModal}
          onSuccessReceipt={handleShowReceipt}
        />
      )}

      {activeActionModal === 'add-expense' && (
        <AddExpenseModal
          isOpen={true}
          onClose={handleCloseModal}
        />
      )}

      {/* Printable / Downloadable Official Receipt Modal */}
      {currentReceipt && (
        <ReceiptModal
          isOpen={Boolean(currentReceipt)}
          onClose={() => setCurrentReceipt(null)}
          receipt={currentReceipt}
        />
      )}
    </div>
  );
};
