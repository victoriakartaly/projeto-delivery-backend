import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

// Importa Rotas
import authRoutes from './src/routes/auth.route.js';
import restaurantRoutes from './src/routes/restaurant.route.js';
import productRoutes from './src/routes/product.route.js';
import orderRoutes from './src/routes/order.route.js';
import adminRoutes from './src/routes/admin.route.js'; // NOVO: Rotas de Admin

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const productRouter = require('./src/routes/product.route');


// Middleware para processar JSON
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
    res.send('API de Delivery rodando com sucesso!');
});

// Montagem das rotas
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/restaurants', restaurantRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/admin', adminRoutes); 
app.use('/api/v1/products', productRouter); // NOVO: Montagem das Rotas de Admin

export default app;