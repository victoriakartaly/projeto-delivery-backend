/* eslint-disable react-hooks/immutability */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-irregular-whitespace */
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api'; 


const AuthContext = createContext(undefined); 


const setAuthHeader = (token) => {
    if (token) {
        api.defaults.headers.Authorization = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.Authorization;
    }
};


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
    
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        
        if (storedToken) {
            setAuthHeader(storedToken); 
            
            
            api.get('/auth/me') 
                .then(response => {
                    
                    setUser(response.data.data || response.data); 
                })
                .catch(() => {
                    
                    logout(false); 
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password }); 
        
        
        const { token, data } = response.data; 
        
        localStorage.setItem('token', token);
        setAuthHeader(token); 
        setUser(data);
        
        
        
    };

    const register = async (formData) => {
        const response = await api.post('/auth/register', formData);
        
        const { token, data } = response.data;
        
        if (token) {
            
            localStorage.setItem('token', token);
            setAuthHeader(token);
            setUser(data);
            
            
            
        }
    };

    const logout = (shouldRedirect = true) => {
        localStorage.removeItem('token');
        setAuthHeader(null); 
        setUser(null);
        
        if (shouldRedirect) {
             
             window.location.href = '/login'; 
        }
    };

    
    return (
        <AuthContext.Provider value={{ user, signed: !!user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => {
    const context = useContext(AuthContext);

    
    if (context === undefined) { 
        throw new Error('O hook useAuth deve ser usado dentro de um AuthProvider. Verifique o seu _app.js ou Layout.');
    }
    return context;
};