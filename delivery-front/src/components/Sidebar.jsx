import React from 'react';
import { Link } from 'react-router-dom';


const Sidebar = ({ activeLink, logout }) => {
    
    const navItems = [
        { name: 'Visão Geral', path: '/admin/dashboard', icon: '🏠' },
        { name: 'Restaurantes', path: '/admin/restaurants', icon: '🍔' },
        { name: 'Produtos', path: '/admin/products', icon: '🍕' },
        { name: 'Usuários', path: '/admin/users', icon: '👥' },
        { name: 'Pedidos', path: '/admin/orders', icon: '🛒' },
    ];
    
    return (
        <nav className="sidebar">
            <div className="sidebar-header">
                <h3>Delivery Admin</h3>
            </div>
            
            <ul className="sidebar-nav">
                {navItems.map((item) => (
                    <li key={item.name}>
                        <Link 
                            to={item.path} 
                            
                            className={`nav-link ${activeLink === item.name ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {item.name}
                        </Link>
                    </li>
                ))}
            </ul>
            
            <div className="sidebar-footer">
                <button onClick={logout} className="btn-logout-sidebar">Sair</button>
            </div>
        </nav>
    );
};

export default Sidebar;