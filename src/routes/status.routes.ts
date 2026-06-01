import { Router } from "express";

import prisma from "../lib/prisma";
 
const router = Router();
 
router.get("/status", async (req, res) => {

  try {

    const [livrosCadastrados, alunosAtivos, totalAvaliacao] = await Promise.all([

      prisma.livro.count(),

      prisma.usuario.count(),

      prisma.avaliacao.count(),

    ]);
 
    return res.status(200).json({

      livrosCadastrados,

      alunosAtivos,

      totalAvaliacao,

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({ error: "Erro ao buscar status do sistema" });

  }

});
 
export default router;
 