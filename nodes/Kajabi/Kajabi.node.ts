/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

import { logLicensingNotice } from './transport/kajabiClient';
import * as site from './actions/site';
import * as course from './actions/course';
import * as member from './actions/member';
import * as offer from './actions/offer';
import * as subscription from './actions/subscription';
import * as grant from './actions/grant';
import * as tag from './actions/tag';
import * as note from './actions/note';
import * as form from './actions/form';
import * as webhook from './actions/webhook';

export class Kajabi implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Kajabi',
    name: 'kajabi',
    icon: 'file:kajabi.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with Kajabi API for course management, members, offers, and more',
    defaults: {
      name: 'Kajabi',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'kajabiOAuth2Api',
        required: true,
      },
    ],
    properties: [
      // Resource selection
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'Course', value: 'course' },
          { name: 'Form', value: 'form' },
          { name: 'Grant', value: 'grant' },
          { name: 'Member', value: 'member' },
          { name: 'Note', value: 'note' },
          { name: 'Offer', value: 'offer' },
          { name: 'Site', value: 'site' },
          { name: 'Subscription', value: 'subscription' },
          { name: 'Tag', value: 'tag' },
          { name: 'Webhook', value: 'webhook' },
        ],
        default: 'member',
      },

      // ========== SITE OPERATIONS ==========
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['site'],
          },
        },
        options: [
          { name: 'Get', value: 'get', description: 'Get a site by ID', action: 'Get a site' },
          { name: 'Get Many', value: 'getAll', description: 'Get many sites', action: 'Get many sites' },
        ],
        default: 'getAll',
      },

      // ========== COURSE OPERATIONS ==========
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['course'],
          },
        },
        options: [
          { name: 'Get', value: 'get', description: 'Get a course by ID', action: 'Get a course' },
          { name: 'Get Categories', value: 'getCategories', description: 'Get course categories', action: 'Get course categories' },
          { name: 'Get Chapters', value: 'getChapters', description: 'Get course chapters', action: 'Get course chapters' },
          { name: 'Get Lessons', value: 'getLessons', description: 'Get lessons in a chapter', action: 'Get lessons' },
          { name: 'Get Many', value: 'getAll', description: 'Get many courses', action: 'Get many courses' },
        ],
        default: 'getAll',
      },

      // ========== MEMBER OPERATIONS ==========
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['member'],
          },
        },
        options: [
          { name: 'Add Tag', value: 'addTag', description: 'Add a tag to a member', action: 'Add tag to member' },
          { name: 'Create', value: 'create', description: 'Create a new member', action: 'Create a member' },
          { name: 'Delete', value: 'delete', description: 'Delete a member', action: 'Delete a member' },
          { name: 'Get', value: 'get', description: 'Get a member by ID', action: 'Get a member' },
          { name: 'Get by Email', value: 'getByEmail', description: 'Get a member by email', action: 'Get member by email' },
          { name: 'Get Grants', value: 'getGrants', description: 'Get member product access', action: 'Get member grants' },
          { name: 'Get Many', value: 'getAll', description: 'Get many members', action: 'Get many members' },
          { name: 'Get Tags', value: 'getTags', description: 'Get member tags', action: 'Get member tags' },
          { name: 'Remove Tag', value: 'removeTag', description: 'Remove a tag from a member', action: 'Remove tag from member' },
          { name: 'Update', value: 'update', description: 'Update a member', action: 'Update a member' },
        ],
        default: 'getAll',
      },

      // ========== OFFER OPERATIONS ==========
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['offer'],
          },
        },
        options: [
          { name: 'Get', value: 'get', description: 'Get an offer by ID', action: 'Get an offer' },
          { name: 'Get Grants', value: 'getGrants', description: 'Get who has access to offer', action: 'Get offer grants' },
          { name: 'Get Many', value: 'getAll', description: 'Get many offers', action: 'Get many offers' },
          { name: 'Get Pricing', value: 'getPricing', description: 'Get pricing options', action: 'Get offer pricing' },
        ],
        default: 'getAll',
      },

      // ========== SUBSCRIPTION OPERATIONS ==========
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['subscription'],
          },
        },
        options: [
          { name: 'Cancel', value: 'cancel', description: 'Cancel a subscription', action: 'Cancel subscription' },
          { name: 'Get', value: 'get', description: 'Get a subscription by ID', action: 'Get a subscription' },
          { name: 'Get by Member', value: 'getByMember', description: 'Get member subscriptions', action: 'Get member subscriptions' },
          { name: 'Get Many', value: 'getAll', description: 'Get many subscriptions', action: 'Get many subscriptions' },
          { name: 'Reactivate', value: 'reactivate', description: 'Reactivate a canceled subscription', action: 'Reactivate subscription' },
        ],
        default: 'getAll',
      },

      // ========== GRANT OPERATIONS ==========
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['grant'],
          },
        },
        options: [
          { name: 'Create', value: 'create', description: 'Grant product access', action: 'Create a grant' },
          { name: 'Get', value: 'get', description: 'Get a grant by ID', action: 'Get a grant' },
          { name: 'Get by Member', value: 'getByMember', description: 'Get member grants', action: 'Get member grants' },
          { name: 'Get Many', value: 'getAll', description: 'Get many grants', action: 'Get many grants' },
          { name: 'Revoke', value: 'revoke', description: 'Revoke product access', action: 'Revoke a grant' },
        ],
        default: 'getAll',
      },

      // ========== TAG OPERATIONS ==========
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['tag'],
          },
        },
        options: [
          { name: 'Create', value: 'create', description: 'Create a new tag', action: 'Create a tag' },
          { name: 'Delete', value: 'delete', description: 'Delete a tag', action: 'Delete a tag' },
          { name: 'Get', value: 'get', description: 'Get a tag by ID', action: 'Get a tag' },
          { name: 'Get Many', value: 'getAll', description: 'Get many tags', action: 'Get many tags' },
          { name: 'Get Members', value: 'getMembers', description: 'Get members with tag', action: 'Get tagged members' },
        ],
        default: 'getAll',
      },

      // ========== NOTE OPERATIONS ==========
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['note'],
          },
        },
        options: [
          { name: 'Create', value: 'create', description: 'Create a note for a member', action: 'Create a note' },
          { name: 'Delete', value: 'delete', description: 'Delete a note', action: 'Delete a note' },
          { name: 'Get Many', value: 'getAll', description: 'Get member notes', action: 'Get many notes' },
          { name: 'Update', value: 'update', description: 'Update a note', action: 'Update a note' },
        ],
        default: 'getAll',
      },

      // ========== FORM OPERATIONS ==========
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['form'],
          },
        },
        options: [
          { name: 'Get', value: 'get', description: 'Get a form by ID', action: 'Get a form' },
          { name: 'Get Many', value: 'getAll', description: 'Get many forms', action: 'Get many forms' },
          { name: 'Get Submissions', value: 'getSubmissions', description: 'Get form submissions', action: 'Get form submissions' },
        ],
        default: 'getAll',
      },

      // ========== WEBHOOK OPERATIONS ==========
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['webhook'],
          },
        },
        options: [
          { name: 'Create', value: 'create', description: 'Register a webhook', action: 'Create a webhook' },
          { name: 'Delete', value: 'delete', description: 'Remove a webhook', action: 'Delete a webhook' },
          { name: 'Get Many', value: 'getAll', description: 'Get many webhooks', action: 'Get many webhooks' },
        ],
        default: 'getAll',
      },

      // ========== SHARED PARAMETERS ==========
      // Site ID
      {
        displayName: 'Site ID',
        name: 'siteId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['site'],
            operation: ['get'],
          },
        },
        description: 'The ID of the site to retrieve',
      },

      // Course ID
      {
        displayName: 'Course ID',
        name: 'courseId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['course'],
            operation: ['get', 'getChapters', 'getCategories', 'getLessons'],
          },
        },
        description: 'The ID of the course',
      },

      // Chapter ID
      {
        displayName: 'Chapter ID',
        name: 'chapterId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['course'],
            operation: ['getLessons'],
          },
        },
        description: 'The ID of the chapter',
      },

      // Member ID
      {
        displayName: 'Member ID',
        name: 'memberId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['member'],
            operation: ['get', 'update', 'delete', 'getGrants', 'getTags', 'addTag', 'removeTag'],
          },
        },
        description: 'The ID of the member',
      },
      {
        displayName: 'Member ID',
        name: 'memberId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['note'],
            operation: ['getAll', 'create', 'update', 'delete'],
          },
        },
        description: 'The ID of the member',
      },
      {
        displayName: 'Member ID',
        name: 'memberId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['subscription'],
            operation: ['getByMember'],
          },
        },
        description: 'The ID of the member',
      },
      {
        displayName: 'Member ID',
        name: 'memberId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['grant'],
            operation: ['create', 'getByMember'],
          },
        },
        description: 'The ID of the member',
      },

      // Email for member
      {
        displayName: 'Email',
        name: 'email',
        type: 'string',
        placeholder: 'name@email.com',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['member'],
            operation: ['create', 'getByEmail'],
          },
        },
        description: 'The email address of the member',
      },

      // Offer ID
      {
        displayName: 'Offer ID',
        name: 'offerId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['offer'],
            operation: ['get', 'getPricing', 'getGrants'],
          },
        },
        description: 'The ID of the offer',
      },
      {
        displayName: 'Offer ID',
        name: 'offerId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['grant'],
            operation: ['create'],
          },
        },
        description: 'The ID of the offer to grant access to',
      },

      // Subscription ID
      {
        displayName: 'Subscription ID',
        name: 'subscriptionId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['subscription'],
            operation: ['get', 'cancel', 'reactivate'],
          },
        },
        description: 'The ID of the subscription',
      },

      // Grant ID
      {
        displayName: 'Grant ID',
        name: 'grantId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['grant'],
            operation: ['get', 'revoke'],
          },
        },
        description: 'The ID of the grant',
      },

      // Tag ID
      {
        displayName: 'Tag ID',
        name: 'tagId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['tag'],
            operation: ['get', 'delete', 'getMembers'],
          },
        },
        description: 'The ID of the tag',
      },
      {
        displayName: 'Tag ID',
        name: 'tagId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['member'],
            operation: ['removeTag'],
          },
        },
        description: 'The ID of the tag to remove',
      },

      // Tag name
      {
        displayName: 'Tag Name',
        name: 'tagName',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['member'],
            operation: ['addTag'],
          },
        },
        description: 'The name of the tag to add',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['tag'],
            operation: ['create'],
          },
        },
        description: 'The name of the tag',
      },

      // Note ID
      {
        displayName: 'Note ID',
        name: 'noteId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['note'],
            operation: ['update', 'delete'],
          },
        },
        description: 'The ID of the note',
      },

      // Note body
      {
        displayName: 'Body',
        name: 'body',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['note'],
            operation: ['create', 'update'],
          },
        },
        description: 'The content of the note',
      },

      // Form ID
      {
        displayName: 'Form ID',
        name: 'formId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['form'],
            operation: ['get', 'getSubmissions'],
          },
        },
        description: 'The ID of the form',
      },

      // Webhook ID
      {
        displayName: 'Webhook ID',
        name: 'webhookId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['webhook'],
            operation: ['delete'],
          },
        },
        description: 'The ID of the webhook to delete',
      },

      // Webhook URL
      {
        displayName: 'URL',
        name: 'url',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['webhook'],
            operation: ['create'],
          },
        },
        description: 'The URL to send webhook events to',
      },

      // Webhook topic
      {
        displayName: 'Topic',
        name: 'topic',
        type: 'options',
        required: true,
        displayOptions: {
          show: {
            resource: ['webhook'],
            operation: ['create'],
          },
        },
        options: [
          { name: 'Course Completed', value: 'course.completed' },
          { name: 'Form Submitted', value: 'form.submitted' },
          { name: 'Member Created', value: 'member.created' },
          { name: 'Member Updated', value: 'member.updated' },
          { name: 'Offer Purchased', value: 'offer.purchased' },
          { name: 'Post Completed', value: 'post.completed' },
          { name: 'Subscription Canceled', value: 'subscription.canceled' },
          { name: 'Subscription Created', value: 'subscription.created' },
        ],
        default: 'member.created',
        description: 'The event type to subscribe to',
      },

      // Cancel at period end
      {
        displayName: 'Cancel at Period End',
        name: 'cancelAtPeriodEnd',
        type: 'boolean',
        default: true,
        displayOptions: {
          show: {
            resource: ['subscription'],
            operation: ['cancel'],
          },
        },
        description: 'Whether to cancel at the end of the billing period instead of immediately',
      },

      // Return All
      {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        default: false,
        displayOptions: {
          show: {
            resource: ['site', 'course', 'member', 'offer', 'subscription', 'grant', 'tag', 'note', 'form', 'webhook'],
            operation: ['getAll', 'getChapters', 'getCategories', 'getLessons', 'getPricing', 'getGrants', 'getByMember', 'getMembers', 'getSubmissions'],
          },
        },
        description: 'Whether to return all results or only up to a given limit',
      },

      // Limit
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        typeOptions: {
          minValue: 1,
          maxValue: 100,
        },
        default: 25,
        displayOptions: {
          show: {
            resource: ['site', 'course', 'member', 'offer', 'subscription', 'grant', 'tag', 'note', 'form', 'webhook'],
            operation: ['getAll', 'getChapters', 'getCategories', 'getLessons', 'getPricing', 'getGrants', 'getByMember', 'getMembers', 'getSubmissions'],
            returnAll: [false],
          },
        },
        description: 'Max number of results to return',
      },

      // ========== ADDITIONAL FIELDS ==========
      // Member create additional fields
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            resource: ['member'],
            operation: ['create'],
          },
        },
        options: [
          {
            displayName: 'Custom Fields',
            name: 'customFields',
            type: 'fixedCollection',
            typeOptions: {
              multipleValues: true,
            },
            default: {},
            options: [
              {
                displayName: 'Field',
                name: 'field',
                values: [
                  {
                    displayName: 'Key',
                    name: 'key',
                    type: 'string',
                    default: '',
                  },
                  {
                    displayName: 'Value',
                    name: 'value',
                    type: 'string',
                    default: '',
                  },
                ],
              },
            ],
          },
          {
            displayName: 'First Name',
            name: 'firstName',
            type: 'string',
            default: '',
          },
          {
            displayName: 'Last Name',
            name: 'lastName',
            type: 'string',
            default: '',
          },
          {
            displayName: 'Name',
            name: 'name',
            type: 'string',
            default: '',
          },
          {
            displayName: 'Phone',
            name: 'phone',
            type: 'string',
            default: '',
          },
          {
            displayName: 'Tags',
            name: 'tags',
            type: 'string',
            default: '',
            description: 'Comma-separated list of tags',
          },
        ],
      },

      // Member update fields
      {
        displayName: 'Update Fields',
        name: 'updateFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            resource: ['member'],
            operation: ['update'],
          },
        },
        options: [
          {
            displayName: 'Custom Fields',
            name: 'customFields',
            type: 'fixedCollection',
            typeOptions: {
              multipleValues: true,
            },
            default: {},
            options: [
              {
                displayName: 'Field',
                name: 'field',
                values: [
                  {
                    displayName: 'Key',
                    name: 'key',
                    type: 'string',
                    default: '',
                  },
                  {
                    displayName: 'Value',
                    name: 'value',
                    type: 'string',
                    default: '',
                  },
                ],
              },
            ],
          },
          {
            displayName: 'First Name',
            name: 'firstName',
            type: 'string',
            default: '',
          },
          {
            displayName: 'Last Name',
            name: 'lastName',
            type: 'string',
            default: '',
          },
          {
            displayName: 'Name',
            name: 'name',
            type: 'string',
            default: '',
          },
          {
            displayName: 'Phone',
            name: 'phone',
            type: 'string',
            default: '',
          },
          {
            displayName: 'Tags',
            name: 'tags',
            type: 'string',
            default: '',
            description: 'Comma-separated list of tags',
          },
        ],
      },

      // Grant additional fields
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            resource: ['grant'],
            operation: ['create'],
          },
        },
        options: [
          {
            displayName: 'Expires At',
            name: 'expiresAt',
            type: 'dateTime',
            default: '',
            description: 'When the grant should expire',
          },
        ],
      },

      // Webhook additional fields
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            resource: ['webhook'],
            operation: ['create'],
          },
        },
        options: [
          {
            displayName: 'Site ID',
            name: 'siteId',
            type: 'string',
            default: '',
            description: 'Filter webhook to specific site',
          },
        ],
      },

      // ========== FILTERS ==========
      // Course filters
      {
        displayName: 'Filters',
        name: 'filters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        displayOptions: {
          show: {
            resource: ['course'],
            operation: ['getAll'],
          },
        },
        options: [
          {
            displayName: 'Site ID',
            name: 'site_id',
            type: 'string',
            default: '',
          },
          {
            displayName: 'Status',
            name: 'status',
            type: 'options',
            options: [
              { name: 'Draft', value: 'draft' },
              { name: 'Published', value: 'published' },
            ],
            default: '',
          },
        ],
      },

      // Member filters
      {
        displayName: 'Filters',
        name: 'filters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        displayOptions: {
          show: {
            resource: ['member'],
            operation: ['getAll'],
          },
        },
        options: [
          {
            displayName: 'Email',
            name: 'email',
            type: 'string',
            default: '',
          },
          {
            displayName: 'Site ID',
            name: 'site_id',
            type: 'string',
            default: '',
          },
          {
            displayName: 'Tag',
            name: 'tag',
            type: 'string',
            default: '',
          },
        ],
      },

      // Offer filters
      {
        displayName: 'Filters',
        name: 'filters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        displayOptions: {
          show: {
            resource: ['offer'],
            operation: ['getAll'],
          },
        },
        options: [
          {
            displayName: 'Site ID',
            name: 'site_id',
            type: 'string',
            default: '',
          },
          {
            displayName: 'Status',
            name: 'status',
            type: 'options',
            options: [
              { name: 'Draft', value: 'draft' },
              { name: 'Published', value: 'published' },
            ],
            default: '',
          },
        ],
      },

      // Subscription filters
      {
        displayName: 'Filters',
        name: 'filters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        displayOptions: {
          show: {
            resource: ['subscription'],
            operation: ['getAll'],
          },
        },
        options: [
          {
            displayName: 'Member ID',
            name: 'member_id',
            type: 'string',
            default: '',
          },
          {
            displayName: 'Offer ID',
            name: 'offer_id',
            type: 'string',
            default: '',
          },
          {
            displayName: 'Status',
            name: 'status',
            type: 'options',
            options: [
              { name: 'Active', value: 'active' },
              { name: 'Canceled', value: 'canceled' },
              { name: 'Past Due', value: 'past_due' },
              { name: 'Trialing', value: 'trialing' },
            ],
            default: '',
          },
        ],
      },

      // Grant filters
      {
        displayName: 'Filters',
        name: 'filters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        displayOptions: {
          show: {
            resource: ['grant'],
            operation: ['getAll'],
          },
        },
        options: [
          {
            displayName: 'Member ID',
            name: 'member_id',
            type: 'string',
            default: '',
          },
          {
            displayName: 'Offer ID',
            name: 'offer_id',
            type: 'string',
            default: '',
          },
        ],
      },

      // Tag filters
      {
        displayName: 'Filters',
        name: 'filters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        displayOptions: {
          show: {
            resource: ['tag'],
            operation: ['getAll'],
          },
        },
        options: [
          {
            displayName: 'Name',
            name: 'name',
            type: 'string',
            default: '',
          },
          {
            displayName: 'Site ID',
            name: 'site_id',
            type: 'string',
            default: '',
          },
        ],
      },

      // Form filters
      {
        displayName: 'Filters',
        name: 'filters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        displayOptions: {
          show: {
            resource: ['form'],
            operation: ['getAll'],
          },
        },
        options: [
          {
            displayName: 'Name',
            name: 'name',
            type: 'string',
            default: '',
          },
          {
            displayName: 'Site ID',
            name: 'site_id',
            type: 'string',
            default: '',
          },
        ],
      },

      // ========== OPTIONS ==========
      // Member options
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        displayOptions: {
          show: {
            resource: ['member'],
            operation: ['getAll'],
          },
        },
        options: [
          {
            displayName: 'Fields',
            name: 'fields',
            type: 'string',
            default: '',
            description: 'Comma-separated list of fields to return (sparse fieldsets)',
            placeholder: 'email,name,tags',
          },
        ],
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    // Log licensing notice once
    logLicensingNotice();

    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
      try {
        let result: INodeExecutionData[] = [];

        // Route to appropriate handler
        switch (resource) {
          case 'site':
            switch (operation) {
              case 'getAll':
                result = await site.getAll.call(this, i);
                break;
              case 'get':
                result = await site.get.call(this, i);
                break;
            }
            break;

          case 'course':
            switch (operation) {
              case 'getAll':
                result = await course.getAll.call(this, i);
                break;
              case 'get':
                result = await course.get.call(this, i);
                break;
              case 'getChapters':
                result = await course.getChapters.call(this, i);
                break;
              case 'getCategories':
                result = await course.getCategories.call(this, i);
                break;
              case 'getLessons':
                result = await course.getLessons.call(this, i);
                break;
            }
            break;

          case 'member':
            switch (operation) {
              case 'getAll':
                result = await member.getAll.call(this, i);
                break;
              case 'get':
                result = await member.get.call(this, i);
                break;
              case 'create':
                result = await member.create.call(this, i);
                break;
              case 'update':
                result = await member.update.call(this, i);
                break;
              case 'delete':
                result = await member.deleteMember.call(this, i);
                break;
              case 'getByEmail':
                result = await member.getByEmail.call(this, i);
                break;
              case 'getGrants':
                result = await member.getGrants.call(this, i);
                break;
              case 'getTags':
                result = await member.getTags.call(this, i);
                break;
              case 'addTag':
                result = await member.addTag.call(this, i);
                break;
              case 'removeTag':
                result = await member.removeTag.call(this, i);
                break;
            }
            break;

          case 'offer':
            switch (operation) {
              case 'getAll':
                result = await offer.getAll.call(this, i);
                break;
              case 'get':
                result = await offer.get.call(this, i);
                break;
              case 'getPricing':
                result = await offer.getPricing.call(this, i);
                break;
              case 'getGrants':
                result = await offer.getGrants.call(this, i);
                break;
            }
            break;

          case 'subscription':
            switch (operation) {
              case 'getAll':
                result = await subscription.getAll.call(this, i);
                break;
              case 'get':
                result = await subscription.get.call(this, i);
                break;
              case 'getByMember':
                result = await subscription.getByMember.call(this, i);
                break;
              case 'cancel':
                result = await subscription.cancel.call(this, i);
                break;
              case 'reactivate':
                result = await subscription.reactivate.call(this, i);
                break;
            }
            break;

          case 'grant':
            switch (operation) {
              case 'getAll':
                result = await grant.getAll.call(this, i);
                break;
              case 'get':
                result = await grant.get.call(this, i);
                break;
              case 'create':
                result = await grant.create.call(this, i);
                break;
              case 'revoke':
                result = await grant.revoke.call(this, i);
                break;
              case 'getByMember':
                result = await grant.getByMember.call(this, i);
                break;
            }
            break;

          case 'tag':
            switch (operation) {
              case 'getAll':
                result = await tag.getAll.call(this, i);
                break;
              case 'get':
                result = await tag.get.call(this, i);
                break;
              case 'create':
                result = await tag.create.call(this, i);
                break;
              case 'delete':
                result = await tag.deleteTag.call(this, i);
                break;
              case 'getMembers':
                result = await tag.getMembers.call(this, i);
                break;
            }
            break;

          case 'note':
            switch (operation) {
              case 'getAll':
                result = await note.getAll.call(this, i);
                break;
              case 'create':
                result = await note.create.call(this, i);
                break;
              case 'update':
                result = await note.update.call(this, i);
                break;
              case 'delete':
                result = await note.deleteNote.call(this, i);
                break;
            }
            break;

          case 'form':
            switch (operation) {
              case 'getAll':
                result = await form.getAll.call(this, i);
                break;
              case 'get':
                result = await form.get.call(this, i);
                break;
              case 'getSubmissions':
                result = await form.getSubmissions.call(this, i);
                break;
            }
            break;

          case 'webhook':
            switch (operation) {
              case 'getAll':
                result = await webhook.getAll.call(this, i);
                break;
              case 'create':
                result = await webhook.create.call(this, i);
                break;
              case 'delete':
                result = await webhook.deleteWebhook.call(this, i);
                break;
            }
            break;
        }

        returnData.push(...result);
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: { error: (error as Error).message },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
