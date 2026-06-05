import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { useState } from "react";
import { Toaster } from "./components/ui/sonner";

// Customer Website Pages
import CustomerLayout from "./components/layouts/CustomerLayout";
import HomePage from "./components/customer/HomePage";
import ProductListing from "./components/customer/ProductListing";
import ProductDetail from "./components/customer/ProductDetail";
import ShoppingCart from "./components/customer/ShoppingCart";
import Checkout from "./components/customer/Checkout";
import OrderHistory from "./components/customer/OrderHistory";
import OrderDetail from "./components/customer/OrderDetail";
import CustomerProfile from "./components/customer/CustomerProfile";
import Wishlist from "./components/customer/Wishlist";
import Auth from "./components/customer/Auth";
import AccountCenter from "./components/customer/AccountCenter";
import PersonalInformation from "./components/customer/PersonalInformation";
import ChangePassword from "./components/customer/ChangePassword";
import AddressManagement from "./components/customer/AddressManagement";
import WishlistManagement from "./components/customer/WishlistManagement";
import CustomerReviewManagement from "./components/customer/ReviewManagement";
import NotificationCenter from "./components/customer/NotificationCenter";

// Admin Portal Pages
import AdminLayout from "./components/layouts/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import ProductManagement from "./components/admin/ProductManagement";
import ProductForm from "./components/admin/ProductForm";
import OrderManagement from "./components/admin/OrderManagement";
import AdminOrderDetail from "./components/admin/AdminOrderDetail";
import InventoryManagement from "./components/admin/InventoryManagement";
import UserManagement from "./components/admin/UserManagement";
import CategoryManagement from "./components/admin/CategoryManagement";
import BrandManagement from "./components/admin/BrandManagement";
import CouponManagement from "./components/admin/CouponManagement";
import ReviewManagement from "./components/admin/ReviewManagement";
import PaymentManagement from "./components/admin/PaymentManagement";
import ReportsAnalytics from "./components/admin/ReportsAnalytics";
import SystemSettings from "./components/admin/SystemSettings";
import ExcelImport from "./components/admin/ExcelImport";

// Staff Portal Pages
import StaffLayout from "./components/layouts/StaffLayout";
import StaffDashboard from "./components/staff/StaffDashboard";
import StaffOrderProcessing from "./components/staff/StaffOrderProcessing";
import StaffInventory from "./components/staff/StaffInventory";
import StaffSupport from "./components/staff/StaffSupport";

// Shared Widgets
import AIChatbot from "./components/widgets/AIChatbot";
import LiveSupportChat from "./components/widgets/LiveSupportChat";

export default function App() {
  const [showAIChat, setShowAIChat] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);

  return (
    <BrowserRouter>
      <div className="size-full bg-background">
        <Routes>
          {/* Customer Website Routes */}
          <Route path="/" element={<CustomerLayout />}>
            <Route index element={<HomePage />} />
            <Route path="products" element={<ProductListing />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="cart" element={<ShoppingCart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="orders" element={<OrderHistory />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="profile" element={<CustomerProfile />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="auth" element={<Auth />} />
            {/* Account Center Routes */}
            <Route path="account" element={<AccountCenter />} />
            <Route path="account/personal" element={<PersonalInformation />} />
            <Route path="account/change-password" element={<ChangePassword />} />
            <Route path="account/addresses" element={<AddressManagement />} />
            <Route path="account/wishlist" element={<WishlistManagement />} />
            <Route path="account/reviews" element={<CustomerReviewManagement />} />
            <Route path="account/notifications" element={<NotificationCenter />} />
          </Route>

          {/* Admin Portal Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id/edit" element={<ProductForm />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="orders/:id" element={<AdminOrderDetail />} />
            <Route path="inventory" element={<InventoryManagement />} />
            <Route path="inventory/import" element={<ExcelImport type="inventory" />} />
            <Route path="products/import" element={<ExcelImport type="products" />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="brands" element={<BrandManagement />} />
            <Route path="coupons" element={<CouponManagement />} />
            <Route path="reviews" element={<ReviewManagement />} />
            <Route path="payments" element={<PaymentManagement />} />
            <Route path="reports" element={<ReportsAnalytics />} />
            <Route path="settings" element={<SystemSettings />} />
          </Route>

          {/* Staff Portal Routes */}
          <Route path="/staff" element={<StaffLayout />}>
            <Route index element={<StaffDashboard />} />
            <Route path="orders" element={<StaffOrderProcessing />} />
            <Route path="inventory" element={<StaffInventory />} />
            <Route path="support" element={<StaffSupport />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* AI Chatbot Widget */}
        <AIChatbot isOpen={showAIChat} onToggle={() => setShowAIChat(!showAIChat)} />

        {/* Live Support Chat Widget */}
        <LiveSupportChat isOpen={showLiveChat} onToggle={() => setShowLiveChat(!showLiveChat)} />

        {/* Toast Notifications */}
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}
