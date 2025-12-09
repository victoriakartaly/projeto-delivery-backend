/* eslint-disable no-irregular-whitespace */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 💡 IMPORTAÇÃO NECESSÁRIA
import api from '../services/api'; 
import { FaClock, FaCheckCircle, FaTruck, FaTimesCircle, FaUtensils, FaHourglassHalf, FaMapMarkerAlt, FaRulerCombined, FaEye } from 'react-icons/fa'; // 💡 Adicionando FaEye

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
    if (value === undefined || value === null) return 'R$ 0,00';
    return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};


const ClientOrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // 💡 1. Inicializa o hook de navegação
    const navigate = useNavigate(); 
    
    
    const fetchOrders = async () => {
        try {
            
            const response = await api.get('/orders/client'); 
            
            setOrders(Array.isArray(response.data.data) ? response.data.data : []);
            setError(null);
        } catch (err) {
            console.error("Erro ao carregar histórico de pedidos:", err);
            
            setError("Não foi possível carregar seus pedidos. Verifique sua conexão ou tente novamente mais tarde.");
        } finally {
            setLoading(false);
        }
    };

    // 💡 2. Função para navegar para os detalhes do pedido
    const handleViewOrder = (orderId) => {
        navigate(`/client/order/${orderId}`);
    };

    useEffect(() => {
        fetchOrders();
        
        const intervalId = setInterval(fetchOrders, 15000); // Atualiza a cada 15 segundos
        
        
        return () => clearInterval(intervalId); // Limpeza
    }, []);

    
    
    if (loading) {
        return <div className="p-4 text-center text-lg font-medium text-purple-600">Carregando seu histórico de pedidos...</div>;
    }
    
    if (error) {
        return <div className="p-4 text-center text-red-700 bg-red-100 border border-red-300 rounded-lg font-medium">{error}</div>;
    }

    if (orders.length === 0) {
        return (
            <div className="p-8 text-center text-xl text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                <p>Você ainda não fez nenhum pedido. Faça seu primeiro agora! 🎉</p>
            </div>
        );
    }

    
    
    
    
    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-extrabold text-gray-900 border-b pb-4 mb-6">Seus Pedidos Recentes ({orders.length})</h2>
            
            <div className="space-y-4">
                {orders.map(order => {
                    const statusInfo = getStatusDisplay(order.status);
                    const formattedDate = new Date(order.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
                    
                    const restaurantName = order.restaurant?.name || 'Restaurante Excluído/Desconhecido';

                    return (
                        <div 
                            key={order._id} 
                            className={`bg-white p-5 rounded-xl shadow-lg border-l-4 ${statusInfo.border} transition hover:shadow-xl`}
                        >
                            <div className="flex justify-between items-start border-b pb-3 mb-3">
                                <div>
                                    <h4 className="text-xl font-extrabold text-purple-700">{restaurantName}</h4>
                                    <p className="text-xs text-gray-400 mt-1">Ref. #**{order._id.slice(-6).toUpperCase()}**</p> 
                                </div>
                                
                                <div className="flex flex-col items-end">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-semibold rounded-full border ${statusInfo.color} mb-2`}>
                                        {statusInfo.icon}
                                        {statusInfo.label}
                                    </span>
                                    {/* 💡 Botão para Acompanhar o Pedido */}
                                    <button
                                        onClick={() => handleViewOrder(order._id)}
                                        className="inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition shadow-md"
                                    >
                                        <FaEye /> Acompanhar
                                    </button>
                                </div>
                            </div>

                            {/* Informações de Resumo */}
                            <div className="grid grid-cols-2 gap-y-3 text-sm text-gray-600">
                                
                                <p className="font-medium text-gray-700">Total:</p>
                                <p className="text-right font-extrabold text-lg text-green-700">{formatCurrency(order.totalPrice)}</p>
                                
                                <p className="font-medium text-gray-700">Pagamento:</p>
                                <p className="text-right capitalize">{order.paymentMethod}</p>
                                
                                <p className="font-medium text-gray-700">Data:</p>
                                <p className="text-right flex items-center justify-end gap-1"><FaClock className="text-gray-400" />{formattedDate}</p>
                            </div>

                            {/* Detalhes (Endereço e Itens) */}
                            <details className="mt-4 pt-4 border-t border-dashed border-gray-300">
                                <summary className="cursor-pointer font-bold text-gray-700 hover:text-purple-600 transition">Ver Itens e Endereço de Entrega</summary>
                                <div className="mt-3 p-3 bg-gray-100 rounded-lg space-y-3 text-sm">
                                    
                                    {/* Endereço de Entrega */}
                                    <h5 className="font-semibold flex items-center gap-2 text-base text-gray-800 border-b pb-1"><FaMapMarkerAlt /> Endereço de Entrega:</h5>
                                    <p>
                                        Rua: **{order.deliveryAddress?.street || 'N/A'}**, 
                                        Nº: **{order.deliveryAddress?.number || 'N/A'}**, 
                                        Bairro: **{order.deliveryAddress?.neighborhood || 'N/A'}**
                                    </p>
                                    
                                    {/* Itens do Pedido */}
                                    <h5 className="font-semibold flex items-center gap-2 text-base text-gray-800 border-b pb-1 mt-3"><FaRulerCombined /> Itens do Pedido:</h5>
                                    <ul className="list-disc list-inside ml-4 space-y-1">
                                        {/* Mapeia os itens do pedido */}
                                        {order.items.map((item, index) => (
                                            <li key={index} className="text-gray-600">
                                                <span className="font-bold">{item.quantity}x</span> {item.productName || `Produto ID: ${item.productId.slice(-6)}...`} - {formatCurrency(item.price)}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </details>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ClientOrderHistory;