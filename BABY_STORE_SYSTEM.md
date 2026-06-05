# Baby Store Management System
## Complete High-Fidelity UI/UX System

A modern, comprehensive eCommerce + Inventory Management + AI Customer Support platform for baby products.

---

## 🎨 Design System

### Color Palette
- **Primary**: `#F8BBD0` - Soft pastel pink
- **Secondary**: `#FCE4EC` - Lighter pink
- **Accent**: `#EC407A` - Vibrant pink
- **Background**: `#FFF8FA` - Warm white
- **Success**: `#66BB6A` - Green
- **Warning**: `#FFA726` - Orange
- **Destructive**: `#EF5350` - Red
- **Info**: `#42A5F5` - Blue

### Typography
- Modern sans-serif font stack
- Heading weights: 500-700
- Body text: 400-500

### Design Principles
- Material Design 3 inspired
- Mobile-first responsive design
- Premium and professional aesthetic
- Friendly and welcoming for parents and mothers
- Soft, rounded corners (12px border radius)
- Subtle shadows and elevation

---

## 📦 System Architecture

The system consists of **3 main portals**:

### 1. Customer Website
**Public-facing eCommerce platform**

#### Pages:
- **Home** (`/`) - Hero carousel, featured categories, best sellers, flash sale, customer reviews, newsletter
- **Product Listing** (`/products`) - Grid/list view, advanced filters (category, brand, price, age, rating), sorting
- **Product Detail** (`/product/:id`) - Image gallery, variants (size, color), specifications, reviews, related products
- **Shopping Cart** (`/cart`) - Cart management, quantity adjustment, coupon input
- **Checkout** (`/checkout`) - Multi-step checkout, address selection, payment methods (COD, VNPay, MoMo)
- **Order History** (`/orders`) - Order list with status tracking
- **Order Detail** (`/orders/:id`) - Order timeline, payment & shipping status
- **Wishlist** (`/wishlist`) - Saved products
- **Customer Profile** (`/profile`) - Personal info, addresses, password change
- **Authentication** (`/auth`) - Login, register, forgot password

#### Features:
- Search functionality
- Category navigation
- Multi-level filtering
- Product recommendations
- Review system
- Responsive design (desktop, tablet, mobile)

### 2. Admin Portal
**Comprehensive management dashboard**

#### Dashboard (`/admin`)
- Revenue, Orders, Products, Customers KPIs
- Revenue trend chart (6 months)
- Orders chart (weekly)
- Low stock alerts table
- Recent orders table

#### Product Management (`/admin/products`)
- Product listing with search & filters
- Bulk actions (edit, export, delete)
- Product CRUD operations
- Image upload
- Variant management
- Product import/export

#### Excel Import Wizard (`/admin/products/import` | `/admin/inventory/import`)
**7-Step Import Flow:**
1. **Upload File** - Drag & drop Excel file + template download
2. **Preview Data** - Review imported rows
3. **Column Mapping** - Map Excel columns to database fields
4. **Validation** - Detect errors and warnings
5. **Duplicate Check** - Handle duplicate SKUs
6. **Summary** - Review import statistics
7. **Import Result** - Success/error report

#### Other Management Pages:
- **Order Management** - Order processing and tracking
- **Inventory Management** - Stock monitoring, low stock alerts, transactions
- **User Management** - User CRUD, role assignment, account management
- **Category Management** - Tree structure, hierarchical categories
- **Brand Management** - Brand CRUD operations
- **Coupon Management** - Coupon creation, usage statistics
- **Review Management** - Approve, reject, reply to reviews
- **Payment Management** - Transaction monitoring, refunds
- **Reports & Analytics** - Revenue, order, product, customer analytics
- **System Settings** - Store, payment, email, notification, AI settings

#### Features:
- Real-time KPI tracking
- Interactive charts (revenue, orders)
- Advanced filtering and search
- Bulk operations
- Excel import/export
- Role-based access

### 3. Staff Portal
**Operational interface for staff members**

#### Pages:
- **Dashboard** (`/staff`) - Task overview, quick actions
- **Order Processing** (`/staff/orders`) - Order queue management
- **Inventory** (`/staff/inventory`) - Stock monitoring, adjustments
- **Customer Support** (`/staff/support`) - Live chat monitoring

#### Features:
- Simplified interface focused on operations
- Real-time customer support
- Order fulfillment workflow
- Inventory monitoring

---

## 🤖 AI & Support Features

### AI Chatbot Widget
**Intelligent shopping assistant**

#### Features:
- Natural language product search
- Product recommendations
- Order tracking
- FAQ support
- Suggested questions
- Quick actions (Track Order, Promotions)
- Product cards within chat
- Instant responses

#### Example Queries:
- "Find products under 500,000 VND"
- "Recommend products for a 2-year-old baby"
- "Track my order"
- "Show current promotions"

### Live Customer Support Chat
**Real-time human support**

#### Customer Side:
- Chat interface with staff
- File/image upload
- Quick reply buttons
- Typing indicators
- Read receipts
- Average response time display

#### Staff Side:
- Active conversations dashboard
- Customer profile view
- Order history access
- Conversation tagging
- Internal notes
- Chat assignment

---

## 🛠 Technical Stack

### Frontend
- **React 18.3.1** - UI library
- **React Router 7.13.0** - Routing
- **Tailwind CSS 4.1.12** - Styling
- **shadcn/ui** - Component library (Radix UI primitives)
- **Recharts 2.15.2** - Charts and analytics
- **Lucide React** - Icons
- **Motion (Framer Motion)** - Animations

### Key Libraries
- `react-hook-form` - Form management
- `sonner` - Toast notifications
- `date-fns` - Date utilities
- `cmdk` - Command palette
- `embla-carousel-react` - Carousels
- `vaul` - Drawer component

### Components
- 40+ shadcn/ui components
- Custom layouts (Customer, Admin, Staff)
- Reusable widgets (AI Chat, Live Support)
- Responsive design system

---

## 📱 Responsive Design

All screens are fully responsive across:
- **Desktop**: 1920px, 1440px
- **Tablet**: 768px, 1024px
- **Mobile**: 375px, 414px

### Mobile Features:
- Hamburger menu navigation
- Touch-optimized interactions
- Mobile-first layouts
- Swipeable carousels
- Bottom sheet modals

---

## 🎯 Key Features

### Customer Experience
- ✅ Beautiful, intuitive product browsing
- ✅ Advanced filtering and search
- ✅ Product recommendations
- ✅ AI-powered shopping assistant
- ✅ Live customer support
- ✅ Multiple payment methods
- ✅ Order tracking with timeline
- ✅ Review and rating system
- ✅ Wishlist functionality
- ✅ Newsletter subscription

### Admin Capabilities
- ✅ Comprehensive dashboard with KPIs
- ✅ Product management with variants
- ✅ Excel import/export with validation
- ✅ Inventory tracking and alerts
- ✅ Order management and fulfillment
- ✅ User and role management
- ✅ Coupon and promotion management
- ✅ Analytics and reporting
- ✅ System configuration
- ✅ Review moderation

### Staff Operations
- ✅ Order processing queue
- ✅ Inventory monitoring
- ✅ Live chat support
- ✅ Customer information access
- ✅ Task management

---

## 🚀 Getting Started

The application is already set up and ready to use. Navigate through the different portals:

### Access Points:
- **Customer Website**: `/` (Home page)
- **Admin Portal**: `/admin` (Dashboard)
- **Staff Portal**: `/staff` (Staff dashboard)

### Navigation:
- Customer Website: Full header with categories, search, cart, wishlist
- Admin Portal: Sidebar navigation with all management sections
- Staff Portal: Simplified sidebar for operational tasks

### Floating Widgets:
- **AI Chatbot**: Bottom-right corner (sparkles icon)
- **Live Support**: Bottom-right corner, above chatbot (message icon)

---

## 📊 Sample Data

The application includes comprehensive sample data for demonstration:
- Products with images, pricing, variants
- Orders with different statuses
- Customer reviews and ratings
- KPI metrics and charts
- Low stock alerts
- Recent activity feeds

---

## 🎨 UI Components Used

### Layout Components
- Customer Layout (header, footer, navigation)
- Admin Layout (sidebar, top bar)
- Staff Layout (sidebar, top bar)

### Page Components
**Customer**: 10 pages
**Admin**: 14 pages
**Staff**: 4 pages
**Widgets**: 2 floating widgets

### UI Library
- Buttons (primary, secondary, outline, ghost)
- Cards and containers
- Forms and inputs
- Tables with sorting
- Modals and dialogs
- Dropdowns and menus
- Badges and chips
- Avatars
- Progress bars
- Tabs
- Carousels
- Charts (line, bar)
- Pagination
- Tooltips
- Alerts and toasts

---

## 🌟 Design Highlights

1. **Soft Pastel Pink Theme**: Professional yet warm and welcoming
2. **Material Design 3**: Modern, clean interface patterns
3. **Premium Feel**: High-quality visuals and smooth interactions
4. **Parent-Friendly**: Clear, easy-to-understand navigation
5. **Mobile-First**: Optimized for all device sizes
6. **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation
7. **Performance**: Optimized rendering, code splitting
8. **Consistency**: Unified design system across all portals

---

## 📈 Future Enhancements

Potential additions:
- Real backend API integration
- Database connection (PostgreSQL/MongoDB)
- Authentication system (JWT, OAuth)
- Real-time notifications (WebSocket)
- Advanced analytics (Google Analytics, Mixpanel)
- Email marketing integration
- SMS notifications
- Multi-language support (i18n)
- SEO optimization
- PWA capabilities
- Admin role permissions
- Advanced reporting dashboard
- Automated inventory management
- AI-powered product recommendations
- Customer segmentation
- Loyalty program

---

## 📄 License

This is a demonstration project showcasing a complete eCommerce system design.

---

Built with ❤️ using React, Tailwind CSS, and shadcn/ui
