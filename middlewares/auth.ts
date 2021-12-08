import {NextFunction, Request, Response} from "express";
import Config from "../config";

export default function auth(req: Request, res: Response, next: NextFunction): void {
	const token = req.query.token;
	if(typeof token === "string" && token === Config.ADMIN_TOKEN) next();
	else res.status(401).json({
		ok: false,
		error: "Access denied!"
	});
}