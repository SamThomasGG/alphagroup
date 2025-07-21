import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('px-2 py-1', 'bg-blue-500', 'text-white');
    expect(result).toBe('px-2 py-1 bg-blue-500 text-white');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const result = cn('base-class', isActive && 'active-class');
    expect(result).toBe('base-class active-class');
  });

  it('should handle false conditional classes', () => {
    const isActive = false;
    const result = cn('base-class', isActive && 'active-class');
    expect(result).toBe('base-class');
  });

  it('should merge conflicting Tailwind classes correctly', () => {
    const result = cn('px-2 px-4', 'py-1 py-2');
    expect(result).toBe('px-4 py-2');
  });

  it('should handle empty inputs', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle undefined and null values', () => {
    const result = cn('base-class', undefined, null, 'another-class');
    expect(result).toBe('base-class another-class');
  });

  it('should handle arrays of classes', () => {
    const result = cn(['class1', 'class2'], 'class3');
    expect(result).toBe('class1 class2 class3');
  });

  it('should handle objects with boolean values', () => {
    const result = cn({
      'class1': true,
      'class2': false,
      'class3': true
    });
    expect(result).toBe('class1 class3');
  });
});