/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import axios from 'axios';






const API_URL = 'http://localhost:3001/api/produtos'

const HomePage = () => {
    
    const [produtosDestaque, setProdutosDestaque] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    
    const fetchProdutosDestaque = async () => {
        try {
            
            const response = await axios.get(`${API_URL}/destaques`);
            
            
            setProdutosDestaque(response.data);
            setLoading(false); 
        } catch (err) {
            console.error("Erro ao buscar produtos em destaque:", err);
            setError("Não foi possível carregar os produtos. Tente novamente mais tarde.");
            setLoading(false);
        }
    };

    
    useEffect(() => {
        fetchProdutosDestaque();
    }, []); 

    
    const renderProdutos = () => {
        if (loading) {
            return <p>Carregando nosso menu delicioso...</p>;
        }

        if (error) {
            return <p style={{ color: 'red' }}>Erro: {error}</p>;
        }

        if (produtosDestaque.length === 0) {
            return <p>Nenhum item em destaque no momento. Confira o menu completo!</p>;
        }

        return (
            <div className="product-list-grid">
                {produtosDestaque.map(produto => (
                    
                    
                    <div key={produto._id} className="product-card">
                        <h3>{produto.nome}</h3>
                        <p>{produto.descricao}</p>
                        <p>R$ {produto.preco.toFixed(2)}</p>
                        <button>Adicionar ao Carrinho</button>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="homepage">
            {}
            
            <section className="hero-banner">
                <h1>Seu Delivery Favorito: Rápido e Fresco!</h1>
                <p>Peça agora e receba a melhor comida na sua porta.</p>
                <button className="cta-button">Ver Menu Completo</button>
            </section>

            <section className="featured-products">
                <h2>🔥 Nossos Destaques da Semana</h2>
                {renderProdutos()}
            </section>
            
            {}
        </div>
    );
};

export default HomePage;