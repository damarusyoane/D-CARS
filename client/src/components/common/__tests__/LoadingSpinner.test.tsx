import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('h-6 w-6');
    expect(spinner).toHaveClass('text-primary-600');
  });

  it('renders with different sizes', () => {
    const sizes = ['sm', 'md', 'lg', 'xl'] as const;
    sizes.forEach((size) => {
      render(<LoadingSpinner size={size} />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass(`h-${size === 'sm' ? 4 : size === 'md' ? 6 : size === 'lg' ? 8 : 12} w-${size === 'sm' ? 4 : size === 'md' ? 6 : size === 'lg' ? 8 : 12}`);
    });
  });

  it('renders with different colors', () => {
    const colors = ['primary', 'white', 'gray'] as const;
    colors.forEach((color) => {
      render(<LoadingSpinner color={color} />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass(
        color === 'primary'
          ? 'text-primary-600'
          : color === 'white'
          ? 'text-white'
          : 'text-gray-400'
      );
    });
  });

  it('renders with loading text when showText is true', () => {
    render(<LoadingSpinner showText />);
    expect(screen.getByText('common.loading')).toBeInTheDocument();
  });

  it('does not render loading text when showText is false', () => {
    render(<LoadingSpinner showText={false} />);
    expect(screen.queryByText('common.loading')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />);
    const container = screen.getByRole('status').parentElement;
    expect(container).toHaveClass('custom-class');
  });
}); 