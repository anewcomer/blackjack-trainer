import { useEffect, useRef } from 'react';

/**
 * Custom hook to create a focus trap for modals and dialogs
 * This improves accessibility by keeping focus within the modal when it's open
 * 
 * @param isActive Whether the focus trap is active
 * @param rootElementRef Reference to the root element to trap focus within
 * @returns void
 */
export const useFocusTrap = (isActive: boolean, rootElementRef: React.RefObject<HTMLElement>): void => {
  // Reference to store the element that had focus before the trap was activated
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !rootElementRef.current) {
      return;
    }

    // Store the currently focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Find all focusable elements within the root element
    const rootElement = rootElementRef.current;
    const focusableElements = rootElement.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    // If no focusable elements are found, return
    if (focusableElements.length === 0) {
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus the first element when the trap is activated
    firstElement.focus();

    // Handle tab and shift+tab to cycle through elements
    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      // If shift+tab on the first element, move to the last element
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } 
      // If tab on the last element, move to the first element
      else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    // Add event listener for keyboard navigation
    document.addEventListener('keydown', handleTabKey);

    // Clean up when the component unmounts or the trap is deactivated
    return () => {
      document.removeEventListener('keydown', handleTabKey);
      // Restore focus to the element that had focus before the trap was activated
      if (previousFocusRef.current && isActive) {
        previousFocusRef.current.focus();
      }
    };
  }, [isActive, rootElementRef]);
};

export default useFocusTrap;
