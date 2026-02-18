const mongoose=require ("mongoose");

//function that connects to MONGO
const connectDB=async()=>{
    try{
        //connect to local MONGODB
        await mongoose.connect("mongodb://127.0.0.1:27017/educonnect");
        console.log("Mongo Connected");

    }catch(error)
    {
        console.error("MongoDb failed to connect");
        console.error(error.message);
        process.exit(1);
    }
};
module.exports=connectDB;