/* eslint-disable no-irregular-whitespace */



import React, { useState, useEffect } from 'react';
import api from '../services/api'; 
import { useAuth } from '../contexts/AuthContext'; 

import AdminDashboardLayout from '../components/AdminDashboardLayout'; 


const AdminDashboard = () => {
  const { user } = useAuth();
  
  
  const [restaurants, setRestaurants] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]); 
  const [transactionTotal, setTransactionTotal] = useState(0); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        
        const [resRes, prodRes, userRes, transRes] = await Promise.all([
          
          api.get('/admin/restaurants'), 
          
          api.get('/admin/products'),
          
          api.get('/admin/users'),
          
          api.get('/analytics/transactions/today') 
        ]);

        
        setRestaurants(Array.isArray(resRes.data?.data) ? resRes.data.data : []); 
        setProducts(Array.isArray(prodRes.data?.data) ? prodRes.data.data : []);
        setUsers(Array.isArray(userRes.data?.data) ? userRes.data.data : []);
        
        
        setTransactionTotal(transRes.data?.data?.value || 0.0); 

        setError(null);
        setIsLoading(false);
      } catch (err) {
        console.error("Erro ao carregar dados do Admin:", err.response || err); 
        
        setError(`Erro de Conexão. Status: ${err.response?.status || 'Network Error'}. Verifique as rotas de Admin no Backend.`);
        setIsLoading(false);
      }
    };
    fetchAdminData();
  }, []); 

  
  if (isLoading) {
    return (
        <AdminDashboardLayout activeLink="Dashboard">
            <div className="flex justify-center items-center h-40">
                <p className="text-xl text-purple-600 font-semibold">Carregando Painel Administrativo...</p>
            </div>
        </AdminDashboardLayout>
    );
  }
  
  if (error) {
    return (
        <AdminDashboardLayout activeLink="Dashboard">
            <div className="p-6 bg-red-100 border border-red-400 text-red-700 rounded-xl m-8">
                <p className="font-bold">Erro de Conexão:</p>
                <p>{error}</p>
            </div>
        </AdminDashboardLayout>
    );
  }
  
  
  return (
    <AdminDashboardLayout activeLink="Dashboard">
        
        <div className="p-4 md:p-8 space-y-10">
            {}
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
                Visão Geral do Sistema 📊
            </h1>

            {}
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border-l-4 border-purple-600">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    Bem-vindo(a), {user?.name || 'Admin'}
                </h3>
                <p className="text-gray-600">
                    Resumo dos dados globais.
                </p>
            </div>
        
            {}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {}
                <MetricCard 
                    title="Total de Restaurantes" 
                    value={restaurants.length} 
                    icon="🍔"
                    color="blue"
                />

                {}
                <MetricCard 
                    title="Total de Produtos" 
                    value={products.length} 
                    icon="🍕"
                    color="green"
                />
                
                {}
                <MetricCard 
                    title="Total de Usuários" 
                    value={users.length} 
                    icon="👥"
                    color="yellow"
                />

                {}
                <MetricCard 
                    title="Faturamento Hoje" 
                    
                    value={transactionTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
                    icon="💰"
                    color="red"
                />

            </div>
            
            <hr className="border-gray-200 my-8"/>

            {}
            <DataSection title="👥 Últimos Usuários Cadastrados" data={users} columns={['ID', 'Nome', 'Email', 'Cargo']}>
                {users.slice(0, 5).map(u => ( 
                    <tr key={u._id || u.id} className="text-sm">
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-500">{(u._id || u.id)?.substring(0, 8)}...</td> 
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{u.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{u.email}</td>
                        <td className={`px-6 py-4 whitespace-nowrap font-semibold uppercase text-xs ${u.role === 'admin' ? 'text-red-600' : 'text-blue-600'}`}>{u.role || 'N/A'}</td>
                    </tr>
                ))}
            </DataSection>
            
            <hr className="border-gray-200 my-8"/>

            {}
            <DataSection title="🍔 Últimos Restaurantes Cadastrados" data={restaurants} columns={['ID', 'Nome', 'Email (Dono)', 'Endereço']}>
                {restaurants.slice(0, 5).map(r => ( 
                    <tr key={r._id || r.id} className="text-sm">
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-500">{(r._id || r.id)?.substring(0, 8)}...</td> 
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-purple-700">{r.name || r.restaurantName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{r.email || r.owner?.email || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{r.address?.substring(0, 30) || 'N/A'}</td>
                    </tr>
                ))}
            </DataSection>

            <hr className="border-gray-200 my-8"/>

            {}
            <DataSection title="🍕 Últimos Produtos Adicionados" data={products} columns={['ID', 'Nome', 'Preço', 'Restaurante']}>
                {products.slice(0, 5).map(p => ( 
                    <tr key={p._id || p.id} className="text-sm">
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-500">{(p._id || p.id)?.substring(0, 8)}...</td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{p.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-green-600">R$ {p.price?.toFixed(2).replace('.', ',') || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{p.restaurant?.name || (p.restaurant?._id ? p.restaurant._id.substring(0, 8) + '...' : 'N/A')}</td> 
                    </tr>
                ))}
            </DataSection>

        </div>
    </AdminDashboardLayout>
  );
};






const MetricCard = ({ title, value, icon, color }) => {
    const colorClasses = {
        blue: 'bg-blue-500/10 text-blue-600',
        green: 'bg-green-500/10 text-green-600',
        yellow: 'bg-yellow-500/10 text-yellow-600',
        red: 'bg-red-500/10 text-red-600',
    };
    const iconColorClass = colorClasses[color] || 'bg-gray-500/10 text-gray-600';

    return (
        <div className="bg-white p-5 rounded-xl shadow-md flex items-center justify-between transition transform hover:scale-[1.02] duration-300 border border-gray-100">
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


const DataSection = ({ title, data, columns, children }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="text-2xl font-semibold text-gray-800">{title}</h3>
                <span className="text-lg font-bold text-purple-600">{data.length} Total</span>
            </div>
            
            {data.length === 0 ? (
                <p className="p-4 text-gray-500 italic text-center border rounded-md">Nenhum dado encontrado para esta seção.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {columns.map(col => (
                                    <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {children}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;