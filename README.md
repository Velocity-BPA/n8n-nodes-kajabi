# n8n-nodes-kajabi

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for Kajabi, enabling workflow automation for course management, member administration, subscription tracking, and digital product sales on the leading all-in-one knowledge commerce platform.

![n8n](https://img.shields.io/badge/n8n-community--node-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)

## Features

- **Complete API Coverage**: All 10 Kajabi resources with 50+ operations
- **OAuth 2.0 Authentication**: Secure client credentials flow with automatic token refresh
- **JSON:API Support**: Full parsing of Kajabi's JSON:API response format
- **Webhook Triggers**: Real-time event handling for member, subscription, and course events
- **Sparse Fieldsets**: Optimize API responses by requesting only needed fields
- **Flexible Filtering**: Filter members, courses, offers, and more by multiple criteria
- **Pagination Support**: Handle large datasets with automatic pagination

## Installation

### Community Nodes (Recommended)

1. Open your n8n instance
2. Go to **Settings** → **Community Nodes**
3. Click **Install**
4. Enter `n8n-nodes-kajabi`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n custom nodes directory
cd ~/.n8n/custom

# Install the package
npm install n8n-nodes-kajabi
```

### Development Installation

```bash
# Clone or extract the repository
cd n8n-nodes-kajabi

# Install dependencies
npm install

# Build the project
npm run build

# Create symlink to n8n custom nodes
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-kajabi

# Restart n8n
n8n start
```

## Credentials Setup

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| Client ID | String | Yes | OAuth Client ID from Kajabi Admin Portal |
| Client Secret | Password | Yes | OAuth Client Secret from Kajabi Admin Portal |

### Obtaining API Credentials

1. Log in to your Kajabi admin dashboard
2. Navigate to **Settings** → **API Keys** (or **User API Keys**)
3. Create a new OAuth application
4. Copy the **Client ID** and **Client Secret**
5. Use these in the n8n credential configuration

## Resources & Operations

### Sites
Manage your Kajabi sites.

| Operation | Description |
|-----------|-------------|
| Get All | List all sites in your account |
| Get | Retrieve a specific site by ID |

### Courses
Manage online courses and their content structure.

| Operation | Description |
|-----------|-------------|
| Get All | List all courses with optional filters |
| Get | Retrieve a specific course |
| Get Chapters | List chapters within a course |
| Get Categories | List categories for a course |
| Get Lessons | List lessons within a chapter |

### Members (Contacts)
Comprehensive member/contact management.

| Operation | Description |
|-----------|-------------|
| Get All | List members with filtering and sparse fieldsets |
| Get | Retrieve a specific member |
| Create | Add a new member to a site |
| Update | Modify member details |
| Delete | Remove a member |
| Get by Email | Find member by email address |
| Get Grants | List member's product access |
| Get Tags | List member's assigned tags |
| Add Tag | Assign a tag to a member |
| Remove Tag | Remove a tag from a member |

### Offers (Products)
Manage digital products and their pricing.

| Operation | Description |
|-----------|-------------|
| Get All | List all offers with status/site filters |
| Get | Retrieve a specific offer |
| Get Pricing | Get pricing options for an offer |
| Get Grants | List who has access to an offer |

### Subscriptions
Manage recurring payment subscriptions.

| Operation | Description |
|-----------|-------------|
| Get All | List subscriptions with filters |
| Get | Retrieve a specific subscription |
| Get by Member | List member's subscriptions |
| Cancel | Cancel a subscription |
| Reactivate | Restore a canceled subscription |

### Grants (Access)
Control product access for members.

| Operation | Description |
|-----------|-------------|
| Get All | List all grants |
| Get | Retrieve a specific grant |
| Create | Grant product access to a member |
| Revoke | Remove product access |
| Get by Member | List member's product access |

### Tags
Organize members with tags.

| Operation | Description |
|-----------|-------------|
| Get All | List all tags |
| Get | Retrieve a specific tag |
| Create | Create a new tag |
| Delete | Remove a tag |
| Get Members | List members with a specific tag |

### Notes
Add notes to member records.

| Operation | Description |
|-----------|-------------|
| Get All | List notes for a member |
| Create | Add a note to a member |
| Update | Edit an existing note |
| Delete | Remove a note |

### Forms
Access form data and submissions.

| Operation | Description |
|-----------|-------------|
| Get All | List all forms |
| Get | Retrieve a specific form |
| Get Submissions | List form submissions |

### Webhooks
Manage webhook registrations for real-time events.

| Operation | Description |
|-----------|-------------|
| Get All | List registered webhooks |
| Create | Register a new webhook |
| Delete | Remove a webhook |

## Trigger Node

The **Kajabi Trigger** node enables real-time workflow automation based on Kajabi events.

### Supported Events

| Event | Description |
|-------|-------------|
| `member.created` | New member registered |
| `member.updated` | Member details changed |
| `subscription.created` | New subscription started |
| `subscription.canceled` | Subscription canceled |
| `offer.purchased` | Product/offer purchased |
| `form.submitted` | Form submission received |
| `course.completed` | Member completed a course |
| `post.completed` | Member completed a post/lesson |

### Trigger Configuration

1. Add the **Kajabi Trigger** node to your workflow
2. Select the credential to use
3. Choose the event type(s) to listen for
4. Optionally filter by specific site
5. Activate the workflow

## Usage Examples

### Create a Member and Grant Product Access

```javascript
// Step 1: Create Member
// Configure Kajabi node with:
// - Resource: Member
// - Operation: Create
// - Email: {{ $json.email }}
// - First Name: {{ $json.firstName }}
// - Site ID: your-site-id

// Step 2: Grant Access
// Configure second Kajabi node with:
// - Resource: Grant
// - Operation: Create
// - Member ID: {{ $json.id }}
// - Offer ID: your-offer-id
```

### Sync Members to External CRM

```javascript
// Trigger: Kajabi Trigger (member.created)
// → Transform data with Function node
// → HTTP Request to your CRM API
```

### Cancel and Notify on Subscription End

```javascript
// Trigger: Kajabi Trigger (subscription.canceled)
// → Send email notification
// → Update internal records
// → Log to analytics
```

## Kajabi Concepts

### Sites
A Site represents a standalone Kajabi website. Each site has its own members, courses, and offers. Most operations are site-scoped.

### Offers vs Grants
- **Offer**: A product for sale (course, membership, coaching, etc.)
- **Grant**: A member's access to an offer (can be purchased or manually granted)

### JSON:API Format
Kajabi uses the JSON:API specification. This node handles all parsing automatically, returning flat objects with relationships preserved.

### Sparse Fieldsets
For large member lists, use sparse fieldsets to request only needed fields:
```
fields[members]=email,first_name,last_name
```

## Error Handling

The node includes comprehensive error handling:

| Error Type | Description | Resolution |
|------------|-------------|------------|
| 401 Unauthorized | Invalid or expired token | Check credentials, token auto-refreshes |
| 403 Forbidden | Insufficient permissions | Verify API key scope |
| 404 Not Found | Resource doesn't exist | Check IDs and filters |
| 422 Validation Error | Invalid request data | Check required fields |
| 429 Rate Limited | Too many requests | Reduce request frequency |

Enable **Continue On Fail** in node settings to handle errors gracefully in production workflows.

## Security Best Practices

1. **Secure Credentials**: Store Client ID/Secret in n8n credentials, never in workflow data
2. **Least Privilege**: Request only the API scopes you need
3. **Site Filtering**: Use site-specific operations when possible
4. **Webhook Verification**: Validate webhook signatures in production
5. **Rate Limiting**: Respect Kajabi's rate limits; use pagination for large datasets

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch mode for development
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure all tests pass and code follows the existing style.

## Support

- **Documentation**: [Kajabi API Reference](https://kajabi.readme.io/reference)
- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-kajabi/issues)
- **n8n Community**: [n8n Community Forum](https://community.n8n.io)

## Acknowledgments

- [Kajabi](https://kajabi.com) for their comprehensive API
- [n8n](https://n8n.io) for the powerful workflow automation platform
- The n8n community for inspiration and best practices
