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
 * Get all offers
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
      '/offers',
      {},
      query,
      { returnAll: true },
    );
  } else {
    items = await kajabiApiRequestAllItems.call(
      this,
      'GET',
      '/offers',
      {},
      query,
      { returnAll: false, pageSize: limit },
    );
  }

  return returnData(items);
}

/**
 * Get a single offer by ID
 */
export async function get(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
  const offerId = this.getNodeParameter('offerId', index) as string;

  const response = await kajabiApiRequest.call(this, 'GET', `/offers/${offerId}`);

  const items = parseJsonApiResponse(response);

  if (items.length === 0) {
    throw new Error(`Offer with ID ${offerId} not found`);
  }

  return returnSingleData(items[0]);
}

/**
 * Get pricing options for an offer
 */
export async function getPricing(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const offerId = this.getNodeParameter('offerId', index) as string;
  const returnAll = this.getNodeParameter('returnAll', index) as boolean;
  const limit = this.getNodeParameter('limit', index, 25) as number;

  let items: IDataObject[];

  if (returnAll) {
    items = await kajabiApiRequestAllItems.call(
      this,
      'GET',
      `/offers/${offerId}/prices`,
      {},
      {},
      { returnAll: true },
    );
  } else {
    items = await kajabiApiRequestAllItems.call(
      this,
      'GET',
      `/offers/${offerId}/prices`,
      {},
      {},
      { returnAll: false, pageSize: limit },
    );
  }

  return returnData(items);
}

/**
 * Get grants for an offer (who has access)
 */
export async function getGrants(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const offerId = this.getNodeParameter('offerId', index) as string;
  const returnAll = this.getNodeParameter('returnAll', index) as boolean;
  const limit = this.getNodeParameter('limit', index, 25) as number;

  let items: IDataObject[];

  if (returnAll) {
    items = await kajabiApiRequestAllItems.call(
      this,
      'GET',
      `/offers/${offerId}/grants`,
      {},
      {},
      { returnAll: true },
    );
  } else {
    items = await kajabiApiRequestAllItems.call(
      this,
      'GET',
      `/offers/${offerId}/grants`,
      {},
      {},
      { returnAll: false, pageSize: limit },
    );
  }

  return returnData(items);
}
