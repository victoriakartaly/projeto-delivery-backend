import express from 'express';
import { 
    createProduct, 
    getRestaurantProducts, 
    updateProduct, 
    deleteProduct,
    getAllProducts,
    
    getMyProducts 
} from '../controllers/product.controller.js'; 


import { protect, authorize } from '../middlewares/auth.middleware.js'; 

const router = express.Router();







router.get('/restaurant/:restaurantId', getRestaurantProducts);









router.get('/restaurant', protect, authorize('restaurant', 'employee'), getMyProducts); 





router.get('/', protect, authorize('admin'), getAllProducts);



router.post('/', protect, authorize('restaurant', 'admin', 'employee'), createProduct); 




router.put('/:id', protect, authorize('restaurant', 'employee'), updateProduct);



router.delete('/:id', protect, authorize('restaurant', 'employee'), deleteProduct);


export default router;