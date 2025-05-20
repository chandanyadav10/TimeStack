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
        default : "no-photo.jpg"
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