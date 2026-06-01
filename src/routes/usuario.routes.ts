import { Router } from "express";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma";

const router = Router();



router.post("/usuarios", async (req, res) => {
  try {
    const { email, cpf, senha, nome, fotoUrl } = req.body;

    if (!email || !cpf || !senha) {
      return res.status(400).json({
        error: "Preencha email, cpf e senha",
      });
    }

    if (senha.length < 8) {
      return res.status(400).json({
        error: "Senha deve ter no mínimo 8 caracteres",
      });
    }

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

    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuario.create({
       data: {
        nome,
        fotoUrl,
        email,
        cpf,
        senha: senhaHash,
      },
    });

    const { senha: _, ...usuarioSemSenha } = usuario;

    return res.status(201).json(usuarioSemSenha);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Erro no servidor",
    });
  }
});

router.get("/usuarios", async (req, res) => {
  try {

    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        fotoUrl: true
      },
    });

    return res.status(200).json(usuarios);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Erro ao buscar usuarios",
    });
  }
});



router.post("/login", async (req, res) => {
  try {

    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        error: "Preencha email e senha",
      });
    }

    const user = await prisma.usuario.findFirst({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        error: "Usuário não encontrado",
      });
    }

    const senhaCorreta = await bcrypt.compare(
      senha,
      user.senha
    );

    if (!senhaCorreta) {
      return res.status(401).json({
        error: "Credenciais inválidas",
      });
    }

    return res.status(200).json({
      message: "Login realizado com sucesso!",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Erro no login",
    });
  }
});

router.get("/login", async (req, res) => {
  try {

    const logados = await prisma.usuario.findMany({
      select: {
        id: true,
        senha: true,
        email: true,
      
      },
    });

    return res.status(200).json(logados);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Erro ao buscar login",
    });
  }
});



router.post("/alunos", async (req, res) => {
  try {

    const { nome, email, cpf, senha } = req.body;

    if (!nome || !email || !cpf || !senha) {
      return res.status(400).json({
        error: "Preencha nome, email, cpf e senha",
      });
    }

    if (senha.length < 8) {
      return res.status(400).json({
        error: "Senha deve ter no mínimo 8 caracteres",
      });
    }

    const alunoExistente = await prisma.usuario.findFirst({
      where: {
        OR: [{ email }, { cpf }],
      },
    });

    if (alunoExistente) {
      return res.status(400).json({
        error: "Email ou CPF já cadastrado",
      });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const aluno = await prisma.usuario.create({
      data: {
        nome,
        email,
        cpf,
        senha: senhaHash,
      },
    });

    const { senha: _, ...alunoSemSenha } = aluno;

    return res.status(201).json(alunoSemSenha);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Erro ao criar aluno",
    });
  }
});



router.get("/alunos", async (req, res) => {
  try {

    const alunos = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
      },
    });

    return res.status(200).json(alunos);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Erro ao buscar alunos",
    });
  }
});



router.get("/alunos/:id", async (req, res) => {
  try {

    const id = Number(req.params.id);

    const aluno = await prisma.usuario.findUnique({
      where: { id },

      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
      },
    });

    if (!aluno) {
      return res.status(404).json({
        error: "Aluno não encontrado",
      });
    }

    return res.status(200).json(aluno);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Erro ao buscar aluno",
    });
  }
});



router.put("/alunos/:id", async (req, res) => {
  try {

    const id = Number(req.params.id);

    const { nome, email, cpf } = req.body;

    const alunoExiste = await prisma.usuario.findUnique({
      where: { id },
    });

    if (!alunoExiste) {
      return res.status(404).json({
        error: "Aluno não encontrado",
      });
    }

    const alunoAtualizado = await prisma.usuario.update({
      where: { id },

      data: {
        nome,
        email,
        cpf,
      },
    });

    return res.status(200).json(alunoAtualizado);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Erro ao atualizar aluno",
    });
  }
});



router.delete("/alunos/:id", async (req, res) => {
  try {

    const id = Number(req.params.id);

    const alunoExiste = await prisma.usuario.findUnique({
      where: { id },
    });

    if (!alunoExiste) {
      return res.status(404).json({
        error: "Aluno não encontrado",
      });
    }

    await prisma.usuario.delete({
      where: { id },
    });

    return res.status(200).json({
      message: "Aluno deletado com sucesso",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Erro ao deletar aluno",
    });
  }
});

export default router;           