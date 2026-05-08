# Enterprise Documentation System Guide

## 🎯 Overview

The OMCLTA ERP Documentation System is a comprehensive, enterprise-grade solution for user training, knowledge management, and support. It combines world-class written content with AI-powered assistance to reduce onboarding time and improve operational accuracy.

## 🏗️ System Architecture

### Database Layer
- **manuals** - Core documentation articles
- **manual_categories** - Content organization
- **manual_versions** - Version history and rollback capability
- **manual_permissions** - Role-based visibility control
- **manual_feedback** - User feedback (helpful/unhelpful)
- **manual_search_index** - Full-text search capability
- **contextual_help** - Page-to-documentation mappings

### Backend Services
- **ManualController** - CRUD operations for documentation
- **ManualSearchController** - Full-text search with relevance ranking
- **AIAssistantController** - AI-powered Q&A based on documentation
- **ContextualHelpService** - Maps application pages to help articles

### Frontend Components
- **ManualPage** - Article reader with feedback
- **ManualSidebar** - Navigation tree by category
- **ManualSearch** - Real-time search with results dropdown
- **ContextHelpModal** - Context-sensitive help on any page
- **AIManualAssistant** - Conversational AI assistant

## 📚 Content Structure

### User Manual (Type: user)
For operational users: Sales Officers, Inventory Staff, Accounts Officers

**Categories:**
- Getting Started
- Module Guides (Sales, Inventory, Accounts, KYC)
- Workflow Walkthroughs
- FAQs & Troubleshooting

**Content Standard:**
Each section includes:
1. Overview - What and why
2. When to Use - Business context
3. Step-by-Step Guide - Numbered instructions
4. Expected Result - What should happen
5. Warnings - Important rules
6. Best Practices - Operational guidance
7. Troubleshooting - Common issues

### Admin Manual (Type: admin)
For system administrators and IT teams

**Coverage:**
- System architecture
- RBAC management
- Workflow configuration
- Location & multi-branch setup
- Inventory configuration
- Financial controls
- Audit & compliance
- AI & reporting
- Deployment & maintenance
- Security best practices
- Disaster recovery

## 🔍 Search & Discovery Features

### Full-Text Search
- Real-time search across title, content, keywords
- Relevance ranking based on:
  - Title match (highest weight)
  - Keyword match
  - Content match
  - Excerpt match

**Example:**
```
User searches: "how do I create a sales order?"
Results show:
1. "Creating and Managing Sales Orders" (title match - highest)
2. "Sales Order Best Practices" (content match)
3. "End-to-End Sales Process" (workflow match)
```

### AI Search
The AI assistant extracts keywords and finds relevant articles:
```
Question: "What documents do I need for KYC?"
AI Response: Based on KYC Process documentation...
[Displays excerpt from matching article]
```

### Contextual Help
Automatic recommendations based on current page:
```
User on: /dashboard/admin/users
Help Button Shows: "RBAC Management and Access Control"
```

## 🤖 AI Assistant Features

### Smart Answering
The AI assistant learns from documentation and answers:
- "How do I approve a sales order?"
- "What is the KYC process?"
- "How to transfer inventory?"

**Process:**
1. Extract keywords from question
2. Find relevant articles
3. Score by relevance
4. Generate response combining excerpts
5. Link to full articles

### Natural Language Understanding
- Parses user questions
- Extracts intent and keywords
- Finds matching documentation
- Provides contextual answers

## 🔐 Role-Based Visibility

Content is automatically filtered by user role:

### Sales Officer sees:
- Sales Order guides
- Customer management
- KYC process
- Sales workflow

### Accounts Manager sees:
- Financial accounting
- Voucher processing
- Ledger management
- Account reconciliation
- Price list management

### Super Admin sees:
- Everything
- All guides accessible

## 📊 Feedback & Analytics

### User Feedback
- Helpful/Unhelpful ratings
- Comment submission
- Improvement tracking

**Feedback Page Shows:**
- Total views per article
- Helpful vs unhelpful ratio
- Comments for improvement
- Popular articles trending

### Content Insights
- Most viewed articles
- Least helpful articles
- Search patterns
- User behavior tracking

## 🚀 Getting Started

### 1. Migrate Database
```bash
php artisan migrate
```

### 2. Seed Documentation
```bash
php artisan db:seed --class=DocumentationSeeder
php artisan db:seed --class=ComprehensiveDocumentationSeeder
```

### 3. Access Admin Panel
Visit: `/dashboard/admin/documentation`

Create, edit, publish manuals

### 4. Publish Content
- Status: draft → published
- Automatically appears in search
- Visible to authorized users

### 5. Integrate Components
Add to layout:
```tsx
import { ManualSearch } from '@/components/documentation/ManualSearch';
import { ContextHelpModal } from '@/components/documentation/ContextHelpModal';
import { AIManualAssistant } from '@/components/documentation/AIManualAssistant';

export default function Layout() {
  return (
    <>
      <ManualSearch />
      <ContextHelpModal />
      <AIManualAssistant />
      {children}
    </>
  );
}
```

## 📱 API Endpoints

### Documentation Access
```
GET /api/v1/documentation/manuals
GET /api/v1/documentation/manuals/{slug}
GET /api/v1/documentation/categories
GET /api/v1/documentation/search?q=query
GET /api/v1/documentation/contextual-help?page=/path
```

### Administration
```
POST /api/v1/documentation/manuals
PATCH /api/v1/documentation/manuals/{id}
DELETE /api/v1/documentation/manuals/{id}
POST /api/v1/documentation/manuals/{id}/feedback
```

### AI Assistant
```
POST /api/v1/documentation/ai-assistant
{
  "question": "How do I create a sales order?"
}
Response:
{
  "response": "Based on the Sales Orders documentation...",
  "sources": [
    {"title": "Creating Sales Orders", "slug": "sales-orders"}
  ]
}
```

## 📝 Content Management

### Creating Documentation

**1. Via Admin Dashboard**
- Go to `/dashboard/admin/documentation`
- Click "+ Create Manual"
- Fill title, slug, type, excerpt
- Edit content (HTML editor)
- Save as draft
- Publish when ready

**2. Via API**
```bash
POST /api/v1/documentation/manuals
{
  "title": "Sales Orders Guide",
  "slug": "sales-orders",
  "category_id": "uuid",
  "type": "user",
  "content": "<h2>Content here</h2>",
  "excerpt": "Brief summary",
  "status": "draft"
}
```

### Content Best Practices

1. **Clear Titles**
   - "Creating Sales Orders" ✅
   - "Sales Orders" ✅
   - "Order Management System" ❌ (too vague)

2. **Keyword Optimization**
   - Include searchable terms
   - Use business terminology
   - Support natural language queries

3. **Structure**
   - Headings for scanability
   - Numbered steps for procedures
   - Tables for comparisons
   - Callouts for warnings

4. **Screenshots**
   - Placeholder: `[Screenshot of Sales Order Form]`
   - Replace with actual screenshots
   - Use arrows to highlight key areas

## 🔗 Contextual Help Mappings

Map application routes to help articles:

**Default Mappings:**
```
/dashboard → getting-started
/sales → sales-orders
/sales/orders → sales-orders
/inventory → inventory-management
/accounts → financial-accounting
/kyc → kyc-process
/dashboard/admin/users → rbac-management
/dashboard/admin/roles → rbac-management
```

**Add Custom Mapping:**
```php
$helpService = app(ContextualHelpService::class);
$helpService->registerMapping('/custom/page', 'manual-slug');
```

## 📊 Documentation Metrics

### Dashboard Shows:
- Total articles (published, draft, archived)
- View counts by article
- Helpful/unhelpful ratio
- Most searched keywords
- New articles this month
- Editor activity

## 🔄 Versioning & History

Every edit is saved:
- Previous versions accessible
- Rollback to any version
- Change notes per update
- Audit trail of edits
- Editor attribution

**Example:**
```
Version 3 (Current)
- Updated pricing examples
- Added screenshot
- Edit by: Sarah (2026-05-08)

Version 2
- Fixed typo in step 3
- Edit by: John (2026-04-15)

Version 1 (Original)
- Initial publication
- Edit by: Mike (2026-04-01)
```

## 🎓 User Journey

### Onboarding Flow:
1. New user logs in
2. Sees Dashboard
3. ContextHelpModal suggests "Getting Started" guide
4. Reads through sections
5. Rates article helpful
6. Searches for "sales orders"
7. Reads Sales Orders guide
8. Asks AI: "How do I submit an order?"
9. AI provides step-by-step answer
10. User references guide while working

## 📈 Content Updates

### Monthly Review:
- Check unhelpful articles
- Update based on user feedback
- Add missing guides
- Refresh outdated content
- Monitor search trends

### Quarterly Refresh:
- Update for new features
- Add new workflow guides
- Improve struggling articles
- Expand best practices

## 🛠️ Troubleshooting

### Search Not Working
- Check article status: must be "published"
- Verify keywords are populated
- Ensure index is updated
- Check user permissions

### AI Assistant Not Responding
- Check API endpoint availability
- Verify JWT token
- Check documentation exists
- Review AI logs

### Context Help Missing
- Verify page route mapping exists
- Check manual is published
- Confirm user role has access
- Clear browser cache

## 💡 Advanced Features

### Custom HTML Content
- Full HTML support in articles
- Embedded videos via iframe
- Tables for data
- Code blocks with syntax highlighting
- Interactive examples (optional)

### Multi-Language Support (Future)
- Documentation translations
- User language preferences
- Translated search results

### Video Integration (Future)
- Embedded video tutorials
- Step-by-step video walkthroughs
- Screen recordings
- Interactive video guides

## 📞 Support

### For Users
- In-app AI Assistant: Click purple chat icon
- Help Button: Click on any page
- Search: Use search bar
- Contact: Support team contact info

### For Admins
- Documentation Management: `/dashboard/admin/documentation`
- Feedback Review: Dashboard analytics
- Performance Metrics: Admin analytics

## 🎯 Success Metrics

Target outcomes:
- ✅ Reduce onboarding time by 50%
- ✅ Decrease support tickets by 30%
- ✅ Improve user confidence scores
- ✅ Achieve 90%+ helpful rating
- ✅ Cover 100% of features documented
- ✅ Maintain <3 day update turnaround

## 📚 Documentation Modules Included

### User Guides (Completed)
- ✅ Getting Started
- ✅ Sales Orders
- ✅ Inventory Management
- ✅ Financial Accounting
- ✅ KYC Process
- ✅ Reports & Analytics
- ✅ End-to-End Sales Process

### Admin Guides (Completed)
- ✅ RBAC Management
- ✅ Inventory Configuration
- ✅ Workflow Approval Chains
- ✅ Multi-Location Setup
- ✅ Financial Controls

### In Roadmap
- 🔄 Video Tutorials
- 🔄 Interactive Simulations
- 🔄 Mobile App Guide
- 🔄 API Documentation
- 🔄 Custom Report Builder

---

**Version:** 1.0  
**Last Updated:** 2026-05-08  
**Status:** Production Ready

For questions: Documentation team or contact support
