import express from "express"
import cors from "cors"
import mongoose from "mongoose"

const app = express()
app.use(express.json())
app.use(express.urlencoded())
app.use(cors())

mongoose.connect("mongodb://localhost:27017/myLoginRegisterDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, () => {
    console.log("DB connected")
})

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
})

const User = new mongoose.model("User", userSchema)


const todoSchema=new mongoose.Schema({
    status:{
        type:String
    },
    timetaken:{
        type:Number
    }
})

const Todo=new mongoose.model("Todo",todoSchema)

//Routes
app.post("/login", (req, res)=> {
    const { email, password} = req.body
    User.findOne({ email: email}, (err, user) => {
        if(user){
            if(password === user.password ) {
                res.send({message: "Login Successfull", user: user})
            } else {
                res.send({ message: "Password didn't match"})
            }
        } else {
            res.send({message: "User not registered"})
        }
    })
}) 

app.post("/register", (req, res)=> {
    const { name, email, password} = req.body
    User.findOne({email: email}, (err, user) => {
        if(user){
            res.send({message: "User already registerd"})
        } else {
            const user = new User({
                name,
                email,
                password
            })
            user.save(err => {
                if(err) {
                    res.send(err)
                } else {
                    res.send( { message: "Successfully Registered, Please login now." })
                }
            })
        }
    })
    
}) 



// const express = require("express");
// const router = express.Router();

// const User = require("../models/user")
// const Todo = require("../models/Todo")
// const User = require("../models/auth")



// const authHeader = require("../middleware/jsonAuthorization");

// require("dotenv").config()

app.post("/addtodo", (req, res) => {
    const { cooking } = req.body;
    const newtodo = new Todo({
        cooking
    })
    newtodo.save().then((res) => {
        return res.json({ newtodo: res })
    }).catch(err => console.log(err))
})



app.get('/todo-list', async (req, res) => {
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    const user = await User.findById(req.session.user._id);
    res.json(user.todoList);
});

app.post('/tasks/:taskId/start', async (req, res) => {
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    const { taskId } = req.params;
    const user = await User.findById(req.session.user._id);
    const task = user.todoList.find((task) => task.id === taskId);
    if (!task || task.status !== 'not started') {
        res.sendStatus(400);
        return;
    }
    task.status = 'in progress';
    task.startTime = Date.now();
    await user.save();
    res.json(task);
});

app.post('/tasks/:taskId/pause', async (req, res) => {
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    const { taskId } = req.params;
    const user = await User.findById(req.session.user._id);
    const task = user.todoList.find((task) => task.id === taskId);
    if (!task || task.status !== 'in progress') {
        res.sendStatus(400);
        return;
    }
    task.status = 'paused';
    task.timeTaken += Date.now() - task.startTime;
    task.startTime = null;
    await user.save();
    res.json(task);
});

app.post('/tasks/:taskId/end', async (req, res) => {
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    const { taskId } = req.params;
    const user = await User.findById(req.session.user._id);
    const task = user.todoList.find((task) => task.id === taskId);
    if (!task || task
        .status !== 'in progress') {
        res.sendStatus(400);
        return;
    }
    task.status = 'completed';
    task.timeTaken += Date.now() - task.startTime;
    task.startTime = null;
    await user.save();
    res.json(task);
});








app.listen(9002,() => {
    console.log("BE started at port 9002")
})