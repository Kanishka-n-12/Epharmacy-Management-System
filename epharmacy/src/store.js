import { configureStore } from "@reduxjs/toolkit";
import cartReducer     from "./features/cart/slice/cartSlice";
import medicineReducer from "./features/medicines/slices/medicineSlice";
import authReducer     from "./features/auth/slice/authSlice";
import categoryReducer  from "./features/categories/slices/categorySlice"
import addressReducer from "./features/deliveries/slice/addressSlice"
import dashboardReducer from "./features/admin/dashboard/slice/dashboardSlice"
import userReducer from "./features/users/slice/userSlice"
import notificationReducer from "./features/notifications/slice/notificationSlice"
import  deliveryReducer  from "./features/deliveries/slice/deliverySlice";
import prescriptionReducer from "./features/prescriptions/slices/prescriptionAdminSlice"
import orderPaymentReducer from "./features/orders/slices/ordersPaymentSlice"
import profileReducer from "./features/users/slice/profileSlice"
import orderReducer from "./features/orders/slices/orderSlice"
import userPrescriptionReducer from "./features/prescriptions/slices/prescriptionSlice"
import PaymentReducer from "./features/payments/slice/paymentSlice"

export const store = configureStore({
  reducer: {
    cart:      cartReducer,
    medicines: medicineReducer,
    auth:      authReducer,   
    categories: categoryReducer,
    address: addressReducer,
    
    dashboard :   dashboardReducer,
    users     : userReducer,
    notifications:notificationReducer,
    deliveries: deliveryReducer,
    prescriptions: prescriptionReducer,
    ordersPayments:orderPaymentReducer,
    userPrescriptions: userPrescriptionReducer,
    profile: profileReducer,
    orders: orderReducer,
    payment:PaymentReducer,

  },
});