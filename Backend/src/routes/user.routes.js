import express from "express"
import { registerUser,loginUser, getCurrentUser, patientDashboard, doctorDashboard, adminDashboard } from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const userRouter = express.Router();
//  /api/users/register
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
//auth-test
userRouter.get('/me',protect, getCurrentUser);

//patient only
userRouter.get('/patient',protect, authorize("patient"),patientDashboard);
//doctor-only
userRouter.get('/doctor',protect, authorize("doctor"),doctorDashboard);
//admin-only
userRouter.get('/admin',protect, authorize("admin"),adminDashboard);


export default userRouter;