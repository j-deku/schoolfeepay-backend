import mongoose from "mongoose";
import logger from "../middlewares/logger";
import dotenv from "dotenv"
dotenv.config();

export const connectDB = async() =>{
    try{
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            logger.error("MONGO_URI is not defined");
            process.exit(1);
        }
        await mongoose.connect(mongoUri);
        console.log("Db connected successfully");
    }catch(error){
        if (error instanceof Error) {
            logger.error("Db connection failed", error);
            console.error("DB Error:", error);
        }
            process.exit(1);
    }
};
