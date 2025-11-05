import express from 'express';
import { registerUser, loginUser, getMe } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Rotas de Autenticação 
// POST /api/v1/auth/register - Cadastro (Clientes, Restaurantes, Funcionários)
router.post('/register', registerUser);

// POST /api/v1/auth/login - Login (Todos os perfis)
router.post('/login', loginUser);

// GET /api/v1/auth/me - Rota protegida de exemplo
router.get('/me', protect, getMe);

export default router;