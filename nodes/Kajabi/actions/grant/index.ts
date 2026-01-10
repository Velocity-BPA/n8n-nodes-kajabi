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
import { returnData, returnSingleData, cleanObject } from '../../utils/helpers';

/**
 * Get all grants
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
      '/grants',
      {},
      query,
      { returnAll: true },
    );
  } else {
    items = await kajabiApiRequestAllItems.call(
      this,
      'GET',
      '/grants',
      {},
      query,
      { returnAll: false, pageSize: limit },
    );
  }

  return returnData(items);
}

/**
 * Get a single grant by ID
 */
export async function get(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
  const grantId = this.getNodeParameter('grantId', index) as string;

  const response = await kajabiApiRequest.call(this, 'GET', `/grants/${grantId}`);

  const items = parseJsonApiResponse(response);

  if (items.length === 0) {
    throw new Error(`Grant with ID ${grantId} not found`);
  }

  return returnSingleData(items[0]);
}

/**
 * Create a new grant (give product access)
 */
export async function create(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const memberId = this.getNodeParameter('memberId', index) as string;
  const offerId = this.getNodeParameter('offerId', index) as string;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  const attributes: IDataObject = {
    member_id: memberId,
    offer_id: offerId,
  };

  if (additionalFields.expiresAt) {
    attributes.expires_at = additionalFields.expiresAt;
  }

  const relationships: IDataObject = {
    member: {
      data: {
        type: 'members',
        id: memberId,
      },
    },
    offer: {
      data: {
        type: 'offers',
        id: offerId,
      },
    },
  };

  const body = buildJsonApiBody('grants', cleanObject(attributes), undefined, relationships);

  const response = await kajabiApiRequest.call(this, 'POST', '/grants', body);

  const items = parseJsonApiResponse(response);

  return returnSingleData(items[0]);
}

/**
 * Revoke a grant (remove product access)
 */
export async function revoke(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const grantId = this.getNodeParameter('grantId', index) as string;

  await kajabiApiRequest.call(this, 'DELETE', `/grants/${grantId}`);

  return returnSingleData({ id: grantId, revoked: true });
}

/**
 * Get grants by member
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
      `/members/${memberId}/grants`,
      {},
      {},
      { returnAll: true },
    );
  } else {
    items = await kajabiApiRequestAllItems.call(
      this,
      'GET',
      `/members/${memberId}/grants`,
      {},
      {},
      { returnAll: false, pageSize: limit },
    );
  }

  return returnData(items);
}
