const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
const csvtojson = require('csvtojson');
const path=require('path');
const Student = require('../models/Student');

router.get('/', (req, res) => {
    res.status(200).send("Welcome to home!");
})

router.post('/csvinput', async (req, res) => {
    try {
        const inputCSV = req.files.input;
        const dr=path.join(__dirname,'..','input.csv');
        console.log(dr);
        await inputCSV.mv(dr);
        const data = await csvtojson().fromFile('input.csv');
        console.log(data);
        for (let i = 0; i < data.length; i++) {
            const characters = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            let userID = "s";
            const charactersLength = characters.length;

            while (true) {
                for (let i = 0; i < 5; i++) {
                    userID += characters.charAt(Math.floor(Math.random() * charactersLength));
                }

                let checkUser = await Student.findOne({ userID });
                if (checkUser != null) {
                    userID = "s";
                    continue;
                } else {
                    break;
                }
            }
            const student = new Student({
                name: data[i].name,
                userID: userID,
                stream: data[i].stream,
                roll: data[i].roll,
                marks: data[i].marks
            })
            await student.save();
        }
        res.status(200).json({ message: "Student(s) created!" });
    } catch (error) {
        res.status(500).json({ error: "Something went wrong!" });
    }
})

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (name.trim() != "" || email.trim() != "" || password.trim() != "") {
            const characters = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            let userID = "t";
            const charactersLength = characters.length;

            while (true) {
                for (var i = 0; i < 5; i++) {
                    userID += characters.charAt(Math.floor(Math.random() * charactersLength));
                }

                let checkUser = await Teacher.findOne({ userID });
                if (checkUser != null) {
                    userID = "t";
                    continue;
                } else {
                    break;
                }
            }
            console.log("hi1");
            const teacher = new Teacher({ name, userID, email, password });
            console.log("hi2");
            const token = await teacher.generateTempToken();
            console.log("hi3");
            sendEmail({
                user: teacher.email,
                subject: "Verify email",
                html: `<h1>Registration successful</h1><br><h4>Welcome to our website ${teacher.name}. Here is your token : ${token}</h4>`
            })
            console.log("hi4");
            await teacher.save();
            res.status(201).json({ message: "User created!" });
        }
        else {
            res.status(400).json({ error: "Please enter all the details!" });
        }
    } catch (error) {
        res.status(500).json({ error: "Something went wrong!" })
    }
})

router.post('/verify', async (req, res) => {
    try {
        const { token } = req.body;
        console.log("hi1");
        const verifiedToken = await jwt.verify(token, process.env.SECRET_KEY);
        const teacher = await Teacher.findOne({ _id: verifiedToken._id });
        if (!teacher) {
            res.status(401).json({ error: "User doesn't exist!" });
        }
        else {
            let userID = teacher.userID;
            let verified = true;
            await Teacher.updateOne({ userID }, {
                $set: {
                    verified
                }
            })
            res.status(201).json({ message: "User verified!" });
        }
    } catch (error) {
        res.status(500).json({ error: "Something went wrong!" })
    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("hi1");
        if (!email.trim() || !password.trim()) {
            res.status(400).json({ error: "Please enter all the details!" });
        }
        else {
            const teacher = await Teacher.findOne({ email });
            console.log("hi2");
            if (!teacher) {
                res.status(400).json({ error: "User not found!" });
            }
            else if (teacher.verified == false) {
                res.status(401).json({ error: "User is not verified!" });
            }
            else {
                const checkPass = await teacher.comparePasswords(password);
                console.log("hi3");
                if (!checkPass) {
                    res.status(400).json({ error: "Invalid credentials!1" });
                }
                else {
                    console.log("hi4");
                    const token = await teacher.generateToken();
                    res.status(201).send(token);
                    console.log(teacher);
                }
            }
        }

    } catch (error) {
        res.status(401).json({ error: "Invalid credentials!2" });
    }
})

module.exports = router;