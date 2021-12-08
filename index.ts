/* eslint-disable @typescript-eslint/no-var-requires */
require("dotenv").config();
import express, {Express} from "express";
import notFound from "./middlewares/not-found";
import Config from "./config";
import IndexRouter from "./routes";
import auth from "./middlewares/auth";

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({
	extended: false
}));

app.use(auth);
app.use("/", IndexRouter);
app.use(notFound);

(async () => {
	app.listen(Config.PORT, () => {
		console.log(Config.ADMIN_TOKEN);
		console.log(`server has been started on port ${Config.PORT}`);
	});
})();