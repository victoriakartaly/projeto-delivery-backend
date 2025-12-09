import AdminDashboardLayout from '../components/AdminDashboardLayout';
import api from '../services/api'; 
import { useState, useEffect } from 'react';


const EditRestaurantModal = ({ restaurant, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        name: restaurant?.name || '',
        email: restaurant?.email || '',
        address: restaurant?.address || '',
        category: restaurant?.category || '',
        phone: restaurant?.phone || '',
        password: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const dataToSend = { ...formData };
        if (!dataToSend.password) delete dataToSend.password;

        onSave(restaurant._id, dataToSend);
    };

    const modalStyles = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
        content: {
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
        },
    };

    return (
        <div style={modalStyles.overlay}>
            <div style={modalStyles.content}>
                <h3>Editar Restaurante: {restaurant.name}</h3>
                <form onSubmit={handleSubmit}>

                    <div className="form-group-row">
                        <div className="form-group">
                            <label>Nome:</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>E-mail:</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group-row">
                        <div className="form-group">
                            <label>Endereço:</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Categoria:</label>
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group-row">
                        <div className="form-group">
                            <label>Telefone:</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Senha (nova):</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Deixe em branco para manter a atual"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="modal-actions" style={{ marginTop: '20px', textAlign: 'right' }}>
                        <button type="submit" className="btn-action edit" style={{ marginRight: '10px' }}>Salvar</button>
                        <button type="button" onClick={onClose} className="btn-action delete">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const RestaurantManagement = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [currentRestaurant, setCurrentRestaurant] = useState(null);

    const fetchRestaurants = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/admin/restaurants');
            setRestaurants(Array.isArray(response.data.data) ? response.data.data : []);
            setError(null);
        } catch (err) {
            const status = err.response?.status;
            let message = "Não foi possível carregar os restaurantes.";
            if (status === 401 || status === 403) message += " Verifique as permissões.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Tem certeza que deseja DELETAR o restaurante "${name}"?`)) {
            try {
                await api.delete(`/admin/restaurants/${id}`);
                alert(`Restaurante "${name}" deletado!`);
                fetchRestaurants();
            } catch {
                alert("Erro ao deletar. Verifique permissões.");
            }
        }
    };

    const handleEdit = (restaurant) => {
        setCurrentRestaurant(restaurant);
        setIsEditing(true);
    };

    const handleUpdate = async (id, data) => {
        try {
            await api.put(`/admin/restaurants/${id}`, data);
            alert("Restaurante atualizado!");
            fetchRestaurants();
        } catch (err) {
            const backendMessage = err.response?.data?.message || 'Erro desconhecido.';
            alert(`Erro ao atualizar: ${backendMessage}`);
        } finally {
            setIsEditing(false);
            setCurrentRestaurant(null);
        }
    };

    useEffect(() => { fetchRestaurants(); }, []);

    return (
        <AdminDashboardLayout activeLink="Restaurantes">
            <div className="data-section">
                <h3>Gerenciamento de Restaurantes ({restaurants.length})</h3>

                {isLoading && <p>Carregando...</p>}
                {error && <p className="status-msg error">{error}</p>}

                {!isLoading && !error && (
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nome</th>
                                    <th>E-mail</th>
                                    <th>Endereço</th>
                                    <th>Categoria</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {restaurants.map(r => (
                                    <tr key={r._id}>
                                        <td>{r._id.substring(0, 8)}...</td>
                                        <td>{r.name}</td>
                                        <td>{r.email}</td>
                                        <td>{r.address}</td>
                                        <td>{r.category || 'N/A'}</td>
                                        <td>
                                            <button className="btn-action edit" onClick={() => handleEdit(r)}>Editar</button>
                                            <button className="btn-action delete" onClick={() => handleDelete(r._id, r.name)}>Deletar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isEditing && currentRestaurant && (
                <EditRestaurantModal
                    restaurant={currentRestaurant}
                    onSave={handleUpdate}
                    onClose={() => { setIsEditing(false); setCurrentRestaurant(null); }}
                />
            )}
        </AdminDashboardLayout>
    );
};

export default RestaurantManagement;