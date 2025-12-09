// src/components/ProductCard.jsx

import React from 'react';
import { FaPlus, FaMinus, FaCartPlus } from 'react-icons/fa'; // Assumindo que você está usando react-icons

const ProductCard = ({ 
    product, 
    onAddItem, 
    onRemoveItem, 
    quantityInCart 
}) => {

    const { 
        name, 
        description, 
        price, 
        imageUrl, 
        available 
    } = product;

    // Função auxiliar para formatar o preço
    const formatPrice = (p) => `R$ ${p.toFixed(2).replace('.', ',')}`;

    return (
        <div className="product-card bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 flex flex-col overflow-hidden">
            
            {/* Imagem do Produto */}
            <div className="relative h-48">
                <img 
                    src={imageUrl || 'placeholder.jpg'} // Use uma imagem de fallback
                    alt={name} 
                    className="w-full h-full object-cover"
                />
                {!available && (
                    <div className="absolute inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center">
                        <span className="text-white text-lg font-bold">ESGOTADO</span>
                    </div>
                )}
            </div>

            {/* Detalhes do Produto */}
            <div className="p-4 flex-grow">
                <h3 className="text-xl font-bold text-gray-800 mb-1">{name}</h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{description}</p>
                <div className="flex justify-between items-center">
                    <span className="text-2xl font-extrabold text-purple-600">
                        {formatPrice(price)}
                    </span>
                </div>
            </div>

            {/* Ações e Controle de Quantidade */}
            <div className="p-4 bg-gray-50 border-t border-gray-100">
                {quantityInCart > 0 ? (
                    // Estado: Item já está no carrinho
                    <div className="flex justify-between items-center space-x-2">
                        <button
                            onClick={onRemoveItem}
                            disabled={!available}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition disabled:opacity-50"
                            title="Remover 1 item"
                        >
                            <FaMinus />
                        </button>
                        
                        <span className="text-xl font-bold text-gray-800 flex-grow text-center">
                            {quantityInCart} no carrinho
                        </span>

                        <button
                            onClick={onAddItem}
                            disabled={!available}
                            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition disabled:opacity-50"
                            title="Adicionar 1 item"
                        >
                            <FaPlus />
                        </button>
                    </div>
                ) : (
                    // Estado: Item não está no carrinho
                    <button
                        onClick={onAddItem}
                        disabled={!available}
                        className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-purple-700 transition disabled:bg-gray-400"
                    >
                        <FaCartPlus />
                        <span>Adicionar ao Carrinho</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProductCard;