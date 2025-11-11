import Restaurant from '../models/restaurant.model.js';
import Product from '../models/product.model.js'; 

/**
 * @desc Busca restaurantes por nome, localização ou categoria.
 * @route GET /api/v1/restaurants/search
 * @access Public
 */
export const searchRestaurants = async (req, res) => {
    try {
        const { query, category, location } = req.query;
        let filters = {};

        
        if (query) {
            filters.restaurantName = { $regex: query, $options: 'i' }; // Busca case-insensitive
        }

        
        if (category) {
            filters.category = { $regex: category, $options: 'i' };
        }

        
        if (location) {
            filters.address = { $regex: location, $options: 'i' };
        }

        
        const restaurants = await Restaurant.find(filters)
            .select('-__v -password')
            .limit(100); 

        if (restaurants.length === 0) {
            return res.status(404).json({
                success: true,
                message: 'Nenhum restaurante encontrado com os critérios de busca.',
                data: []
            });
        }

        res.status(200).json({
            success: true,
            count: restaurants.length,
            data: restaurants
        });

    } catch (error) {
        console.error('Erro na busca de restaurantes:', error.message);
        res.status(500).json({
            success: false,
            message: 'Falha no servidor ao processar a busca.',
            error: error.message
        });
    }
};


/**
 * @desc Cliente visualiza o cardápio de um restaurante específico.
 * @route GET /api/v1/restaurants/:restaurantId/menu
 * @access Public
 */
export const getRestaurantMenu = async (req, res) => {
    try {
        const { restaurantId } = req.params;

        
        const restaurant = await Restaurant.findById(restaurantId);

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurante não encontrado.'
            });
        }

        const menu = await Product.find({ restaurant: restaurantId }).select('-__v');

        if (menu.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'O cardápio deste restaurante está vazio.',
                data: []
            });
        }

        res.status(200).json({
            success: true,
            restaurantName: restaurant.restaurantName,
            data: menu
        });

    } catch (error) {
        console.error('Erro ao buscar cardápio:', error.message);
        res.status(500).json({
            success: false,
            message: 'Falha no servidor ao buscar o cardápio.',
            error: error.message
        });
    }
};
