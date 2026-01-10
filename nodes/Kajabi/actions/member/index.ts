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
  buildFieldsQuery,
} from '../../transport/kajabiClient';
import { returnData, returnSingleData, cleanObject, parseTags } from '../../utils/helpers';

/**
 * Get all members
 */
export async function getAll(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const returnAll = this.getNodeParameter('returnAll', index) as boolean;
  const limit = this.getNodeParameter('limit', index, 25) as number;
  const filters = this.getNodeParameter('filters', index, {}) as IDataObject;
  const options = this.getNodeParameter('options', index, {}) as IDataObject;

  let query: IDataObject = buildFilterQuery(filters);

  // Handle sparse fieldsets
  if (options.fields) {
    const fields = (options.fields as string).split(',').map((f) => f.trim());
    query = { ...query, ...buildFieldsQuery('members', fields) };
  }

  let items: IDataObject[];

  if (returnAll) {
    items = await kajabiApiRequestAllItems.call(
      this,
      'GET',
      '/members',
      {},
      query,
      { returnAll: true },
    );
  } else {
    items = await kajabiApiRequestAllItems.call(
      this,
      'GET',
      '/members',
      {},
      query,
      { returnAll: false, pageSize: limit },
    );
  }

  return returnData(items);
}

/**
 * Get a single member by ID
 */
export async function get(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
  const memberId = this.getNodeParameter('memberId', index) as string;

  const response = await kajabiApiRequest.call(this, 'GET', `/members/${memberId}`);

  const items = parseJsonApiResponse(response);

  if (items.length === 0) {
    throw new Error(`Member with ID ${memberId} not found`);
  }

  return returnSingleData(items[0]);
}

/**
 * Create a new member
 */
export async function create(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const email = this.getNodeParameter('email', index) as string;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  const attributes: IDataObject = {
    email,
  };

  // Add optional fields
  if (additionalFields.name) {
    attributes.name = additionalFields.name;
  }
  if (additionalFields.firstName) {
    attributes.first_name = additionalFields.firstName;
  }
  if (additionalFields.lastName) {
    attributes.last_name = additionalFields.lastName;
  }
  if (additionalFields.phone) {
    attributes.phone = additionalFields.phone;
  }
  if (additionalFields.tags) {
    attributes.tags = parseTags(additionalFields.tags as string);
  }
  if (additionalFields.customFields) {
    attributes.custom_fields = additionalFields.customFields;
  }

  const body = buildJsonApiBody('members', cleanObject(attributes));

  const response = await kajabiApiRequest.call(this, 'POST', '/members', body);

  const items = parseJsonApiResponse(response);

  return returnSingleData(items[0]);
}

/**
 * Update a member
 */
export async function update(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const memberId = this.getNodeParameter('memberId', index) as string;
  const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

  const attributes: IDataObject = {};

  if (updateFields.name !== undefined) {
    attributes.name = updateFields.name;
  }
  if (updateFields.firstName !== undefined) {
    attributes.first_name = updateFields.firstName;
  }
  if (updateFields.lastName !== undefined) {
    attributes.last_name = updateFields.lastName;
  }
  if (updateFields.phone !== undefined) {
    attributes.phone = updateFields.phone;
  }
  if (updateFields.tags !== undefined) {
    attributes.tags = parseTags(updateFields.tags as string);
  }
  if (updateFields.customFields !== undefined) {
    attributes.custom_fields = updateFields.customFields;
  }

  const body = buildJsonApiBody('members', cleanObject(attributes), memberId);

  const response = await kajabiApiRequest.call(this, 'PATCH', `/members/${memberId}`, body);

  const items = parseJsonApiResponse(response);

  return returnSingleData(items[0]);
}

/**
 * Delete a member
 */
export async function deleteMember(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const memberId = this.getNodeParameter('memberId', index) as string;

  await kajabiApiRequest.call(this, 'DELETE', `/members/${memberId}`);

  return returnSingleData({ id: memberId, deleted: true });
}

/**
 * Get member by email
 */
export async function getByEmail(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const email = this.getNodeParameter('email', index) as string;

  const query = buildFilterQuery({ email });

  const items = await kajabiApiRequestAllItems.call(
    this,
    'GET',
    '/members',
    {},
    query,
    { returnAll: false, pageSize: 1 },
  );

  if (items.length === 0) {
    throw new Error(`Member with email ${email} not found`);
  }

  return returnSingleData(items[0]);
}

/**
 * Get member's grants (product access)
 */
export async function getGrants(
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

/**
 * Get member's tags
 */
export async function getTags(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const memberId = this.getNodeParameter('memberId', index) as string;

  const response = await kajabiApiRequest.call(this, 'GET', `/members/${memberId}/tags`);

  const items = parseJsonApiResponse(response);

  return returnData(items);
}

/**
 * Add tag to member
 */
export async function addTag(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const memberId = this.getNodeParameter('memberId', index) as string;
  const tagName = this.getNodeParameter('tagName', index) as string;

  const body = {
    data: {
      type: 'tags',
      attributes: {
        name: tagName,
      },
    },
  };

  const response = await kajabiApiRequest.call(this, 'POST', `/members/${memberId}/tags`, body);

  const items = parseJsonApiResponse(response);

  return returnSingleData(items[0] || { member_id: memberId, tag: tagName, added: true });
}

/**
 * Remove tag from member
 */
export async function removeTag(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const memberId = this.getNodeParameter('memberId', index) as string;
  const tagId = this.getNodeParameter('tagId', index) as string;

  await kajabiApiRequest.call(this, 'DELETE', `/members/${memberId}/tags/${tagId}`);

  return returnSingleData({ member_id: memberId, tag_id: tagId, removed: true });
}
