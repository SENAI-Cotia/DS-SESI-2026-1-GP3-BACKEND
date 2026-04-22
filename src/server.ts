import express from "express";
import usuariorouter from "./routes/usuario.routes";


const app = express();

app.use(express.json()); // permite receber JSON
app.use(usuariorouter);  // usa as rotas

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});