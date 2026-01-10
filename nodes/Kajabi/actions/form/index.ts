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
  buildFilterQuery,
} from '../../transport/kajabiClient';
import { returnData, returnSingleData } from '../../utils/helpers';

/**
 * Get all forms
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
    items = await kajabiApiRequestAllItems.call(
      this,
      'GET',
      '/forms',
      {},
      query,
      { returnAll: true },
    );
  } else {
    items = await kajabiApiRequestAllItems.call(
      this,
      'GET',
      '/forms',
      {},
      query,
      { returnAll: false, pageSize: limit },
    );
  }

  return returnData(items);
}

/**
 * Get a single form by ID
 */
export async function get(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
  const formId = this.getNodeParameter('formId', index) as string;

  const response = await kajabiApiRequest.call(this, 'GET', `/forms/${formId}`);

  const items = parseJsonApiResponse(response);

  if (items.length === 0) {
    throw new Error(`Form with ID ${formId} not found`);
  }

  return returnSingleData(items[0]);
}

/**
 * Get form submissions
 */
export async function getSubmissions(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const formId = this.getNodeParameter('formId', index) as string;
  const returnAll = this.getNodeParameter('returnAll', index) as boolean;
  const limit = this.getNodeParameter('limit', index, 25) as number;

  let items: IDataObject[];

  if (returnAll) {
    items = await kajabiApiRequestAllItems.call(
      this,
      'GET',
      `/forms/${formId}/submissions`,
      {},
      {},
      { returnAll: true },
    );
  } else {
    items = await kajabiApiRequestAllItems.call(
      this,
      'GET',
      `/forms/${formId}/submissions`,
      {},
      {},
      { returnAll: false, pageSize: limit },
    );
  }

  return returnData(items);
}
