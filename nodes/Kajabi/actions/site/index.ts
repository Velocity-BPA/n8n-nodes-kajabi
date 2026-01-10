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
} from '../../transport/kajabiClient';
import { returnData, returnSingleData } from '../../utils/helpers';

/**
 * Get all sites
 */
export async function getAll(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const returnAll = this.getNodeParameter('returnAll', index) as boolean;
  const limit = this.getNodeParameter('limit', index, 25) as number;

  let items: IDataObject[];

  if (returnAll) {
    items = await kajabiApiRequestAllItems.call(this, 'GET', '/sites', {}, {}, { returnAll: true });
  } else {
    items = await kajabiApiRequestAllItems.call(
      this,
      'GET',
      '/sites',
      {},
      {},
      { returnAll: false, pageSize: limit },
    );
  }

  return returnData(items);
}

/**
 * Get a single site by ID
 */
export async function get(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
  const siteId = this.getNodeParameter('siteId', index) as string;

  const response = await kajabiApiRequest.call(this, 'GET', `/sites/${siteId}`);

  const items = parseJsonApiResponse(response);

  if (items.length === 0) {
    throw new Error(`Site with ID ${siteId} not found`);
  }

  return returnSingleData(items[0]);
}
