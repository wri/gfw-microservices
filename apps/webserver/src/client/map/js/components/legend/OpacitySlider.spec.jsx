import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OpacitySlider from './OpacitySlider';

describe('OpacitySlider', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('should render the opacity icon button', () => {
    const onChange = jest.fn();
    render(<OpacitySlider value={0.5} onChange={onChange} />);

    expect(screen.getByRole('button', { name: /adjust opacity/i })).toBeInTheDocument();
  });

  it('should open popup when icon is clicked', async () => {
    const onChange = jest.fn();
    render(<OpacitySlider value={0.5} onChange={onChange} />);

    const button = screen.getByRole('button', { name: /adjust opacity/i });
    await user.click(button);

    expect(screen.getByText(/opacity/i)).toBeInTheDocument();
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('should display correct percentage value', async () => {
    const onChange = jest.fn();
    render(<OpacitySlider value={0.75} onChange={onChange} />);

    const button = screen.getByRole('button', { name: /adjust opacity/i });
    await user.click(button);

    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('should convert 0-1 range to 0-100 for display', async () => {
    const onChange = jest.fn();
    render(<OpacitySlider value={0.33} onChange={onChange} />);

    const button = screen.getByRole('button', { name: /adjust opacity/i });
    await user.click(button);

    const slider = screen.getByRole('slider');
    expect(slider.value).toBe('33');
  });

  it('should call onChange with 0-1 range when slider changes', async () => {
    const onChange = jest.fn();
    render(<OpacitySlider value={0.5} onChange={onChange} />);

    const button = screen.getByRole('button', { name: /adjust opacity/i });
    await user.click(button);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '80' } });

    expect(onChange).toHaveBeenCalledWith(0.8);
  });

  it('should close popup when clicking outside', async () => {
    const onChange = jest.fn();
    render(
      <div>
        <OpacitySlider value={0.5} onChange={onChange} />
        <div data-testid="outside">Outside element</div>
      </div>
    );

    const button = screen.getByRole('button', { name: /adjust opacity/i });
    await user.click(button);

    expect(screen.getByText(/opacity/i)).toBeInTheDocument();

    const outside = screen.getByTestId('outside');
    fireEvent.mouseDown(outside);

    await waitFor(() => {
      expect(screen.queryByText(/opacity/i)).not.toBeInTheDocument();
    });
  });

  it('should not open when disabled', async () => {
    const onChange = jest.fn();
    render(<OpacitySlider value={0.5} onChange={onChange} disabled />);

    const button = screen.getByRole('button', { name: /adjust opacity/i });
    await user.click(button);

    expect(screen.queryByText(/opacity/i)).not.toBeInTheDocument();
  });

  it('should disable slider input when disabled prop is true', async () => {
    const onChange = jest.fn();
    render(<OpacitySlider value={0.5} onChange={onChange} />);

    const button = screen.getByRole('button', { name: /adjust opacity/i });
    await user.click(button);

    const slider = screen.getByRole('slider');
    expect(slider).not.toBeDisabled();
  });

  it('should have proper ARIA attributes on SVG', () => {
    const onChange = jest.fn();
    const { container } = render(<OpacitySlider value={0.5} onChange={onChange} />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('should display 0% and current percentage labels', async () => {
    const onChange = jest.fn();
    render(<OpacitySlider value={0.65} onChange={onChange} />);

    const button = screen.getByRole('button', { name: /adjust opacity/i });
    await user.click(button);

    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('65%')).toBeInTheDocument();
  });

  it('should handle edge case of 0% opacity', async () => {
    const onChange = jest.fn();
    render(<OpacitySlider value={0} onChange={onChange} />);

    const button = screen.getByRole('button', { name: /adjust opacity/i });
    await user.click(button);

    // Use getAllByText since there are two '0%' elements (min label and current value)
    const zeroPercentElements = screen.getAllByText('0%');
    expect(zeroPercentElements.length).toBe(2);
    const slider = screen.getByRole('slider');
    expect(slider.value).toBe('0');
  });

  it('should handle edge case of 100% opacity', async () => {
    const onChange = jest.fn();
    render(<OpacitySlider value={1} onChange={onChange} />);

    const button = screen.getByRole('button', { name: /adjust opacity/i });
    await user.click(button);

    expect(screen.getByText('100%')).toBeInTheDocument();
    const slider = screen.getByRole('slider');
    expect(slider.value).toBe('100');
  });

  it('should render slider with correct value', async () => {
    const onChange = jest.fn();
    render(<OpacitySlider value={0.6} onChange={onChange} />);

    const button = screen.getByRole('button', { name: /adjust opacity/i });
    await user.click(button);

    const slider = screen.getByRole('slider');
    expect(slider.value).toBe('60');
    expect(screen.getByText('60%')).toBeInTheDocument();
  });
});
