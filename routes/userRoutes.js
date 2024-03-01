const {Router} = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const router = Router();
const HttpError = require("../models/errorModel")
const Admin = require("../models/adminModel")
const User = require('../models/participateModel')

const authMiddleWare = require('../middleware/Auth')

router.post("/register", async(req, res, next) => {
    try {
        const {name,email,password,confirmPassword} = req.body;
        if(!name || !email || !password){
            return next (new HttpError("fill in all feilds",422))
        }
        const newEmail = email.toLowerCase();
        const emailExists = await Admin.findOne({email: newEmail});
        if(emailExists){
            return next(new HttpError("email already exists",422))
        }
        if((password.trim()).length < 6){
            return next(new HttpError("password should be atleast 6 charecters", 422));
        }
        if(password != confirmPassword){
            return next( new HttpError("passwords do not match",422));
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password,salt);

        const newAdmin = await Admin.create({name,email:newEmail,password:hashedPass});
        res.status(201).json(`newUser ${newAdmin.email} registered`);

    } catch (error) {
        return next(new HttpError("user registration failed",422))
    }
});

router.post("/users", async (req, res, next) => {
  try {
    const {name} = req.body;
    if (!name) {
      return next(new HttpError("enter your insta_Id", 422));
    }

    const existingUser = await User.find({username:name})
    
    if(existingUser.length>0){
        return next(new HttpError("Already Participated"))
    }

    
        const users = await User.find();
        const number = users.length + 1;

    const newUser = await User.create({
      username:name,number
    });
    res.status(201).json(newUser);
  } catch (error) {
    return next(new HttpError("try again", 422));
  }
});

router.post('/login',async(req,res,next)=>{
    try {
        const {email,password} = req.body;
        if(!email || !password){
            return next(new HttpError("fill in all the feilds",422));
        }
        const newEmail = email.toLowerCase();

        const admin = await Admin.findOne({email:newEmail});

        if(!admin){
            return next(new HttpError("invalid credentials",422))
        }

        const comparePass = await bcrypt.compare(password,admin.password);

        if(!comparePass) {
            return next(new HttpError("invalid password",422))
        }


        const {_id:id,name} = admin;

        const token = jwt.sign({ id, name }, process.env.JWT_SECRET,{expiresIn:"1d"});

        res.status(200).json({token,id,name})
        
    } catch (error) {
        return next(new HttpError("login failed please check your credentials",422))
        
    }
});

router.get('/users',async(req,res,next)=>{
    try {
        const users = await User.find()
        res.json(users) 
    } catch (error) {
        return next(new HttpError(error.message,500))
    }
})

router.get('/users/:number', authMiddleWare,async(req,res,next)=>{
    try {

        const {number} = req.params;

        console.log(number);

        const user = await User.find({number:number})

        if(!user){
            return next(new HttpError("user not found",422))
        }

        res.status(200).json(user)
        
    } catch (error) {
        return next(error);
    }
})


module.exports = router