import express from "express";
import usuariorouter from "./routes/usuario.routes";
import livrorouter from "./routes/livrosEanotacoes"


const app = express();

app.use(express.json()); // permite receber JSON
app.use(usuariorouter);
app.use(livrorouter)  // usa as rotas

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});