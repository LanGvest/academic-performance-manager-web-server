import {Router} from "express";
import IndexController from "../controllers/index";

const IndexRouter = Router();

IndexRouter.get("/getStudents", IndexController.getStudents);
IndexRouter.get("/getAvg", IndexController.getAvg);
IndexRouter.get("/updateStudent", IndexController.updateStudent);
IndexRouter.get("/addStudent", IndexController.addStudent);
IndexRouter.get("/deleteStudent", IndexController.deleteStudent);

export default IndexRouter;