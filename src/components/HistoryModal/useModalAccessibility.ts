import { useRef, useEffect } from 'react';
import useFocusTrap from '../../hooks/useFocusTrap';

interface UseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Hook for handling modal accessibility and keyboard navigation
 */
export const useModalAccessibility = ({ isOpen, onClose }: UseModalProps) => {
  // Reference to the dialog content for focus trap
  const dialogRef = useRef<HTMLDivElement>(null);
  
  // Reference to focus on close button when modal opens
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Apply focus trap to dialog
  useFocusTrap(isOpen, dialogRef);

  // Focus the close button when modal opens
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (isOpen && event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  return {
    dialogRef,
    closeButtonRef
  };
};
