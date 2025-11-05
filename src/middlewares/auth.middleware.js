import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// Função utilitária para gerar o JWT (usada no Controller)
export const generateToken = (id) => {
    
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d', // Token expira em 7 dias
    });
};

// 1. Protege a rota: Verifica se o usuário está logado
export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Obtém o token do cabeçalho
            token = req.headers.authorization.split(' ')[1];

            // Verifica o token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Anexa o usuário à requisição (exceto a senha)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Usuário não encontrado.' });
            }

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Não autorizado, token inválido.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Não autorizado, sem token.' });
    }
};

// 2. Autoriza por Perfil: Restringe acesso a certos perfis

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Acesso negado. Requer um dos seguintes perfis: ${roles.join(', ')}` 
            });
        }
        next();
    };
};
