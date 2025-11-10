import express from 'express';
import { 
    createProduct, 
    getRestaurantProducts, 
    updateProduct, 
    deleteProduct 
} from '../controllers/product.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();



router.post('/', protect, authorize('restaurant'), createProduct);


router.get('/', protect, authorize('restaurant'), getRestaurantProducts);


router.put('/:id', protect, authorize('restaurant'), updateProduct);


router.delete('/:id', protect, authorize('restaurant'), deleteProduct);


export default router;
