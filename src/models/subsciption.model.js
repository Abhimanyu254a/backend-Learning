import mongoose ,{Schema} from "mongoose";

const subsciptionSchema = new Schema({
    subscriber:{
        type:Schema.type.ObjectId,// the person who is the one Subscribing
        ref:"User"
    },
    channel:{
        type:Schema.type.ObjectId,// the person whom "subscriber" is subscribing
        ref:"User"
    }

},{timestamps:true})


export const Subsciption = mongoose.model("Subsciption", subsciptionSchema)