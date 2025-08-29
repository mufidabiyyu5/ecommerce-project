import "dotenv/config";
import app from "./app.js";
import { connectDatabase } from "./config/connection.js";

app.get("/", (req, res) => {
  res.send("Server is active");
});

app.listen(process.env.PORT, async () => {
    try {
        await connectDatabase()
        console.log(`Server is running on port ${process.env.PORT}`);
    } catch (error) {
        console.error("Error starting the server:", error);
    }
});