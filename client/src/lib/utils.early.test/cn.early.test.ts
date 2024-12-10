
// Unit tests for: cn


import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cn } from '../utils';

// Import necessary modules


// Import necessary modules
// Mock ClassValue type
type MockClassValue = {
  className: string;
  condition?: boolean;
};

// Mock implementations for clsx and twMerge
jest.mock("clsx", () => ({
  clsx: jest.fn(),
}));

jest.mock("tailwind-merge", () => ({
  twMerge: jest.fn(),
}));

// Import the cn function
describe('cn() cn method', () => {
  beforeEach(() => {
    // Reset mocks before each test
    (clsx as jest.Mock).mockReset();
    (twMerge as jest.Mock).mockReset();
  });

  describe('Happy paths', () => {
    it('should merge class names correctly', () => {
      // Test description: Ensure cn merges class names correctly when given valid inputs.
      const mockInput1: MockClassValue = { className: 'class1' } as any;
      const mockInput2: MockClassValue = { className: 'class2' } as any;

      (clsx as jest.Mock).mockReturnValue('class1 class2' as any);
      (twMerge as jest.Mock).mockReturnValue('class1 class2' as any);

      const result = cn(mockInput1, mockInput2);

      expect(clsx).toHaveBeenCalledWith([mockInput1, mockInput2]);
      expect(twMerge).toHaveBeenCalledWith('class1 class2');
      expect(result).toBe('class1 class2');
    });

    it('should handle conditional class names', () => {
      // Test description: Ensure cn handles conditional class names based on truthy conditions.
      const mockInput1: MockClassValue = { className: 'class1', condition: true } as any;
      const mockInput2: MockClassValue = { className: 'class2', condition: false } as any;

      (clsx as jest.Mock).mockReturnValue('class1' as any);
      (twMerge as jest.Mock).mockReturnValue('class1' as any);

      const result = cn(mockInput1, mockInput2);

      expect(clsx).toHaveBeenCalledWith([mockInput1, mockInput2]);
      expect(twMerge).toHaveBeenCalledWith('class1');
      expect(result).toBe('class1');
    });
  });

  describe('Edge cases', () => {
    it('should return an empty string when no inputs are provided', () => {
      // Test description: Ensure cn returns an empty string when no inputs are provided.
      (clsx as jest.Mock).mockReturnValue('' as any);
      (twMerge as jest.Mock).mockReturnValue('' as any);

      const result = cn();

      expect(clsx).toHaveBeenCalledWith([]);
      expect(twMerge).toHaveBeenCalledWith('');
      expect(result).toBe('');
    });

    it('should handle null and undefined inputs gracefully', () => {
      // Test description: Ensure cn handles null and undefined inputs without errors.
      const mockInput1: MockClassValue = { className: 'class1' } as any;
      const mockInput2: MockClassValue = null as any;
      const mockInput3: MockClassValue = undefined as any;

      (clsx as jest.Mock).mockReturnValue('class1' as any);
      (twMerge as jest.Mock).mockReturnValue('class1' as any);

      const result = cn(mockInput1, mockInput2, mockInput3);

      expect(clsx).toHaveBeenCalledWith([mockInput1, mockInput2, mockInput3]);
      expect(twMerge).toHaveBeenCalledWith('class1');
      expect(result).toBe('class1');
    });
  });
});

// End of unit tests for: cn
