import app from "./app.js";
import { connectDB } from "./src/config/database.js"; 

const PORT = process.env.PORT || 3000;

// Inicializa a conexão com o banco de dados
connectDB();

// Inicia o servidor Express
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
