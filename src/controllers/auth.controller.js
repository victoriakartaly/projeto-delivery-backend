import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { generateToken } from '../middlewares/auth.middleware.js'; 

// Função auxiliar para estruturar a resposta de sucesso
const sendTokenResponse = (res, user, statusCode) => {
    const token = generateToken(user._id);
    res.status(statusCode).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
        // Adiciona o ID do restaurante se for um restaurante/proprietário
        restaurantId: user.restaurantId || undefined 
    });
};

// Requisito: Cadastrar Clientes, Restaurantes, Funcionários
export const registerUser = async (req, res) => {
    const { name, email, password, role, ...otherDetails } = req.body;

    try {
        // 1. Verifica se o usuário já existe
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'E-mail já cadastrado.' });
        }
        
        // 2. Cria o usuário
        let restaurant;
        let userData = { name, email, password, role: role || 'client' }; // Default é 'client'

        if (userData.role === 'restaurant') {
            // Se for um restaurante, primeiro cria a entidade Restaurante
            restaurant = await Restaurant.create({ 
                name: otherDetails.restaurantName,
                address: otherDetails.address,
                category: otherDetails.category,
                // O 'owner' será adicionado após a criação do usuário,  o campo 'restaurantId' é obrigatório.
                // Usaremos um placeholder temporário ou faremos a criação em duas etapas.
            });
            // Adiciona o ID do Restaurante ao payload do usuário
            userData.restaurantId = restaurant._id; 
            userData.phone = otherDetails.phone; // Telefone do restaurante
        } else if (userData.role === 'employee' || userData.role === 'admin') {
            // Requisito: Cadastro de funcionários com dados pessoais
            Object.assign(userData, otherDetails);
        }

        const user = await User.create(userData);

        if (restaurant) {
            // Se foi criado um restaurante, atualiza a referência do dono
            restaurant.owner = user._id;
            await restaurant.save();
        }

        sendTokenResponse(res, user, 201); // 201 Created

    } catch (error) {
        console.error("Erro no cadastro:", error);
        res.status(500).json({ message: 'Erro interno do servidor ao cadastrar usuário.', error: error.message });
    }
};

// Requisito: Login de Clientes, Restaurantes, Funcionários e Administradores
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Verifica se E-mail e Senha foram fornecidos
        if (!email || !password) {
            return res.status(400).json({ message: 'Por favor, forneça e-mail e senha.' });
        }

        // 2. Encontra o usuário pelo E-mail
        const user = await User.findOne({ email }).select('+password'); // Pede a senha para comparação

        if (!user) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        // 3. Compara a senha
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        // 4. Envia a resposta com o Token JWT
        sendTokenResponse(res, user, 200);

    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ message: 'Erro interno do servidor ao realizar login.' });
    }
};

// Função de exemplo para testar o perfil (precisa do middleware 'protect')
export const getMe = (req, res) => {
    res.status(200).json(req.user);
};
