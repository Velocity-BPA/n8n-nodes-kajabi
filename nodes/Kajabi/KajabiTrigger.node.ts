/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IDataObject,
  IHookFunctions,
  INodeType,
  INodeTypeDescription,
  IWebhookFunctions,
  IWebhookResponseData,
} from 'n8n-workflow';

import { kajabiApiRequest, parseJsonApiResponse, logLicensingNotice } from './transport/kajabiClient';

export class KajabiTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Kajabi Trigger',
    name: 'kajabiTrigger',
    icon: 'file:kajabi.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["event"]}}',
    description: 'Starts the workflow when Kajabi events occur',
    defaults: {
      name: 'Kajabi Trigger',
    },
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'kajabiOAuth2Api',
        required: true,
      },
    ],
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        responseMode: 'onReceived',
        path: 'webhook',
      },
    ],
    properties: [
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        required: true,
        default: 'member.created',
        options: [
          {
            name: 'Course Completed',
            value: 'course.completed',
            description: 'Triggered when a member completes a course',
          },
          {
            name: 'Form Submitted',
            value: 'form.submitted',
            description: 'Triggered when a form is submitted',
          },
          {
            name: 'Member Created',
            value: 'member.created',
            description: 'Triggered when a new member is created',
          },
          {
            name: 'Member Updated',
            value: 'member.updated',
            description: 'Triggered when a member is updated',
          },
          {
            name: 'Offer Purchased',
            value: 'offer.purchased',
            description: 'Triggered when an offer is purchased',
          },
          {
            name: 'Post Completed',
            value: 'post.completed',
            description: 'Triggered when a post is completed',
          },
          {
            name: 'Subscription Canceled',
            value: 'subscription.canceled',
            description: 'Triggered when a subscription is canceled',
          },
          {
            name: 'Subscription Created',
            value: 'subscription.created',
            description: 'Triggered when a new subscription is created',
          },
        ],
      },
      {
        displayName: 'Site ID',
        name: 'siteId',
        type: 'string',
        default: '',
        description: 'Filter webhooks to a specific site (optional)',
      },
    ],
  };

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        logLicensingNotice();

        const webhookUrl = this.getNodeWebhookUrl('default');
        const event = this.getNodeParameter('event') as string;

        try {
          const response = await kajabiApiRequest.call(this, 'GET', '/webhooks');
          const webhooks = parseJsonApiResponse(response);

          for (const webhook of webhooks) {
            if (webhook.url === webhookUrl && webhook.topic === event) {
              const webhookData = this.getWorkflowStaticData('node');
              webhookData.webhookId = webhook.id;
              return true;
            }
          }

          return false;
        } catch (error) {
          return false;
        }
      },

      async create(this: IHookFunctions): Promise<boolean> {
        logLicensingNotice();

        const webhookUrl = this.getNodeWebhookUrl('default');
        const event = this.getNodeParameter('event') as string;
        const siteId = this.getNodeParameter('siteId', '') as string;

        const body: IDataObject = {
          data: {
            type: 'webhooks',
            attributes: {
              url: webhookUrl,
              topic: event,
            },
          },
        };

        if (siteId) {
          (body.data as IDataObject).attributes = {
            ...(body.data as IDataObject).attributes as IDataObject,
            site_id: siteId,
          };
        }

        try {
          const response = await kajabiApiRequest.call(this, 'POST', '/webhooks', body);
          const webhooks = parseJsonApiResponse(response);

          if (webhooks.length > 0) {
            const webhookData = this.getWorkflowStaticData('node');
            webhookData.webhookId = webhooks[0].id;
            return true;
          }

          return false;
        } catch (error) {
          return false;
        }
      },

      async delete(this: IHookFunctions): Promise<boolean> {
        const webhookData = this.getWorkflowStaticData('node');
        const webhookId = webhookData.webhookId as string;

        if (!webhookId) {
          return true;
        }

        try {
          await kajabiApiRequest.call(this, 'DELETE', `/webhooks/${webhookId}`);
          delete webhookData.webhookId;
          return true;
        } catch (error) {
          return false;
        }
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    logLicensingNotice();

    const req = this.getRequestObject();
    const body = req.body as IDataObject;

    // Return the webhook payload
    return {
      workflowData: [
        this.helpers.returnJsonArray([
          {
            event: body.event || body.topic,
            timestamp: body.timestamp || new Date().toISOString(),
            data: body.data || body,
            raw: body,
          },
        ]),
      ],
    };
  }
}
