import express from 'express';

import { protect, authorize } from '../middlewares/auth.middleware.js'; 

import { 
    getAllUsers, 
    handleUserCreation, 
    updateUser, 
    deleteUser,
    getAllRestaurants, 
    updateRestaurant,
    deleteRestaurant,
    getRestaurantById, 
    
    getAllProducts 
} from '../controllers/admin.controller.js'; 


const router = express.Router();






router.get('/dashboard-check', protect, authorize('admin'), (req, res) => {
    res.status(200).json({
        message: 'SUCESSO! Acesso liberado ao dashboard de administração.',
        userDetails: {
            id: req.user._id,
            role: req.user.role,
            name: req.user.name
        }
    });
});






router.route('/users')
  
  .get(protect, authorize('admin'), getAllUsers) 
  
  .post(protect, authorize('admin'), handleUserCreation); 

router.route('/users/:id')
  
  .put(protect, authorize('admin'), updateUser)  
  
  .delete(protect, authorize('admin'), deleteUser); 
  





router.route('/restaurants')
  
  .get(protect, authorize('admin'), getAllRestaurants); 

router.route('/restaurants/:id')
  
  .put(protect, authorize('admin'), updateRestaurant)  
  
  .delete(protect, authorize('admin'), deleteRestaurant); 








router.route('/products')
  
  
  .get(protect, authorize('admin', 'restaurant', 'employee'), getAllProducts); 


export default router;