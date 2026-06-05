# 🎯 Quick Start Guide - Baby Store Management System

## 📍 Main Navigation Routes

### Customer Website (Public)
- **Home**: `/` - Landing page with hero, products, categories
- **Products**: `/products` - Browse all products with filters
- **Product Detail**: `/product/:id` - Individual product page
- **Cart**: `/cart` - Shopping cart
- **Checkout**: `/checkout` - Complete purchase
- **Orders**: `/orders` - Order history
- **Profile**: `/profile` - Account settings
- **Wishlist**: `/wishlist` - Saved items
- **Auth**: `/auth` - Login/Register

### Admin Portal (Management)
- **Dashboard**: `/admin` - Analytics & KPIs
- **Products**: `/admin/products` - Product catalog management
- **Orders**: `/admin/orders` - Order processing
- **Inventory**: `/admin/inventory` - Stock management
- **Users**: `/admin/users` - User management
- **Categories**: `/admin/categories` - Category tree
- **Brands**: `/admin/brands` - Brand management
- **Coupons**: `/admin/coupons` - Promotions
- **Reviews**: `/admin/reviews` - Review moderation
- **Payments**: `/admin/payments` - Transactions
- **Reports**: `/admin/reports` - Analytics
- **Settings**: `/admin/settings` - System config
- **Import Products**: `/admin/products/import` - Excel import wizard
- **Import Inventory**: `/admin/inventory/import` - Stock import

### Staff Portal (Operations)
- **Dashboard**: `/staff` - Staff overview
- **Orders**: `/staff/orders` - Order processing
- **Inventory**: `/staff/inventory` - Stock monitoring
- **Support**: `/staff/support` - Live chat

## 🤖 Interactive Features

### Floating Widgets (Bottom Right)
1. **AI Chatbot** ✨ - Sparkles icon
   - Natural language product search
   - Recommendations
   - Order tracking
   - FAQ support

2. **Live Support** 💬 - Message icon
   - Real-time chat with staff
   - Quick replies
   - File sharing

## 🎨 Design System

### Color Tokens (in theme.css)
```css
--primary: #F8BBD0        /* Soft pink */
--secondary: #FCE4EC      /* Lighter pink */
--accent: #EC407A         /* Vibrant pink */
--background: #FFF8FA     /* Warm white */
--success: #66BB6A        /* Green */
--warning: #FFA726        /* Orange */
--destructive: #EF5350    /* Red */
--info: #42A5F5          /* Blue */
```

### Component Categories
- **Layout**: Headers, Sidebars, Footers
- **Navigation**: Menus, Breadcrumbs, Tabs
- **Data Display**: Tables, Cards, Lists, Charts
- **Forms**: Inputs, Selects, Checkboxes, Radios
- **Feedback**: Alerts, Toasts, Badges, Progress
- **Overlay**: Modals, Dialogs, Drawers, Popovers

## 📦 Key Features by Portal

### Customer Website
✅ Product browsing with filters & search
✅ Variant selection (size, color)
✅ Shopping cart with coupon codes
✅ Multi-step checkout
✅ Order tracking with timeline
✅ Product reviews & ratings
✅ Wishlist management
✅ AI shopping assistant
✅ Live customer support

### Admin Portal
✅ Real-time dashboard with KPIs
✅ Product CRUD with variants
✅ Excel import/export (7-step wizard)
✅ Inventory tracking & alerts
✅ Order fulfillment workflow
✅ User & role management
✅ Coupon creation & analytics
✅ Review moderation
✅ Payment monitoring
✅ Comprehensive reporting

### Staff Portal
✅ Order processing queue
✅ Inventory monitoring
✅ Customer support chat
✅ Task dashboard

## 🎯 Sample Workflows

### Customer Journey
1. Browse products on home page
2. Filter by category/price
3. View product details
4. Select variants (size/color)
5. Add to cart
6. Apply coupon code
7. Checkout with address
8. Select payment method
9. Track order status

### Admin Workflow
1. View dashboard KPIs
2. Check low stock alerts
3. Import products via Excel
4. Process orders
5. Manage inventory
6. Review analytics
7. Moderate customer reviews
8. Create promotional coupons

### Staff Workflow
1. Monitor order queue
2. Process new orders
3. Update inventory
4. Respond to customer chat
5. View customer history

## 📊 Excel Import Wizard

### 7-Step Process
1. **Upload** - Drag & drop Excel file
2. **Preview** - Review data rows
3. **Map** - Link columns to fields
4. **Validate** - Check for errors
5. **Duplicates** - Handle existing SKUs
6. **Summary** - Review import stats
7. **Result** - View success/errors

### Template Downloads
- Product template
- Inventory template

## 🛠 Component Locations

```
src/app/components/
├── customer/       (10 pages)
├── admin/          (14 pages)
├── staff/          (4 pages)
├── layouts/        (3 layouts)
├── widgets/        (2 widgets)
└── ui/             (40+ components)
```

## 🚀 Tech Stack

- React 18.3.1
- React Router 7.13.0
- Tailwind CSS 4.1.12
- shadcn/ui (Radix UI)
- Recharts (analytics)
- Lucide Icons
- Motion (animations)

## 📱 Responsive Breakpoints

- Mobile: 375px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

## 🎨 UI Components Available

All shadcn/ui components are available:
- Buttons, Cards, Badges
- Forms, Inputs, Selects
- Tables, Tabs, Accordions
- Modals, Dialogs, Drawers
- Charts, Progress, Sliders
- Avatars, Tooltips, Popovers
- And 30+ more...

## 📝 Notes

- All pages include responsive layouts
- Sample data is pre-populated
- Charts use Recharts library
- Icons from Lucide React
- Toast notifications via Sonner
- Form handling with react-hook-form

---

**Start exploring at**: `/` for the customer website or `/admin` for the admin portal!
