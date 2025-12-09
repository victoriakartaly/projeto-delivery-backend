import mongoose from 'mongoose';
import User from './user.model.js'; 


const EmployeeSchema = new mongoose.Schema({
    
  
    
    cpf: {
        type: String,
        required: [true, 'O CPF é obrigatório para funcionários'],
        unique: true, 
        trim: true,
    },
    
    sector: {
        type: String,
        required: [true, 'O setor de trabalho é obrigatório'],
    },

    jobTitle: {
        type: String,
        required: [true, 'A função/cargo é obrigatória'],
    },

    restaurant: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant', 
        required: [true, 'O funcionário deve estar associado a um restaurante'],
    },
    
    phone: { type: String, required: false }, 
    photo: { type: String },
    
}, { 
    
    discriminatorKey: 'role', 
    timestamps: true,
   
});



const Employee = User.discriminator('Employee', EmployeeSchema);

export default Employee;