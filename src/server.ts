import express from "express";
import usuariorouter from "./routes/usuario.routes";
import livrorouter from "./routes/livrosEanotacoes"
import alunosRoutes from "./routes/alunos"


const app = express();

app.use(express.json()); // permite receber JSON
app.use(usuariorouter);
app.use(livrorouter)  // usa as rotas
app.use(alunosRoutes)  // usa as rotas

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});