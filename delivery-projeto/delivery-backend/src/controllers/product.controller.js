import Product from '../models/product.model.js';
import Restaurant from '../models/restaurant.model.js'; 

const getRestaurantIdForUser = async (user) => {
    let restaurantId = user.restaurantId;

    if (!restaurantId && user.role === 'restaurant') {
        
        const restaurantEntity = await Restaurant.findOne({ owner: user.id }).select('_id');
        if (restaurantEntity) {
            restaurantId = restaurantEntity._id;
        }
    }
    return restaurantId;
};



export const createProduct = async (req, res) => {
    try {
        let targetRestaurantId; 

        
        if (req.user.role === 'admin') {
            
            targetRestaurantId = req.body.restaurantId;
            
            if (!targetRestaurantId) {
                return res.status(400).json({ 
                    message: 'O Administrador deve fornecer o ID do restaurante (restaurantId) no corpo da requisição.' 
                });
            }
        
        
        } else if (req.user.role === 'restaurant' || req.user.role === 'employee') {
            
            targetRestaurantId = await getRestaurantIdForUser(req.user);

            
            if (!targetRestaurantId) {
                
                return res.status(403).json({ 
                    message: 'Seu usuário não está vinculado a um restaurante.' 
                });
            }
        
        } else {
            
            return res.status(403).json({ 
                message: 'Permissão negada para criar produtos.' 
            });
        }
        
        
        const { restaurantId, ...productData } = req.body; 

        
        const product = await Product.create({
            ...productData, 
            restaurant: targetRestaurantId, 
        });

        res.status(201).json({ 
            status: 'success',
            data: product 
        });
        
    } catch (error) {
        console.error("Erro ao criar produto:", error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Erro de validação ao cadastrar produto.', errors: error.errors });
        }
        res.status(500).json({ message: 'Erro ao cadastrar produto.' });
    }
};




export const getRestaurantProducts = async (req, res) => {
    try {
        const restaurantId = req.params.restaurantId;

        if (!restaurantId) {
            return res.status(400).json({ message: 'ID do restaurante é obrigatório na URL.' });
        }

        const products = await Product.find({ restaurant: restaurantId });
        res.status(200).json({ 
            status: 'success',
            results: products.length,
            data: products 
        });
    } catch (error) {
        console.error("Erro ao buscar cardápio:", error);
        res.status(500).json({ message: 'Erro ao buscar cardápio.' });
    }
};




export const getMyProducts = async (req, res) => {
    try {
        
        
        const restaurantId = await getRestaurantIdForUser(req.user);

        if (!restaurantId) {
            return res.status(403).json({ message: 'Seu usuário não está vinculado a um restaurante. Não é possível listar produtos.' });
        }

        const products = await Product.find({ restaurant: restaurantId });
        res.status(200).json({ 
            status: 'success',
            results: products.length,
            data: products 
        });
    } catch (error) {
        console.error("Erro ao buscar cardápio próprio:", error);
        res.status(500).json({ message: 'Erro ao buscar seu cardápio.' });
    }
};





export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate({
            path: 'restaurant',
            select: 'name' 
        });

        res.status(200).json({
            status: 'success',
            results: products.length,
            data: products
        });
    } catch (error) {
        console.error("Erro ao buscar todos os produtos:", error);
        res.status(500).json({ message: 'Erro interno ao buscar todos os produtos.' });
    }
};





export const updateProduct = async (req, res) => {
    try {
        
        const restaurantId = await getRestaurantIdForUser(req.user);
        
        if (!restaurantId) {
            return res.status(403).json({ message: 'Permissão negada. Usuário não vinculado a um restaurante.' });
        }

        
        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, restaurant: restaurantId }, 
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ message: 'Produto não encontrado ou você não tem permissão para editá-lo.' });
        }

        res.status(200).json({
            status: 'success',
            data: product
        });
    } catch (error) {
        console.error("Erro ao atualizar produto:", error);
        res.status(500).json({ message: 'Erro ao atualizar produto.' });
    }
};





export const deleteProduct = async (req, res) => {
    try {
        
        const restaurantId = await getRestaurantIdForUser(req.user);
        
        if (!restaurantId) {
            return res.status(403).json({ message: 'Permissão negada. Usuário não vinculado a um restaurante.' });
        }

        
        const result = await Product.findOneAndDelete({ 
            _id: req.params.id, 
            restaurant: restaurantId 
        });

        if (!result) {
            return res.status(404).json({ message: 'Produto não encontrado ou você não tem permissão para excluir.' });
        }

        res.status(200).json({ 
            status: 'success',
            message: 'Produto excluído com sucesso.' 
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao excluir produto.' });
    }
};