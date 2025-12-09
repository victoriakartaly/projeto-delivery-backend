/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import api from '../services/api'; 
import { useAuth } from './AuthContext'; 

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    
    const { user } = useAuth();
    
    
    const [orderData, setOrderData] = useState({
        restaurantId: '', 
        restaurantName: '', 
        items: [], 
        paymentMethod: '', 
        shippingAddress: { 
            street: '',
            number: '',
            neighborhood: ''
        }
    });

    
    useEffect(() => {
        if (user && user.address) {
            setOrderData(prev => ({
                ...prev,
                shippingAddress: {
                    street: user.address.street || '',
                    number: user.address.number || '',
                    neighborhood: user.address.neighborhood || ''
                }
            }));
        }
    }, [user]); 

    
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [checkoutError, setCheckoutError] = useState(null);

    
    const clearError = useCallback(() => setCheckoutError(null), []);

    
    const clearCart = useCallback(() => {
        setOrderData(prev => ({
            ...prev,
            restaurantId: '', 
            restaurantName: '', 
            items: [], 
            paymentMethod: '', 
        }));
        
        clearError();
    }, [clearError]);

    
    
    

    const setRestaurant = useCallback((id, name) => {
        setOrderData(prev => {
            
            if (prev.restaurantId && prev.restaurantId !== id && prev.items.length > 0) {
                console.warn(`Restaurante alterado de ${prev.restaurantName} para ${name}. O carrinho foi limpo.`);
                return {
                    ...prev,
                    restaurantId: id,
                    restaurantName: name,
                    items: [], 
                    paymentMethod: '' 
                };
            }
            
            return { 
                ...prev, 
                restaurantId: id, 
                restaurantName: name 
            };
        });
    }, []);

    const addItemToOrder = useCallback((productId, name, price, restaurantId, restaurantName, delta = 1) => {
        
        
        if (!restaurantId) {
             console.error("Erro: Tente adicionar item antes de selecionar o restaurante.");
             return;
        }

        setOrderData(prevOrderData => {
            
            let nextItems = prevOrderData.items;

            
            if (prevOrderData.restaurantId && prevOrderData.restaurantId !== restaurantId) {
                nextItems = [];
                console.warn("Forçando limpeza de carrinho devido à inconsistência do restaurante.");
            }

            
            const existingItemIndex = nextItems.findIndex(item => item.productId === productId);
            let updatedItems;

            if (existingItemIndex > -1) {
                updatedItems = nextItems.map((item, index) =>
                    index === existingItemIndex
                        ? { ...item, quantity: item.quantity + delta } 
                        : item
                );
            } else if (delta > 0) {
                
                updatedItems = [...nextItems, { 
                    productId, 
                    productName: name, 
                    priceAtOrder: price, 
                    quantity: delta 
                }]; 
            } else {
                updatedItems = nextItems;
            }
            
            
            updatedItems = updatedItems.filter(item => item.quantity > 0);
            
            return { 
                ...prevOrderData, 
                restaurantId: restaurantId, 
                restaurantName: restaurantName,
                items: updatedItems 
            };
        });

    }, []); 

    const removeItemFromOrder = useCallback((productId) => {
        setOrderData(prevOrderData => ({
            ...prevOrderData,
            items: prevOrderData.items.filter(item => item.productId !== productId)
        }));
    }, []);
    
    const setPaymentMethodContext = useCallback((method) => {
        setOrderData(prev => ({ ...prev, paymentMethod: method }));
    }, []);

    const updateAddressContext = useCallback((addressObject) => {
        setOrderData(prev => ({ 
            ...prev, 
            shippingAddress: addressObject 
        }));
    }, []);
    
    
    
    

    const currentTotal = useMemo(() => {
        const total = orderData.items.reduce((sum, item) => sum + (item.priceAtOrder * item.quantity), 0);
        return parseFloat(total.toFixed(2));
    }, [orderData.items]); 
    
    const itemsInCartMap = useMemo(() => {
        return orderData.items.reduce((map, item) => {
            map[item.productId] = item.quantity;
            return map;
        }, {});
    }, [orderData.items]);
    
    
    
    

    const handleCheckout = async (additionalData) => { 
        
        const deliveryFee = additionalData?.deliveryFee || 0;
        const paymentMethod = additionalData?.paymentMethod || orderData.paymentMethod;
        const shippingAddress = additionalData?.shippingAddress || orderData.shippingAddress;
        
        const finalOrderData = {
            ...orderData,
            paymentMethod: paymentMethod,
            shippingAddress: shippingAddress,
            deliveryFee: deliveryFee,
            totalPrice: currentTotal + deliveryFee 
        }

        if (finalOrderData.items.length === 0 || !finalOrderData.restaurantId || !finalOrderData.paymentMethod) {
            setCheckoutError("O carrinho está incompleto ou vazio. Verifique itens e forma de pagamento.");
            return null;
        }

        setCheckoutLoading(true);
        setCheckoutError(null);
        
        
        
        const itemsToSend = finalOrderData.items.map(item => ({ 
            productId: item.productId,
            quantity: item.quantity,
            
            name: item.productName, 
            priceAtOrder: item.priceAtOrder,
        }));

        try {
            const response = await api.post('/orders', {
                restaurantId: finalOrderData.restaurantId,
                items: itemsToSend, 
                paymentMethod: finalOrderData.paymentMethod,
                shippingAddress: finalOrderData.shippingAddress,
                deliveryFee: finalOrderData.deliveryFee,
                totalPrice: finalOrderData.totalPrice, 
            });

            
            clearCart(); 
            
            return response.data.data; 
        } catch (err) {
            console.error("Erro no checkout:", err);
            
            const errorMessage = err.response?.data?.message || 'Falha na comunicação com o servidor ao finalizar o pedido.';
            setCheckoutError(errorMessage);
            
            throw new Error(errorMessage); 
        } finally {
            setCheckoutLoading(false);
        }
    };
    
    
    
    

    const contextValue = {
        cart: {
            ...orderData,
            totalAmount: currentTotal 
        },
        itemsInCartMap,
        checkoutLoading,
        checkoutError,
        clearError, 
        clearCart,
        addItemToOrder,
        removeItemFromOrder,
        setPaymentMethod: setPaymentMethodContext,
        updateAddress: updateAddressContext,
        handleCheckout,
        setRestaurant 
    };

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};