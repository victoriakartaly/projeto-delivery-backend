import express from 'express';
import { fileURLToPath } from 'url'; 
import path from 'path'; 
import cors from 'cors'; 




import authRoutes from './src/routes/auth.route.js';
import restaurantRoutes from './src/routes/restaurant.route.js';
import productRoutes from './src/routes/product.route.js';
import orderRoutes from './src/routes/order.route.js';
import adminRoutes from './src/routes/admin.route.js'; 
import analyticsRoutes from './src/routes/analytics.route.js';
import cartRoutes from './src/routes/cart.route.js';

const app = express(); 
const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename); 


app.use(express.json()); 
app.use(cors({ 
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], 
    credentials: true,
}));


app.get('/', (req, res) => {
    res.send('API de Delivery rodando com sucesso!');
});
 

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/restaurants', restaurantRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/admin', adminRoutes); 
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/cart', cartRoutes);

export default app;