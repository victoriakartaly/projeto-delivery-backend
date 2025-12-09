import Restaurant from "../models/restaurant.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";




export const createRestaurant = async (req, res) => {
    try {
        const { name, description, address, category, owner } = req.body;

        
        if (!name || !address || !category || !owner) {
            return res.status(400).json({
                success: false,
                message: "Preencha todos os campos obrigatórios."
            });
        }

        
        const ownerExists = await User.findById(owner);
        if (!ownerExists) {
            return res.status(404).json({
                success: false,
                message: "O dono informado não existe."
            });
        }

        
        if (ownerExists.role !== "owner") {
            return res.status(400).json({
                success: false,
                message: "O usuário informado não é um dono (role = 'owner')."
            });
        }

        
        const restaurant = await Restaurant.create({
            name,
            description,
            address,
            category,
            owner
        });

        res.status(201).json({
            success: true,
            message: "Restaurante criado com sucesso!",
            data: restaurant
        });

    } catch (error) {
        console.error("Erro ao criar restaurante:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao criar restaurante.",
            error: error.message
        });
    }
};





export const getSimpleRestaurantList = async (req, res) => {
    try {
        
        const restaurants = await Restaurant.find().select('_id name'); 

        res.status(200).json({
            success: true,
            count: restaurants.length,
            data: restaurants
        });

    } catch (error) {
        console.error("Erro ao carregar lista simples de restaurantes:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao carregar lista de restaurantes.",
            error: error.message
        });
    }
};










export const searchRestaurants = async (req, res) => {
    try {
        const { query, category, location } = req.query;
        let filters = {};

        if (query) filters.name = { $regex: query, $options: "i" };
        if (category) filters.category = { $regex: category, $options: "i" };
        if (location) filters.address = { $regex: location, $options: "i" };

        const restaurants = await Restaurant.find(filters)
            .select("-__v")
            .populate("owner", "name email role");

        res.status(200).json({
            success: true,
            count: restaurants.length,
            data: restaurants
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erro ao buscar restaurantes",
            error: error.message
        });
    }
};





export const getRestaurantMenu = async (req, res) => {
    try {
        const { restaurantId } = req.params;

        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurante não encontrado."
            });
        }

        const menu = await Product.find({ restaurant: restaurantId });

        res.status(200).json({
            success: true,
            restaurant: restaurant.name,
            data: menu
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erro ao carregar cardápio.",
            error: error.message
        });
    }
};





export const getAllRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find({})
            .select("-__v")
            .populate("owner", "name email role");

        res.status(200).json({
            success: true,
            count: restaurants.length,
            data: restaurants
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erro ao listar restaurantes.",
            error: error.message
        });
    }
};





export const updateRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurante não encontrado."
            });
        }

        res.status(200).json({
            success: true,
            data: restaurant
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erro ao atualizar restaurante.",
            error: error.message
        });
    }
};





export const deleteRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findByIdAndDelete(req.params.id);

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurante não encontrado."
            });
        }

        res.status(200).json({
            success: true,
            message: "Restaurante deletado com sucesso."
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erro ao deletar restaurante.",
            error: error.message
        });
    }
};