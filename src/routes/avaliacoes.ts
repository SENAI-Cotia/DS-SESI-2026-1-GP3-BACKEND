import { Router } from "express";


import prisma from "../lib/prisma";

const router = Router();



router.post("/avaliacao", async (req, res) => {
    const { nota, comentario, usuarioId, livroId } = req.body

   
    if (
        nota === undefined ||
        !comentario ||
        !usuarioId ||
        !livroId
    ) {
        return res.status(400).json({
            error: "Todos os campos são obrigatórios"
        })
    }

    try {

        
        const usuarioExiste = await prisma.usuario.findUnique({
            where: { id: usuarioId }
        })

        if (!usuarioExiste) {
            return res.status(404).json({
                error: "Usuário não encontrado"
            })
        }

       
        const livroExiste = await prisma.livro.findUnique({
            where: { id: livroId }
        })

        if (!livroExiste) {
            return res.status(404).json({
                error: "Livro não encontrado"
            })
        }

        const avaliacao = await prisma.avaliacao.create({
            data: {
                nota,
                comentario,
                usuarioId,
                livroId
            }
        })

        return res.status(201).json(avaliacao)

    } catch (error) {

        console.error(error)

        return res.status(500).json({
            error: "Erro ao postar avaliação do usuário"
        })
    }
})





export default router;