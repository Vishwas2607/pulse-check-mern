import "dotenv/config";
import connectDB from "./api/src/config/db.connection.js";
import app from "./app.js";

const port= process.env.PORT;

connectDB()
.then(()=> {
    const server = app.listen(port,()=> {
        console.log(`✅ Server is running on http://localhost:${port}`)
    });

    server.on("error", (err)=> {
        console.log("Server failed to start: ", err);
        process.exit(1);
    });
})
.catch((err)=> {
    console.error("❌ DB Connection failed:", err);
    process.exit(1);
})