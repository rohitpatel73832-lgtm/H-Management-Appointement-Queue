import express from "express"
import { registerUser } from "../controllers/user.controller.js";


const userRouter = express.Router();
//  /api/users/register
userRouter.post('/register', registerUser);



export default userRouter;