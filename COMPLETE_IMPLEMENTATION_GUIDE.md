# 🏗️ Complete Implementation Guide - Baby Store Management System

## Overview
This guide details the complete implementation of all 12 major modules for the Baby Store Management System, maintaining the existing soft pastel pink design system and Material Design 3 principles.

---

## 📋 Implementation Status

### ✅ Already Implemented (Existing)
- Design System Foundation (theme.css)
- Customer Website Core (Home, Products, Cart, Checkout)
- Admin Dashboard (KPIs, Charts)
- Product Management (CRUD, Import/Export)
- Excel Import Wizard (7-step flow)
- Staff Portal (Basic structure)
- AI Chatbot Widget
- Live Support Chat Widget
- Layouts (Customer, Admin, Staff)

### 🔨 To Be Implemented (12 Major Modules)

---

## MODULE 1: Customer Account Center (7 Screens)

### 1.1 Account Dashboard (`/account`)
**Status:** ✅ Created as `AccountCenter.tsx`

**Features:**
- Profile card with avatar, membership tier, loyalty points
- Loyalty progress bar to next tier
- Quick stats (Orders, Wishlist, Addresses, Reviews)
- Lifetime value display
- Quick action grid (6 actions)
- Recent orders list with status
- Pending actions (Reviews, Notifications)
- Notification preview

**Components:**
- Avatar with membership badge
- Progress bar for loyalty points
- Statistics cards (2x2 grid)
- Action cards (3-column grid)
- Order cards with status badges
- Notification cards with unread indicators

**Routes:**
```
/account → Account Center Dashboard
```

---

### 1.2 Personal Information (`/account/personal`)

**Components Needed:**
- Form with edit/save states
- Avatar upload with camera overlay
- Input fields with validation:
  * Full Name *
  * Email (with format validation) *
  * Phone Number (with format validation) *
  * Gender (Radio group)
  * Date of Birth (Date picker)

**States:**
- View mode (disabled inputs)
- Edit mode (enabled inputs)
- Validation errors (inline with icons)
- Success alert
- Loading/Saving state

**Validation Rules:**
```javascript
fullName: required, min 2 chars
email: required, valid email format
phone: required, valid phone format
gender: optional
dateOfBirth: optional, max date = today
```

---

### 1.3 Change Password (`/account/password`)

**Components:**
- Password strength indicator
  * Weak (Red) < 6 chars
  * Fair (Orange) 6-7 chars
  * Good (Blue) 8+ chars, mixed case
  * Strong (Green) 8+ chars, mixed case, numbers, special

**Form Fields:**
- Current Password (with show/hide toggle)
- New Password (with show/hide toggle)
- Confirm Password (with show/hide toggle)

**Validation:**
- Current password required
- New password ≥ 8 chars
- Must include uppercase, lowercase, number
- Passwords must match
- Cannot reuse current password

**Visual Elements:**
- Progress bar (colored by strength)
- Checklist with green checkmarks:
  * ✓ At least 8 characters
  * ✓ Uppercase and lowercase
  * ✓ Contains numbers
  * ✓ Contains special characters

---

### 1.4 Address Management (`/account/addresses`)

**Features:**
- Address cards grid (2 columns)
- Default address highlighted (accent border + badge)
- Add/Edit/Delete addresses
- Set default address

**Address Form:**
```
Receiver Name *
Phone Number *
Province/City * (dropdown)
District * (dropdown, dependent on province)
Ward * (dropdown, dependent on district)
Detail Address * (street, building)
```

**Card Display:**
- MapPin icon
- Receiver name (title)
- Phone number
- Full formatted address
- Actions: Set Default, Edit, Delete

**Dialog:**
- Modal for add/edit
- 2-column responsive form
- Cascading dropdowns
- Save/Cancel buttons

---

### 1.5 Wishlist Management (`/account/wishlist`)

**View Modes:**
- Grid view (product cards)
- List view (table)

**Product Card:**
- Product image
- Name, brand
- Current price
- Original price (if discounted)
- Discount badge
- Rating
- Stock status
- Actions:
  * Move to Cart button
  * Remove from Wishlist button

**Features:**
- Search wishlist
- Filter by category, price range
- Sort by date added, price
- Bulk actions (select multiple)
- Share wishlist

**Empty State:**
```
Icon: Heart (outline)
Message: "Your wishlist is empty"
Description: "Start adding products you love"
Action: "Browse Products" button
```

---

### 1.6 Review Management (`/account/reviews`)

**Tabs:**
1. Pending Reviews (products to review)
2. Submitted Reviews (published reviews)

**Pending Reviews:**
- Product card with image
- Order date
- "Write Review" button
- Shows product details

**Submitted Reviews:**
- Review card showing:
  * Product name & image
  * Star rating (1-5)
  * Review text
  * Review date
  * Status (Pending Approval / Published)
  * Edit button (if pending)
  * Delete button

**Write Review Form:**
- Star rating selector (interactive)
- Review title (optional)
- Review text (textarea, min 10 chars)
- Photo upload (optional, max 5 images)
- Submit button

**States:**
- Loading reviews
- Empty pending reviews
- Empty submitted reviews
- Review submission success

---

### 1.7 Notification Center (`/account/notifications`)

**Categories:**
- All Notifications
- Promotions (Gift icon, accent color)
- Order Updates (Package icon, info color)
- System Notifications (Bell icon, muted color)

**Notification Card:**
- Icon (based on type)
- Message text
- Timestamp
- Unread indicator (accent background)
- Action button (optional)

**Features:**
- Mark as read
- Mark all as read
- Delete notification
- Filter by category
- Infinite scroll or pagination

**Empty State:**
```
Icon: Bell (outline)
Message: "No notifications"
Description: "You're all caught up!"
```

---

## MODULE 2: Admin Order Management

### 2.1 Order Dashboard (`/admin/orders`)

**KPI Cards (1st row - 5 cards):**
1. Total Orders
   - Icon: ShoppingCart
   - Value: 1,234
   - Change: +8.2% ↑ (green)

2. Pending Orders
   - Icon: Clock
   - Value: 45
   - Color: Warning

3. Shipping Orders
   - Icon: Truck
   - Value: 89
   - Color: Info

4. Delivered Orders
   - Icon: CheckCircle
   - Value: 1,056
   - Color: Success

5. Cancelled Orders
   - Icon: XCircle
   - Value: 44
   - Color: Destructive

**Charts (2nd row):**
- Order Trend (Line chart) - 30 days
- Order Status Distribution (Pie chart)

**Recent Orders Table:**
- Columns: Order ID, Customer, Amount, Status, Date, Actions
- Show last 10 orders
- "View All Orders" link

---

### 2.2 Order List (Data Grid) (`/admin/orders/list`)

**Advanced Table Features:**
- Search by: Order ID, Customer Name, Email
- Filter by:
  * Date Range
  * Status (All, Pending, Confirmed, Shipping, Delivered, Cancelled)
  * Payment Status (Paid, Unpaid, Refunded)
  * Payment Method (COD, VNPay, MoMo)
  * Amount Range

**Table Columns:**
```
☐ Checkbox (select)
Order ID (sortable)
Customer Name
Email
Total Amount (sortable)
Payment Status (badge)
Payment Method (badge)
Order Status (badge)
Created Date (sortable)
Actions (View, Edit Status, Print)
```

**Bulk Actions:**
- Export selected to Excel
- Update status (for multiple orders)
- Print invoices
- Send email notifications

**Pagination:**
- Show: 10, 25, 50, 100 per page
- Page navigation
- Total count display

**Row Actions Dropdown:**
- View Details
- Edit Status
- Print Invoice
- Send Notification
- Cancel Order
- Refund

---

### 2.3 Order Detail (`/admin/orders/:id`)

**Layout:** 2-column (8/4 grid)

**Left Column:**

**Order Timeline (Visual):**
```
Vertical timeline with icons:
● Pending (Clock) - June 4, 10:30
● Confirmed (CheckCircle) - June 4, 11:00
● Shipping (Truck) - June 5, 09:15
● Delivered (Package) - [Pending]

Colors: Green (completed), Gray (pending)
Connected by vertical line
```

**Order Items Table:**
```
Product (image + name) | SKU | Qty | Price | Total
```

**Order Summary:**
```
Subtotal:          2,470,000 ₫
Shipping:             50,000 ₫
Discount (CODE):    -100,000 ₫ (green)
─────────────────────────────
Total:             2,420,000 ₫ (accent, bold)
```

**Customer Notes:**
- MessageSquare icon
- Display customer delivery instructions

**Right Sidebar:**

**Order Status Card:**
- Status dropdown selector
- Action buttons:
  * Confirm Order (green)
  * Update Status (outline)
  * Cancel Order (red)

**Customer Information:**
- User icon
- Name, Email, Phone
- "View Customer Profile" link

**Shipping Address:**
- MapPin icon
- Receiver name & phone
- Full address

**Payment Information:**
- CreditCard icon
- Payment method (badge)
- Payment status (badge)
- Transaction ID
- Paid timestamp

**Actions Bar:**
- Print Invoice button
- Send Email button
- Back to Orders button

---

### 2.4 Order Status Workflow

**Status Flow:**
```
Pending → Confirmed → Shipping → Delivered
           ↓
        Cancelled (at any point)
```

**Status Change Rules:**
- Pending → Confirmed (admin action)
- Confirmed → Shipping (admin action + tracking)
- Shipping → Delivered (admin action + confirmation)
- Any → Cancelled (requires reason)

**Timeline Events:**
- Order Created
- Payment Confirmed
- Order Confirmed
- Shipped (with tracking number)
- Out for Delivery
- Delivered
- Cancelled (with reason)
- Refunded

**Notifications:**
Each status change triggers:
- Customer email
- Customer notification
- Admin notification (if cancelled)

---

## MODULE 3: Inventory Management

### 3.1 Inventory Dashboard (`/admin/inventory`)

**KPI Cards:**
1. Total Products: 856
2. In Stock: 798 (green)
3. Low Stock: 45 (warning)
4. Out of Stock: 13 (destructive)

**Stock Value Card:**
- Total inventory value: 450,000,000 ₫
- Monthly change: +5.2%

**Charts:**
- Stock Level Trend (30 days)
- Category Distribution (Pie)
- Low Stock Alerts (Bar chart)

**Recent Transactions:**
- Last 10 inventory movements
- Type (Import, Export, Adjustment)
- Quantity change
- Date & User

---

### 3.2 Inventory Table (`/admin/inventory/list`)

**Columns:**
```
Product Name
SKU
Category
Variant (Size/Color)
Current Stock
Reserved Stock
Available Stock
Status (badge: In Stock, Low Stock, Out of Stock)
Last Updated
Actions
```

**Filters:**
- Category
- Brand
- Status (In Stock, Low Stock, Out of Stock)
- Search by SKU or Product Name

**Bulk Actions:**
- Export inventory
- Adjust stock
- Set reorder point

**Stock Status Colors:**
- In Stock (stock > 20): Green badge
- Low Stock (stock 1-20): Orange badge
- Out of Stock (stock = 0): Red badge

---

### 3.3 Inventory Detail (`/admin/inventory/:sku`)

**Stock Overview Card:**
- Current Stock: 45
- Reserved: 5
- Available: 40
- Reorder Point: 20
- Reorder Quantity: 50

**Stock Movement Chart:**
- 30-day history
- Line chart showing stock levels

**Transaction History Table:**
```
Date | Type | Quantity | Balance | Note | User
```

**Transaction Types:**
- Import (green, +)
- Export (blue, -)
- Return (info, +)
- Adjustment (gray, +/-)
- Cancelled (destructive, +)

**Actions:**
- Adjust Stock button
- Set Reorder Point button
- Export History button

---

### 3.4 Inventory Import Wizard (5 Steps)

**Step 1: Upload Excel**
- Drag & drop zone
- File type: .xlsx, .xls
- Max size: 10MB
- "Download Template" button

**Step 2: Preview Data**
- Table preview (first 10 rows)
- Total rows count
- Column detection
- Continue/Cancel buttons

**Step 3: Validation**
- SKU validation (exists in system)
- Quantity validation (numeric, positive)
- Error highlighting (red rows)
- Warning highlighting (yellow rows)
- Error count summary

**Step 4: Stock Change Preview**
- Before/After comparison
- SKU | Current Stock | Change | New Stock
- Warnings for negative stock

**Step 5: Confirm & Import**
- Summary:
  * Total SKUs: 150
  * Valid: 145 (green)
  * Warnings: 3 (yellow)
  * Errors: 2 (red)
- Import History log
- "Complete Import" button
- Success message with counts

**Progress Indicator:**
- Linear stepper (1 → 2 → 3 → 4 → 5)
- Each step highlighted when active
- Green checkmark when completed

---

### 3.5 Transaction History (`/admin/inventory/transactions`)

**Filters:**
- Date Range
- Transaction Type
- Product/SKU
- User

**Table:**
```
ID | Date | Type | Product | SKU | Qty | User | Note
```

**Export:**
- Export to Excel
- Date range selection
- Filter applied before export

---

## MODULE 4: User Management

### 4.1 User Dashboard (`/admin/users`)

**KPI Cards:**
1. Total Users: 3,542
2. Customers: 3,421 (accent)
3. Staff: 85 (info)
4. Admins: 36 (warning)

**User Growth Chart:**
- 12-month trend
- New users per month

**Recent Users Table:**
- Last 20 registered users
- Name, Email, Role, Status, Date

---

### 4.2 User Table (`/admin/users/list`)

**Columns:**
```
☐ | Avatar | Name | Email | Phone | Role | Status | Created | Actions
```

**Filters:**
- Role (Customer, Staff, Admin)
- Status (Active, Inactive, Locked)
- Registration Date Range
- Search by Name/Email/Phone

**Bulk Actions:**
- Export selected
- Change role
- Lock/Unlock accounts
- Send email

**Row Actions:**
- View Details
- Edit User
- Change Role
- Lock/Unlock
- Reset Password
- Delete (with confirmation)

---

### 4.3 User Detail (`/admin/users/:id`)

**Personal Information Tab:**
- Avatar
- Full Name
- Email
- Phone
- Gender
- Date of Birth
- Created Date
- Last Login

**Account Tab:**
- Role selector
- Status toggle (Active/Inactive)
- Lock account button
- Reset password button
- Delete account button

**Order History Tab:**
- Order table
- Total orders
- Total spent
- Average order value

**Address History Tab:**
- List of saved addresses

**Review History Tab:**
- Reviews written
- Rating distribution

**Activity Timeline Tab:**
- Login history
- Order history
- Profile changes

---

### 4.4 Role Management (`/admin/users/roles`)

**Roles List:**
1. Admin (full access)
2. Staff (operations)
3. Customer (shopping)

**Role Detail:**
- Role name
- Description
- Permissions list (checkboxes):
  * View Dashboard
  * Manage Products
  * Manage Orders
  * Manage Inventory
  * Manage Users
  * Manage Settings
  * View Reports

**Users in Role:**
- Table of users with this role
- Add/Remove user from role

---

## MODULE 5: Category Management

### 5.1 Category Tree View (`/admin/categories`)

**Tree Structure (nested):**
```
▾ Clothing & Apparel (245)
  ▸ Baby Clothes (156)
  ▸ Toddler Clothes (89)
▾ Feeding & Nursing (189)
  ▸ Bottles (67)
  ▸ Feeding Sets (55)
  ▸ Bibs (67)
▸ Diapers & Bath (156)
▸ Toys & Entertainment (312)
```

**Category Card:**
- Category name
- Product count
- Status (Active/Inactive)
- Actions: Edit, Add Subcategory, Delete

**Add/Edit Form:**
- Category Name *
- Parent Category (dropdown, nullable)
- Description
- Sort Order (number)
- Status (toggle)
- Image Upload

**Drag & Drop:**
- Reorder categories
- Move to different parent
- Visual feedback during drag

---

### 5.2 Category Statistics

**For Each Category:**
- Total Products
- Products in Stock
- Total Revenue
- Top Selling Products

**Chart:**
- Revenue by Category (Pie chart)

---

## MODULE 6: Brand Management

### 6.1 Brand Table (`/admin/brands`)

**Columns:**
```
Logo | Brand Name | Products Count | Status | Created | Actions
```

**Add/Edit Form:**
- Brand Name *
- Description
- Website URL
- Logo Upload (with preview)
- Status (Active/Inactive)

**Logo Upload:**
- Drag & drop area
- Image preview (square, 200x200)
- Max size: 2MB
- Formats: PNG, JPG, SVG

---

### 6.2 Brand Detail (`/admin/brands/:id`)

**Overview:**
- Logo display
- Brand name
- Description
- Website link
- Statistics card:
  * Total Products
  * Total Sales
  * Revenue

**Products Tab:**
- Table of products under this brand
- Filter, search, sort

**Statistics Tab:**
- Revenue chart
- Best selling products
- Monthly sales trend

---

## MODULE 7: Coupon Management

### 7.1 Coupon Dashboard (`/admin/coupons`)

**KPI Cards:**
1. Total Coupons: 45
2. Active Coupons: 23
3. Expired Coupons: 15
4. Usage Rate: 67%

**Chart:**
- Coupon usage over time

---

### 7.2 Coupon Table

**Columns:**
```
Code | Type | Value | Usage | Limit | Valid From | Valid To | Status | Actions
```

**Coupon Types:**
- Percentage (%)
- Fixed Amount (₫)
- Free Shipping

**Add/Edit Form:**
```
Coupon Code * (auto-generate option)
Coupon Type * (dropdown)
Discount Value *
Minimum Order Amount
Maximum Discount (for percentage)
Usage Limit (total)
Usage Limit per Customer
Valid From *
Valid To *
Status (Active/Inactive)
```

---

### 7.3 Coupon Usage Analytics

**For Each Coupon:**
- Total Uses
- Total Discount Given
- Total Orders
- Revenue Impact
- Usage by Date (chart)

**Top Performing Coupons:**
- Table sorted by usage
- Revenue generated

---

## MODULE 8: Review Management

### 8.1 Review Dashboard (`/admin/reviews`)

**KPI Cards:**
1. Total Reviews: 856
2. Pending Approval: 23
3. Approved: 798
4. Average Rating: 4.6 ⭐

**Rating Distribution:**
- Bar chart showing 1-5 stars

---

### 8.2 Review Table

**Columns:**
```
Product | Customer | Rating | Review | Date | Status | Actions
```

**Status:**
- Pending (orange badge)
- Approved (green badge)
- Rejected (red badge)

**Filters:**
- Status
- Rating (1-5 stars)
- Date Range
- Product
- Customer

---

### 8.3 Review Moderation

**Review Card:**
- Product info (image, name)
- Customer info (name, verified purchase badge)
- Star rating
- Review title
- Review text
- Images (if any)
- Date submitted

**Actions:**
- Approve button (green)
- Reject button (red)
- Reply button
- Delete button

**Reply Form:**
- Textarea for admin response
- "Post Reply" button
- Reply appears under review

---

## MODULE 9: Payment Management

### 9.1 Payment Dashboard (`/admin/payments`)

**KPI Cards:**
1. Total Transactions: 1,234
2. Successful: 1,189 (green)
3. Pending: 23 (warning)
4. Failed: 22 (destructive)

**Transaction Volume Chart:**
- Daily transaction trend
- Amount chart

---

### 9.2 Transaction Table

**Columns:**
```
Transaction ID | Order ID | Customer | Amount | Method | Status | Date | Actions
```

**Payment Methods:**
- COD (badge)
- VNPay (badge)
- MoMo (badge)

**Payment Status:**
- Pending (warning)
- Paid (success)
- Failed (destructive)
- Refunded (info)

---

### 9.3 Transaction Detail

**Information:**
- Transaction ID
- Order ID (link to order)
- Customer (link to user)
- Amount
- Payment Method
- Gateway Response
- Transaction Date
- Status

**Refund Section:**
- Refund Amount input
- Refund Reason textarea
- "Process Refund" button

**Timeline:**
- Transaction Created
- Payment Processed
- Payment Confirmed
- Refunded (if applicable)

---

### 9.4 Gateway Settings (`/admin/payments/settings`)

**VNPay Settings:**
- Merchant ID
- Secret Key (password field)
- Sandbox Mode (toggle)
- Test Credentials

**MoMo Settings:**
- Partner Code
- Access Key
- Secret Key
- Sandbox Mode (toggle)

**Test Connection:**
- "Test VNPay Connection" button
- "Test MoMo Connection" button
- Success/Error message display

---

## MODULE 10: Reports & Analytics

### 10.1 Executive Dashboard (`/admin/reports`)

**Top KPIs (1st row):**
1. Total Revenue
2. Total Orders
3. Total Customers
4. Average Order Value

**Charts (2nd row):**
- Revenue Trend (6 months)
- Order Volume (6 months)

**Quick Links:**
- Revenue Analytics →
- Order Analytics →
- Product Analytics →
- Customer Analytics →

---

### 10.2 Revenue Analytics (`/admin/reports/revenue`)

**Date Range Selector:**
- Last 7 Days
- Last 30 Days
- Last 90 Days
- Last 12 Months
- Custom Range

**Charts:**
1. Revenue Trend (Line chart)
2. Revenue by Category (Pie chart)
3. Revenue by Payment Method (Bar chart)

**Table:**
- Daily/Weekly/Monthly breakdown
- Revenue, Orders, AOV columns

**Export:**
- Export to Excel
- Export to PDF

---

### 10.3 Order Analytics

**Charts:**
1. Order Volume Trend
2. Order Status Distribution
3. Orders by Hour/Day

**Metrics:**
- Total Orders
- Conversion Rate
- Average Order Value
- Orders per Customer

---

### 10.4 Product Analytics

**Top Products Table:**
```
Rank | Product | Category | Units Sold | Revenue | Growth
```

**Charts:**
- Best Sellers (Bar chart)
- Category Performance (Pie chart)

---

### 10.5 Customer Analytics

**Metrics:**
- Total Customers
- New Customers (this month)
- Returning Customers
- Customer Lifetime Value

**Charts:**
- Customer Acquisition (Line chart)
- Customer Segmentation (Pie chart)
  * New (0-1 orders)
  * Regular (2-5 orders)
  * Loyal (6+ orders)

---

### 10.6 Inventory Analytics

**Metrics:**
- Total Products
- Products in Stock
- Low Stock Alerts
- Out of Stock

**Charts:**
- Stock Level Trend
- Turnover Rate by Category

---

### 10.7 Coupon Analytics

**Metrics:**
- Total Coupons Created
- Active Coupons
- Total Usage
- Total Discount Given

**Top Coupons Table:**
- Code, Usage, Discount, Revenue Impact

---

### 10.8 Review Analytics

**Metrics:**
- Total Reviews
- Average Rating
- Review Response Rate
- Pending Reviews

**Charts:**
- Rating Distribution (1-5 stars)
- Reviews over Time

---

### 10.9 Chat Analytics

**Metrics:**
- Total Conversations
- Average Response Time
- Customer Satisfaction
- Resolution Rate

**Charts:**
- Conversations per Day
- Response Time Trend

---

### 10.10 AI Analytics

**Metrics:**
- Total AI Interactions
- Questions Answered
- Products Recommended
- Escalated to Human

**Charts:**
- AI Usage Trend
- Top Questions
- Success Rate

---

## MODULE 11: System Settings

### 11.1 General Settings (`/admin/settings/general`)

**Store Information:**
- Store Name
- Store Email
- Store Phone
- Store Address
- Timezone
- Currency
- Language

---

### 11.2 Logo & Banner Management

**Logo Upload:**
- Main Logo (dark background)
- Logo Light (light background)
- Favicon
- Preview area

**Banner Management:**
- Home page banners
- Category banners
- Upload interface
- Position/sort order
- Active/Inactive toggle

---

### 11.3 Email Settings

**SMTP Configuration:**
- SMTP Host
- SMTP Port
- SMTP Username
- SMTP Password
- Encryption (None, SSL, TLS)
- From Name
- From Email

**Email Templates:**
- Order Confirmation
- Shipping Notification
- Delivery Confirmation
- Password Reset
- Welcome Email

**Test Email:**
- Send test email button
- Recipient email input

---

### 11.4 Notification Settings

**Order Notifications:**
- Order Created ✓
- Order Confirmed ✓
- Order Shipped ✓
- Order Delivered ✓
- Order Cancelled ✓

**Inventory Notifications:**
- Low Stock Alert ✓
- Out of Stock Alert ✓

**Customer Notifications:**
- New Customer Registration
- New Review Submitted ✓

---

### 11.5 Payment Settings

**Enable/Disable Methods:**
- COD (toggle)
- VNPay (toggle + settings)
- MoMo (toggle + settings)

**For Each Gateway:**
- API Credentials
- Sandbox/Production mode
- Test Connection button

---

### 11.6 Shipping Settings

**Shipping Methods:**
- Standard Shipping
- Express Shipping
- Same Day Delivery

**For Each Method:**
- Name
- Description
- Base Cost
- Additional Cost per KG
- Estimated Days
- Active/Inactive

**Shipping Zones:**
- Zone Name (e.g., Hồ Chí Minh City)
- Provinces included
- Shipping method availability
- Cost adjustments

---

### 11.7 Chat Settings

**Live Chat:**
- Enable/Disable toggle
- Auto-reply message
- Business hours
- Working days
- Offline message

**Chat Widget:**
- Position (Bottom Right/Left)
- Primary Color
- Welcome Message

---

### 11.8 AI Chatbot Settings

**AI Configuration:**
- Enable/Disable toggle
- AI Model (GPT-4, GPT-3.5)
- Temperature (slider 0-1)
- Max Tokens

**System Prompt:**
- Large textarea for custom prompt
- Default prompt template

**FAQ Management:**
- FAQ list
- Add/Edit/Delete FAQ
- FAQ Categories

**Knowledge Base:**
- Upload documents
- Product catalog sync
- Category information

---

### 11.9 SEO Settings

**Meta Tags:**
- Site Title
- Site Description
- Meta Keywords

**Social Media:**
- Facebook Meta Tags
- Twitter Card
- Open Graph Image

**Sitemap:**
- Generate Sitemap button
- Last Generated date
- sitemap.xml URL

---

### 11.10 Security Settings

**Two-Factor Authentication:**
- Enable 2FA (toggle)
- Require for Admins (toggle)

**Session Management:**
- Session Timeout (dropdown: 15min, 30min, 1hr, 2hr)
- Concurrent Sessions Limit

**Password Policy:**
- Minimum Length (number input)
- Require Uppercase (checkbox)
- Require Numbers (checkbox)
- Require Special Characters (checkbox)
- Password Expiry (days)

**IP Whitelist:**
- Add IP addresses
- Only allow admin access from listed IPs

---

### 11.11 Role & Permission Management

**Roles:**
- Admin
- Staff
- Customer

**For Each Role:**
- Permission checklist:
  * Dashboard (View)
  * Products (View, Create, Edit, Delete)
  * Orders (View, Create, Edit, Delete)
  * Inventory (View, Edit)
  * Users (View, Create, Edit, Delete)
  * Categories (View, Create, Edit, Delete)
  * Brands (View, Create, Edit, Delete)
  * Coupons (View, Create, Edit, Delete)
  * Reviews (View, Moderate, Delete)
  * Payments (View, Refund)
  * Reports (View, Export)
  * Settings (View, Edit)

**Save Permissions:**
- "Save Changes" button
- Success message

---

## MODULE 12: Customer Support Chat

### 12.1 Customer View (`/support/chat`)

**Conversation List (Left Sidebar):**
- Search conversations
- Active conversation highlighted
- Each conversation shows:
  * Last message preview
  * Timestamp
  * Unread count badge
  * Online status indicator

**Chat Window (Main Area):**

**Header:**
- Staff name & avatar
- Online status (green dot)
- "Close Conversation" button

**Message Area:**
- Messages scrollable
- Customer messages (right, accent background)
- Staff messages (left, secondary background)
- Typing indicator: "Staff is typing..."
- Read receipts (double check marks)

**Input Area:**
- Text input
- Emoji picker button
- Image upload button
- File upload button
- Send button

**Empty State:**
```
Icon: MessageCircle
Message: "No conversations"
Description: "Start a new conversation"
Action: "New Conversation" button
```

---

### 12.2 Staff View (`/staff/support`)

**Layout: 3 columns**

**Left: Conversation Queue**
- Tabs:
  * Assigned to Me (badge with count)
  * Waiting Queue (badge with count)
  * All Conversations

**Conversation Card:**
- Customer name & avatar
- Last message preview
- Wait time (if in queue)
- Priority indicator (high, normal, low)
- "Accept" button (if in queue)

**Middle: Chat Window**
- Same as customer view
- Additional actions:
  * Transfer to another staff
  * Add internal note
  * Close conversation
  * Mark as resolved

**Right: Customer Profile Sidebar**

**Customer Info:**
- Name, email, phone
- Membership tier
- Member since
- "View Full Profile" link

**Order History:**
- Recent orders list
- Total orders count
- Total spent

**Notes:**
- Internal notes (visible to staff only)
- Add note textarea
- Save note button

**Quick Actions:**
- Send product recommendations
- Send order status
- Escalate to manager

---

### 12.3 Admin View (`/admin/chat`)

**Chat Dashboard:**

**KPI Cards:**
1. Active Conversations: 23
2. Waiting in Queue: 5
3. Resolved Today: 45
4. Avg Response Time: 2m 30s

**Charts:**
- Conversations per Hour
- Resolution Time Trend

**Staff Performance Table:**
```
Staff Name | Active | Resolved | Avg Response Time | Rating
```

**Active Conversations:**
- Table showing all active chats
- Staff assigned
- Customer name
- Duration
- Status

---

### 12.4 Chat States

**Empty State (No Conversations):**
```
Icon: MessageCircle (outline, large)
Message: "No active conversations"
Description: "All conversations are resolved"
```

**Loading State:**
- Skeleton loaders for conversation list
- Skeleton for messages

**Offline State:**
```
Icon: WifiOff
Message: "You're offline"
Description: "Check your connection"
```

**Error State:**
```
Icon: AlertCircle
Message: "Failed to load messages"
Action: "Retry" button
```

**Typing Indicator:**
- Three animated dots
- "[Staff Name] is typing..."

**Connection Status:**
- Green dot: Online
- Yellow dot: Away
- Gray dot: Offline

---

## Implementation Priority

### Phase 1: Customer Account (Week 1)
1. Account Center Dashboard ✅
2. Personal Information
3. Change Password
4. Address Management

### Phase 2: Core Admin Features (Week 2)
1. Order Detail with Timeline
2. User Management
3. Category Management
4. Brand Management

### Phase 3: Operations (Week 3)
1. Inventory Import Wizard
2. Coupon Management
3. Review Management
4. Payment Management

### Phase 4: Analytics & Settings (Week 4)
1. Complete Reports & Analytics
2. System Settings (all 11 sections)

### Phase 5: Customer Support (Week 5)
1. Customer Chat View
2. Staff Chat View
3. Admin Chat Dashboard

---

## Design Consistency Checklist

✅ Use existing color palette (Primary #F8BBD0, Accent #EC407A)
✅ Maintain Material Design 3 principles
✅ Reuse existing components (shadcn/ui)
✅ Follow existing spacing system
✅ Use Lucide React icons
✅ Implement responsive layouts
✅ Add loading/empty/error states
✅ Include form validation
✅ Toast notifications for success/error
✅ Maintain existing typography

---

## Component Reuse

**From Existing System:**
- Card, CardHeader, CardTitle, CardContent
- Button (primary, secondary, outline, ghost)
- Input, Label, Textarea
- Select, SelectTrigger, SelectValue
- Table, TableHeader, TableBody, TableRow, TableCell
- Badge (colored variants)
- Avatar, AvatarImage, AvatarFallback
- Dialog, DialogHeader, DialogTitle
- Tabs, TabsList, TabsTrigger, TabsContent
- Alert, AlertDescription
- Progress
- Switch, Checkbox, RadioGroup
- Separator
- Skeleton (for loading states)

**Icons (Lucide):**
- ShoppingBag, ShoppingCart, Package, Truck
- User, Users, UserCog
- Heart, Star, MessageCircle
- MapPin, CreditCard, Gift
- Settings, Bell, AlertCircle
- Upload, Download, Trash2, Edit
- Plus, Minus, Check, X
- TrendingUp, TrendingDown, BarChart3

---

## Next Steps

1. Create remaining customer account components
2. Implement admin order detail with timeline
3. Build inventory import wizard
4. Create user management CRUD
5. Implement category tree view
6. Build reports & analytics dashboards
7. Create complete system settings
8. Implement customer support chat (all views)

All components will maintain the soft pastel pink aesthetic and professional, parent-friendly design! 🎨
