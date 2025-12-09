import jwt from 'jsonwebtoken';
import User from '../models/user.model.js'; 


export const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        
        expiresIn: '7d', 
    });
};

export const protect = async (req, res, next) => {
    let token;

    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            
            token = req.headers.authorization.split(' ')[1];

            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                
                return res.status(401).json({ message: 'Usuário não encontrado.' });
            }

            
            next(); 
            return;
            
        } catch (error) {
            console.error("Erro na verificação do token:", error);
            
            return res.status(401).json({ message: 'Não autorizado, token inválido/expirado.' });
        }
    }

    
    if (!token) {
        return res.status(401).json({ message: 'Não autorizado, sem token.' });
    }
};


export const authorize = (...roles) => {
    return (req, res, next) => {
        
        console.log(`Verificando rota: Papéis permitidos: ${roles.join(', ')}. Papel do Usuário: ${req.user?.role}`);
        
        
        if (req.user && !roles.includes(req.user.role)) {
            
            
            return res.status(403).json({ 
                message: `Acesso negado. Requer um dos seguintes perfis: ${roles.join(', ')}. Seu perfil atual: ${req.user.role}` 
            });
        } 
        
        
        else if (!req.user) {
            return res.status(403).json({ 
                message: `Acesso negado. Usuário não autenticado.` 
            });
        }
        
        
        next();
    };
};