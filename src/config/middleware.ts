import express = require("express");
import logger = require("%config/logger");
import config = require("%config/config");
import jwt = require("jsonwebtoken");
import model = require("%models");
import crypt = require("crypto");

export interface JwtPayload {
    username: string;
    id: number,
}

export const createJwt = (payload: JwtPayload) => jwt.sign(payload, config.JwtKey, { expiresIn: "30d", issuer: config.jwtIssuer });
export const hashSHA512 = (data: string) => crypt.createHash("sha512").update(data).digest("base64");

export const Authentication = (AllowAuthenticationHeader: boolean = true) => (
    async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        try {
            const token = req.headers.authorization;
            
            if (!token && !AllowAuthenticationHeader) return next();
            else if (token && !AllowAuthenticationHeader) return res.status(403).json({ message: "forbidden" });
            else if (!token) return res.status(401).json({ message: "unauthorized" });

            let payload;

            try {
                payload = jwt.verify(token, config.JwtKey, { complete: true, ignoreExpiration: false, ignoreNotBefore: false, issuer: config.jwtIssuer });
            } catch (error) {
                logger.error(error);
                return res.status(401).json({ message: "unauthorized" });
            }

            if (typeof payload.payload === "string") return res.status(400).json({ message: "bad request" });

            const pl = <JwtPayload>payload.payload;
            if (!pl.id || !pl.username || pl.id === null || pl.username === null) return res.status(401).json({ message: "invalid token" });
            const user = await model.User.findOne({ where: { username: String(pl.username) }, attributes: [ "username" ] });

            if (!user) return res.status(401).json({ message: `user "${pl.username}" not exists` }); 


            res.locals.payload = pl;
            return next();
        } catch (error) {
            logger.error(error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
);