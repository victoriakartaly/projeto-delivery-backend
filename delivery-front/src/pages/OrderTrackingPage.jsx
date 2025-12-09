/* eslint-disable no-irregular-whitespace */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FaClock, FaCheckCircle, FaTruck, FaTimesCircle, FaUtensils, FaHourglassHalf, FaMapMarkerAlt, FaRulerCombined, FaSpinner } from 'react-icons/fa';

const getStatusDisplay = (status) => {
    switch (status) {
        case 'pending':
            return { label: 'Aguardando Confirmação', icon: <FaHourglassHalf className="text-yellow-600" />, color: 'bg-yellow-100 border-yellow-300 text-yellow-800', border: 'border-yellow-600' };
        case 'accepted':
            return { label: 'Pedido Aceito', icon: <FaCheckCircle className="text-green-600" />, color: 'bg-green-100 border-green-300 text-green-800', border: 'border-green-600' };
        case 'in_preparation':
            return { label: 'Em Preparação', icon: <FaUtensils className="text-blue-600" />, color: 'bg-blue-100 border-blue-300 text-blue-800', border: 'border-blue-600' };
        case 'ready_for_delivery':
            return { label: 'Pronto para Envio', icon: <FaTruck className="text-indigo-600" />, color: 'bg-indigo-100 border-indigo-300 text-indigo-800', border: 'border-indigo-600' };
        case 'on_the_way':
            return { label: 'A Caminho', icon: <FaTruck className="text-purple-600" />, color: 'bg-purple-100 border-purple-300 text-purple-800', border: 'border-purple-600' };
        case 'delivered':
            return { label: 'Entregue', icon: <FaCheckCircle className="text-gray-600" />, color: 'bg-gray-200 border-gray-400 text-gray-700', border: 'border-gray-600' };
        case 'cancelled':
            return { label: 'Cancelado', icon: <FaTimesCircle className="text-red-600" />, color: 'bg-red-100 border-red-300 text-red-800', border: 'border-red-600' };
        default:
            return { label: 'Status Desconhecido', icon: <FaClock className="text-gray-500" />, color: 'bg-gray-100 border-gray-300 text-gray-500', border: 'border-gray-500' };
    }
};

const formatCurrency = (value) => {
    if (value === undefined || value === null) value = 0; 
    return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};


const OrderTrackingPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrderDetails = async () => {
        try {
            
            const response = await api.get(`/orders/${orderId}`); 
            
            
            setOrder(response.data.data); 
            setError(null);
        } catch (err) {
            console.error("Erro ao carregar detalhes do pedido:", err);
            if (err.response && err.response.status === 404) {
                 setError("Pedido não encontrado ou ID inválido.");
            } else {
                 setError("Não foi possível carregar os detalhes do pedido. Tente novamente.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (orderId) {
            fetchOrderDetails();
            
            const intervalId = setInterval(fetchOrderDetails, 10000); 
            return () => clearInterval(intervalId);
        }

// eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId]);


    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-10 text-xl font-bold text-purple-600 bg-gray-50">
                <FaSpinner className="animate-spin text-4xl mb-4" />
                Rastreando Pedido **#{orderId.slice(-6).toUpperCase()}**...
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen p-10 text-xl font-bold text-red-700 bg-red-100">
                ⚠️ {error}
            </div>
        );
    }

    if (!order) return null;

    const statusInfo = getStatusDisplay(order.status);

    const restaurantName = order.restaurant?.name || 'Restaurante Desconhecido';

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto min-h-screen bg-white shadow-lg">
            <h1 className="text-3xl font-extrabold text-gray-900 border-b pb-3 mb-6">
                Acompanhamento do Pedido
            </h1>

            {}
            <div className={`p-6 rounded-xl shadow-xl border-t-8 mb-6 ${statusInfo.border}`}
                 style={{ borderColor: statusInfo.border.replace('border-', '') }}>
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Pedido **#{orderId.slice(-6).toUpperCase()}**
                    </h2>
                    <span className={`inline-flex items-center gap-2 px-4 py-2 text-base font-bold rounded-full border-2 ${statusInfo.color}`}>
                        {statusInfo.icon}
                        {statusInfo.label}
                    </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                    **{restaurantName}**
                </p>
            </div>
            
            {}
            <div className="space-y-4">
                
                {}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 border-b pb-1">Resumo Financeiro</h3>
                    <div className="grid grid-cols-2 text-sm text-gray-600">
                        <p className="font-medium">Subtotal:</p>
                        {}
                        <p className="text-right">{formatCurrency((order.totalPrice || 0) - (order.deliveryFee || 0))}</p> 
                        <p className="font-medium">Taxa de Entrega:</p>
                        <p className="text-right">{formatCurrency(order.deliveryFee)}</p>
                        <p className="font-extrabold text-lg text-gray-900 mt-2">Total Final:</p>
                        {}
                        <p className="text-right font-extrabold text-xl text-green-700 mt-2">{formatCurrency(order.totalPrice)}</p>
                    </div>
                </div>

                {}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="font-bold flex items-center gap-2 text-lg text-gray-800 mb-2"><FaMapMarkerAlt /> Endereço de Entrega:</h3>
                    {}
                    <p className="text-sm text-gray-600">
                        Rua: **{order.deliveryAddress?.street || 'N/A'}**, 
                        Nº: **{order.deliveryAddress?.number || 'N/A'}**, 
                        Bairro: **{order.deliveryAddress?.neighborhood || 'N/A'}**
                    </p>
                </div>
                
                {}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="font-bold flex items-center gap-2 text-lg text-gray-800 mb-2"><FaRulerCombined /> Itens do Pedido:</h3>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                        {}
                        {(order.items || []).map((item, index) => (
                            <li key={index} className="text-gray-600">
                                <span className="font-bold">{item.quantity}x</span> {item.name || `Produto ID: ${item.productId.slice(-6)}...`}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {}
            <div className="flex justify-center space-x-4 mt-8">
                <button 
                    onClick={() => navigate('/client/orders')} 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition text-base shadow-md"
                >
                    Voltar para Histórico
                </button>
                <button 
                    onClick={() => navigate('/client/menu')} 
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition text-base shadow-md"
                >
                    Fazer Novo Pedido
                </button>
            </div>
        </div>
    );
};

export default OrderTrackingPage;