import { Router } from "express";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma";
import multer from "multer"
import { parse } from "csv-parse/sync"
import jwt, { JwtPayload } from "jsonwebtoken"
import { authenticate, requireAdmin } from "../middlewares/auth"

const router = Router();
const upload = multer({ storage: multer.memoryStorage() })

const JWT_SECRET = process.env.JWT_SECRET ?? "sesisenai"

router.post("/usuarios", async (req, res) => {
  try {

    const { nome, email, cpf, curso } = req.body;

    if (!nome || !email || !cpf || !curso) {
      return res.status(400).json({
        error: "Preencha nome, email e cpf",
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

    const senhaPadrao = "Senai2026"

    const senhaHash = await bcrypt.hash(senhaPadrao, 10)

    const aluno = await prisma.usuario.create({
      data: {
        nome,
        email,
        cpf,
        curso,
        role: "USER",
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


router.post("/login", async (req, res) => {
  try {

    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        error: "Preencha email e senha",
      });
    }

    const user = await prisma.usuario.findFirst({ where: { email } });

    if (!user) {
      return res.status(404).json({
        error: "Usuário não encontrado",
      });
    }

    const senhaCorreta = await bcrypt.compare(senha, user.senha);

    if (senhaCorreta) {
      const token = jwt.sign(
        {
          userId: user.id,
          nome: user.nome,
          role: user.role,
          email: user.email
        },
        JWT_SECRET,
        { expiresIn: "8h" }
      )

      return res.status(200).json({ token })
    }

    return res.status(400).json({
      message: "E-mail e senha incorretos.",
     
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Erro no login",
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
        curso: true
      },
      where: {
        role: "USER"
      }
    });

    return res.status(200).json(alunos);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Erro ao buscar alunos",
    });
  }
});

interface Aluno {
  nome: string,
  curso: string,
  cpf: string,
  email: string,
}

router.post("/alunos/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Arquivo inválido!" })
  }

  try {
    const alunos: Aluno[] = parse(req.file.buffer, { columns: true, trim: true, skip_empty_lines: true, delimiter: ';', bom: true })

    const alunosValidos = alunos.filter(aluno => aluno.nome && aluno.email && aluno.cpf);


    if (alunosValidos.length === 0) {
      return res.status(400).json({ error: "Nenhum aluno válido encontrado." });
    }

    const cpfsCadastrados = alunosValidos.map(aluno => aluno.cpf);

    const alunosComSenhaHash = await Promise.all(
      alunosValidos.map(async (aluno) => ({
        ...aluno,
        senha: await bcrypt.hash("Senai2026", 10)
      }))
    );

    await prisma.usuario.createMany({
      data: alunosComSenhaHash,
    });

    const usuariosCadastrados = await prisma.usuario.findMany({
      where: {
        cpf: {
          in: cpfsCadastrados
        }
      }
    });



    return res.json(usuariosCadastrados);

  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: "Ocorreu um erro ao processar o csv" })
  }
})



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
        curso: true
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

router.put("/usuarios/:id", async (req, res) => {
  try {

    const id = Number(req.params.id);

    const { nome, email, cpf } = req.body;

    const usuarioExiste = await prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuarioExiste) {
      return res.status(404).json({
        error: "Aluno não encontrado",
      });
    }

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id },

      data: {
        nome,
        email,
        cpf,

      },
    });

    return res.status(200).json(usuarioAtualizado);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Erro ao atualizar o usuario",
    });
  }
});



router.put("/alunos/:id", async (req, res) => {
  try {

    const id = Number(req.params.id);

    const { nome, email, cpf, curso } = req.body;

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
        curso
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


router.post("/bibliotecaria", async (req, res) => {
  try {

    const { nome, email, cpf, senha } = req.body;

    if (!nome || !email || !cpf || !senha) {
      return res.status(400).json({
        error: "Preencha nome, email, cpf e senha",
      });
    }

    const userExistente = await prisma.usuario.findFirst({
      where: {
        OR: [{ email }, { cpf }],
      },
    });

    if (userExistente) {
      return res.status(400).json({
        error: "Email ou CPF já cadastrado",
      });
    }


    const senhaHash = await bcrypt.hash(senha, 10)

    const user = await prisma.usuario.create({
      data: {
        nome,
        email,
        cpf,
        curso: "bibliotecaria",
        role: "ADMIN",
        senha: senhaHash,
      },
    });

    const { senha: _, ...userSemSenha } = user;

    return res.status(201).json(userSemSenha);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Erro ao cadastrar",
    });
  }
});

export default router;           