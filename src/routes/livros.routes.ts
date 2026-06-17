import { Router } from "express";
import prisma from "../lib/prisma";
import multer from "multer"
import { parse } from "csv-parse/sync"
import { Livro } from "@prisma/client";
const upload = multer({ storage: multer.memoryStorage() })


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
                capaUrl
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

/* post csv */

router.post("/livros/upload", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Arquivo inválido!" })
    }

    try {
        const livros: Livro[] = parse(req.file.buffer, { columns: true, trim: true, skip_empty_lines: true, delimiter: ';', bom: true })

        const livrosFiltrados = livros.filter(livro =>
            livro.titulo && livro.autor && livro.genero && livro.descricao && livro.ano && livro.capaUrl
        );

        if (livrosFiltrados.length === 0) {
            return res.status(400).json({ error: "Nenhum livro válido encontrado." });
        }

        const livrosValidos = livrosFiltrados.map(livro => ({
            ...livro,
            ano: parseInt(livro.ano as any, 10) // Converte a string para Int
        }));

        const tituloCadastrados = livrosValidos.map(livro => livro.titulo);

        await prisma.livro.createMany({
            data: livrosValidos, // Agora o 'ano' aqui já é um número
        });
        const livrosCadastrados = await prisma.livro.findMany({
            where: {
                titulo: {
                    in: tituloCadastrados
                }
            }
        });

        return res.json(livrosCadastrados);

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Ocorreu um erro ao processar o csv" })
    }
})

router.get("/livros/:id", async (req, res) => {

    const id = Number(req.params.id)

    try {

        const livro = await prisma.livro.findUnique({

            where: { id }

        })

        if (!livro) {

            return res.status(404).json({ error: "Livro não encontrado" })

        }

        res.json(livro)

    } catch (error) {

        res.status(500).json({ error: "Erro ao buscar livro" })

    }

})


router.get("/livros", async (req, res) => {
    const { titulo } = req.query

    try {
        const livros = await prisma.livro.findMany({
            where: titulo
                ? {
                    titulo: {
                        contains: String(titulo),
                        mode: "insensitive"
                    }
                }
                : {}
        })

        res.json(livros)
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar livros" })
    }
})

router.delete("/livros/:id", async (req, res) => {
    const id = Number(req.params.id)

    try {
        await prisma.livro.delete({
            where: { id }
        })

        return res.status(204).send()
    } catch (error) {
        return res.status(404).json({ error: "Livro deletado com sucesso" })
    }

})

router.put("/livros/:id", async (req, res) => {
    const id = Number(req.params.id)
    const { titulo, autor, genero, ano, descricao, capaUrl } = req.body

    try {
        const livroAtualizado = await prisma.livro.update({
            where: { id },
            data: {
                titulo,
                autor,
                genero,
                ano,
                descricao,
                capaUrl,

            }
        })

        return res.json(livroAtualizado)
    } catch (error) {
        return res.status(404).json({ error: "Livro não encontrado" })
    }

})


export default router
