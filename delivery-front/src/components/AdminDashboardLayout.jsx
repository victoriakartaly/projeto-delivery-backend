import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; 


const AdminDashboardLayout = ({ children, activeLink }) => {
    
    const navigate = useNavigate(); 
    const { logout, user } = useAuth(); 

    const handleLogout = () => {
        logout();
        
        navigate('/login'); 
    };

    return (
        
        <div className="flex min-h-screen bg-gray-50">
            
            {}
            <aside className="w-64 bg-gray-800 text-white flex flex-col shadow-2xl z-10">
                <div className="p-6 border-b border-gray-700/50">
                    <h3 className="text-2xl font-extrabold tracking-wider text-purple-400">ADMIN PAINEL</h3>
                    <p className="text-sm mt-1 text-gray-400">{user?.role.toUpperCase()}</p>
                </div>
                
                <nav className="flex-1 px-4 py-6 space-y-2">
                    <h4 className="text-xs font-semibold uppercase text-gray-500 mb-3 ml-2">Módulos</h4>
                    
                    {}
                    <Link 
                        to="/admin" 
                        className={`
                            nav-item block px-4 py-2 rounded-lg transition duration-150 ease-in-out 
                            ${activeLink === 'Dashboard' 
                                ? 'bg-purple-700 text-white font-bold shadow-md' 
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }
                        `}
                    >
                        🏠 Dashboard
                    </Link>
                    
                    {}
                    <Link 
                        to="/admin/users" 
                        className={`
                            nav-item block px-4 py-2 rounded-lg transition duration-150 ease-in-out 
                            ${activeLink === 'Usuários' 
                                ? 'bg-purple-700 text-white font-bold shadow-md' 
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }
                        `}
                    >
                        👥 Gerenciar Usuários
                    </Link>
                    
                    <Link 
                        to="/admin/restaurants" 
                        className={`
                            nav-item block px-4 py-2 rounded-lg transition duration-150 ease-in-out 
                            ${activeLink === 'Restaurantes' 
                                ? 'bg-purple-700 text-white font-bold shadow-md' 
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }
                        `}
                    >
                        🍔 Restaurantes
                    </Link>
                    
                    <Link 
                        to="/admin/products" 
                        className={`
                            nav-item block px-4 py-2 rounded-lg transition duration-150 ease-in-out 
                            ${activeLink === 'Produtos' 
                                ? 'bg-purple-700 text-white font-bold shadow-md' 
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }
                        `}
                    >
                        📦 Produtos Globais
                    </Link>
                    
                    {}
                </nav>
            </aside>

            {}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="flex justify-between items-center bg-white p-4 shadow-md border-b border-gray-200">
                    <div className="text-lg font-medium text-gray-700">
                        Bem-vindo(a), <strong className="text-purple-600">{user?.name || 'Admin'}</strong>
                    </div>
                    <button 
                        onClick={handleLogout} 
                        className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition duration-150 shadow-md"
                    >
                        Sair 🚪
                    </button>
                </header>
                
                {}
                <div className="flex-1 overflow-y-auto bg-gray-100 p-0"> 
                    {}
                    {children}
                </div>
            </main>

        </div>
    );
};

export default AdminDashboardLayout;