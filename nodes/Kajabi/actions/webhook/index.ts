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
} from '../../transport/kajabiClient';
import { returnData, returnSingleData, cleanObject } from '../../utils/helpers';

/**
 * Get all webhooks
 */
export async function getAll(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const returnAll = this.getNodeParameter('returnAll', index) as boolean;
  const limit = this.getNodeParameter('limit', index, 25) as number;

  let items: IDataObject[];

  if (returnAll) {
    items = await kajabiApiRequestAllItems.call(
      this,
      'GET',
      '/webhooks',
      {},
      {},
      { returnAll: true },
    );
  } else {
    items = await kajabiApiRequestAllItems.call(
      this,
      'GET',
      '/webhooks',
      {},
      {},
      { returnAll: false, pageSize: limit },
    );
  }

  return returnData(items);
}

/**
 * Create a new webhook
 */
export async function create(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const url = this.getNodeParameter('url', index) as string;
  const topic = this.getNodeParameter('topic', index) as string;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  const attributes: IDataObject = {
    url,
    topic,
  };

  if (additionalFields.siteId) {
    attributes.site_id = additionalFields.siteId;
  }

  const body = buildJsonApiBody('webhooks', cleanObject(attributes));

  const response = await kajabiApiRequest.call(this, 'POST', '/webhooks', body);

  const items = parseJsonApiResponse(response);

  return returnSingleData(items[0]);
}

/**
 * Delete a webhook
 */
export async function deleteWebhook(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const webhookId = this.getNodeParameter('webhookId', index) as string;

  await kajabiApiRequest.call(this, 'DELETE', `/webhooks/${webhookId}`);

  return returnSingleData({ id: webhookId, deleted: true });
}
