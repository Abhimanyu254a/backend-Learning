//require('dotenv').config({path: './env'});
import dotenv from "dotenv";
import ConnectDB from "./db/DB.js";

dotenv.config({
    path:'./env'
})


ConnectDB()
.then(() =>{
    app.listen(process.env.PORT || 8000, () =>{
        console.log(`Server is Running at the Port : ${process.env.PORT} `)
    })
    
})
.catch((e) =>{
    console.log("MONGODB connection failed !!!", e);
});



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