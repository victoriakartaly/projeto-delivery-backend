import express from 'express';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { 
    createRestaurant,
    searchRestaurants, 
    getRestaurantMenu,
    getAllRestaurants,
    updateRestaurant, 
    deleteRestaurant,
    
    getSimpleRestaurantList 
} from '../controllers/restaurant.controller.js';

const router = express.Router();
router.get('/list', getSimpleRestaurantList); 
router.get('/search', searchRestaurants); 
router.get('/:restaurantId/menu', getRestaurantMenu);
router.get('/:restaurantId/products', getRestaurantMenu);

router.post(
    '/',
    protect,
    authorize('admin'),
    createRestaurant
);

router.get(
    '/',
    protect,
    authorize('admin', 'client'),
    getAllRestaurants
);



router.put(
    '/:id',
    protect,
    authorize('admin'),
    updateRestaurant
);



router.delete(
    '/:id',
    protect,
    authorize('admin'),
    deleteRestaurant
);


export default router;