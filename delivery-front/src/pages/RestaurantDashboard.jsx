/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';


import { storage } from "../firebase/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";


const EditProductModal = ({ product, isModalOpen, onClose, onSave }) => {
    
    const [formData, setFormData] = useState(product || {});

    useEffect(() => {
        setFormData(product || {});
    }, [product]);

    if (!isModalOpen || !product) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const updatedData = { 
            ...formData, 
            price: parseFloat(formData.price) 
        };
        onSave(updatedData);
    };

    return (
        
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            {}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-bold text-purple-700 mb-4 border-b pb-2">
                    Editar Produto: {product.name}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {}
                    <div className="flex items-center space-x-4 mb-4">
                        <img 
                            src={product.imageUrl || 'https://via.placeholder.com/100?text=Sem+Imagem'} 
                            alt={product.name} 
                            className="w-20 h-20 object-cover rounded-lg shadow-md"
                        />
                        <p className="text-sm text-gray-500 italic">
                            A imagem só pode ser alterada cadastrando um novo item (ou usando um painel de gerenciamento de arquivos dedicado).
                        </p>
                    </div>

                    {}
                    <label className="block text-sm font-medium text-gray-700">Nome do Prato</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    />

                    {}
                    <label className="block text-sm font-medium text-gray-700">Descrição</label>
                    <textarea
                        rows="3"
                        name="description"
                        value={formData.description || ''}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 resize-none"
                    />

                    {}
                    <label className="block text-sm font-medium text-gray-700">Preço (R$)</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price || ''}
                        onChange={handleChange}
                        step="0.01" 
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    />

                    {}
                    <label className="block text-sm font-medium text-gray-700">Categoria</label>
                    <select
                        name="category"
                        value={formData.category || 'Lanche'}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 bg-white"
                    >
                        <option value="Lanche">Lanche</option>
                        <option value="Bebida">Bebida</option>
                        <option value="Sobremesa">Sobremesa</option>
                    </select>

                    {}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-150"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-150"
                        >
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};



const OrderCard = ({ order, statusMap, handleUpdateStatus }) => {
    const statusColor = {
        pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        accepted: 'bg-green-100 text-green-700 border-green-300',
        in_preparation: 'bg-blue-100 text-blue-700 border-blue-300',
        ready_for_delivery: 'bg-indigo-100 text-indigo-700 border-indigo-300',
        on_the_way: 'bg-purple-100 text-purple-700 border-purple-300',
        delivered: 'bg-gray-100 text-gray-500 border-gray-300',
        cancelled: 'bg-red-100 text-red-700 border-red-300',
    }[order.status] || 'bg-gray-100 text-gray-600 border-gray-300';
    
    const formattedPrice = order.totalPrice?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00';

    return (
        <div key={order._id} className={`p-5 rounded-xl shadow-md border-l-4 mb-4 ${statusColor}`}>
            <div className="flex justify-between items-start mb-3 border-b border-opacity-30 pb-2">
                <h4 className="text-lg font-bold">Pedido #{order._id.substring(0, 8)}</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor.replace('border-', 'bg-').replace('-100', '-500')}`.replace('bg-gray', 'bg-slate-500').replace('text-yellow', 'text-yellow-900').replace('text-green', 'text-green-900').replace('text-blue', 'text-blue-900').replace('text-indigo', 'text-indigo-900').replace('text-purple', 'text-purple-900').replace('text-red', 'text-red-900')}>
                    {statusMap[order.status] || order.status}
                </span>
            </div>
            
            <p className="text-sm text-gray-800 mb-1">
                <span className="font-medium">Cliente:</span> **{order.client?.name || 'Desconhecido'}**
            </p>
            <p className="text-sm text-gray-800 mb-3">
                <span className="font-medium">Total:</span> <strong className="text-xl text-red-600">{formattedPrice}</strong>
            </p>
            
            {}
            {order.deliveryAddress && (
                <p className="text-xs text-gray-600 italic mb-3">
                    Entrega: {order.deliveryAddress.street}, {order.deliveryAddress.number} - {order.deliveryAddress.neighborhood}
                </p>
            )}

            <ul className="text-xs text-gray-700 list-disc ml-4 mt-2 mb-4">
                {}
                {order.items?.slice(0, 3).map((item, index) => (
                    <li key={index}>
                        {item.quantity}x {item.name} (R$ {item.price?.toFixed(2).replace('.', ',')})
                    </li>
                ))}
                {order.items?.length > 3 && <li>... mais {order.items.length - 3} itens</li>}
            </ul>

            {}
            <div className="flex flex-wrap gap-2 pt-3 border-t border-opacity-30">
                
                {}
                {order.status === 'pending' && (
                    <button 
                        onClick={() => handleUpdateStatus(order._id, 'accepted')} 
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded text-sm transition duration-150"
                    >
                        Aceitar Pedido
                    </button>
                )}
                
                {}
                {order.status === 'accepted' && (
                    <button 
                        onClick={() => handleUpdateStatus(order._id, 'in_preparation')} 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded text-sm transition duration-150"
                    >
                        Iniciar Preparo
                    </button>
                )}

                {}
                {order.status === 'in_preparation' && (
                    <button 
                        onClick={() => handleUpdateStatus(order._id, 'ready_for_delivery')} 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded text-sm transition duration-150"
                    >
                        Pronto para Envio
                    </button>
                )}
                
                {}
                {order.status === 'ready_for_delivery' && (
                    <button 
                        onClick={() => handleUpdateStatus(order._id, 'on_the_way')} 
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-3 rounded text-sm transition duration-150"
                    >
                        Marcar como 'A Caminho'
                    </button>
                )}

                {}
                {(order.status === 'on_the_way' || order.status === 'ready_for_delivery') && (
                    <button 
                        onClick={() => handleUpdateStatus(order._id, 'delivered')} 
                        className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-3 rounded text-sm transition duration-150"
                    >
                        ✅ Finalizar Pedido
                    </button>
                )}

                {}
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <button 
                        onClick={() => handleUpdateStatus(order._id, 'cancelled')} 
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded text-sm transition duration-150"
                    >
                        Cancelar
                    </button>
                )}
            </div>
        </div>
    );
};


const MetricCard = ({ title, value, icon, color }) => {
    const colorClasses = {
        blue: 'bg-blue-500/10 text-blue-600',
        green: 'bg-green-500/10 text-green-600',
        yellow: 'bg-yellow-500/10 text-yellow-600',
        red: 'bg-red-500/10 text-red-600',
        purple: 'bg-purple-500/10 text-purple-600',
    };
    const iconColorClass = colorClasses[color] || 'bg-gray-500/10 text-gray-600';

    return (
        <div className="bg-white p-5 rounded-xl shadow-md flex items-center justify-between transition transform hover:scale-[1.02] duration-300">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
            </div>
            <div className={`p-3 rounded-full ${iconColorClass}`}>
                <span className="text-2xl">{icon}</span>
            </div>
        </div>
    );
};


const ProductCard = ({ product, handleDeleteProduct, handleEditClick }) => {
    const formattedPrice = product.price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00';

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full">
            <div className="relative h-36">
                <img 
                    src={product.imageUrl || 'https://via.placeholder.com/300x150?text=Sem+Imagem'} 
                    alt={product.name} 
                    className="w-full h-full object-cover" 
                />
                <span className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    {product.category}
                </span>
            </div>
            
            <div className="p-4 flex flex-col flex-grow">
                <h4 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{product.name}</h4>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3 flex-grow">{product.description}</p>
                
                <div className="flex justify-between items-center pt-2 border-t mt-auto">
                    <strong className="text-xl text-green-600 font-extrabold">{formattedPrice}</strong>
                    
                    <div className="flex space-x-2">
                        
                        <button 
                            onClick={() => handleEditClick(product)}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition"
                            title="Editar Produto"
                        >
                            ✏️
                        </button>
                      
                        <button 
                            onClick={() => handleDeleteProduct(product._id, product.name)}
                            className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition"
                            title="Remover Produto"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const RestaurantDashboard = () => {
    const { user, logout } = useAuth();

    
    const [prod, setProd] = useState({ name: "", description: "", price: "", category: "Lanche", imageUrl: "" });
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [msg, setMsg] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [analytics, setAnalytics] = useState({
        totalClients: 0,
        totalOrders: 0,
        totalRevenue: 0,
    });
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);


    const fetchProducts = async () => {
        setProductsLoading(true);
        try {
            const response = await api.get('/products/restaurant'); 
            const fetchedProducts = Array.isArray(response.data.data) ? response.data.data : [];
            setProducts(fetchedProducts);
        } catch (error) {
            console.error("Erro ao carregar produtos:", error);
            setMsg(`❌ Falha ao carregar cardápio: ${error.response?.data?.message || 'Verifique sua conexão.'}`);
        } finally {
            setProductsLoading(false);
        }
    };

   
    const fetchAllData = async () => {
        setOrdersLoading(true);
        
        try {
           
            const [ordersResponse, analyticsResponse] = await Promise.all([
                
                api.get('/orders/restaurant'), 
                api.get('/analytics/restaurant/today'),
            ]); 
            
            const fetchedOrders = Array.isArray(ordersResponse.data.data) ? ordersResponse.data.data : [];
            setOrders(fetchedOrders);
            
            const fetchedAnalytics = analyticsResponse.data.data || { totalClients: 0, totalOrders: 0, totalRevenue: 0 };
            setAnalytics(fetchedAnalytics);
            
            setOrdersLoading(false);
            
        } catch (error) {
            console.error("Erro ao carregar dados do restaurante:", error);
            setOrdersLoading(false);
            setMsg(`❌ Falha ao carregar dados: ${error.response?.data?.message || 'Verifique sua conexão ou backend.'}`);
        }
    };
    
    useEffect(() => {
        fetchAllData(); 
        fetchProducts(); 
        
        const intervalId = setInterval(fetchAllData, 30000); 
        return () => clearInterval(intervalId); 
    }, []); 

    
    const handleUpdateStatus = async (orderId, newStatus) => {
        setMsg('');
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus }); 
            
            
            if (newStatus === 'delivered' || newStatus === 'cancelled') {
                setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
            } else {
                
                setOrders(prevOrders => prevOrders.map(order => 
                    order._id === orderId ? { ...order, status: newStatus } : order
                ));
            }

            setMsg(`✅ Status do Pedido ${orderId.substring(0, 5)}... atualizado para ${newStatus}!`);
            
            
            const analyticsResponse = await api.get('/analytics/restaurant/today');
            setAnalytics(analyticsResponse.data.data || { totalClients: 0, totalOrders: 0, totalRevenue: 0 });

        } catch (error) {
            console.error("Erro ao atualizar status:", error.response?.data || error);
            setMsg(`❌ Erro ao atualizar status: ${error.response?.data?.message || 'Falha na comunicação com o servidor.'}`);
        }
    };


    const uploadImage = async () => {
        if (!imageFile) return null;
        setUploading(true);
        const imageRef = ref(storage, `products/${Date.now()}-${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        const downloadURL = await getDownloadURL(imageRef);
        setUploading(false);
        return downloadURL;
    };
    

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        if (file) {
            setPreview(URL.createObjectURL(file)); 
        }
    };

  
    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            let imageUrl = "";
            if (imageFile) {
                imageUrl = await uploadImage();
            }
            await api.post("/products", { 
                ...prod,
                price: parseFloat(prod.price),
                imageUrl
            });

            setMsg("✅ Produto adicionado ao cardápio!");
            setProd({ name: "", description: "", price: "", category: "Lanche", imageUrl: "" });
            setPreview(null);
            setImageFile(null);
            
            await fetchProducts(); 

        } catch (error) {
            console.error(error.response?.data || error);
            setMsg("❌ Erro ao criar produto.");
        }
    };
    
   
    const handleDeleteProduct = async (productId, productName) => {
        if (window.confirm(`Tem certeza que deseja remover o produto "${productName}" do cardápio?`)) {
            setMsg('');
            try {
                await api.delete(`/products/${productId}`); 
                setProducts(prevProducts => prevProducts.filter(p => p._id !== productId));
                setMsg(`✅ Produto "${productName}" removido com sucesso!`);
            } catch (error) {
                console.error("Erro ao deletar produto:", error.response?.data || error);
                setMsg(`❌ Erro ao remover produto: ${error.response?.data?.message || 'Falha na comunicação.'}`);
            }
        }
    };

    const handleEditClick = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };


    const handleUpdateProduct = async (updatedData) => {
        setIsModalOpen(false); 
        setMsg(''); 

        try {
            await api.put(`/products/${updatedData._id}`, updatedData); 
            
            
            setProducts(prevProducts => prevProducts.map(p => 
                p._id === updatedData._id ? updatedData : p
            ));

            setMsg(`✅ Produto "${updatedData.name}" atualizado com sucesso!`);
            setEditingProduct(null);

        } catch (error) {
            console.error("Erro ao atualizar produto:", error.response?.data || error);
            setMsg(`❌ Erro ao atualizar produto: ${error.response?.data?.message || 'Falha na comunicação.'}`);
        }
    };




    const statusMap = {
        pending: '🟡 Pendente',
        accepted: '🟢 Aceito',
        in_preparation: '👨‍🍳 Em Preparação',
        ready_for_delivery: '📦 Pronto para Envio',
        on_the_way: '🛵 A Caminho',
        delivered: '✅ Entregue',
        cancelled: '🔴 Cancelado'
    };

    const formattedRevenue = analytics.totalRevenue?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00';

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            
            {}
            <EditProductModal 
                product={editingProduct}
                isModalOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleUpdateProduct}
            />

            {}
            <header className="flex justify-between items-center mb-8 p-4 bg-white shadow-lg rounded-xl">
                <h1 className="text-3xl font-extrabold text-purple-800">
                    Painel do Restaurante: <span className="text-gray-800">{user.name}</span>
                </h1>
                <button 
                    onClick={logout} 
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-150 shadow-md"
                >
                    Sair
                </button>
            </header>
            
            {}
            {msg && (
                <div className={`p-4 mb-6 rounded-lg font-medium ${msg.startsWith('✅') ? 'bg-green-100 text-green-700 border border-green-400' : 'bg-red-100 text-red-700 border border-red-400'}`}>
                    {msg}
                </div>
            )}

            {}
            <h2 className="text-2xl font-bold text-gray-700 mb-4 border-b pb-2">Desempenho Hoje 📊</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                
                <MetricCard 
                    title="Clientes Únicos Hoje" 
                    value={analytics.totalClients} 
                    icon="👥"
                    color="blue"
                />

                <MetricCard 
                    title="Pedidos Recebidos Hoje" 
                    value={analytics.totalOrders} 
                    icon="🔔"
                    color="yellow"
                />

                <MetricCard 
                    title="Receita Bruta Hoje" 
                    value={formattedRevenue} 
                    icon="💰"
                    color="green"
                />
            </div>

            {}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {}
                <div className="lg:col-span-2 space-y-10">
                    
                    {}
                    <div className="orders-section">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                            Pedidos Pendentes/Em Andamento <span className="text-purple-600">({orders.length} Ativos)</span>
                        </h3>
                        
                        {ordersLoading ? (
                            <p className="text-gray-500 italic">Carregando pedidos...</p>
                        ) : orders.length === 0 ? (
                            <div className="p-6 bg-white rounded-xl shadow-md text-center">
                                <p className="text-xl text-green-600 font-semibold">Nenhum pedido novo no momento. 🎉</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {}
                                {orders.map(order => (
                                    <OrderCard 
                                        key={order._id}
                                        order={order}
                                        statusMap={statusMap}
                                        handleUpdateStatus={handleUpdateStatus}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {}
                    <div className="products-list-section pt-4">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                            Cardápio Ativo <span className="text-purple-600">({products.length} Itens)</span>
                        </h3>
                        
                        {productsLoading ? (
                            <p className="text-gray-500 italic">Carregando cardápio...</p>
                        ) : products.length === 0 ? (
                            <div className="p-6 bg-white rounded-xl shadow-md text-center">
                                <p className="text-xl text-gray-600 font-semibold">O cardápio está vazio. Cadastre seu primeiro item ao lado! 👈</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {products.map(product => (
                                    <ProductCard 
                                        key={product._id}
                                        product={product}
                                        handleDeleteProduct={handleDeleteProduct}
                                        handleEditClick={handleEditClick}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {}
                <div className="product-creation-section bg-white p-6 rounded-xl shadow-lg h-fit sticky top-4">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                        Adicionar Item ao Menu 🍕
                    </h3>

                    <form onSubmit={handleCreate} className="space-y-4">
                        {}
                        <input
                            type="text"
                            placeholder="Nome do Prato"
                            value={prod.name}
                            onChange={(e) => setProd({ ...prod, name: e.target.value })}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                        />

                        {}
                        <textarea
                            rows="3"
                            placeholder="Descrição"
                            value={prod.description}
                            onChange={(e) => setProd({ ...prod, description: e.target.value })}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 resize-none"
                        />

                        {}
                        <input
                            type="number"
                            placeholder="Preço (ex: 19.90)"
                            value={prod.price}
                            onChange={(e) => setProd({ ...prod, price: e.target.value })}
                            step="0.01" 
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                        />

                        {}
                        <select
                            value={prod.category}
                            onChange={(e) => setProd({ ...prod, category: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 bg-white"
                        >
                            <option value="Lanche">Lanche</option>
                            <option value="Bebida">Bebida</option>
                            <option value="Sobremesa">Sobremesa</option>
                        </select>

                        {}
                        <label className="block text-sm font-medium text-gray-700 pt-2">Imagem do Produto:</label>
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageSelect} 
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                        />


                        {}
                        {preview && (
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-24 h-24 rounded-lg object-cover mt-2 shadow-md"
                            />
                        )}

                        {}
                        <button 
                            type="submit" 
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition duration-150 shadow-md"
                            disabled={uploading}
                        >
                            {uploading ? 'Enviando Imagem...' : 'Adicionar ao Cardápio'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RestaurantDashboard;