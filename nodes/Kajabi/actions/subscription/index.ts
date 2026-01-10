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
 * Get all subscriptions
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
      '/subscriptions',
      {},
      query,
      { returnAll: true },
    );
  } else {
    items = await kajabiApiRequestAllItems.call(
      this,
      'GET',
      '/subscriptions',
      {},
      query,
      { returnAll: false, pageSize: limit },
    );
  }

  return returnData(items);
}

/**
 * Get a single subscription by ID
 */
export async function get(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
  const subscriptionId = this.getNodeParameter('subscriptionId', index) as string;

  const response = await kajabiApiRequest.call(this, 'GET', `/subscriptions/${subscriptionId}`);

  const items = parseJsonApiResponse(response);

  if (items.length === 0) {
    throw new Error(`Subscription with ID ${subscriptionId} not found`);
  }

  return returnSingleData(items[0]);
}

/**
 * Get subscriptions by member
 */
export async function getByMember(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const memberId = this.getNodeParameter('memberId', index) as string;
  const returnAll = this.getNodeParameter('returnAll', index) as boolean;
  const limit = this.getNodeParameter('limit', index, 25) as number;

  let items: IDataObject[];

  if (returnAll) {
    items = await kajabiApiRequestAllItems.call(
      this,
      'GET',
      `/members/${memberId}/subscriptions`,
      {},
      {},
      { returnAll: true },
    );
  } else {
    items = await kajabiApiRequestAllItems.call(
      this,
      'GET',
      `/members/${memberId}/subscriptions`,
      {},
      {},
      { returnAll: false, pageSize: limit },
    );
  }

  return returnData(items);
}

/**
 * Cancel a subscription
 */
export async function cancel(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const subscriptionId = this.getNodeParameter('subscriptionId', index) as string;
  const cancelAtPeriodEnd = this.getNodeParameter('cancelAtPeriodEnd', index, true) as boolean;

  const body = {
    data: {
      type: 'subscriptions',
      id: subscriptionId,
      attributes: {
        cancel_at_period_end: cancelAtPeriodEnd,
      },
    },
  };

  const response = await kajabiApiRequest.call(
    this,
    'PATCH',
    `/subscriptions/${subscriptionId}/cancel`,
    body,
  );

  const items = parseJsonApiResponse(response);

  return returnSingleData(items[0] || { id: subscriptionId, canceled: true });
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivate(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const subscriptionId = this.getNodeParameter('subscriptionId', index) as string;

  const response = await kajabiApiRequest.call(
    this,
    'PATCH',
    `/subscriptions/${subscriptionId}/reactivate`,
    {},
  );

  const items = parseJsonApiResponse(response);

  return returnSingleData(items[0] || { id: subscriptionId, reactivated: true });
}
