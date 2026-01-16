import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import customerRoutes from "./routes/customer.routes.js";
import serviceRoutes from "./routes/service.routes.js";
import clothingTypeRoutes from "./routes/clothingType.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

app.use(
  "/invoices/files",
  express.static(path.join(ROOT_DIR, "tmp", "invoices"))
);
app.use("/api/customers", customerRoutes);
app.use("/api/clothing-types", clothingTypeRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/analytics", analyticsRoutes);

export default app;
