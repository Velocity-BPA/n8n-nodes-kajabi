/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IDataObject,
  IExecuteFunctions,
  IHttpRequestMethods,
  ILoadOptionsFunctions,
  IHookFunctions,
  IWebhookFunctions,
  IRequestOptions,
  JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

import type {
  IJsonApiResponse,
  IJsonApiResource,
  IPaginationOptions,
} from '../types/KajabiTypes';

const BASE_URL = 'https://app.kajabi.com/api/v1';

type KajabiFunctions =
  | IExecuteFunctions
  | ILoadOptionsFunctions
  | IHookFunctions
  | IWebhookFunctions;

/**
 * Make an authenticated request to the Kajabi API
 */
export async function kajabiApiRequest(
  this: KajabiFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body: IDataObject = {},
  query: IDataObject = {},
): Promise<IJsonApiResponse> {
  const options: IRequestOptions = {
    method,
    uri: `${BASE_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    json: true,
  };

  if (Object.keys(body).length > 0) {
    options.body = body;
  }

  if (Object.keys(query).length > 0) {
    options.qs = query;
  }

  try {
    const credentials = await this.getCredentials('kajabiOAuth2Api');

    // Handle OAuth2 token
    if (credentials.accessToken) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${credentials.accessToken}`,
      };
    }

    const response = await this.helpers.request(options);
    return response as IJsonApiResponse;
  } catch (error: unknown) {
    const err = error as JsonObject;
    throw new NodeApiError(this.getNode(), err as JsonObject, {
      message: err.message as string || 'Kajabi API request failed',
    });
  }
}

/**
 * Make an authenticated request with pagination support
 */
export async function kajabiApiRequestAllItems(
  this: IExecuteFunctions | ILoadOptionsFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body: IDataObject = {},
  query: IDataObject = {},
  options: IPaginationOptions = {},
): Promise<IDataObject[]> {
  const { returnAll = false, page = 1, pageSize = 25 } = options;

  if (!returnAll) {
    query['page[number]'] = page;
    query['page[size]'] = pageSize;

    const response = await kajabiApiRequest.call(this, method, endpoint, body, query);
    return parseJsonApiResponse(response);
  }

  const returnData: IDataObject[] = [];
  let currentPage = 1;
  let hasMore = true;

  while (hasMore) {
    query['page[number]'] = currentPage;
    query['page[size]'] = 100; // Max page size

    const response = await kajabiApiRequest.call(this, method, endpoint, body, query);
    const items = parseJsonApiResponse(response);

    returnData.push(...items);

    // Check if there are more pages
    if (response.meta?.page) {
      const { number, total_pages } = response.meta.page;
      hasMore = number < total_pages;
      currentPage++;
    } else {
      hasMore = items.length === 100;
      currentPage++;
    }

    // Safety limit
    if (currentPage > 100) {
      break;
    }
  }

  return returnData;
}

/**
 * Parse JSON:API response format into flat objects
 */
export function parseJsonApiResponse(response: IJsonApiResponse): IDataObject[] {
  if (!response.data) {
    return [];
  }

  const data = Array.isArray(response.data) ? response.data : [response.data];

  return data.map((item: IJsonApiResource) => ({
    id: item.id,
    type: item.type,
    ...item.attributes,
    relationships: item.relationships || {},
  }));
}

/**
 * Parse a single JSON:API resource
 */
export function parseJsonApiResource(resource: IJsonApiResource): IDataObject {
  return {
    id: resource.id,
    type: resource.type,
    ...resource.attributes,
    relationships: resource.relationships || {},
  };
}

/**
 * Build JSON:API request body
 */
export function buildJsonApiBody(
  type: string,
  attributes: IDataObject,
  id?: string,
  relationships?: IDataObject,
): IDataObject {
  const body: IDataObject = {
    data: {
      type,
      attributes,
    },
  };

  if (id) {
    (body.data as IDataObject).id = id;
  }

  if (relationships && Object.keys(relationships).length > 0) {
    (body.data as IDataObject).relationships = relationships;
  }

  return body;
}

/**
 * Build filter query parameters
 */
export function buildFilterQuery(filters: IDataObject): IDataObject {
  const query: IDataObject = {};

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '' && value !== null) {
      query[`filter[${key}]`] = value;
    }
  }

  return query;
}

/**
 * Build sparse fieldsets query parameter
 */
export function buildFieldsQuery(resource: string, fields: string[]): IDataObject {
  if (fields.length === 0) {
    return {};
  }

  return {
    [`fields[${resource}]`]: fields.join(','),
  };
}

/**
 * Build sort query parameter
 */
export function buildSortQuery(field: string, direction: 'asc' | 'desc' = 'asc'): IDataObject {
  const sortValue = direction === 'desc' ? `-${field}` : field;
  return { sort: sortValue };
}

/**
 * Extract relationship IDs from JSON:API response
 */
export function extractRelationshipIds(
  relationships: IDataObject,
  relationshipName: string,
): string[] {
  const relationship = relationships[relationshipName] as IDataObject;
  if (!relationship || !relationship.data) {
    return [];
  }

  const data = relationship.data;
  if (Array.isArray(data)) {
    return (data as IDataObject[]).map((item: IDataObject) => item.id as string);
  }

  return [(data as IDataObject).id as string];
}

/**
 * Handle Kajabi API errors
 */
export function handleKajabiError(error: unknown): never {
  const err = error as IDataObject;

  if (err.errors && Array.isArray(err.errors)) {
    const errorMessages = (err.errors as IDataObject[])
      .map((e: IDataObject) => `${e.title}: ${e.detail}`)
      .join(', ');
    throw new Error(`Kajabi API Error: ${errorMessages}`);
  }

  if (err.message) {
    throw new Error(`Kajabi API Error: ${err.message}`);
  }

  throw new Error('Unknown Kajabi API Error');
}

/**
 * Log licensing notice (once per session)
 */
let licensingNoticeLogged = false;

export function logLicensingNotice(): void {
  if (!licensingNoticeLogged) {
    console.warn(`
[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
`);
    licensingNoticeLogged = true;
  }
}
