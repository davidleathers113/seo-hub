
// Unit tests for: ContentReview

import { fireEvent, render, screen } from '@testing-library/react';
import { ContentReview } from '../ContentReview';
import "@testing-library/jest-dom";

describe('ContentReview() ContentReview method', () => {
  const mockOnUpdateContent = jest.fn();

  const mockContent = [
    {
      id: 'section-1',
      content: 'This is a test content section.',
      status: 'pending',
      comments: [],
      version: 1,
    },
    {
      id: 'section-2',
      content: 'Another content section for testing.',
      status: 'approved',
      comments: [],
      version: 1,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Paths', () => {
    it('should render content sections correctly', () => {
      // Test to ensure content sections are rendered correctly
      render(<ContentReview content={mockContent} onUpdateContent={mockOnUpdateContent} />);
      expect(screen.getByText('section-1')).toBeInTheDocument();
      expect(screen.getByText('section-2')).toBeInTheDocument();
    });

    it('should allow adding a comment to a section', () => {
      // Test to ensure comments can be added to a section
      render(<ContentReview content={mockContent} onUpdateContent={mockOnUpdateContent} />);
      fireEvent.click(screen.getByText('section-1'));
      fireEvent.change(screen.getByPlaceholderText('Add a comment...'), { target: { value: 'New comment' } });
      fireEvent.click(screen.getByRole('button', { name: /thumbs up/i }));
      expect(mockOnUpdateContent).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          id: 'section-1',
          comments: expect.arrayContaining([
            expect.objectContaining({ content: 'New comment' })
          ])
        })
      ]));
    });

    it('should update the status of a section', () => {
      // Test to ensure the status of a section can be updated
      render(<ContentReview content={mockContent} onUpdateContent={mockOnUpdateContent} />);
      fireEvent.click(screen.getByText('section-1'));
      fireEvent.click(screen.getByRole('button', { name: /check circle/i }));
      expect(mockOnUpdateContent).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          id: 'section-1',
          status: 'approved'
        })
      ]));
    });
  });

  describe('Edge Cases', () => {
    it('should not add a comment if the input is empty', () => {
      // Test to ensure no comment is added if the input is empty
      render(<ContentReview content={mockContent} onUpdateContent={mockOnUpdateContent} />);
      fireEvent.click(screen.getByText('section-1'));
      fireEvent.click(screen.getByRole('button', { name: /thumbs up/i }));
      expect(mockOnUpdateContent).not.toHaveBeenCalled();
    });

    it('should handle sections with long content gracefully', () => {
      // Test to ensure sections with long content are handled correctly
      const longContent = 'A'.repeat(150);
      const contentWithLongSection = [{ ...mockContent[0], content: longContent }];
      render(<ContentReview content={contentWithLongSection} onUpdateContent={mockOnUpdateContent} />);
      expect(screen.getByText(`${longContent.slice(0, 100)}...`)).toBeInTheDocument();
    });

    it('should handle no sections gracefully', () => {
      // Test to ensure the component handles no sections gracefully
      render(<ContentReview content={[]} onUpdateContent={mockOnUpdateContent} />);
      expect(screen.queryByText('section-1')).not.toBeInTheDocument();
    });
  });
});

// End of unit tests for: ContentReview
