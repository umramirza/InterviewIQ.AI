

import React from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"; // Changed to framer-motion (standard)
import { BsRobot, BsCoin, BsShieldLock } from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import { FaUserAstronaut } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setUserData } from "../redux/userSlice";
import axios from "axios";
import { ServerUrl } from "../App";
import AuthModel from "./AuthModel";

function Navbar() {
    const { userData } = useSelector((state) => state.user)
    const [showCreditPopup, setShowCreditPopup] = useState(false)
    const [showUserPopup, setShowUserPopup] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [showAuth, setShowAuth] = useState(false);

    const handleLogout = async () => {
        try {
            await axios.get(ServerUrl + "/api/auth/logout", { withCredentials: true })
            dispatch(setUserData(null))
            setShowCreditPopup(false)
            setShowUserPopup(false)
            navigate("/")
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="bg-[#f3f3f3] flex justify-center px-4 pt-6">
            <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-6xl bg-white rounded-[24px] shadow-sm border border-gray-200 px-8 py-4 flex justify-between items-center relative z-50">
                
                {/* Logo Section */}
                <div onClick={() => navigate("/")} className="flex items-center gap-3 cursor-pointer">
                    <div className="bg-black text-white p-2 rounded-lg">
                        <BsRobot size={18} />
                    </div>
                    <h1 className="font-semibold hidden md:block text-lg">InterviewIQ.AI</h1>
                </div>

                <div className="flex items-center gap-6 relative">
                    {/* Credits Section */}
                    <div className="relative">
                        <button onClick={() => {
                            if (!userData) {
                                setShowAuth(true)
                                return;
                            }
                            setShowCreditPopup(!showCreditPopup);
                            setShowUserPopup(false)
                        }} className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-md hover:bg-gray-200 transition">
                            <BsCoin size={20} className="text-yellow-600" />
                            <span className="font-bold">{userData?.credits || 0}</span>
                        </button>
                        
                        {showCreditPopup && (
                            <div className="absolute right-[-50px] mt-3 w-64 bg-white shadow-xl border border-gray-200 rounded-2xl p-5 z-50">
                                <p className="text-sm text-gray-600 mb-4">Need more credits to continue interviews</p>
                                <button onClick={() => {navigate("/pricing"); setShowCreditPopup(false)}} className="w-full bg-black text-white py-2 rounded-lg text-sm font-medium">Buy more credits</button>
                            </div>
                        )}
                    </div>

                    {/* Profile Section */}
                    <div className="relative">
                        <button onClick={() => {
                            if (!userData) {
                                setShowAuth(true)
                                return;
                            }
                            setShowUserPopup(!showUserPopup);
                            setShowCreditPopup(false)
                        }} className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all border-2 ${userData?.isAdmin ? "border-red-500 bg-red-50 text-red-600" : "bg-black text-white border-transparent"}`}>
                            {userData ? userData?.name.slice(0, 1).toUpperCase() : <FaUserAstronaut size={16} />}
                        </button>

                        {showUserPopup && (
                            <div className="absolute right-0 mt-3 w-56 bg-white shadow-2xl border border-gray-200 rounded-2xl p-4 z-50">
                                <div className="px-2 py-2 border-b border-gray-100 mb-2">
                                    <p className="text-sm font-bold text-gray-800 truncate">{userData?.name}</p>
                                    {userData?.isAdmin && (
                                        <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase">Administrator</span>
                                    )}
                                </div>

                                {/* ADMIN ONLY LINK */}
                                {userData?.isAdmin && (
                                    <button 
                                        onClick={() => {navigate("/admin"); setShowUserPopup(false)}} 
                                        className="w-full text-left text-sm py-2 px-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-bold flex items-center gap-2 mb-1 transition-all"
                                    >
                                        <BsShieldLock size={16} /> Admin Panel
                                    </button>
                                )}

                                <button onClick={() => {navigate("/history"); setShowUserPopup(false)}} className="w-full text-left text-sm py-2 px-3 rounded-lg hover:bg-gray-100 text-gray-600 flex items-center gap-2">
                                    Interview History
                                </button>
                                
                                <button onClick={handleLogout}
                                    className="w-full text-left text-sm py-2 px-3 rounded-lg hover:bg-red-50 flex items-center gap-2 text-red-500 font-medium mt-1">
                                    <HiOutlineLogout size={16} /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
        </div>
    )
}

export default Navbar