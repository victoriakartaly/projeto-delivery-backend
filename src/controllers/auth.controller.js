import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { generateToken } from '../middlewares/auth.middleware.js'; 


const sendTokenResponse = (res, user, statusCode) => {
    const token = generateToken(user._id);
    res.status(statusCode).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
        
        restaurantId: user.restaurantId || undefined 
    });
};


export const registerUser = async (req, res) => {
    const { name, email, password, role, ...otherDetails } = req.body;

    try {
       
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'E-mail já cadastrado.' });
        }
        
        
        let restaurant;
        let userData = { name, email, password, role: role || 'client' }; 

        if (userData.role === 'restaurant') {
            
            restaurant = await Restaurant.create({ 
                name: otherDetails.restaurantName,
                address: otherDetails.address,
                category: otherDetails.category,
               
            });
           
            userData.restaurantId = restaurant._id; 
            userData.phone = otherDetails.phone;
        } else if (userData.role === 'employee' || userData.role === 'admin') {
            
            Object.assign(userData, otherDetails);
        }

        const user = await User.create(userData);

        if (restaurant) {
            
            restaurant.owner = user._id;
            await restaurant.save();
        }

        sendTokenResponse(res, user, 201); 

    } catch (error) {
        console.error("Erro no cadastro:", error);
        res.status(500).json({ message: 'Erro interno do servidor ao cadastrar usuário.', error: error.message });
    }
};


export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
      
        if (!email || !password) {
            return res.status(400).json({ message: 'Por favor, forneça e-mail e senha.' });
        }

        
        const user = await User.findOne({ email }).select('+password'); 

        if (!user) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

      
        sendTokenResponse(res, user, 200);

    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ message: 'Erro interno do servidor ao realizar login.' });
    }
};

// Função de exemplo para testar o perfil
export const getMe = (req, res) => {
    res.status(200).json(req.user);
};
