import express from 'express';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import {
    createOrder,
    listRestaurantOrders,
    updateOrderStatus,
    getOrderStatus
} from '../controllers/order.controller.js';

const router = express.Router();


router.post('/', protect, authorize('client'), createOrder);


router.get('/:id/status', protect, authorize('client'), getOrderStatus);



router.get('/', protect, authorize('restaurant'), listRestaurantOrders);


router.patch('/:id/status', protect, authorize('restaurant'), updateOrderStatus);


export default router;
