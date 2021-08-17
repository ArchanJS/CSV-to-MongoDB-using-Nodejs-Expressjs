const express=require('express');
const router=express.Router();
const auth=require('../middlewares/auth');
const Student=require('../models/Student');

router.get('/',auth,async(req,res)=>{
    try {
        res.status(200).send(req.teacher);
    } catch (error) {
        res.status(500).json({error:"Something went wrong!"});
    }
})

router.get('/students',auth,async(req,res)=>{
    try {
        const students=await Student.find();
        res.status(200).send(students);
    } catch (error) {
        res.status(500).json({error:"Something went wrong!"});
    }
})

router.get('/studentbyid',auth,async(req,res)=>{
    try {
        const students=await Student.find({userID:req.body.userID});
        res.status(200).send(students);
    } catch (error) {
        res.status(500).json({error:"Something went wrong!"});
    }
})

router.patch('/updatemarks',auth,async(req,res)=>{
    try {
        const {userID,marks}=req.body;
        if(userID.trim()=="" || marks.trim()=="") res.status(400).json({error:"Don't leave any field empty!"});
        await Student.updateOne({userID},{
            $set:{
                marks
            }
        });
        res.status(200).json({message:"Student updated successfully!"});
    } catch (error) {
        res.status(500).json({error:"Something went wrong!"});
    }
})

router.delete('/deletestudent',auth,async(req,res)=>{
    try {
        const {userID}=req.body;
        if(userID.trim()=="") res.status(400).json({error:"Don't leave any field empty!"});
        await Student.deleteOne({userID});
        res.status(200).json({messafe:"Student deleted successfully!"});
    } catch (error) {
        res.status(500).json({error:"Something went wrong!"});
    }
})

module.exports=router;