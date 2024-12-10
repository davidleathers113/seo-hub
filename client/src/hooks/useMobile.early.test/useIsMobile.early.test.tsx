
// Unit tests for: useIsMobile

import { act, renderHook } from '@testing-library/react-hooks';
import { useIsMobile } from '../useMobile';



describe('useIsMobile() useIsMobile method', () => {
  // Mock the window.matchMedia function
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query.includes('max-width: 767px'),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  describe('Happy Paths', () => {
    it('should return true when window width is less than MOBILE_BREAKPOINT', () => {
      // Simulate a mobile screen
      window.innerWidth = 767;

      const { result } = renderHook(() => useIsMobile());

      expect(result.current).toBe(true);
    });

    it('should return false when window width is greater than or equal to MOBILE_BREAKPOINT', () => {
      // Simulate a desktop screen
      window.innerWidth = 768;

      const { result } = renderHook(() => useIsMobile());

      expect(result.current).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle window resize events correctly', () => {
      const { result } = renderHook(() => useIsMobile());

      // Initial state
      expect(result.current).toBe(false);

      // Simulate a resize to mobile
      act(() => {
        window.innerWidth = 767;
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current).toBe(true);

      // Simulate a resize back to desktop
      act(() => {
        window.innerWidth = 768;
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current).toBe(false);
    });

    it('should clean up event listeners on unmount', () => {
      const addEventListenerSpy = jest.fn();
      const removeEventListenerSpy = jest.fn();

      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query.includes('max-width: 767px'),
        addEventListener: addEventListenerSpy,
        removeEventListener: removeEventListenerSpy,
      }));

      const { unmount } = renderHook(() => useIsMobile());

      expect(addEventListenerSpy).toHaveBeenCalledTimes(1);

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
    });
  });
});

// End of unit tests for: useIsMobile
