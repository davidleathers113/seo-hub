
// Unit tests for: Pagination

import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/react';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../pagination';



describe('Pagination() Pagination method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    test('renders Pagination component with default props', () => {
      // This test checks if the Pagination component renders correctly with default props.
      const { getByRole } = render(<Pagination />);
      expect(getByRole('navigation')).toBeInTheDocument();
    });

    test('renders PaginationContent with children', () => {
      // This test checks if the PaginationContent component renders its children correctly.
      const { getByRole } = render(
        <PaginationContent>
          <li>Page 1</li>
        </PaginationContent>
      );
      expect(getByRole('list')).toBeInTheDocument();
    });

    test('renders PaginationItem with children', () => {
      // This test checks if the PaginationItem component renders its children correctly.
      const { getByText } = render(
        <PaginationItem>
          <a href="#">1</a>
        </PaginationItem>
      );
      expect(getByText('1')).toBeInTheDocument();
    });

    test('renders active PaginationLink', () => {
      // This test checks if the PaginationLink component renders correctly when active.
      const { getByRole } = render(
        <PaginationLink isActive href="#">
          1
        </PaginationLink>
      );
      expect(getByRole('link')).toHaveAttribute('aria-current', 'page');
    });

    test('renders PaginationPrevious with correct label', () => {
      // This test checks if the PaginationPrevious component renders with the correct label.
      const { getByLabelText } = render(<PaginationPrevious />);
      expect(getByLabelText('Go to previous page')).toBeInTheDocument();
    });

    test('renders PaginationNext with correct label', () => {
      // This test checks if the PaginationNext component renders with the correct label.
      const { getByLabelText } = render(<PaginationNext />);
      expect(getByLabelText('Go to next page')).toBeInTheDocument();
    });

    test('renders PaginationEllipsis with hidden text', () => {
      // This test checks if the PaginationEllipsis component renders with hidden text for accessibility.
      const { getByText } = render(<PaginationEllipsis />);
      expect(getByText('More pages')).toHaveClass('sr-only');
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    test('renders Pagination with additional className', () => {
      // This test checks if the Pagination component accepts and applies additional class names.
      const { getByRole } = render(<Pagination className="extra-class" />);
      expect(getByRole('navigation')).toHaveClass('extra-class');
    });

    test('renders PaginationLink without href', () => {
      // This test checks if the PaginationLink component renders correctly without an href attribute.
      const { getByRole } = render(<PaginationLink>1</PaginationLink>);
      expect(getByRole('link')).not.toHaveAttribute('href');
    });

    test('renders PaginationItem with no children', () => {
      // This test checks if the PaginationItem component renders correctly even when no children are provided.
      const { container } = render(<PaginationItem />);
      expect(container.firstChild).toBeInTheDocument();
    });

    test('renders PaginationEllipsis with additional props', () => {
      // This test checks if the PaginationEllipsis component accepts and applies additional props.
      const { getByRole } = render(<PaginationEllipsis data-testid="ellipsis" />);
      expect(getByRole('presentation')).toHaveAttribute('data-testid', 'ellipsis');
    });
  });
});

// End of unit tests for: Pagination
