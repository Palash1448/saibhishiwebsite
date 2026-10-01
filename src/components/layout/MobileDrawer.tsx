import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden select-none">
      {/* Material 3 Android Scrim Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Android Navigation Drawer Panel (Slides from Left with rounded-r-3xl) */}
      <div
        className="fixed inset-y-0 left-0 w-[82vw] max-w-[320px] sm:max-w-[340px] bg-slate-900 shadow-[10px_0_36px_rgba(0,0,0,0.6)] z-10 flex flex-col rounded-r-3xl overflow-hidden border-r border-slate-800/90 animate-slide-in-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
      >
        <Sidebar onCloseMobile={onClose} isMobile={true} />
      </div>
    </div>
  );
};

