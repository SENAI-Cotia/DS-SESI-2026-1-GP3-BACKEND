import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const router = Router();
const prisma = new PrismaClient();

router.post("/usuarios", async (req, res) => {
  try {
    const { email, cpf, senha } = req.body;

    // ✅ validação
    if (!email || !cpf || !senha) {
      return res.status(400).json({
        error: "Preencha email, cpf e senha",
      });
    }

    // ✅ senha mínima
    if (senha.length < 8) {
      return res.status(400).json({
        error: "Senha deve ter no mínimo 8 caracteres",
      });
    }

    // ✅ verifica duplicidade
    const usuarioExistente = await prisma.usuario.findFirst({
      where: {
        OR: [{ email }, { cpf }],
      },
    });

    if (usuarioExistente) {
      return res.status(400).json({
        error: "Email ou CPF já cadastrado",
      });
    }

    // 🔐 criptografar senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // 💾 salvar no banco
    const usuario = await prisma.usuario.create({
      data: {
        email,
        cpf,
        senha: senhaHash,
      },
    });

    // 🚫 remover senha da resposta
    const { senha: _, ...usuarioSemSenha } = usuario;

    return res.status(201).json(usuarioSemSenha);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Erro no servidor",
    });
  }
});

export default router;