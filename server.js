const express = require('express');
const mongoose = require('mongoose');
const Registeruser = require('./model');
const jwt =require('jsonwebtoken');
const middleware = require('./middleware');
const cors = require('cors');
const app = express();
require('dotenv').config(); // Load environment variables from .env file

// Middleware to parse JSON
app.use(express.json());

//cors useage
app.use(cors({origin:"*"}))
// Configure MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('DB connection established'))
    .catch(err => console.error('DB connection error:', err));
//for json format
//app.user(express.json());
//to post data
app.post('/register',async(req,res) => {
    try {
        const{username,email,password,confirmpassword} = req.body;
        let exist = await Registeruser.findOne({email})
        if (exist)
        {
            return res.status(400).send('User alrady exist');
        }
        if (password !== confirmpassword)
        {
            return res.status(400).send('Passwords not matching');
        }
        let newUser = new Registeruser({
            username,
            email,
            password,
            confirmpassword
        })
        await newUser.save();
        res.status(200).send('Successfully registered');
    } catch (err) 
    {
        console.log(err)
        return res.status(500).send('Internal server error');
        
    }
})
//post method similar to register
//but we need only 2 credantials 
//username and the password
app.post('/login',async (req , res) => {
    try {
        const {email , password} = req.body;
        let exist = await Registeruser.findOne({email});
        if ( !exist) {
            return res.status(400).send("User not found");
        }
        if(exist.password !== password)
        {
            return res.status(400).send("Password doesn't match");
        }
        let payload = {
            user:{
                id:exist.id
            }
        }
        jwt.sign(payload,'jwtSecret',{expiresIn:3600000},
            (err,token) =>
            {
                if(err) throw err;
                return res.json({token})
            }
        )
    } 
    catch (err) 
    {
        console.log(err);
        return res.status(500).send('Server error');    
    }
})
//protected router
app.get('/myprofile',middleware,async(req, res) => {
    try {
        let exist = await Registeruser.findById(req.user.id);
        if (!exist)
        {
            return res.status(400).send('User not found');
        }
        res.json(exist);
    }
     catch (err) 
     {
        console.log(err);
        return res.status(500).send('Server Error');
    }
} )

// Start the server
app.listen(5000, () => {
    console.log('Server running on port 5000');
});
