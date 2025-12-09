import jwt from 'jsonwebtoken';
import User from '../models/user.model.js'; 
import Restaurant from '../models/restaurant.model.js'; 
import Employee from '../models/employee.model.js'; 
import { generateToken } from '../middlewares/auth.middleware.js'; 



const getUserRestaurantInfo = async (user) => {
    let restaurantId = user.restaurantId ? user.restaurantId.toString() : null; 
    let employeeId = null;

    
    if (user.role === 'restaurant') {
        try {
            if (!restaurantId) {
                const restaurant = await Restaurant.findOne({ owner: user._id });
                if (restaurant) {
                    restaurantId = restaurant._id.toString();
                }
            }
        } catch (err) {
            console.error("Erro ao buscar Restaurante por owner:", err);
        }
    } 
    
   
    if (user.role === 'employee') {
        try {
            const employee = await Employee.findOne({ user: user._id });
            if (employee) {
                employeeId = employee._id.toString(); 
            }
        } catch (err) {
            console.error("Erro ao buscar Employee por user ID:", err);
        }
    }

    return { restaurantId, employeeId };
};


const sendTokenResponse = async (res, user, statusCode) => {
    
    const token = generateToken(user._id); 
    
    const { restaurantId, employeeId } = await getUserRestaurantInfo(user);


    const userData = user.toObject ? user.toObject() : user;
    delete userData.password;

    res.status(statusCode).json({
        success: true,
        data: {
            
            ...userData, 
            
            restaurantId: restaurantId || userData.restaurantId, 
            employeeId: employeeId,
        },
        token,
    });
};



export const registerUser = async (req, res) => {
    
   
    const { 
        name, email, password, role, 
        restaurantName, address, category, phone, 
        cpf, jobTitle, sector, 
        restaurantId 
    } = req.body;

    try {
        
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'E-mail já cadastrado.' });
        }
        
        
        const userData = { name, email, password, role: role || 'client' }; 

        
        if (userData.role === 'restaurant') {
            
            
            const user = new User({ name, email, password, role: 'restaurant' }); 
            await user.save(); 

            
            const restaurant = await Restaurant.create({ 
                name: restaurantName, 
                address,
                category,
                phone,
                owner: user._id, 
            });
            
            
            user.restaurantId = restaurant._id;
            await user.save(); 

            await sendTokenResponse(res, user, 201); 
            return; 

        
        } else if (userData.role === 'employee' || userData.role === 'admin') {
            
            
            Object.assign(userData, { cpf, jobTitle, sector });

            
            if (restaurantId) {
                userData.restaurantId = restaurantId;
            }
            
            const user = await User.create(userData);
            
            
            await sendTokenResponse(res, user, 201); 
            return;
        }

        
        const user = await User.create(userData);
        await sendTokenResponse(res, user, 201);

    } catch (error) {
        console.error("Erro no cadastro:", error);
        const statusCode = error.name === 'ValidationError' ? 400 : 500;
        res.status(statusCode).json({ 
            success: false, 
            message: 'Erro ao cadastrar. Verifique os dados.', 
            error: error.message,
            errorDetail: error.message 
        });
    }
};



export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Por favor, forneça e-mail e senha.' });
        }

        
        const user = await User.findOne({ email }).select('+password'); 

        if (!user) {
            return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
        }

        
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
        }

        
        await sendTokenResponse(res, user, 200); 

    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor ao realizar login.' });
    }
};



export const getMe = async (req, res) => {
    const user = req.user;

    try {
        
        const { restaurantId, employeeId } = await getUserRestaurantInfo(user);

        
        const userWithoutPassword = user.toObject ? user.toObject() : user;
        delete userWithoutPassword.password;

        const userWithInfo = {
            ...userWithoutPassword,
            restaurantId: restaurantId || userWithoutPassword.restaurantId,
            employeeId
        };

        res.status(200).json({ success: true, data: userWithInfo });

    } catch (error) {
        console.error("Erro em getMe:", error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor ao obter dados do usuário.' });
    }
};