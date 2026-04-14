/**
 * Validator Utility Tests
 * Unit tests for input validation and XSS sanitization
 */

const {
  sanitizeText,
  validateRequiredFields,
  validateEmail,
  validateStringLength,
} = require('../../src/utils/validators');

describe('Input Validators', () => {
  // ===== SANITIZATION =====
  describe('sanitizeText - XSS Protection', () => {
    test('should remove script tags', () => {
      const input = '<script>alert("XSS")</script>Hello';
      const output = sanitizeText(input);
      expect(output).not.toMatch(/<script>/i);
      expect(output).toContain('Hello');
    });

    test('should remove onclick handlers', () => {
      const input = '<img src=x onclick="alert(1)">Hello';
      const output = sanitizeText(input);
      expect(output).not.toMatch(/onclick/i);
    });

    test('should remove onerror handlers', () => {
      const input = '<img src=x onerror="alert(1)">Text';
      const output = sanitizeText(input);
      expect(output).not.toMatch(/onerror/i);
    });

    test('should preserve clean text', () => {
      const input = 'This is clean text with no HTML';
      const output = sanitizeText(input);
      expect(output).toBe(input);
    });

    test('should handle HTML entities', () => {
      const input = '<div>Test &lt;script&gt;</div>';
      const output = sanitizeText(input);
      expect(output).toContain('Test');
    });

    test('should handle multiple tags', () => {
      const input = '<script>bad</script>Good<img onerror="bad">';
      const output = sanitizeText(input);
      expect(output).toContain('Good');
      expect(output).not.toMatch(/<script>/i);
      expect(output).not.toMatch(/onerror/i);
    });
  });

  // ===== REQUIRED FIELDS =====
  describe('validateRequiredFields - Validation', () => {
    test('should return empty array for complete data', () => {
      const data = { title: 'Test', description: 'Desc' };
      const required = ['title', 'description'];
      const errors = validateRequiredFields(data, required);
      expect(errors).toEqual([]);
    });

    test('should return errors for missing fields', () => {
      const data = { title: 'Test' };
      const required = ['title', 'description', 'date'];
      const errors = validateRequiredFields(data, required);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain(expect.stringMatching(/description|date/i));
    });

    test('should catch empty string as missing', () => {
      const data = { title: '', description: 'Desc' };
      const required = ['title', 'description'];
      const errors = validateRequiredFields(data, required);
      expect(errors).toContain(expect.stringMatching(/title/i));
    });

    test('should catch null as missing', () => {
      const data = { title: null, description: 'Desc' };
      const required = ['title', 'description'];
      const errors = validateRequiredFields(data, required);
      expect(errors).toContain(expect.stringMatching(/title/i));
    });

    test('should catch undefined as missing', () => {
      const data = { title: undefined, description: 'Desc' };
      const required = ['title', 'description'];
      const errors = validateRequiredFields(data, required);
      expect(errors).toContain(expect.stringMatching(/title/i));
    });
  });

  // ===== EMAIL VALIDATION =====
  describe('validateEmail - Email Format', () => {
    test('should accept valid emails', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.user@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    test('should reject invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('user @example.com')).toBe(false);
    });

    test('should reject empty email', () => {
      expect(validateEmail('')).toBe(false);
    });
  });

  // ===== STRING LENGTH =====
  describe('validateStringLength - Length Constraints', () => {
    test('should accept string within limits', () => {
      const result = validateStringLength('Test', { min: 2, max: 10 });
      expect(result.valid).toBe(true);
    });

    test('should reject string too short', () => {
      const result = validateStringLength('A', { min: 2, max: 10 });
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/too short|minimum/i);
    });

    test('should reject string too long', () => {
      const result = validateStringLength('A'.repeat(100), { min: 2, max: 50 });
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/too long|maximum/i);
    });

    test('should handle edge cases', () => {
      const atMin = validateStringLength('ab', { min: 2, max: 10 });
      expect(atMin.valid).toBe(true);

      const atMax = validateStringLength('a'.repeat(10), { min: 2, max: 10 });
      expect(atMax.valid).toBe(true);
    });
  });
});
