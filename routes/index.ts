import {Router} from "express";
import IndexController from "../controllers/index";

const IndexRouter = Router();

IndexRouter.get("/students", IndexController.getStudents);

export default IndexRouter;