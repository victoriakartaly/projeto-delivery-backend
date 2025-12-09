/* eslint-disable no-irregular-whitespace */


import React, { useState, useEffect } from 'react';
import AdminDashboardLayout from '../components/AdminDashboardLayout';
import api from '../services/api';
import '../assets/styles/Dashboard.css';

const initialFormData = {
  name: '',
  email: '',
  password: '',
  role: 'client',

  restaurantName: '',
  address: '',
  category: '',
  phone: '',

  cpf: '',
  sector: '',
  jobTitle: '',
  
  restaurant: '', 
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [restaurantsList, setRestaurantsList] = useState([]);

  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  
  
  
  const fetchRestaurants = async () => {
    try {
      const response = await api.get('/admin/restaurants');
      setRestaurantsList(response.data?.data || []);
    } catch (err) {
      console.error('Erro ao carregar restaurantes:', err);
    }
  };

  
  
  
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data?.data || []);
    } catch {
      setStatusMessage('Erro ao carregar usuários.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRestaurants();
  }, []);

  
  
  
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "role") {
      
      setFormData(prev => ({
        ...prev,
        role: value
      }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  
  
  
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage('');

    
    
    
    if (isEditing) {
      const updateData = { ...formData };
      if (!updateData.password) delete updateData.password;

      if (updateData.restaurant) {
        updateData.restaurantId = updateData.restaurant;
      }
      delete updateData.restaurant;

      delete updateData.restaurantName;
      delete updateData.address;
      delete updateData.category;
      delete updateData.phone;

      try {
        await api.put(`/admin/users/${currentUserId}`, updateData);
        setStatusMessage('Usuário atualizado com sucesso!');
        setIsEditing(false);
        setFormData(initialFormData);
        fetchUsers();
      } catch {
        setStatusMessage('Erro ao atualizar usuário.');
      }
      return;
    }

    
    
    
    if (formData.role === "restaurant") {
      if (!formData.restaurantName.trim()) {
        return setStatusMessage("O nome do restaurante é obrigatório.");
      }

      try {
        
        const userRes = await api.post('/admin/users', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: "restaurant",
        });

        const ownerId = userRes.data?.data?._id;
        if (!ownerId) throw new Error("Erro ao obter ownerId");

        
        const restRes = await api.post('/admin/restaurants', {
          name: formData.restaurantName.trim(),
          address: formData.address.trim(),
          category: formData.category.trim(),
          phone: formData.phone.trim(),
          owner: ownerId,
        });

        const restaurantId = restRes.data?.data?._id;

        
        await api.put(`/admin/users/${ownerId}`, { restaurantId });

        setStatusMessage('Restaurante criado com sucesso!');
        setFormData(initialFormData);
        fetchUsers();
        return;

      } catch (err) {
        console.error("Erro ao criar restaurante:", err);
        return setStatusMessage("Erro ao criar restaurante.");
      }
    }

    
    
    
    try {
      const cleanData = { ...formData };

      
      if (cleanData.restaurant) {
        cleanData.restaurantId = cleanData.restaurant;
      }

      delete cleanData.restaurant;
      delete cleanData.restaurantName;
      delete cleanData.address;
      delete cleanData.category;
      delete cleanData.phone;

      await api.post('/admin/users', cleanData);

      setStatusMessage("Usuário criado com sucesso!");
      setFormData(initialFormData);
      fetchUsers();
    } catch {
      setStatusMessage("Erro ao criar usuário.");
    }
  };

  
  
  
  const handleEdit = (user) => {
    setIsEditing(true);
    setCurrentUserId(user._id);

    setFormData({
      ...initialFormData,
      ...user,
      password: '',
      restaurant: user.restaurant?._id || ""
    });

    window.scrollTo(0, 0);
  };

  
  
  
  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja deletar?")) return;

    try {
      await api.delete(`/admin/users/${id}`);
      setStatusMessage("Usuário deletado!");
      fetchUsers();
    } catch {
      setStatusMessage("Erro ao deletar usuário.");
    }
  };

  
  
  
  return (
    <AdminDashboardLayout activeLink="Usuários">
      {statusMessage && (
        <div className={`status-msg ${statusMessage.includes('sucesso') ? 'success' : 'error'}`}>
          {statusMessage}
        </div>
      )}

      <div className="data-section">
        <h3>{isEditing ? "✏️ Editar Usuário" : "➕ Criar Novo Usuário"}</h3>

        <form onSubmit={handleFormSubmit} className="form-dashboard">

          
          <div className="form-group-row">
            <div className="form-group">
              <label>Nome</label>
              <input name="name" required value={formData.name} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input name="email" required value={formData.email} onChange={handleChange} />
            </div>
          </div>

          
          <div className="form-group-row">
            <div className="form-group">
              <label>Senha</label>
              <input
                type="password"
                name="password"
                required={!isEditing}
                value={formData.password}
                onChange={handleChange}
              />
              </div>

              <div className="form-group">
                <label>Cargo</label>
                <select name="role" value={formData.role} onChange={handleChange} disabled={isEditing}>
                  <option value="client">Cliente</option>
                  <option value="employee">Funcionário</option>
                  <option value="restaurant">Restaurante</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
          </div>

          
          {(formData.role === "employee" || (isEditing && formData.role === "employee")) && (
            <div className="form-group-row">
              <div className="form-group">
                <label>Vincular ao Restaurante (ID)</label>
                <select 
                  name="restaurant" 
                  value={formData.restaurant} 
                  onChange={handleChange} 
                  required={formData.role === "employee"} 
                >
                  <option value="">--- Selecione um Restaurante ---</option>
                  {restaurantsList.map(r => (
                    <option key={r._id} value={r._id}>{r.name} ({r.email})</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          
          
          {formData.role === "restaurant" && (
            <div className="form-group-row two-cols">

              <div className="form-group">
                <label>Nome do Restaurante</label>
                <input
                  name="restaurantName"
                  value={formData.restaurantName}
                  required
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Endereço</label>
                <input name="address" value={formData.address} required onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Categoria</label>
                <input name="category" value={formData.category} required onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Telefone</label>
                <input name="phone" value={formData.phone} required onChange={handleChange} />
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              {isEditing ? 'Salvar Alterações' : 'Criar Usuário'}
            </button>

            {isEditing && (
              <button type="button" className="btn-cancel" onClick={() => {
                setIsEditing(false);
                setFormData(initialFormData);
              }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

     
      <div className="data-section">
        <h3>👥 Lista de Usuários ({users.length})</h3>

        {!isLoading && (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Cargo</th>
                  <th>Restaurante</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u._id.slice(0, 8)}...</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role.toUpperCase()}</td>
                    <td>{u.restaurant?.name || "—"}</td>

                    <td>
                      <button className="btn-action edit" onClick={() => handleEdit(u)}>
                        Editar
                      </button>

                      <button className="btn-action delete" onClick={() => handleDelete(u._id)}>
                        Deletar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
}