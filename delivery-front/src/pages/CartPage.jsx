/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '../contexts/CartContext'; 
import { useAuth } from '../contexts/AuthContext'; 
import { useNavigate } from 'react-router-dom';
import '../assets/styles/CartPage.css'; 

const DELIVERY_FEE = 5.00; 

const CartPage = () => {
    
    const navigate = useNavigate();
    
    
    const { 
        cart, 
        checkoutError, 
        addItemToOrder,
        clearError,
        handleCheckout,
        checkoutLoading 
    } = useCart();

    
    const { user } = useAuth(); 
    
    
    const [paymentMethod, setPaymentMethod] = useState('');
    const [shippingAddress, setShippingAddress] = useState({ 
        street: '',
        number: '',
        neighborhood: ''
    });
    const [orderSuccess, setOrderSuccess] = useState(null);

    
    
    

    
    useEffect(() => {
        if (user && user.address) {
            setShippingAddress({
                street: user.address.street || '',
                number: user.address.number || '',
                neighborhood: user.address.neighborhood || ''
            });
        }
    }, [user]); 

    
    useEffect(() => {
        clearError(); 
    }, [clearError]);


    
    
    

    
    const handleQuantityChange = useCallback((item, delta) => {
        
        if (cart.restaurantId) {
            addItemToOrder(
                item.productId, 
                item.productName, 
                item.priceAtOrder, 
                cart.restaurantId, 
                cart.restaurantName, 
                delta 
            );
        }
    }, [addItemToOrder, cart.restaurantId, cart.restaurantName]);
    

    
    
    
    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const isAddressValid = shippingAddress.street && shippingAddress.number && shippingAddress.neighborhood;

        if (cart.items.length === 0 || !cart.restaurantId || !paymentMethod || !isAddressValid) {
            alert('Por favor, preencha todos os campos obrigatórios (Endereço, Pagamento) e adicione itens ao carrinho.');
            return;
        }
        
        
        clearError();
        setOrderSuccess(null); 
        
        const finalOrderPayload = {
            paymentMethod, 
            shippingAddress, 
            deliveryFee: DELIVERY_FEE
        };

        try {
            
            
            const response = await handleCheckout(finalOrderPayload); 
            
            
            
            
            const orderId = response?._id; 
            
            if (orderId) {
                
                setOrderSuccess(`🎉 Pedido #${orderId.substring(0, 8)} realizado com sucesso! Redirecionando...`);
                
                
                setTimeout(() => navigate(`/client/order/${orderId}`), 1500);
            } else {
                
                alert('Resposta do servidor incompleta. Tente novamente.');
            }
        } catch (error) {
            
            console.error("Erro ao finalizar pedido:", error);
        }
        
    };
    
    
    const finalTotal = cart.totalAmount + DELIVERY_FEE;
    
    
    const isFormIncomplete = !paymentMethod || !shippingAddress.street || !shippingAddress.number || !shippingAddress.neighborhood || cart.items.length === 0;
    const isDisabled = checkoutLoading || isFormIncomplete;

    
    
    
    if (checkoutLoading) {
        return <div className="cart-page-container loading text-center py-20 text-2xl font-semibold">Enviando Pedido... 🔄</div>;
    }

    
    if (!cart.items || cart.items.length === 0) {
        return (
            <div className="cart-page-container empty-cart p-10 bg-white shadow-lg rounded-xl mt-8 max-w-xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Seu Carrinho está Vazio 😔</h2>
                <p className="text-gray-600 mb-6">Parece que você ainda não escolheu nada no <span className="text-purple-600 font-semibold">{cart.restaurantName || 'Menu Principal'}</span>.</p>
                <button 
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition" 
                    onClick={() => navigate('/client/menu')} 
                >
                    Voltar ao Menu Principal
                </button>
            </div>
        );
    }

    
    
    
    return (
        <div className="cart-page-container p-4 md:p-8 bg-gray-50 min-h-screen max-w-7xl mx-auto">
            <h1 className="text-4xl font-extrabold text-purple-800 mb-8 border-b-4 border-purple-200 pb-4">
                🛒 Finalizar Pedido em {cart.restaurantName || 'Restaurante Selecionado'}
            </h1>
            
            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                
                <div className="lg:col-span-2 space-y-6">
                    
                    
                    {checkoutError && (
                        <div className="p-4 rounded-lg font-medium bg-red-100 text-red-700 border border-red-400">
                            ❌ **Erro ao Processar Pedido:** {checkoutError}
                            <button type="button" onClick={clearError} className="ml-4 font-bold underline">Limpar Erro</button>
                        </div>
                    )}
                    {orderSuccess && (
                        <div className="p-4 rounded-lg font-medium bg-green-100 text-green-700 border border-green-400">
                            {orderSuccess}
                        </div>
                    )}

                    
                    <div className="bg-white p-6 rounded-xl shadow-lg border">
                        <h2 className="text-2xl font-bold text-purple-700 mb-4 border-b pb-2">1. Itens no Carrinho ({cart.items.length})</h2>
                        
                        <div className="space-y-4">
                            {cart.items.map((item) => (
                                <div key={item.productId} className="flex items-center justify-between p-3 border-b last:border-b-0 transition hover:bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3 w-1/2">
                                        <div>
                                            <span className="font-semibold text-gray-800 block">{item.productName}</span>
                                            <span className="text-sm text-gray-500">R$ {item.priceAtOrder.toFixed(2).replace('.', ',')} / un</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2 border border-gray-300 rounded-full">
                                        <button 
                                            type="button"
                                            onClick={() => handleQuantityChange(item, -1)} 
                                            className="p-1 text-purple-600 hover:bg-purple-100 rounded-full text-xl disabled:opacity-50" 
                                            disabled={checkoutLoading}
                                        >
                                            ➖
                                        </button>
                                        <span className="w-6 text-center font-bold text-lg">{item.quantity}</span>
                                        <button 
                                            type="button"
                                            onClick={() => handleQuantityChange(item, 1)} 
                                            className="p-1 text-purple-600 hover:bg-purple-100 rounded-full text-xl disabled:opacity-50" 
                                            disabled={checkoutLoading}
                                        >
                                            ➕
                                        </button>
                                    </div>
                                    
                                    <span className="font-extrabold text-xl text-green-700 w-1/5 text-right">
                                        R$ {(item.priceAtOrder * item.quantity).toFixed(2).replace('.', ',')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                
                <div className="lg:col-span-1 space-y-6">
                    
                    
                    <div className="bg-white p-6 rounded-xl shadow-lg sticky top-8">
                        <h2 className="text-2xl font-bold text-red-600 mb-4 border-b pb-2">2. Dados de Entrega e Pagamento</h2>
                        
                        
                        <h3 className="text-xl font-bold text-gray-700 mb-3 mt-4">Endereço de Entrega</h3>
                        <div className="space-y-3 mb-6">
                            <input 
                                type="text" 
                                placeholder="Rua / Avenida (Ex: Av. Brasil)"
                                value={shippingAddress.street} 
                                onChange={e => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg text-base focus:border-purple-500 focus:ring-purple-500"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <input 
                                    type="text" 
                                    placeholder="Número (Ex: 123)"
                                    value={shippingAddress.number} 
                                    onChange={e => setShippingAddress({ ...shippingAddress, number: e.target.value })}
                                    required
                                    className="p-3 border border-gray-300 rounded-lg text-base focus:border-purple-500 focus:ring-purple-500"
                                />
                                <input 
                                    type="text" 
                                    placeholder="Bairro (Ex: Centro)"
                                    value={shippingAddress.neighborhood} 
                                    onChange={e => setShippingAddress({ ...shippingAddress, neighborhood: e.target.value })}
                                    required
                                    className="p-3 border border-gray-300 rounded-lg text-base focus:border-purple-500 focus:ring-purple-500"
                                />
                            </div>
                            <p className="text-sm text-gray-500 pt-1">O endereço está sendo preenchido automaticamente pelo seu cadastro.</p>
                        </div>

                        
                        <h3 className="text-xl font-bold text-gray-700 mb-3">Método de Pagamento</h3>
                        <select 
                            value={paymentMethod} 
                            onChange={e => setPaymentMethod(e.target.value)} 
                            className="w-full p-3 border border-gray-300 rounded-lg text-base bg-white mb-6 focus:border-purple-500 focus:ring-purple-500"
                            required
                        >
                            <option value="" disabled>Selecione a Forma de Pagamento</option>
                            <option value="pix">Pix 📲</option>
                            <option value="card">Cartão na Entrega 💳</option>
                            <option value="cash">Dinheiro 💵</option>
                        </select>

                        
                        <div className="summary-section pt-4 border-t border-dashed border-gray-300">
                            <h3 className="text-xl font-bold text-gray-700 mb-3">Resumo da Compra</h3>
                            <div className="flex justify-between text-lg mb-1">
                                <span className="text-gray-700">Subtotal:</span>
                                <span className="font-semibold">R$ {cart.totalAmount.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div className="flex justify-between text-lg mb-4">
                                <span className="text-gray-700">Taxa de Entrega:</span>
                                <span className="font-semibold text-red-500">R$ {DELIVERY_FEE.toFixed(2).replace('.', ',')}</span>
                            </div>
                            
                            <div className="flex justify-between items-center py-2 border-t border-gray-300">
                                <span className="text-2xl font-bold text-gray-800">Total:</span>
                                <span className="text-3xl font-extrabold text-red-600">R$ {finalTotal.toFixed(2).replace('.', ',')}</span>
                            </div>

                            <button 
                                type="submit" 
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 mt-4 rounded-lg text-xl transition duration-150 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                disabled={isDisabled}
                            >
                                {checkoutLoading ? 'Enviando Pedido...' : '✅ Confirmar e Pagar'}
                            </button>
                        </div>
                    </div>
                </div>

            </form>
        </div>
    );
};

export default CartPage;