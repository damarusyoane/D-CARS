import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FeaturedCars from '../FeaturedCars';
import { supabase } from '../../../lib/supabase';
import { vi } from 'vitest';

// Mock the Supabase query
vi.mocked(supabase.from).mockReturnValue({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  then: vi.fn().mockResolvedValue({
    data: [
      {
        id: '1',
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        price: 25000,
        mileage: 50000,
        condition: 'used',
        location: 'New York',
        images: ['/car1.jpg'],
        status: 'active',
      },
    ],
    error: null,
  }),
} as any);

describe('FeaturedCars', () => {
  it('renders loading state initially', () => {
    render(
      <BrowserRouter>
        <FeaturedCars />
      </BrowserRouter>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders featured cars after loading', async () => {
    render(
      <BrowserRouter>
        <FeaturedCars />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Check for section title
      expect(screen.getByText('home.featured.title')).toBeInTheDocument();
      expect(screen.getByText('home.featured.description')).toBeInTheDocument();

      // Check for car details
      expect(screen.getByText('2020 Toyota Camry')).toBeInTheDocument();
      expect(screen.getByText('New York')).toBeInTheDocument();
      expect(screen.getByText('$25,000')).toBeInTheDocument();
      expect(screen.getByText('50,000 miles')).toBeInTheDocument();
      expect(screen.getByText('used')).toBeInTheDocument();

      // Check for view all button
      expect(screen.getByText('home.featured.viewAll')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    // Mock API error
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      then: vi.fn().mockRejectedValue(new Error('API Error')),
    } as any);

    render(
      <BrowserRouter>
        <FeaturedCars />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('2020 Toyota Camry')).not.toBeInTheDocument();
    });
  });
}); 