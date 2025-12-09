import User from '../models/user.model.js';
import Employee from '../models/employee.model.js'; 
import Restaurant from '../models/restaurant.model.js';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js'; 
import bcrypt from 'bcryptjs';


const createUser = async (model, userData, role, res) => {
    const { email, password } = userData;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email e senha são obrigatórios.' });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'Usuário já existe.' });
        }

        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        
        const newUser = await model.create({
            ...userData,
            email,
            password: hashedPassword,
            role,
        });

        
        const responseName = newUser.name || newUser.restaurantName; 

        res.status(201).json({
            success: true,
            message: `${role} cadastrado com sucesso!`,
            data: { id: newUser._id, email: newUser.email, role: newUser.role, name: responseName },
        });

    } catch (error) {
        console.error(`Erro ao criar ${role}:`, error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ 
                success: false, 
                message: `Erro de validação: ${messages.join(' | ')}`,
                details: error.message
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: `Falha no servidor ao cadastrar ${role}.`, 
            details: error.message
        });
    }
};


export const handleUserCreation = (req, res) => {
    const { role } = req.body;

    switch (role) {
        case 'client':
            return createUser(User, req.body, 'client', res);
        case 'employee':
            
            return createUser(User, req.body, 'employee', res);
        case 'restaurant':
            return createUser(Restaurant, req.body, 'restaurant', res);
        case 'admin':
            return createUser(User, req.body, 'admin', res); 
        default:
            return res.status(400).json({ success: false, message: 'Cargo (role) inválido.' });
    }
};


export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password -__v') 
            .populate({
                path: 'restaurant',
                select: 'restaurantName' 
            }); 
        
        res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ success: false, message: 'Erro ao listar usuários.', details: error.message });
     }
};


export const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const updates = req.body;
        
        const options = { new: true, runValidators: true };

        
        if (updates.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(updates.password, salt);
        } else {
            
            delete updates.password; 
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updates, options).select('-password');
        
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado para atualização.' });
        }

        res.status(200).json({
            success: true,
            message: 'Usuário atualizado com sucesso!',
            data: updatedUser,
        });

    } catch (error) {
        console.error('Erro ao atualizar usuário:', error.message);
        res.status(500).json({ success: false, message: 'Falha no servidor ao atualizar usuário.', details: error.message });
    }
};


export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
        }
 
        
        if (user._id.toString() === req.user.id) {
            return res.status(403).json({ success: false, message: 'O Admin não pode deletar a própria conta através desta rota.' });
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: `Usuário ${req.params.id} excluído com sucesso.`,
            data: {},
           });
       } catch (error) {
         res.status(500).json({ success: false, message: 'Erro ao excluir usuário.', details: error.message });
       }
};


export const getAllProducts = async (req, res) => {
    try {
        
        const products = await Product.find().populate({
            path: 'restaurant',
            select: 'restaurantName email'
        }).select('-__v'); 

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error("Erro ao listar produtos:", error);
        res.status(500).json({ 
            success: false, 
            message: "Erro interno ao buscar a lista de produtos.", 
            details: error.message 
        });
    }
};

export const getAllRestaurants = async (req, res) => {
    try {
       
        const restaurants = await Restaurant.find().select('-password -__v'); 
        
        res.status(200).json({
            success: true,
            count: restaurants.length,
            data: restaurants 
        });
    } catch (error) {
        console.error('Erro ao listar restaurantes:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Falha no servidor ao buscar restaurantes.', 
            details: error.message 
        });
    }
};


export const getRestaurantById = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id).select('-password');
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurante não encontrado.' });
        }
        res.status(200).json({ success: true, data: restaurant });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao buscar restaurante.', details: error.message });
    }
};


export const updateRestaurant = async (req, res) => {
    try {
        const updates = req.body;
        const options = { new: true, runValidators: true };
        
        if (updates.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(updates.password, salt);
        } else {
            
            delete updates.password; 
        }

        const updatedRestaurant = await Restaurant.findByIdAndUpdate(req.params.id, updates, options).select('-password');

        if (!updatedRestaurant) {
            return res.status(404).json({ success: false, message: 'Restaurante não encontrado para atualização.' });
        }

        res.status(200).json({ success: true, message: 'Restaurante atualizado com sucesso!', data: updatedRestaurant });
    } catch (error) {
        console.error('Erro ao atualizar restaurante:', error.message);
        res.status(500).json({ success: false, message: 'Falha no servidor ao atualizar restaurante.', details: error.message });
    }
};


export const deleteRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findByIdAndDelete(req.params.id);

        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurante não encontrado.' });
        }

        res.status(200).json({ success: true, message: 'Restaurante excluído com sucesso.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao excluir restaurante.', details: error.message });
    }
};


export const getAllOrders = async (req, res) => {
    try {
        
        const orders = await Order.find().populate('user restaurant');
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) {
        console.error('Erro ao listar pedidos:', error);
        res.status(500).json({ success: false, message: 'Erro ao listar pedidos.', details: error.message });
    }
};