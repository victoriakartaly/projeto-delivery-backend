import express from 'express';

import { protect, authorize } from '../middlewares/auth.middleware.js'; 
import {
    createOrder,
    listRestaurantOrders,
    updateOrderStatus,
    getOrderStatus,
    listClientOrders,
    getOrderDetails 
} from '../controllers/order.controller.js';

const router = express.Router();
router.get('/client', protect, authorize('client'), listClientOrders);
router.get('/restaurant', protect, authorize('restaurant', 'employee'), listRestaurantOrders); 
router.get('/:id/status', protect, authorize('client', 'restaurant', 'employee'), getOrderStatus);
router.put('/:id/status', protect, authorize('restaurant', 'employee'), updateOrderStatus);
router.post('/', protect, authorize('client'), createOrder);
router.get(
    '/:id', 
    protect, 
    authorize('client', 'restaurant', 'employee', 'admin'), 
    getOrderDetails
); 


export default router;