import { Router } from "express";


import prisma from "../lib/prisma";

const router = Router();


router.post("/livros", async (req, res) => {
    const { titulo, autor, genero, ano, descricao, capaUrl } = req.body

    if (!titulo || !autor || !genero || !ano || !descricao || !capaUrl) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios" })
    }

    try {
        const livro = await prisma.livro.create({
            data: {
                titulo,
                autor,
                genero,
                ano: Number(ano),
                descricao,
                capaUrl,
            }
        })

        res.status(201).json(livro)


    } catch (error) {
        res.status(500).json({ error: "Erro ao criar livro" })
    }
})

router.post("/livros/:id/anotacoes", async (req, res) => {

    const { conteudo, usuarioId } = req.body

    const livroId = Number(req.params.id)
 
    if (!conteudo || !usuarioId) {

        return res.status(400).json({

            error: "Conteúdo e usuário são obrigatórios"

        })

    }
 
    try {

        // verifica livro

        const livro = await prisma.livro.findUnique({

            where: { id: livroId }

        })
 
        if (!livro) {

            return res.status(404).json({

                error: "Livro não encontrado"

            })

        }
 
        // cria anotação

        const anotacao = await prisma.anotacao.create({

            data: {

                conteudo,

                usuarioId,

                livroId

            }

        })
 
        res.status(201).json(anotacao)
 
    } catch (error) {

        console.error(error)

        res.status(500).json({

            error: "Erro ao criar anotação"

        })

    }

})
 

export default router