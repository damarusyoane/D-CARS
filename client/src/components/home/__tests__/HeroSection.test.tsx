import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HeroSection from '../HeroSection';

describe('HeroSection', () => {
  it('renders the hero section with correct content', () => {
    render(
      <BrowserRouter>
        <HeroSection />
      </BrowserRouter>
    );

    // Check for main title
    expect(screen.getByText('home.hero.title1')).toBeInTheDocument();
    expect(screen.getByText('home.hero.title2')).toBeInTheDocument();

    // Check for description
    expect(screen.getByText('home.hero.description')).toBeInTheDocument();

    // Check for CTA buttons
    expect(screen.getByText('home.hero.cta1')).toBeInTheDocument();
    expect(screen.getByText('home.hero.cta2')).toBeInTheDocument();

    // Check for hero image
    const heroImage = screen.getByAltText('Luxury cars showcase');
    expect(heroImage).toBeInTheDocument();
    expect(heroImage).toHaveAttribute('src', '/hero-image.jpg');
  });

  it('has correct links', () => {
    render(
      <BrowserRouter>
        <HeroSection />
      </BrowserRouter>
    );

    // Check search link
    const searchLink = screen.getByText('home.hero.cta1').closest('a');
    expect(searchLink).toHaveAttribute('href', '/search');

    // Check dashboard link
    const dashboardLink = screen.getByText('home.hero.cta2').closest('a');
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
  });
}); 