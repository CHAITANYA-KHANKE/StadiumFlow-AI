import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock sub-pages to keep things simple and fast
vi.mock('../pages/LandingPage', () => ({
  default: () => <div data-testid="landing-page">Landing Page</div>,
}));
vi.mock('../pages/FanDashboard', () => ({
  default: () => <div data-testid="fan-dashboard">Fan Dashboard</div>,
}));
vi.mock('../pages/OperatorDashboard', () => ({
  default: () => <div data-testid="operator-dashboard">Operator Dashboard</div>,
}));

describe('App Component Smoke Test', () => {
  it('renders the landing page by default', () => {
    render(<App />);
    const landing = screen.getByTestId('landing-page');
    expect(landing).toBeInTheDocument();
  });
});
