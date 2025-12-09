// src/components/MiniCart.jsx (Não precisa de alteração, pois já usa useCart)
import React from 'react';
import { useCart } from '../context/CartContext.jsx';
import { useNavigate } from 'react-router-dom';
import './MiniCart.css'; // Importe seu CSS

const MiniCart = () => {
    const { cart, currentTotal } = useCart();
    const navigate = useNavigate();

    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    const handleGoToCart = () => {
        navigate('/cart');
    };

    const formattedTotal = parseFloat(currentTotal).toFixed(2).replace('.', ',');

    return (
        <button 
            className="minicart-button" 
            onClick={handleGoToCart}
            disabled={totalItems === 0} 
            title={totalItems > 0 ? `Ir para o Carrinho (R$ ${formattedTotal})` : 'Carrinho vazio'}
        >
            🛒
            {totalItems > 0 && (
                <span className="cart-badge">
                    {totalItems}
                </span>
            )}
        </button>
    );
};

export default MiniCart;