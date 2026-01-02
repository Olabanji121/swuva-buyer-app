import {
  formatPrice,
  formatDiscount,
  formatDistance,
  formatTimeWindow,
  debounce,
  cn,
} from '@/lib/utils';

describe('formatPrice', () => {
  it('formats price with AUD currency symbol', () => {
    expect(formatPrice(10)).toBe('$10.00');
    expect(formatPrice(5.99)).toBe('$5.99');
    expect(formatPrice(0)).toBe('$0.00');
  });

  it('handles large numbers', () => {
    expect(formatPrice(1000)).toBe('$1,000.00');
    expect(formatPrice(999.99)).toBe('$999.99');
  });
});

describe('formatDiscount', () => {
  it('calculates discount percentage correctly', () => {
    expect(formatDiscount(5, 10)).toBe('50%');
    expect(formatDiscount(7.5, 10)).toBe('25%');
    expect(formatDiscount(9, 10)).toBe('10%');
  });

  it('returns 0% when no discount', () => {
    expect(formatDiscount(10, 10)).toBe('0%');
    expect(formatDiscount(12, 10)).toBe('0%');
  });

  it('handles edge cases', () => {
    expect(formatDiscount(0, 10)).toBe('100%');
    expect(formatDiscount(5, 0)).toBe('0%');
  });
});

describe('formatDistance', () => {
  it('formats meters for distances under 1km', () => {
    expect(formatDistance(0.5)).toBe('500m');
    expect(formatDistance(0.1)).toBe('100m');
    expect(formatDistance(0.05)).toBe('50m');
  });

  it('formats kilometers for distances 1km and above', () => {
    expect(formatDistance(1)).toBe('1.0km');
    expect(formatDistance(2.5)).toBe('2.5km');
    expect(formatDistance(10.25)).toBe('10.3km');
  });
});

describe('formatTimeWindow', () => {
  it('formats time window correctly', () => {
    expect(formatTimeWindow('09:00', '12:00')).toBe('9:00 AM - 12:00 PM');
    expect(formatTimeWindow('17:00', '19:30')).toBe('5:00 PM - 7:30 PM');
  });

  it('handles midnight and noon', () => {
    expect(formatTimeWindow('00:00', '12:00')).toBe('12:00 AM - 12:00 PM');
    expect(formatTimeWindow('12:00', '23:59')).toBe('12:00 PM - 11:59 PM');
  });
});

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('debounces function calls', () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('passes arguments correctly', () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn('arg1', 'arg2');

    jest.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });
});

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', true && 'active', false && 'disabled')).toBe(
      'base active'
    );
  });

  it('merges tailwind classes correctly', () => {
    // twMerge should resolve conflicting tailwind classes
    expect(cn('px-4', 'px-2')).toBe('px-2');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });
});
