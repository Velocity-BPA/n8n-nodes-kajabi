/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject } from 'n8n-workflow';
import {
  cleanObject,
  parseTags,
  formatDate,
  centsToPrice,
  priceToCents,
  isValidEmail,
  isValidUrl,
  truncate,
  capitalize,
  snakeToTitle,
  camelToSnake,
  getNestedValue,
  setNestedValue,
  chunkArray,
} from '../../nodes/Kajabi/utils/helpers';

describe('Helper Functions', () => {
  describe('cleanObject', () => {
    it('should remove undefined values', () => {
      const input = { a: 1, b: undefined, c: 'test' };
      const result = cleanObject(input);
      expect(result).toEqual({ a: 1, c: 'test' });
    });

    it('should remove null values', () => {
      const input = { a: 1, b: null, c: 'test' };
      const result = cleanObject(input);
      expect(result).toEqual({ a: 1, c: 'test' });
    });

    it('should remove empty strings', () => {
      const input = { a: 1, b: '', c: 'test' };
      const result = cleanObject(input);
      expect(result).toEqual({ a: 1, c: 'test' });
    });

    it('should keep zero values', () => {
      const input = { a: 0, b: 'test' };
      const result = cleanObject(input);
      expect(result).toEqual({ a: 0, b: 'test' });
    });
  });

  describe('parseTags', () => {
    it('should parse comma-separated string', () => {
      const result = parseTags('tag1, tag2, tag3');
      expect(result).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should return array as-is', () => {
      const input = ['tag1', 'tag2'];
      const result = parseTags(input);
      expect(result).toEqual(input);
    });

    it('should handle empty string', () => {
      const result = parseTags('');
      expect(result).toEqual([]);
    });

    it('should filter out empty values', () => {
      const result = parseTags('tag1, , tag2');
      expect(result).toEqual(['tag1', 'tag2']);
    });
  });

  describe('formatDate', () => {
    it('should format Date object to ISO string', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDate(date);
      expect(result).toBe('2024-01-15T10:30:00.000Z');
    });

    it('should format string date to ISO string', () => {
      const result = formatDate('2024-01-15');
      expect(result).toContain('2024-01-15');
    });
  });

  describe('centsToPrice', () => {
    it('should convert cents to formatted price', () => {
      const result = centsToPrice(9999, 'USD');
      expect(result).toBe('$99.99');
    });

    it('should handle zero', () => {
      const result = centsToPrice(0, 'USD');
      expect(result).toBe('$0.00');
    });
  });

  describe('priceToCents', () => {
    it('should convert price to cents', () => {
      const result = priceToCents(99.99);
      expect(result).toBe(9999);
    });

    it('should handle rounding', () => {
      const result = priceToCents(99.999);
      expect(result).toBe(10000);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
    });

    it('should reject email without domain', () => {
      expect(isValidEmail('test@')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URL', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
    });

    it('should validate URL with path', () => {
      expect(isValidUrl('https://example.com/path/to/page')).toBe(true);
    });

    it('should reject invalid URL', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      const result = truncate('This is a very long string', 10);
      expect(result).toBe('This is...');
    });

    it('should not truncate short strings', () => {
      const result = truncate('Short', 10);
      expect(result).toBe('Short');
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    it('should handle empty string', () => {
      expect(capitalize('')).toBe('');
    });
  });

  describe('snakeToTitle', () => {
    it('should convert snake_case to Title Case', () => {
      expect(snakeToTitle('hello_world')).toBe('Hello World');
    });
  });

  describe('camelToSnake', () => {
    it('should convert camelCase to snake_case', () => {
      expect(camelToSnake('helloWorld')).toBe('hello_world');
    });
  });

  describe('getNestedValue', () => {
    it('should get nested value', () => {
      const obj = { a: { b: { c: 'value' } } };
      expect(getNestedValue(obj, 'a.b.c')).toBe('value');
    });

    it('should return undefined for missing path', () => {
      const obj = { a: { b: 'value' } };
      expect(getNestedValue(obj, 'a.c.d')).toBeUndefined();
    });
  });

  describe('setNestedValue', () => {
    it('should set nested value', () => {
      const obj: IDataObject = {};
      setNestedValue(obj, 'a.b.c', 'value');
      expect(obj).toEqual({ a: { b: { c: 'value' } } });
    });
  });

  describe('chunkArray', () => {
    it('should chunk array into smaller arrays', () => {
      const result = chunkArray([1, 2, 3, 4, 5], 2);
      expect(result).toEqual([[1, 2], [3, 4], [5]]);
    });

    it('should handle empty array', () => {
      const result = chunkArray([], 2);
      expect(result).toEqual([]);
    });
  });
});
