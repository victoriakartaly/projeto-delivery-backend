import express from 'express';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import {
    createOrder,
    listRestaurantOrders,
    updateOrderStatus,
    getOrderStatus
} from '../controllers/order.controller.js';

const router = express.Router();

// Rotas para Clientes
// @route POST /api/v1/orders - Fazer um novo pedido
router.post('/', protect, authorize('client'), createOrder);

// @route GET /api/v1/orders/:id/status - Cliente acompanha status do pedido
router.get('/:id/status', protect, authorize('client'), getOrderStatus);


// Rotas para Restaurantes
// @route GET /api/v1/orders - Restaurante lista seus pedidos (pendentes)
router.get('/', protect, authorize('restaurant'), listRestaurantOrders);

// @route PATCH /api/v1/orders/:id/status - Restaurante aceita/atualiza status
router.patch('/:id/status', protect, authorize('restaurant'), updateOrderStatus);


export default router;