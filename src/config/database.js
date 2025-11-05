
import mongoose from "mongoose";
import "dotenv/config"; // Importa e configura o dotenv em uma linha só.

// Usando 'export const' para declarar e exportar a função de uma vez
export const connectDB = async () => {
    try {
        // Acessa a variável de ambiente
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Conectado ao MongoDB com sucesso!");
    } catch (err) {
        console.error("❌ Erro ao conectar no MongoDB:", err.message);
        // Em caso de falha crítica, encerra o processo
        process.exit(1);
    } 
};