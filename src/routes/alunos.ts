import { Router } from "express"
import prisma from "../lib/prisma"
import bcrypt from "bcrypt"

const router = Router()

// 🔹 CRIAR aluno
router.post("/alunos", async (req, res) => {
    const { nome, email, senha } = req.body

    if (!nome || !email || !senha) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios" })
    }

    try {
        const senhaHash = await bcrypt.hash(senha, 10)

        const aluno = await prisma.aluno.create({
            data: {
                nome,
                email,
                senha: senhaHash
            }
        })

        res.status(201).json(aluno)
    } catch (error) {
        res.status(500).json({ error: "Erro ao criar aluno" })
    }
})


// 🔹 LISTAR alunos
router.get("/alunos", async (req, res) => {
    try {
        const alunos = await prisma.aluno.findMany()
        res.json(alunos)
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar alunos" })
    }
})


// 🔹 BUSCAR por ID
router.get("/alunos/:id", async (req, res) => {
    const id = Number(req.params.id)

    try {
        const aluno = await prisma.aluno.findUnique({
            where: { id }
        })

        if (!aluno) {
            return res.status(404).json({ error: "Aluno não encontrado" })
        }

        res.json(aluno)
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar aluno" })
    }
})


// 🔹 ATUALIZAR aluno
router.put("/alunos/:id", async (req, res) => {
    const id = Number(req.params.id)
    const { nome, email, senha } = req.body

    try {
        const alunoExiste = await prisma.aluno.findUnique({
            where: { id }
        })

        if (!alunoExiste) {
            return res.status(404).json({ error: "Aluno não encontrado" })
        }

        let senhaHash = alunoExiste.senha

        if (senha) {
            senhaHash = await bcrypt.hash(senha, 10)
        }

        const alunoAtualizado = await prisma.aluno.update({
            where: { id },
            data: {
                nome,
                email,
                senha: senhaHash
            }
        })

        res.json(alunoAtualizado)
    } catch (error) {
        res.status(500).json({ error: "Erro ao atualizar aluno" })
    }
})


// 🔹 DELETAR aluno
router.delete("/alunos/:id", async (req, res) => {
    const id = Number(req.params.id)

    try {
        const alunoExiste = await prisma.aluno.findUnique({
            where: { id }
        })

        if (!alunoExiste) {
            return res.status(404).json({ error: "Aluno não encontrado" })
        }

        await prisma.aluno.delete({
            where: { id }
        })

        res.json({ message: "Aluno deletado com sucesso" })
    } catch (error) {
        res.status(500).json({ error: "Erro ao deletar aluno" })
    }
})

export default router