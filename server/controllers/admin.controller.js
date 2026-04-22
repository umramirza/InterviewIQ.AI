import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";
import Payment from "../models/payment.model.js";

export const getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalInterviews = await Interview.countDocuments();
        const completedInterviews = await Interview.countDocuments({ status: "completed" });
        const payments = await Payment.find({ status: "paid" });
        const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
        return res.json({ totalUsers, totalInterviews, completedInterviews, totalRevenue });
    } catch (error) {
        return res.status(500).json({ message: `Stats error: ${error}` });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        return res.json(users);
    } catch (error) {
        return res.status(500).json({ message: `Get users error: ${error}` });
    }
};

export const updateUserCredits = async (req, res) => {
    try {
        const { userId, credits } = req.body;
        const user = await User.findByIdAndUpdate(userId, { credits }, { new: true });
        return res.json(user);
    } catch (error) {
        return res.status(500).json({ message: `Update credits error: ${error}` });
    }
};

export const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        return res.json({ message: "User deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: `Delete user error: ${error}` });
    }
};

export const getAllInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find()
            .sort({ createdAt: -1 })
            .populate("userId", "name email");
        return res.json(interviews);
    } catch (error) {
        return res.status(500).json({ message: `Get interviews error: ${error}` });
    }
};

export const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ status: "paid" })
            .sort({ createdAt: -1 })
            .populate("userId", "name email");
        return res.json(payments);
    } catch (error) {
        return res.status(500).json({ message: `Get payments error: ${error}` });
    }
};