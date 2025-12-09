
import React, { useState, useEffect } from 'react'; 
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios'; 
import '../assets/styles/Login.css'; 
import FundoIlustracao from '../assets/delivery-food.jpg'; 


const API_BASE_URL = 'http://localhost:3000/api/v1';

const Login = () => {
    const { login, register } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    
    
    const [restaurants, setRestaurants] = useState([]);
    const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(false);

    
    const [formData, setFormData] = useState({
        name: '', 
        email: '', 
        password: '', 
        role: 'client',
        restaurantName: '', 
        address: '', 
        category: '', 
        phone: '',
        cpf: '', 
        jobTitle: '',
        adminCode: '',
        restaurantId: ''
    });

    const initialExtraFields = {
        restaurantName: '', 
        address: '', 
        category: '', 
        phone: '',
        cpf: '', 
        jobTitle: '',
        adminCode: '',
        restaurantId: ''
    };

    
    useEffect(() => {
        if (!isLogin && formData.role === 'employee') {
            const fetchRestaurants = async () => {
                setIsLoadingRestaurants(true);
                try {
                    
                    
                    const response = await axios.get(`${API_BASE_URL}/restaurants/list`); 
                    
                    
                    setRestaurants(response.data.data); 
                } catch (err) {
                    console.error('Erro ao carregar restaurantes:', err);
                    
                } finally {
                    setIsLoadingRestaurants(false);
                }
            };
            fetchRestaurants();
        } else {
            
            setRestaurants([]);
        }
    }, [isLogin, formData.role]); 

    
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'role') {
            setFormData(prevData => ({
                ...prevData,
                ...initialExtraFields,
                [name]: value
            }));
        } else {
            setFormData(prevData => ({ 
                ...prevData, 
                [name]: value 
            }));
        }
    };

    
    const getSubmitData = () => {
        const baseData = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
        };

        switch (formData.role) {
            case 'restaurant':
                return { ...baseData, restaurantName: formData.restaurantName, address: formData.address, category: formData.category, phone: formData.phone };
            case 'employee':
                return { ...baseData, cpf: formData.cpf, jobTitle: formData.jobTitle, restaurantId: formData.restaurantId };
            case 'admin':
                return { ...baseData, adminCode: formData.adminCode };
            default:
                return baseData;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            if (isLogin) {
                await login(formData.email, formData.password);
            } else {
                const submitData = getSubmitData();
                await register(submitData);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Erro na operação. Verifique suas credenciais.');
        }
    };

    return (
        <div className="login-page-wrapper">
            <div 
                className="illustration-background"
                style={{ backgroundImage: `url(${FundoIlustracao})` }}
            >
                <div className="login-card"> 
                    <h2>{isLogin ? 'Entrar no Delivery' : 'Criar Nova Conta'}</h2>
                    {error && <div className="error-msg">{error}</div>}
                    
                    <form onSubmit={handleSubmit}>
                        
                        {}
                        {!isLogin && (
                            <>
                                <input 
                                    name="name" 
                                    placeholder="Nome Completo" 
                                    onChange={handleChange} 
                                    value={formData.name} 
                                    required 
                                />
                                
                                {}
                                <select name="role" onChange={handleChange} value={formData.role}>
                                    <option value="client">Cliente</option>
                                    <option value="restaurant">Restaurante</option>
                                    <option value="employee">Funcionário</option>
                                </select>

                                {}
                                {formData.role === 'restaurant' && (
                                    <div className="extra-fields">
                                        <input name="restaurantName" placeholder="Nome do Restaurante" onChange={handleChange} value={formData.restaurantName} required />
                                        <input name="address" placeholder="Endereço" onChange={handleChange} value={formData.address} required />
                                        <input name="category" placeholder="Categoria (Lanche, Pizza)" onChange={handleChange} value={formData.category} required />
                                        <input name="phone" placeholder="Telefone" onChange={handleChange} value={formData.phone} required />
                                    </div>
                                )}
                                
                                {}
                                {formData.role === 'employee' && (
                                    <div className="extra-fields">
                                        {}
                                        <select 
                                            name="restaurantId" 
                                            onChange={handleChange} 
                                            value={formData.restaurantId} 
                                            required
                                            disabled={isLoadingRestaurants || restaurants.length === 0}
                                        >
                                            <option value="">
                                                {isLoadingRestaurants ? 'Carregando restaurantes...' : 'Selecione o Restaurante'}
                                            </option>
                                            {restaurants.map((rest) => (
                                                <option key={rest._id} value={rest._id}>
                                                    {rest.name}
                                                </option>
                                            ))}
                                        </select>
                                        
                                        <input name="cpf" placeholder="CPF" onChange={handleChange} value={formData.cpf} required />
                                        <input name="jobTitle" placeholder="Cargo (Ex: Entregador)" onChange={handleChange} value={formData.jobTitle} required />
                                    </div>
                                )}
                                
                                {}
                                {formData.role === 'admin' && (
                                    <div className="extra-fields admin-fields">
                                        <input name="adminCode" placeholder="Código de Acesso Admin" onChange={handleChange} value={formData.adminCode} type="password" required />
                                    </div>
                                )}
                            </>
                        )}

                        {}
                        <input name="email" type="email" placeholder="E-mail" onChange={handleChange} value={formData.email} required />
                        <input name="password" type="password" placeholder="Senha" onChange={handleChange} value={formData.password} required />

                        <button type="submit" className="btn-primary">
                            {isLogin ? 'Entrar' : 'Cadastrar'}
                        </button>
                    </form>

                    {}
                    <button className="register-link" onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
                    </button>
                </div>
            </div>

            {}
            <div className="side-content">
                <div className="logo-section">
                   
                   
                    
                </div>
                
                
                
        
            </div>
            
        </div>
    );
};

export default Login;