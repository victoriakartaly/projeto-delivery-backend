import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      unique: true 
    },

    description: { 
      type: String, 
      default: "" 
    },

    address: { 
      type: String, 
      required: true 
    },

    category: { 
      type: String, 
      required: true 
    },

    
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },

    isOpen: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

export default Restaurant;
