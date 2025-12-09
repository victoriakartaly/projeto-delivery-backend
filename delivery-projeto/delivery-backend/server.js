import app from "./app.js";
import { connectDB } from "./src/config/database.js"; 

const PORT = process.env.PORT || 3000;


connectDB();


app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});