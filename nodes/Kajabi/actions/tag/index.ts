/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import {
  kajabiApiRequest,
  kajabiApiRequestAllItems,
  parseJsonApiResponse,
  buildJsonApiBody,
  buildFilterQuery,
} from '../../transport/kajabiClient';
import { returnData, returnSingleData } from '../../utils/helpers';

/**
 * Get all tags
 */
export async function getAll(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const returnAll = this.getNodeParameter('returnAll', index) as boolean;
  const limit = this.getNodeParameter('limit', index, 25) as number;
  const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

  const query = buildFilterQuery(filters);

  let items: IDataObject[];

  if (returnAll) {
    items = await kajabiApiRequestAllItems.call(this, 'GET', '/tags', {}, query, { returnAll: true });
  } else {
    items = await kajabiApiRequestAllItems.call(
      this,
      'GET',
      '/tags',
      {},
      query,
      { returnAll: false, pageSize: limit },
    );
  }

  return returnData(items);
}

/**
 * Get a single tag by ID
 */
export async function get(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
  const tagId = this.getNodeParameter('tagId', index) as string;

  const response = await kajabiApiRequest.call(this, 'GET', `/tags/${tagId}`);

  const items = parseJsonApiResponse(response);

  if (items.length === 0) {
    throw new Error(`Tag with ID ${tagId} not found`);
  }

  return returnSingleData(items[0]);
}

/**
 * Create a new tag
 */
export async function create(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const name = this.getNodeParameter('name', index) as string;

  const body = buildJsonApiBody('tags', { name });

  const response = await kajabiApiRequest.call(this, 'POST', '/tags', body);

  const items = parseJsonApiResponse(response);

  return returnSingleData(items[0]);
}

/**
 * Delete a tag
 */
export async function deleteTag(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const tagId = this.getNodeParameter('tagId', index) as string;

  await kajabiApiRequest.call(this, 'DELETE', `/tags/${tagId}`);

  return returnSingleData({ id: tagId, deleted: true });
}

/**
 * Get members with a specific tag
 */
export async function getMembers(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const tagId = this.getNodeParameter('tagId', index) as string;
  const returnAll = this.getNodeParameter('returnAll', index) as boolean;
  const limit = this.getNodeParameter('limit', index, 25) as number;

  let items: IDataObject[];

  if (returnAll) {
    items = await kajabiApiRequestAllItems.call(
      this,
      'GET',
      `/tags/${tagId}/members`,
      {},
      {},
      { returnAll: true },
    );
  } else {
    items = await kajabiApiRequestAllItems.call(
      this,
      'GET',
      `/tags/${tagId}/members`,
      {},
      {},
      { returnAll: false, pageSize: limit },
    );
  }

  return returnData(items);
}
