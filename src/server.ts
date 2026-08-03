import express from "express";
import usuariorouter from "./routes/usuario.routes";
import livrorouter from "./routes/livros.routes";
import avaliacao from "./routes/avaliacoes.routes";
import anotacoes from "./routes/anotacoes.routes";
import feed from "./routes/feed.routes";
import status from "./routes/status.routes";

import cors from "cors"


const app = express();

app.use(cors())
app.use(express.json()); // permite receber JSON
app.use(usuariorouter);
app.use(livrorouter)  // usa as rotas
app.use(avaliacao)  // usa as rotas
app.use(anotacoes)
app.use(feed)  // usa as rotas
app.use(status)

const PORT = 3000;
 
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
});