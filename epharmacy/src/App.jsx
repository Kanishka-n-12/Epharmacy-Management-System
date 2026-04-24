import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import UserLayout from "./components/layout/components/UserLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

import HomePage from "./features/home/HomePage";
import CategoryPage from "./features/categories/pages/CategoryPage";
import MedicinesPage from "./features/medicines/pages/MedicinesPage";
import CartPage from "./features/cart/pages/CartPage";
import DeliveryPage from "./features/deliveries/pages/DeliveryPage";
import PaymentPage from "./features/payments/Pages/PaymentPage";
import MyProfile from "./features/users/pages/MyProfile";
import MyOrders from "./features/orders/Pages/MyOrders";
import MyPrescriptions from "./features/prescriptions/pages/MyPrescriptions";

import AboutUs from "./components/layout/components/AboutUs";
import ContactUs from "./components/layout//components/ContactUs";
import PrivacyPolicy from "./components/layout//components/PrivacyPolicy";
import DashboardPage from "./features/admin/pages/DashboardPage";
import UserManagementPage from "./features/admin/pages/UserManagementPage";
import CategoryManagement from "./features/admin/pages/CategoryManagement";
import MedicineManagementPage from "./features/admin/pages/MedicineManagementPage";
import DeliveryManagementPage from "./features/admin/pages/DeliveryManagementPage";
import ReportsAnalyticsPage from "./features/admin/pages/ReportsAnalyticsPage";
import PrescriptionManagementPage from "./features/admin/pages/PrescriptionManagementPage";
import OrdersPaymentManagementPage from "./features/admin/pages/OrdersPaymentsManagementPage";
import ErrorPage from "./components/layout/components/ErrorPage";
import MedicineDetailPage from "./features/medicines/pages/MedicineDetailPage";

const Placeholder = ({ name }) => (
  <div className="container py-5 text-center">
    <h3>{name} Page</h3>
  </div>
);

const Unauthorized = () => (
  <div className="container py-5 text-center">
    <h3>Access Denied</h3>
    <p className="text-muted">You don't have permission to view this page.</p>
    <a href="/" className="btn btn-success mt-3">Go Home</a>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<ErrorPage />} />

        <Route path="/" element={<UserLayout />}>
          <Route index element={<HomePage />} />
          <Route path="medicines" element={<MedicinesPage />} />
          <Route path="categories" element={<CategoryPage />} />
          <Route path="about" element={<AboutUs />} />
          <Route path="contact" element={<ContactUs />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="unauthorized" element={<Unauthorized />} />
          <Route path="login" element={<Navigate to="/" replace />} />
          <Route path="/medicines/:id" element={<MedicineDetailPage />} />

          <Route path="cart" element={
            <ProtectedRoute allowedRoles={["ROLE_USER"]}><CartPage /></ProtectedRoute>
          } />
          <Route path="delivery" element={
            <ProtectedRoute allowedRoles={["ROLE_USER"]}><DeliveryPage /></ProtectedRoute>
          } />
          <Route path="payments" element={
            <ProtectedRoute allowedRoles={["ROLE_USER"]}><PaymentPage /></ProtectedRoute>
          } />
          <Route path="profile" element={
            <ProtectedRoute allowedRoles={["ROLE_USER"]}><MyProfile /></ProtectedRoute>
          } />
          <Route path="orders" element={
            <ProtectedRoute allowedRoles={["ROLE_USER"]}><MyOrders /></ProtectedRoute>
          } />
          <Route path="prescriptions" element={
            <ProtectedRoute allowedRoles={["ROLE_USER"]}><MyPrescriptions /></ProtectedRoute>
          } />
        </Route>

        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/admin/user-management" element={
          <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><UserManagementPage /></ProtectedRoute>
        } />
        <Route path="/admin/category-management" element={
          <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><CategoryManagement /></ProtectedRoute>
        } />
        <Route path="/admin/medicine-management" element={
          <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><MedicineManagementPage /></ProtectedRoute>
        } />
        <Route path="/admin/delivery-management" element={
          <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><DeliveryManagementPage /></ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><ReportsAnalyticsPage /></ProtectedRoute>
        } />
        <Route path="/admin/prescription-management" element={
          <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><PrescriptionManagementPage /></ProtectedRoute>
        } />
        <Route path="/admin/orders-payment" element={
          <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><OrdersPaymentManagementPage /></ProtectedRoute>
        } />

      </Routes>

      
    </BrowserRouter>
  );
}