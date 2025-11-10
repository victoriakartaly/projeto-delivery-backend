import express from 'express';
import { searchRestaurants, getRestaurantMenu } from '../controllers/restaurant.controller.js'; 
const router = express.Router();


router.get('/search', searchRestaurants);


router.get('/:restaurantId/menu', getRestaurantMenu);

export default router;