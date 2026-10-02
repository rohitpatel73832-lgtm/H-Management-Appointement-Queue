import mongoose from "mongoose";
import bcrypt from "bcrypt";


const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [50, "Name cannot exceed 50 characters"]
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"]
        },

        role: {
            type: String,
            enum: ["patient", "doctor", "admin"],
            default: "patient"
        }
    },
    {
        timestamps: true
    }
);

    userSchema.pre("save",async function() {
    if(!this.isModified("password")) return 
    this.password= await bcrypt.hash(this.password,10)
    //next()
    })

const User = mongoose.model("User", userSchema);

export default User;