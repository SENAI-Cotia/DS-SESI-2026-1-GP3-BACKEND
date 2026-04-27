import { Router } from "express";

import bcrypt from "bcrypt";
import  prisma from "../lib/prisma";

const router = Router();



router.post("/usuarios", async (req, res) => {
  try {
    const { email, cpf, senha } = req.body;

    //  validação
    if (!email || !cpf || !senha) {
      return res.status(400).json({
        error: "Preencha email, cpf e senha",
      });
    }

    //  senha mínima
    if (senha.length <= 8) {
      return res.status(400).json({
        error: "Senha deve ter no mínimo 8 caracteres",
      });
    }

    //  verifica duplicidade
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

    //  criptografar senha
    const senhaHash = await bcrypt.hash(senha, 10);

    //  salvar no banco
    const usuario = await prisma.usuario.create({
      data: {
        email,
        cpf,
        senha: senhaHash,
      },
    });

    //  remover senha da resposta
    const { senha: _, ...usuarioSemSenha } = usuario;

    return res.status(201).json(usuarioSemSenha);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Erro no servidor",
    });
  }
});

router.post("/login", async (req, res) => {
  const { email, senha } = req.body

  if (!email || !senha) {
    return res.status(400).json({
      error: "Preencha email e senha",
    });
  }

  const user = await prisma.usuario.findFirst({ where: { email } })

  if (!user) {
    return res.status(404).json({ error: "usuário não encontrado" })
  }

  if (!(await bcrypt.compare(senha, user.senha))) {// validação da senha
    return res.status(401).json({ error: "credenciais inválidas" })
  }

  return res.status(200).json("Login realizado com sucesso!")

})


export default router;