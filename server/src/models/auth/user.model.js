import mongoose from "mongoose";
import bcrypt from "bcrypt"


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"]
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email address is required',
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required : [true, "Please enter your password"]
    },
    photo: {
        type : String,
<<<<<<< HEAD
        default : "no-photo.jpg"
=======
        default : "https://www.freepik.com/free-vector/blue-circle-with-white-user_145857007.htm#fromView=keyword&page=1&position=0&uuid=5c6c0123-d220-42a3-ba92-c5dfa5b07dd5&query=Default+Avatar"
>>>>>>> staging
    },
    bio:{
        type: String,
        default: "I'm a new user !"
    },
    role:{
        type: String,
        enum: ["user", "admin", "super admin"],
        default: "user"
    },
    isVerified:{
        type: Boolean,
        default: false
    }
},{timestamps: true, minimize: false});

userSchema.pre("save", async function(next) {
    // check if password is not modified
    if(!this.isModified("password")){
        next();
    }
    //hashed password ==> bcrypt
    // generat salt 

    const salt = await bcrypt.genSalt(10);
    //hash password with salt
    const hashedPassword = await bcrypt.hash(this.password, salt);

    // set of the password to the hashed password
    this.password = hashedPassword;

    // call next middleware
    next();
    
});

const User = mongoose.model("User", userSchema);

export default User;