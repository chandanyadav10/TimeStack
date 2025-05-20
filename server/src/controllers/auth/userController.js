import asyncHandler from "express-async-handler";
import  User from "../../models/auth/user.model.js"
import generateToken from "../../helpers/generateToken.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import Token from "../../models/auth/token.model.js";
import crypto from "node:crypto";
import hashToken from "../../helpers/hashToken.js";
import sendEmail from "../../helpers/sendEmail.js";
import { console } from "node:inspector";


//register new user
export const registerUser = asyncHandler (async(req , res) => {
   const {name, email, password} = req.body;

   // validation
   if(!name || !email || !password){
    return res.status(400).json({message: "All fields are required !"})
   }

   // check password
   if(password.length<6){
    return res.status(400).json({message: "Password shold alteast 6 characters !"})
   }

   // check if User exist
   const userExists = await User.findOne({email});

   if(userExists){
    // bad request
    return res.status(400).json({message : "User is already exist"})
   }

   // create new user

   const user = await User.create({
    name,
    email,
    password
   });

   // generate token with user id
    const token = generateToken(user._id);
    
   // return user data with token
   res.cookie("token", token, {
    path : "/",
    httpOnly : true,
    maxAge : 30 * 24 * 60 * 60 * 1000,
    sameSite : "none",
    secure : true
   });


   // send back the user token in the response to the client 
   if(user){
     const {_id, name, email, role, photo, bio, isVerified} = user;

    // 201 created
    res.status(201).json({
        _id,
        name,
        email,
        role,
        photo,
        bio,
        isVerified ,
         token:user.token
    });
   }else{
    return res.status(400).json({message : "Invalid user data"});
   }
})

// user login 
export const loginUser = asyncHandler (async (req, res) => {
    const { email, password }= req.body ;

    if(!email || !password){
    res.status(400).json({message : "All fields are required !"})
    }

    const userExists = await User.findOne({email});
    
    if(!userExists){
        res.status(400).json({message: " User not found, sign up!"})
    }

    const isMatch = await bcrypt.compare(password, userExists.password );

    if(!isMatch){
        res.status(400).json({message: "Invalid credentials"})
    }

    // generate token with user id
    const token = generateToken(userExists._id);

    if(userExists && isMatch){
    const {_id, name, email, role, bio, isVerified}= userExists;
    
    // set the token in the cookie
   res.cookie("token", token,{
    path: "/",
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite: true,
    secure: true
   })

   // send back to the user
   res.status(200).json({
    _id,
    name,
    email,
    role,
    bio,
    isVerified,
    token
   });
    }else{
        res.status(400).json({message: "Invalid email or password"})
    }
} )

// user logout
export const logoutUser = asyncHandler (async (req, res) => {
    res.clearCookie("token");

    res.status(200).json({message: "User logged out"})
})

// get user
export const getUser = asyncHandler(async (req, res) => {

    // get user detail from token
    const user = await User.findById(req.user._id).select("-password");
    

    if(user){
        res.status(201).json(user)
    }else{
        res.status(401).json({
            message: "User not found"
        })
    }

})

// update user
export const updateUser = asyncHandler(async (req, res) =>{
    //get user detail from token  ---> protect middleware
    const user = await User.findById(req.user._id);

    if(user){
        // user properties to update
        const {name, bio, photo} = user;
        // update user properties
        user.name = req.body.name || user.name;
        user.bio = req.body.bio || user.bio;
        user.photo = req.body.photo || user.photo;

        const updated = await user.save();

        res.status(201).json({
            _id : updated._id,
            name : updated.name,
            email: updated.email,
            role : updated.role,
            photo : updated.photo,
            bio : updated.bio,
            isVerified : updated.isVerified
        })
    }else{
        res.status(404).json({
            message: "user not found!"
        })
    }

})

// Login status
export const loginStatus = asyncHandler(async (req, res) => {
    const token = req.cookies.token;
    if(!token){
        // 401 unauthorized
        res.status(401).json({
            message: "not authorized, please login"
        })
    }

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if(decoded){
        res.status(200).json(true)
    }else{
        res.status(401).json(false)
    }
})

// Email verification
export const verifyEmail = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    // if user not exists
    if(!user){
        res.status(404).json({
            message: "user not found"
        })
    }

    // if user is already verified
    if(user.isVerified){
        res.status(400).json({
            message: "user already verified"
        })
    }

    let token = await Token.findOne({userId: user._id});

    // if token exist --> delete it
    if(token){
        await token.deleteOne();
    }

    //create a verification token using the user id --> crypto
    const verificationToken = crypto.randomBytes(64).toString("hex") + user._id;

    //hash the verification token 
    const hashedToken = await hashToken(verificationToken);

    // create a new token
    await new Token({
        userId: user._id,
        verificationToken: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000
    }).save();

    // Verification link
<<<<<<< HEAD
    const verificationLink = `${process.env.CLIENT_URL}/verify/${verificationToken}`;
=======
    const verificationLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
>>>>>>> staging

    // send verification email
    const subject = "Email Verification";
    const send_to = user.email;
    const reply_to = "BhR9x@example.com";
    const template = "emailVerification";
    const sent_from = process.env.EMAIL_USER;
    const name = user.name;
    const link = verificationLink;

    try {
        await sendEmail(subject, send_to, reply_to, template, sent_from, name, link);
        return res.status(200).json({message: "Email sent"})
        
    } catch (error) {
        return res.status(500).json({message: "Email not sent"})
        
    }
    })
    
// user verification
export const verifyUser = asyncHandler(async (req, res) => {
    const {verificationToken
    } = req.params;

    if(!verificationToken){
        res.status(400).json({
            message: "Verification token is required"
        })
    }
   // hash the verification token --> because it was hashed before saving
    const hashedToken = await hashToken(verificationToken);

    // find the use with verification token
    const userToken = await Token.findOne({
        verificationToken: hashedToken,
    // check if token is not expired
        expiresAt: {
            $gt: Date.now()
        }
 });

    if(!userToken){
        res.status(400).json({
            message: "Invalid or expired verification token"
        })
    }

    // find the user
    const user = await User.findById(userToken.userId);

    if(user.isVerified){
        res.status(400).json({
            message: "User already verified"
        })
    }

    // verify user
    user.isVerified = true;
    await user.save();
    res.status(200).json({
        message: "User verified successfully"
    })

})

// forgot password 
export const forgotPassword = asyncHandler(async (req, res) => {

    const {email} = req.body;

    if(!email){
        res.status(400).json({
            message: "Email is required"
        })
    }

    const user = await User.findOne({email});

    if(!user){
        res.status(404).json({
            message: "User not found"
        })
    }

    let token = await Token.findOne({userId: user._id});

    // if token exist --> delete it
    if(token){
        await token.deleteOne();
    }

    //create a verification token using the user id --> crypto
    const passwordResetToken = crypto.randomBytes(64).toString("hex") + user._id;

    //hash the verification token 
    const hashedToken = await hashToken(passwordResetToken);

    // create a new token
    await new Token({
        userId: user._id,
        passwordResetToken: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 60 * 60 * 1000
    }).save();

    // Verification link
    const resetPasswordLink = `${process.env.CLIENT_URL}/reset-password/${passwordResetToken}`;

    // send email to user
    const subject = "Reset Password";
    const send_to = user.email;
    const reply_to = "no-reply1@noreply.com";
    const template = "forgotPassword";
    const sent_from = process.env.EMAIL_USER;
    const name = user.name;
    const link = resetPasswordLink;

    try {
        await sendEmail(subject, send_to, reply_to, template, sent_from, name, link);
        return res.status(200).json({message: "Email sent"})
        
    } catch (error) {
        return res.status(500).json({message: "Email not sent"})
        
    }    
})

// reset password

export const resetPassword = asyncHandler(async (req, res) => {
    const { resetPasswordToken } = req.params;
    const { password } = req.body;
  
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }
  
    // hash the reset token
    const hashedToken = hashToken(resetPasswordToken);
  
    // check if token exists and has not expired
    const userToken = await Token.findOne({
      passwordResetToken: hashedToken,
      // check if the token has not expired
      expiresAt: { $gt: Date.now() },
    });
  
    if (!userToken) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }
  
    // find user with the user id in the token
    const user = await User.findById(userToken.userId);
  
    // update user password
    user.password = password;
    await user.save();
  
    res.status(200).json({ message: "Password reset successfully" });
  });

  // change password
export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if(!currentPassword || !newPassword){
        res.status(400).json({
            message: "All fields are required"
        })
    }

    // find user by id
    const user = await User.findById(req.user._id);

    //check if user exists
    if(!user){
        res.status(404).json({
            message: "User not found"
        })
    } 

    // check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    console.log(user.password, currentPassword)

    if(!isMatch){
        res.status(400).json({
            message: "Invalid current password"
        })
    }

    // reset user password
    if(isMatch){
        user.password = newPassword;
        await user.save();
        res.status(200).json({
            message: "Password changed successfully"
        })
    }else{
        res.status(400).json({
            message: "Password could not be changed"
        })
    }
  });