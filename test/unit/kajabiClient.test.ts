/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  parseJsonApiResponse,
  parseJsonApiResource,
  buildJsonApiBody,
  buildFilterQuery,
  buildFieldsQuery,
  buildSortQuery,
  extractRelationshipIds,
} from '../../nodes/Kajabi/transport/kajabiClient';

describe('Kajabi Client', () => {
  describe('parseJsonApiResponse', () => {
    it('should parse array response', () => {
      const response = {
        data: [
          {
            id: '1',
            type: 'members',
            attributes: { email: 'test@example.com', name: 'Test User' },
          },
          {
            id: '2',
            type: 'members',
            attributes: { email: 'test2@example.com', name: 'Test User 2' },
          },
        ],
      };

      const result = parseJsonApiResponse(response);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: '1',
        type: 'members',
        email: 'test@example.com',
        name: 'Test User',
        relationships: {},
      });
    });

    it('should parse single resource response', () => {
      const response = {
        data: {
          id: '1',
          type: 'members',
          attributes: { email: 'test@example.com' },
        },
      };

      const result = parseJsonApiResponse(response);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should handle empty response', () => {
      const response = { data: null };
      const result = parseJsonApiResponse(response as any);
      expect(result).toEqual([]);
    });

    it('should include relationships', () => {
      const response = {
        data: {
          id: '1',
          type: 'grants',
          attributes: { granted_at: '2024-01-01' },
          relationships: {
            member: { data: { id: '10', type: 'members' } },
            offer: { data: { id: '20', type: 'offers' } },
          },
        },
      };

      const result = parseJsonApiResponse(response);

      expect(result[0].relationships).toEqual({
        member: { data: { id: '10', type: 'members' } },
        offer: { data: { id: '20', type: 'offers' } },
      });
    });
  });

  describe('parseJsonApiResource', () => {
    it('should parse single resource', () => {
      const resource = {
        id: '123',
        type: 'courses',
        attributes: { title: 'My Course', status: 'published' },
      };

      const result = parseJsonApiResource(resource);

      expect(result).toEqual({
        id: '123',
        type: 'courses',
        title: 'My Course',
        status: 'published',
        relationships: {},
      });
    });
  });

  describe('buildJsonApiBody', () => {
    it('should build basic body', () => {
      const result = buildJsonApiBody('members', { email: 'test@example.com' });

      expect(result).toEqual({
        data: {
          type: 'members',
          attributes: { email: 'test@example.com' },
        },
      });
    });

    it('should include id when provided', () => {
      const result = buildJsonApiBody('members', { name: 'Updated' }, '123');

      expect(result).toEqual({
        data: {
          type: 'members',
          id: '123',
          attributes: { name: 'Updated' },
        },
      });
    });

    it('should include relationships when provided', () => {
      const relationships = {
        member: { data: { type: 'members', id: '10' } },
      };

      const result = buildJsonApiBody('grants', { expires_at: null }, undefined, relationships);

      expect(result.data).toHaveProperty('relationships', relationships);
    });
  });

  describe('buildFilterQuery', () => {
    it('should build filter query', () => {
      const filters = { status: 'active', site_id: '123' };
      const result = buildFilterQuery(filters);

      expect(result).toEqual({
        'filter[status]': 'active',
        'filter[site_id]': '123',
      });
    });

    it('should exclude undefined values', () => {
      const filters = { status: 'active', site_id: undefined };
      const result = buildFilterQuery(filters);

      expect(result).toEqual({
        'filter[status]': 'active',
      });
    });

    it('should exclude empty strings', () => {
      const filters = { status: 'active', site_id: '' };
      const result = buildFilterQuery(filters);

      expect(result).toEqual({
        'filter[status]': 'active',
      });
    });
  });

  describe('buildFieldsQuery', () => {
    it('should build sparse fieldsets query', () => {
      const result = buildFieldsQuery('members', ['email', 'name', 'tags']);

      expect(result).toEqual({
        'fields[members]': 'email,name,tags',
      });
    });

    it('should return empty object for empty fields', () => {
      const result = buildFieldsQuery('members', []);
      expect(result).toEqual({});
    });
  });

  describe('buildSortQuery', () => {
    it('should build ascending sort', () => {
      const result = buildSortQuery('created_at', 'asc');
      expect(result).toEqual({ sort: 'created_at' });
    });

    it('should build descending sort', () => {
      const result = buildSortQuery('created_at', 'desc');
      expect(result).toEqual({ sort: '-created_at' });
    });
  });

  describe('extractRelationshipIds', () => {
    it('should extract single relationship ID', () => {
      const relationships = {
        member: { data: { id: '123', type: 'members' } },
      };

      const result = extractRelationshipIds(relationships, 'member');
      expect(result).toEqual(['123']);
    });

    it('should extract multiple relationship IDs', () => {
      const relationships = {
        tags: {
          data: [
            { id: '1', type: 'tags' },
            { id: '2', type: 'tags' },
          ],
        },
      };

      const result = extractRelationshipIds(relationships, 'tags');
      expect(result).toEqual(['1', '2']);
    });

    it('should return empty array for missing relationship', () => {
      const relationships = {};
      const result = extractRelationshipIds(relationships, 'member');
      expect(result).toEqual([]);
    });
  });
});
