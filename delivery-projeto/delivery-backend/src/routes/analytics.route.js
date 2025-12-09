

import express from 'express';
import { protect, authorize } from '../middlewares/auth.middleware.js'; 
import { 
    getRestaurantAnalyticsToday,
    
    getDailyTransactions 
} from '../controllers/analytics.controller.js'; 


const router = express.Router();


router.use(protect); 








router.get(
    '/transactions/today', 
    authorize('admin'), 
    getDailyTransactions 
);









router.get(
    '/restaurant/today', 
    authorize('restaurant', 'employee'), 
    getRestaurantAnalyticsToday
);


export default router;