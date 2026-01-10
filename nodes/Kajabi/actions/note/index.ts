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
import { returnData, returnSingleData } from '../../utils/helpers';

/**
 * Get all notes for a member
 */
export async function getAll(
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
      `/members/${memberId}/notes`,
      {},
      {},
      { returnAll: true },
    );
  } else {
    items = await kajabiApiRequestAllItems.call(
      this,
      'GET',
      `/members/${memberId}/notes`,
      {},
      {},
      { returnAll: false, pageSize: limit },
    );
  }

  return returnData(items);
}

/**
 * Create a new note for a member
 */
export async function create(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const memberId = this.getNodeParameter('memberId', index) as string;
  const body = this.getNodeParameter('body', index) as string;

  const requestBody = buildJsonApiBody('notes', { body });

  const response = await kajabiApiRequest.call(
    this,
    'POST',
    `/members/${memberId}/notes`,
    requestBody,
  );

  const items = parseJsonApiResponse(response);

  return returnSingleData(items[0]);
}

/**
 * Update a note
 */
export async function update(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const memberId = this.getNodeParameter('memberId', index) as string;
  const noteId = this.getNodeParameter('noteId', index) as string;
  const body = this.getNodeParameter('body', index) as string;

  const requestBody = buildJsonApiBody('notes', { body }, noteId);

  const response = await kajabiApiRequest.call(
    this,
    'PATCH',
    `/members/${memberId}/notes/${noteId}`,
    requestBody,
  );

  const items = parseJsonApiResponse(response);

  return returnSingleData(items[0]);
}

/**
 * Delete a note
 */
export async function deleteNote(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const memberId = this.getNodeParameter('memberId', index) as string;
  const noteId = this.getNodeParameter('noteId', index) as string;

  await kajabiApiRequest.call(this, 'DELETE', `/members/${memberId}/notes/${noteId}`);

  return returnSingleData({ id: noteId, member_id: memberId, deleted: true });
}
