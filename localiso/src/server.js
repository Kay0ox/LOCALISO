import "dotenv/config";
import app from "./app.js";
import prisma from "./config/prisma.js";

if (!process.env.JWT_SECRET || !process.env.DATABASE_URL) {
  console.error("Defina JWT_SECRET e DATABASE_URL no arquivo .env");
  process.exit(1);
}

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, () => {
  console.log(`API de locação rodando em http://localhost:${PORT}`);
});

async function encerrar() {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}
process.on("SIGINT", encerrar);
process.on("SIGTERM", encerrar);