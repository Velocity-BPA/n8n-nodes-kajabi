/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, INodeExecutionData } from 'n8n-workflow';

/**
 * Convert raw items to n8n execution data format
 */
export function returnData(items: IDataObject[]): INodeExecutionData[] {
  return items.map((item) => ({
    json: item,
    pairedItem: { item: 0 },
  }));
}

/**
 * Convert a single item to n8n execution data format
 */
export function returnSingleData(item: IDataObject): INodeExecutionData[] {
  return [
    {
      json: item,
      pairedItem: { item: 0 },
    },
  ];
}

/**
 * Clean undefined values from an object
 */
export function cleanObject(obj: IDataObject): IDataObject {
  const cleaned: IDataObject = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null && value !== '') {
      cleaned[key] = value;
    }
  }

  return cleaned;
}

/**
 * Parse additional fields from n8n node
 */
export function parseAdditionalFields(additionalFields: IDataObject): IDataObject {
  const parsed: IDataObject = {};

  for (const [key, value] of Object.entries(additionalFields)) {
    if (value !== undefined && value !== '') {
      // Handle nested objects
      if (typeof value === 'object' && !Array.isArray(value)) {
        parsed[key] = cleanObject(value as IDataObject);
      } else {
        parsed[key] = value;
      }
    }
  }

  return parsed;
}

/**
 * Split tags string into array
 */
export function parseTags(tags: string | string[]): string[] {
  if (Array.isArray(tags)) {
    return tags;
  }

  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }

  return [];
}

/**
 * Format date to ISO string
 */
export function formatDate(date: string | Date): string {
  if (date instanceof Date) {
    return date.toISOString();
  }

  return new Date(date).toISOString();
}

/**
 * Parse ISO date string
 */
export function parseDate(dateString: string): Date | null {
  if (!dateString) {
    return null;
  }

  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Convert price from cents to dollars
 */
export function centsToPrice(cents: number, currency = 'USD'): string {
  const amount = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Convert price from dollars to cents
 */
export function priceToCents(price: number): number {
  return Math.round(price * 100);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Truncate string to max length
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }

  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert snake_case to Title Case
 */
export function snakeToTitle(str: string): string {
  return str
    .split('_')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Convert camelCase to snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Get nested property value
 */
export function getNestedValue(obj: IDataObject, path: string): unknown {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }

    current = (current as IDataObject)[key];
  }

  return current;
}

/**
 * Set nested property value
 */
export function setNestedValue(
  obj: IDataObject,
  path: string,
  value: IDataObject | string | number | boolean | null,
): void {
  const keys = path.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key] as IDataObject;
  }

  current[keys[keys.length - 1]] = value;
}

/**
 * Deep merge objects
 */
export function deepMerge(target: IDataObject, source: IDataObject): IDataObject {
  const result = { ...target };

  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    const targetValue = result[key];

    if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(targetValue as IDataObject, sourceValue as IDataObject);
    } else {
      result[key] = sourceValue;
    }
  }

  return result;
}

/**
 * Chunk array into smaller arrays
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }

  return chunks;
}

/**
 * Delay execution
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const delayMs = baseDelay * Math.pow(2, attempt);
      await delay(delayMs);
    }
  }

  throw lastError;
}
