import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({
    path: './.env'
})

async function dbConnect() {

    try {

        mongoose.connection.on("connected", () => {
            console.log("database connected successfully", mongoose.connection.host);
        })

        mongoose.connection.on("disconnect", () => {
            console.log("disconnected to database ", mongoose.connection.host);
        })

        mongoose.connection.on("error", () => {
            console.log("database connection error", mongoose.connection.host);
        })

        await mongoose.connect(process.env.MONGODB_URI)
    } catch (error) {
        console.log(`mongodb connection error`, error);
        process.exit(1);
    }
}

export default dbConnect;
