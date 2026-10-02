import express from "express"
import { registerUser,loginUser, getCurrentUser } from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const userRouter = express.Router();
//  /api/users/register
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/me',protect, getCurrentUser);


export default userRouter;