import express from 'express';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import {
    createEmployee,
    getAllUsers,
    deleteUser,
    getAllRestaurants,
    getAllOrders
} from '../controllers/admin.controller.js';

const router = express.Router();


router.use(protect);
router.use(authorize('admin'));


router.post('/employees', createEmployee);


router.get('/users', getAllUsers);

router.delete('/users/:id', deleteUser);


router.get('/restaurants', getAllRestaurants);


router.get('/orders', getAllOrders);


export default router;