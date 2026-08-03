import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.post("/avaliacao", async (req, res) => {
    const { nota, comentario, usuarioId, livroId } = req.body;

    if (
        nota === undefined ||
        !comentario ||
        !usuarioId ||
        !livroId
    ) {
        return res.status(400).json({
            error: "Todos os campos são obrigatórios"
        });
    }

    try {
        const usuarioExiste = await prisma.usuario.findUnique({
            where: { id: usuarioId }
        });

        if (!usuarioExiste) {
            return res.status(404).json({
                error: "Usuário não encontrado"
            });
        }

        const livroExiste = await prisma.livro.findUnique({
            where: { id: livroId }
        });

        if (!livroExiste) {
            return res.status(404).json({
                error: "Livro não encontrado"
            });
        }

        const avaliacao = await prisma.avaliacao.create({
            data: {
                nota,
                comentario,
                usuarioId,
                livroId
            }
        });

        return res.status(201).json(avaliacao);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Erro ao postar avaliação do usuário"
        });
    }
});

// DELETE
router.delete("/avaliacao/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const avaliacaoExiste = await prisma.avaliacao.findUnique({
            where: { id: Number(id) } // Remova Number() se o id for String/UUID
        });

        if (!avaliacaoExiste) {
            return res.status(404).json({
                error: "Avaliação não encontrada"
            });
        }

        await prisma.avaliacao.delete({
            where: { id: Number(id) } // Remova Number() se o id for String/UUID
        });

        return res.status(200).json({
            message: "Avaliação excluída com sucesso"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Erro ao excluir avaliação"
        });
    }
});

// Rota para cadastrar várias avaliações de uma vez
router.post("/avaliacoes/lote", async (req, res) => {
  try {
    const avaliacoes = req.body; // Espera receber a lista [...]

    if (!Array.isArray(avaliacoes) || avaliacoes.length === 0) {
      return res.status(400).json({
        error: "Envie uma lista (array) de avaliações válida."
      });
    }

    const resultado = await prisma.avaliacao.createMany({
      data: avaliacoes,
    });

    return res.status(201).json({
      message: `${resultado.count} avaliações cadastradas com sucesso!`,
      quantidade: resultado.count
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Erro ao cadastrar avaliações em lote"
    });
  }
});

export default router;