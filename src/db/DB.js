import mongoose from 'mongoose';
import { DB_Name } from '../constants.js';

const ConnectDB = async () =>{
    try{
        const connectionDB = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_Name}`);
        console.log(`\n MongoDB connected !! DB Host: ${connectionDB.connection.host}`);
    }
    catch(e)
    {
        console.log("MONGODB CONNECTION ERROR!!! :", e);
        process.exit(1);
    }
}

export default ConnectDB;