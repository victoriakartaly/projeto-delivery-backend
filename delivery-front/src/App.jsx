/* eslint-disable no-irregular-whitespace */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext'; 


import Login from './pages/Login';
import ProductList from './pages/ProductList'; 
import CartPage from './pages/CartPage';       
import RestaurantDashboard from './pages/RestaurantDashboard';
import AdminDashboard from './pages/AdminDashboard'; 
import UserManagement from './pages/UserManagement';
import RestaurantManagement from './pages/RestaurantManagement';
import ProductManagement from './pages/ProductManagement';


import ClientOrderHistory from './components/ClientOrderHistory'; 
import OrderTrackingPage from './pages/OrderTrackingPage';   

import './assets/styles/App.css';


const PrivateRoute = ({ children, roles }) => {
    const { signed, loading, user } = useAuth();

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-gray-100 text-gray-700 text-lg font-semibold">
            A carregar... 🔄
        </div>
    );
    if (!signed) return <Navigate to="/login" />;
    
    
    if (roles && !roles.includes(user.role)) {
        
        return <Navigate to="/dashboard" />; 
    }

    return children;
};


const LoginWrapper = () => {
    const { signed } = useAuth();
    
    return signed ? <Navigate to="/dashboard" /> : <Login />; 
};


const DashboardSelector = () => {
    const { user } = useAuth();
    if (!user) return null; 

    switch (user.role) {
        case 'client':
            return <Navigate to="/client/menu" />;
        case 'admin':
            return <Navigate to="/admin" />;
        case 'restaurant':
        case 'employee':
            return <Navigate to="/restaurant" />;
        default:
            return <div className="p-10 bg-red-600 text-white font-extrabold text-2xl shadow-2xl">
                Erro: Permissão desconhecida ({user.role})
            </div>;
    }
};





const App = () => {
    return (
        <>
            <AuthProvider>
                <BrowserRouter>
                    <CartProvider>
                        <Routes>

                            
                            <Route path="/" element={<LoginWrapper />} /> 
                            <Route path="/login" element={<LoginWrapper />} />

                           
                            <Route
                                path="/dashboard"
                                element={
                                    <PrivateRoute>
                                        <DashboardSelector />
                                    </PrivateRoute>
                                }
                            />
                            
                           
                            <Route 
                                path="/client" 
                                element={<Navigate to="/client/menu" />} 
                            />

                            <Route 
                                path="/client/menu" 
                                element={<PrivateRoute roles={['client']}><ProductList /></PrivateRoute>} 
                            />
                            <Route 
                                path="/client/cart" 
                                element={<PrivateRoute roles={['client']}><CartPage /></PrivateRoute>} 
                            />
                            
                            
                            <Route 
                                path="/client/order/:orderId" 
                                element={<PrivateRoute roles={['client']}><OrderTrackingPage /></PrivateRoute>} 
                            />
                            
                            
                            <Route 
                                path="/client/orders" 
                                element={<PrivateRoute roles={['client']}><ClientOrderHistory /></PrivateRoute>} 
                            />

                           
                            <Route
                                path="/admin" 
                                element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>}
                            />
                            <Route
                                path="/admin/users"
                                element={<PrivateRoute roles={['admin']}><UserManagement /></PrivateRoute>}
                            />
                            <Route
                                path="/admin/restaurants"
                                element={<PrivateRoute roles={['admin']}><RestaurantManagement /></PrivateRoute>}
                            />
                            <Route
                                path="/admin/products" 
                                element={<PrivateRoute roles={['admin', 'restaurant', 'employee']}><ProductManagement /></PrivateRoute>}
                            />
                            
                            
                            <Route 
                                path="/restaurant" 
                                element={<PrivateRoute roles={['restaurant', 'employee']}><RestaurantDashboard /></PrivateRoute>} 
                            />

                            
                            <Route
                                path="*"
                                element={
                                    <div className="flex items-center justify-center h-screen text-xl font-bold text-red-500 bg-gray-100">
                                        🚧 Erro 404: Página não encontrada 🚧
                                    </div>
                                }
                            />

                        </Routes>
                    </CartProvider>
                </BrowserRouter>
            </AuthProvider>
        </>
    );
};

export default App;