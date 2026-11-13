import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { rotaNaoEncontrada, tratarErros } from "./middlewares/errorHandler.js";

const app = express();

app.use(cors({ origin: "http://localhost:5173" }))
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use(routes);

app.use(rotaNaoEncontrada);
app.use(tratarErros);

export default app;