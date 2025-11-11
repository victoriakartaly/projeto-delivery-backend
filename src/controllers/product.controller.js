import Product from '../models/product.model.js';


export const createProduct = async (req, res) => {

    const restaurant = req.user.restaurantId;

    if (!restaurant) {
        return res.status(403).json({ message: 'Seu usuário não está vinculado a um restaurante.' });
    }
    
    try {
        const product = await Product.create({
            ...req.body,
            restaurant: restaurant,
        });

        res.status(201).json(product);
    } catch (error) {
        console.error("Erro ao criar produto:", error);
        res.status(500).json({ message: 'Erro ao cadastrar produto.' });
    }
};


export const getRestaurantProducts = async (req, res) => {
    try {
        const products = await Product.find({ restaurant: req.user.restaurantId });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar cardápio.' });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, restaurant: req.user.restaurantId }, 
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ message: 'Produto não encontrado ou você não tem permissão para editá-lo.' });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error("Erro ao atualizar produto:", error);
        res.status(500).json({ message: 'Erro ao atualizar produto.' });
    }
};


export const deleteProduct = async (req, res) => {
    try {
        const result = await Product.findOneAndDelete({ 
            _id: req.params.id, 
            restaurant: req.user.restaurantId 
        });

        if (!result) {
            return res.status(404).json({ message: 'Produto não encontrado ou você não tem permissão para excluir.' });
        }

        res.status(200).json({ message: 'Produto excluído com sucesso.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao excluir produto.' });
    }
};
