import { describe, expect } from '@jest/globals';
import { formatString } from '../../src/utils/format'; // Adjust the import path as needed

describe('formatString', () => {
  it('should format a string correctly', () => {
    const input = 'Test Input';
    const formatted = formatString(input);

    // Add your assertion here
    expect(formatted).toBe('Formatted: Test Input');
  });
});