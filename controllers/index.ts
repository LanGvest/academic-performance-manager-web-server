import {Request, Response} from "express";

const IndexController = {
	async getStudents(req: Request, res: Response): Promise<void> {
		try {
			res.status(200).json({
				ok: true
			});
		} catch(e) {
			res.status(500).json({
				ok: false,
				error: e as Error ["message"]
			});
		}
	},
	async getAvg(req: Request, res: Response): Promise<void> {
		try {
			res.status(200).json({
				ok: true
			});
		} catch(e) {
			res.status(500).json({
				ok: false,
				error: e as Error ["message"]
			});
		}
	},
	async updateStudent(req: Request, res: Response): Promise<void> {
		try {
			res.status(200).json({
				ok: true
			});
		} catch(e) {
			res.status(500).json({
				ok: false,
				error: e as Error ["message"]
			});
		}
	},
	async addStudent(req: Request, res: Response): Promise<void> {
		try {
			res.status(200).json({
				ok: true
			});
		} catch(e) {
			res.status(500).json({
				ok: false,
				error: e as Error ["message"]
			});
		}
	},
	async deleteStudent(req: Request, res: Response): Promise<void> {
		try {
			res.status(200).json({
				ok: true
			});
		} catch(e) {
			res.status(500).json({
				ok: false,
				error: e as Error ["message"]
			});
		}
	}
};
export default IndexController;