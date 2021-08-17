const mongoose=require('mongoose');

const studentSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    userID:{
        type:String,
        required:true,
        unique:true
    },
    stream:{
        type:String,
        requied:true
    },
    roll:{
        type:String,
        required:true
    },
    marks:{
        type:String,
        required:true
    }
})

const Student=new mongoose.model("students",studentSchema);

module.exports=Student;