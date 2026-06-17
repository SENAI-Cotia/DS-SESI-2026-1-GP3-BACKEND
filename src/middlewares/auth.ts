import { Request, Response, NextFunction} from "express"
import jwt from "jsonwebtoken"

interface JWTPayload{
    userId: number,
    role: string,
    name: string

}

declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload
        }
    }
}

const JWT_SECRET = process.env.JWT_SECRET ?? "sesisenai"


export function authenticate(req : Request, res : Response, next: NextFunction) {
    const headerQueVeioDoClient = req.headers.authorization;

    if(!headerQueVeioDoClient || !headerQueVeioDoClient.startsWith("Bearer")) {
        return res.status(401).json({error: "Token não fornecido"})
    }

    // o token no header assim: Bearer 232323qesdfsfcdfcvfdffdgdsvd
    const token = headerQueVeioDoClient.split(" ")[1]

    try {
        const tokenDecodificado = jwt.verify(token, JWT_SECRET) as JWTPayload
        req.user = tokenDecodificado
        next()
    } catch (error) {
        res.status(401).json({error: "Token inválido ou expirado!"})
    }
}

export function requireAdmin(req : Request, res : Response, next: NextFunction) {
    if(req.user?.role.toLocaleLowerCase() !== "admin") {
        return res.status(403).json({error: "Apenas admins podem acessar esse recurso"})
    }

    next()
}