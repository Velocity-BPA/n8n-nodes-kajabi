/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject } from 'n8n-workflow';

// JSON:API Types
export interface IJsonApiResource {
  id: string;
  type: string;
  attributes: IDataObject;
  relationships?: IDataObject;
  links?: IDataObject;
}

export interface IJsonApiResponse {
  data: IJsonApiResource | IJsonApiResource[];
  included?: IJsonApiResource[];
  meta?: {
    page?: {
      number: number;
      size: number;
      total: number;
      total_pages: number;
    };
  };
  links?: IDataObject;
}

export interface IJsonApiError {
  status: string;
  source?: {
    pointer?: string;
    parameter?: string;
  };
  title: string;
  detail: string;
}

export interface IJsonApiErrorResponse {
  errors: IJsonApiError[];
}

// Site Types
export interface ISite {
  id: string;
  name: string;
  domain: string;
  subdomain: string;
  created_at: string;
  updated_at: string;
}

// Course Types
export interface ICourse {
  id: string;
  title: string;
  description: string;
  status: 'published' | 'draft';
  site_id: string;
  created_at: string;
  updated_at: string;
}

export interface IChapter {
  id: string;
  title: string;
  position: number;
  course_id: string;
}

export interface ILesson {
  id: string;
  title: string;
  description: string;
  position: number;
  chapter_id: string;
  content_type: string;
}

export interface ICategory {
  id: string;
  name: string;
  course_id: string;
}

// Member Types
export interface IMember {
  id: string;
  email: string;
  name: string;
  first_name: string;
  last_name: string;
  phone: string;
  tags: string[];
  custom_fields: IDataObject;
  site_id: string;
  created_at: string;
  updated_at: string;
}

export interface IMemberCreateInput {
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  tags?: string[];
  custom_fields?: IDataObject;
}

export interface IMemberUpdateInput {
  name?: string;
  first_name?: string;
  last_name?: string;
  tags?: string[];
  custom_fields?: IDataObject;
}

// Offer Types
export interface IOffer {
  id: string;
  title: string;
  description: string;
  price_cents: number;
  currency: string;
  status: 'published' | 'draft';
  site_id: string;
  created_at: string;
  updated_at: string;
}

export interface IPricing {
  id: string;
  offer_id: string;
  price_cents: number;
  currency: string;
  interval: string;
  interval_count: number;
}

// Subscription Types
export interface ISubscription {
  id: string;
  member_id: string;
  offer_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

// Grant Types
export interface IGrant {
  id: string;
  member_id: string;
  offer_id: string;
  granted_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface IGrantCreateInput {
  member_id: string;
  offer_id: string;
  expires_at?: string;
}

// Tag Types
export interface ITag {
  id: string;
  name: string;
  members_count: number;
  site_id: string;
  created_at: string;
  updated_at: string;
}

// Note Types
export interface INote {
  id: string;
  member_id: string;
  body: string;
  author_id: string;
  created_at: string;
  updated_at: string;
}

export interface INoteCreateInput {
  member_id: string;
  body: string;
}

// Form Types
export interface IForm {
  id: string;
  name: string;
  site_id: string;
  fields: IFormField[];
  created_at: string;
  updated_at: string;
}

export interface IFormField {
  id: string;
  name: string;
  field_type: string;
  required: boolean;
}

export interface IFormSubmission {
  id: string;
  form_id: string;
  member_id: string;
  data: IDataObject;
  submitted_at: string;
}

// Webhook Types
export interface IWebhook {
  id: string;
  url: string;
  topic: WebhookTopic;
  site_id: string;
  created_at: string;
  updated_at: string;
}

export type WebhookTopic =
  | 'member.created'
  | 'member.updated'
  | 'subscription.created'
  | 'subscription.canceled'
  | 'offer.purchased'
  | 'form.submitted'
  | 'course.completed'
  | 'post.completed';

export interface IWebhookPayload {
  event: WebhookTopic;
  data: IDataObject;
  timestamp: string;
}

// API Request Types
export interface IKajabiRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  body?: IDataObject;
  query?: IDataObject;
}

export interface IPaginationOptions {
  page?: number;
  pageSize?: number;
  returnAll?: boolean;
}

export interface IFilterOptions {
  [key: string]: string | number | boolean | undefined;
}

export interface ISortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Resource Types for n8n
export type KajabiResource =
  | 'site'
  | 'course'
  | 'member'
  | 'offer'
  | 'subscription'
  | 'grant'
  | 'tag'
  | 'note'
  | 'form'
  | 'webhook';

export type KajabiOperation =
  | 'getAll'
  | 'get'
  | 'create'
  | 'update'
  | 'delete'
  | 'getByEmail'
  | 'getGrants'
  | 'getTags'
  | 'addTag'
  | 'removeTag'
  | 'getChapters'
  | 'getCategories'
  | 'getLessons'
  | 'getPricing'
  | 'getByMember'
  | 'cancel'
  | 'reactivate'
  | 'revoke'
  | 'getMembers'
  | 'getSubmissions';
