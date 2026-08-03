import { Router } from "express"
import prisma from "../lib/prisma"
 
const router = Router()
 
router.get("/feed", async (req, res) => {
 
   try {
 
      const feed = await prisma.avaliacao.findMany({
 
         include: {
 
            usuario: {
               select: {
                  id: true,
                  nome: true,
                  fotoUrl: true
               }
            },
 
            livro: {
               select: {
                  id: true,
                  titulo: true,
                  capaUrl: true
               }
            }
 
         },
 
         orderBy: {
            createdAt: "desc"
         },
 
         take: 20
      })
 
      return res.json(feed)
 
   } catch (error) {
 
      return res.status(500).json({
         error: "Erro ao buscar feed"
      })
 
   }

 
})
 
export default router