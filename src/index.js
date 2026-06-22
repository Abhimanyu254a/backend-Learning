//require('dotenv').config({path: './env'});
import dotenv from "dotenv";
import ConnectDB from "./db/DB.js";

dotenv.config({
    path:'./env'
})


ConnectDB();



/* ---------- This is the first approach --------------
import express from "express";
const app = express();

( async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_Name}`);
        app.on("error",() =>{
            console.log("ERROR :", error);
        })

        app.listen(process.env.PORT,() =>{
            console.log(`app is listening on Port ${process.env.PORT}`)
        })
    }
    catch(error)
    {
        console.log("Error :", error);
        throw error;
    }
})()
    */