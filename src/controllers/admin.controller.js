import User from '../models/user.model.js';
import Employee from '../models/employee.model.js'; 
import Restaurant from '../models/restaurant.model.js';
import Order from '../models/order.model.js';
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

        res.status(201).json({
            success: true,
            message: `${role} cadastrado com sucesso!`,
            data: { id: newUser._id, email: newUser.email, role: newUser.role, name: newUser.name || newUser.restaurantName },
        });

    } catch (error) {
        console.error(`Erro ao criar ${role}:`, error.message);
        res.status(500).json({ success: false, message: `Falha no servidor ao cadastrar ${role}.` });
    }
};



export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password -__v');
        res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao listar usuários.' });
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
        res.status(500).json({ success: false, message: 'Erro ao excluir usuário.' });
    }
};


export const getAllRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find().select('-password -__v');
        res.status(200).json({
            success: true,
            count: restaurants.length,
            data: restaurants,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao listar restaurantes.' });
    }
};


export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('client', 'name email')
            .populate('restaurant', 'restaurantName email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao listar todos os pedidos.' });
    }
};
