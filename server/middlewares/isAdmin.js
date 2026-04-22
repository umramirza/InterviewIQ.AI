import User from "../models/user.model.js";

const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }
        next();
    } catch (error) {
        return res.status(500).json({ message: `Admin check failed: ${error}` });
    }
};

export default isAdmin;

