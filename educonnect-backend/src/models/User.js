const mongoose =require ("mongoose");
const userSchema=new mongoose.Schema(
    {
        uid:{type: String,required: true,unique: true,
        },
        name:{
            type:String,required:true,
        },
        email:{
            type:String,required:true,unique:true,
        },
        sapId:{
            type:Number,required:true,unique:true,
        },
        branch:{
            type:String,required:true,
        },
        year:{
            type:Number,required:true,
        },
        role:{
            type:String,enum:["student","admin"], default:"student",
        },
        status:{
            type:String,enum:["active","inactive"],default:"active",
        },
      
    },
        
    {timestamps:true,}
);
module.exports=mongoose.model("User",userSchema);