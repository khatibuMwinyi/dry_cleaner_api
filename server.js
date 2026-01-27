import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { ensureDemoModerator } from "./src/utils/seedModerator.js";
import bcrypt from "bcryptjs";

const hashedPassword = await bcrypt.hash("moderator1234", 10);

dotenv.config();
await connectDB();
await ensureDemoModerator();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} password: ${hashedPassword}`);
});
