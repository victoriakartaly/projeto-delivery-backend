import express from 'express';
import { 
    createProduct, 
    getRestaurantProducts, 
    updateProduct, 
    deleteProduct 
} from '../controllers/product.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Rotas para Gerenciamento de Cardápio (Apenas Restaurantes)
// Todas as rotas abaixo requerem que o usuário esteja logado (protect) e tenha o perfil 'restaurant' (authorize)

// POST /api/v1/products - Cadastrar um novo item
router.post('/', protect, authorize('restaurant'), createProduct);

// GET /api/v1/products - Listar o cardápio do próprio restaurante
router.get('/', protect, authorize('restaurant'), getRestaurantProducts);

// PUT /api/v1/products/:id - Editar um item específico
router.put('/:id', protect, authorize('restaurant'), updateProduct);

// DELETE /api/v1/products/:id - Remover um item específico
router.delete('/:id', protect, authorize('restaurant'), deleteProduct);


export default router;
