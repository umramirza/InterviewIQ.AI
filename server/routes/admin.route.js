import express from "express";
import isAuth from "../middlewares/isAuth.js";
import isAdmin from "../middlewares/isAdmin.js";
import {
    getStats,
    getAllUsers,
    updateUserCredits,
    deleteUser,
    getAllInterviews,
    getAllPayments
} from "../controllers/admin.controller.js";

const adminRouter = express.Router();

adminRouter.get("/stats", isAuth, isAdmin, getStats);
adminRouter.get("/users", isAuth, isAdmin, getAllUsers);
adminRouter.put("/user/credits", isAuth, isAdmin, updateUserCredits);
adminRouter.delete("/user/:id", isAuth, isAdmin, deleteUser);
adminRouter.get("/interviews", isAuth, isAdmin, getAllInterviews);
adminRouter.get("/payments", isAuth, isAdmin, getAllPayments);

export default adminRouter;