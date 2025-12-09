
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import ProductCard from '../components/ProductCard'; 
import { useCart } from '../contexts/CartContext.jsx'; 
import '../assets/styles/ProductList.css'; 

const ProductList = () => {
    
    const [restaurants, setRestaurants] = useState([]); 
    const [products, setProducts] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [msg, setMsg] = useState(''); 
    
    const navigate = useNavigate(); 
    
    
    const { 
        cart, 
        addItemToOrder,
        itemsInCartMap,
        setRestaurant, 
        checkoutError 
    } = useCart(); 
    
    
    const totalItemsInCart = Object.values(itemsInCartMap).reduce((sum, quantity) => sum + quantity, 0);

    
    
    
    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const resRes = await api.get('/restaurants'); 
            const fetchedRestaurants = Array.isArray(resRes.data.data) ? resRes.data.data : [];
            setRestaurants(fetchedRestaurants); 
            
            
            if (fetchedRestaurants.length === 1 && !cart.restaurantId) {
                const singleRestaurant = fetchedRestaurants[0];
                setRestaurant(singleRestaurant._id, singleRestaurant.name);
            }

        } catch (err) {
            console.error("Erro ao carregar restaurantes:", err); 
            setError(err.response?.data?.message || "Não foi possível carregar restaurantes.");
        } finally {
            setLoading(false);
        }
    }, [cart.restaurantId, setRestaurant]);

    
    
    
    
    const fetchProducts = useCallback(async (restaurantId) => {
        if (!restaurantId) {
            setProducts([]);
            setMsg('Selecione um restaurante acima.');
            return;
        }
        setMsg(''); 
        
        try {
            const response = await api.get(`/restaurants/${restaurantId}/products`); 
            
            
            const productsList = (response.data.data || []).map(p => ({
                ...p,
                
                available: p.is_available !== undefined ? p.is_available : (p.available !== undefined ? p.available : true), 
                _id: p._id, 
            }));

            setProducts(productsList); 
        } catch (err) {
            console.error("Erro ao buscar produtos:", err);
            setMsg(`Erro ao carregar cardápio: ${err.response?.data?.message || 'Falha na comunicação.'}`);
            setProducts([]);
        }
    }, []);
    
    
    
    

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    
    useEffect(() => {
        if (cart.restaurantId) {
            fetchProducts(cart.restaurantId);
        } else {
            setProducts([]);
        }
    }, [cart.restaurantId, fetchProducts]);

    
    
    
    if (loading) {
        return <div className="product-list-container loading text-center py-10">Carregando dados iniciais... 🔄</div>;
    }

    if (error) {
        return <div className="product-list-container error-state text-center py-10 text-red-600 font-bold">Erro fatal: {error}</div>;
    }

    
    
    

    return (
        <div className="product-list-container p-4 md:p-8 max-w-7xl mx-auto">
            
            <h1 className="text-4xl font-extrabold text-purple-800 mb-8 border-b-4 border-purple-200 pb-3">
                Cardápio Disponível
            </h1>

            {}
            {(checkoutError || msg) && (
                <div className="p-4 mb-6 rounded-lg font-medium bg-red-100 text-red-700 border border-red-400 shadow-md">
                    ❌ {checkoutError || msg}
                </div>
            )}

            {}
            <div className="bg-white p-6 rounded-xl shadow-2xl mb-8">
                <label htmlFor="restaurant-select" className="block text-xl font-bold text-purple-700 mb-3">
                    1. Selecione o Restaurante
                </label>
                <select
                    id="restaurant-select"
                    value={cart.restaurantId || ''} 
                    onChange={(e) => {
                        const selectedId = e.target.value;
                        const selectedRestaurant = restaurants.find(r => r._id === selectedId);
                        const name = selectedRestaurant ? selectedRestaurant.name : '';
                        
                        
                        setRestaurant(selectedId, name);
                    }}
                    className="w-full p-4 border-2 border-purple-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 bg-gray-50 text-gray-800 text-lg shadow-inner transition duration-150"
                    required
                >
                    <option value="" disabled>--- Selecione um Restaurante ---</option>
                    {restaurants.map(r => (
                        <option key={r._id} value={r._id}>{r.name}</option>
                    ))}
                </select>
            </div>

            {}
            {totalItemsInCart > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-purple-700 text-white shadow-2xl z-20 md:bottom-4 md:right-4 md:left-auto md:w-80 md:rounded-lg md:p-3">
                    <button
                        onClick={() => navigate('/client/cart')}
                        className="w-full py-3 bg-green-500 hover:bg-green-600 rounded-lg text-lg font-bold flex justify-center items-center space-x-2 transition"
                    >
                        <span>🛒 Ver Carrinho ({totalItemsInCart} {totalItemsInCart > 1 ? 'itens' : 'item'})</span>
                        {}
                        {cart.totalAmount !== undefined && (
                            <span className="font-extrabold ml-2">R$ {cart.totalAmount.toFixed(2).replace('.', ',')}</span>
                        )}
                    </button>
                </div>
            )}


            {}
            {}
            <div className="pb-20 md:pb-0"> 
                <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">
                    2. Escolha os Produtos {cart.restaurantName && `em ${cart.restaurantName}`}
                    <span className="subtitle text-base text-gray-500 font-normal ml-3">({products.length} itens)</span>
                </h2>

                {products.length > 0 ? (
                    <div className="products-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {products.map((product) => (
                            <ProductCard 
                                key={product._id} 
                                product={product} 
                                
                                
                                onAddItem={() => 
                                    addItemToOrder(
                                        product._id, 
                                        product.name, 
                                        product.price, 
                                        cart.restaurantId, 
                                        cart.restaurantName 
                                        
                                    )
                                }
                                
                                
                                onRemoveItem={() => 
                                    addItemToOrder(
                                        product._id, 
                                        product.name, 
                                        product.price, 
                                        cart.restaurantId, 
                                        cart.restaurantName, 
                                        -1 
                                    )
                                }
                                
                                
                                quantityInCart={itemsInCartMap[product._id] || 0}
                            /> 
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-500 text-xl bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        {cart.restaurantId ? "Nenhum item disponível neste cardápio no momento." : "Selecione um restaurante acima para visualizar o menu."}
                    </div>
                )}
            </div>
            
        </div>
    );
};

export default ProductList;