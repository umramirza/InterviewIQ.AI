import React, { useEffect, useState } from "react";
import axios from "axios";
import { ServerUrl } from "../App";
import { useNavigate } from "react-router-dom";
import { BsRobot, BsPeople, BsBriefcase, BsCreditCard, BsGraphUp, BsBoxArrowRight, BsClockHistory, BsCheckCircle, BsList, BsX } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid
} from "recharts";

function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile toggle

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b"];

  // Fetch functions
  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${ServerUrl}/api/admin/stats`, { withCredentials: true });
      setStats(res.data);
    } catch (err) { console.error("Stats Error:", err); }
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${ServerUrl}/api/admin/users`, { withCredentials: true });
      setUsers(res.data);
    } catch (err) { console.error("Users Error:", err); }
  };

  const fetchInterviews = async () => {
    try {
      const res = await axios.get(`${ServerUrl}/api/admin/interviews`, { withCredentials: true });
      setInterviews(res.data);
    } catch (err) { console.error("Interviews Error:", err); }
  };

  const fetchPayments = async () => {
    try {
      const res = await axios.get(`${ServerUrl}/api/admin/payments`, { withCredentials: true });
      setPayments(res.data);
    } catch (err) { console.error("Payments Error:", err); }
  };

  // Initial and Tab-based fetching
  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (tab === "users") fetchUsers();
    if (tab === "interviews") fetchInterviews();
    if (tab === "payments") fetchPayments();
    if (tab === "dashboard") fetchStats();
  }, [tab]);

  // Grouping logic
  const groupedInterviews = interviews.reduce((acc, item) => {
    const id = item.userId?._id || "unknown";
    if (!acc[id]) {
      acc[id] = { user: item.userId, list: [] };
    }
    acc[id].list.push(item);
    return acc;
  }, {});

  const SidebarItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => {
        setTab(id);
        setIsMobileMenuOpen(false); // Close menu on click
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        tab === id ? "bg-green-600 text-white shadow-lg shadow-green-200" : "text-gray-500 hover:bg-gray-100"
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F8FAFC]">
      
      {/* MOBILE TOP BAR (Sirf Choti Screen pr Dikhega) */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b">
        <div className="flex items-center gap-3" onClick={() => navigate("/")}>
          <div className="bg-green-600 text-white p-2 rounded-xl shadow-lg">
            <BsRobot size={20} />
          </div>
          <h1 className="text-lg font-bold text-slate-800">IQ Admin</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
          {isMobileMenuOpen ? <BsX size={28} /> : <BsList size={28} />}
        </button>
      </div>

      {/* SIDEBAR (Desktop: hamesha dikhega | Mobile: toggle par dikhega) */}
      <aside className={`
        ${isMobileMenuOpen ? "block" : "hidden"} 
        md:flex w-full md:w-64 bg-white border-r flex-col p-6 sticky top-0 h-auto md:h-screen z-50
      `}>
        <div className="hidden md:flex items-center gap-3 mb-10 cursor-pointer" onClick={() => navigate("/")}>
          <div className="bg-green-600 text-white p-2 rounded-xl shadow-lg">
            <BsRobot size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">IQ Admin</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem id="dashboard" icon={BsGraphUp} label="Overview" />
          <SidebarItem id="users" icon={BsPeople} label="Users" />
          <SidebarItem id="interviews" icon={BsBriefcase} label="Interviews" />
          <SidebarItem id="payments" icon={BsCreditCard} label="Payments" />
        </nav>

        <button 
          onClick={() => navigate("/")}
          className="mt-6 md:mt-auto flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
        >
          <BsBoxArrowRight size={20} />
          <span className="font-medium">Exit Panel</span>
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 capitalize">{tab}</h2>
            <p className="text-slate-500 text-sm">Real-time system monitoring</p>
          </div>
          {loading && <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>}
        </header>

        <AnimatePresence mode="wait">
          {/* DASHBOARD TAB */}
          {tab === "dashboard" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-[2rem] border-b-4 border-green-500 shadow-sm">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Community</p>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-4xl font-black text-slate-800">{users.length}</h2>
                    <span className="text-green-500 text-xs font-bold">Users</span>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border-b-4 border-blue-500 shadow-sm">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Interviews Taken</p>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-4xl font-black text-slate-800">{interviews.length}</h2>
                    <span className="text-blue-500 text-xs font-bold">Sessions</span>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border-b-4 border-purple-500 shadow-sm">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Platform Revenue</p>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-4xl font-black text-slate-800">₹{stats?.totalRevenue || 0}</h2>
                    <span className="text-purple-500 text-xs font-bold">INR</span>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border-b-4 border-amber-500 shadow-sm">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Avg User Score</p>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-4xl font-black text-slate-800">{stats?.avgScore || "7.2"}</h2>
                    <span className="text-amber-500 text-xs font-bold">/10</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-7 bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-xl font-black text-slate-800">Live User Activity</h3>
                      <p className="text-sm text-slate-400">Track what users are doing right now</p>
                    </div>
                    <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-xs font-bold animate-pulse">● LIVE</span>
                  </div>
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {interviews.length > 0 ? interviews.slice(0, 10).map((iv, i) => (
                      <div key={i} className="group flex items-center justify-between p-4 rounded-3xl bg-slate-50 hover:bg-green-50 transition-all border border-transparent hover:border-green-100">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center font-bold text-slate-600 border border-slate-100">{iv.userId?.name?.charAt(0) || "U"}</div>
                          <div>
                            <h4 className="font-bold text-slate-800 group-hover:text-green-700 transition-colors">{iv.userId?.name || "Guest User"}</h4>
                            <p className="text-xs text-slate-400">Attempted <span className="text-slate-600 font-semibold">{iv.role}</span> interview</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-black text-slate-700">{iv.finalScore}/10</div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold">{new Date(iv.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                      </div>
                    )) : <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200"><p className="text-slate-400 font-medium italic">Awaiting User Interactions...</p></div>}
                  </div>
                </div>

                <div className="col-span-12 lg:col-span-5 space-y-6">
                  <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl overflow-hidden relative">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><BsPeople className="text-blue-400" /> New Registrations</h3>
                    <div className="space-y-4 relative z-10">
                      {users.slice(-4).reverse().map((u, i) => (
                        <div key={i} className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/10">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-[10px]">NEW</div>
                            <div>
                              <p className="text-xs font-bold">{u.name}</p>
                              <p className="text-[10px] text-slate-400 truncate w-32">{u.email}</p>
                            </div>
                          </div>
                          <div className="text-[10px] font-mono text-blue-400">Joined</div>
                        </div>
                      ))}
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/20 blur-[50px] rounded-full"></div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
                    <h3 className="font-black text-slate-800 uppercase tracking-tighter mb-4 text-center">Interview Success Rate</h3>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Completed', value: stats?.completedInterviews || 1 },
                              { name: 'Pending', value: stats?.pendingInterviews || 0 }
                            ]}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={10}
                            dataKey="value"
                          >
                            <Cell fill="#10b981" stroke="none" />
                            <Cell fill="#f1f5f9" stroke="none" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* USERS TAB */}
          {tab === "users" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" key="users">
              {users.length > 0 ? users.map(u => (
                <div key={u._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-700 font-bold uppercase">{u.name?.charAt(0)}</div>
                    <div>
                      <h4 className="font-bold text-slate-800">{u.name}</h4>
                      <p className="text-xs text-slate-400 truncate w-full">{u.email}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl flex justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Credits</span>
                    <span className="text-green-600 font-bold">{u.credits}</span>
                  </div>
                </div>
              )) : <p className="col-span-3 text-center py-10 text-slate-400 font-medium">No users found</p>}
            </motion.div>
          )}

          {/* INTERVIEWS TAB */}
          {tab === "interviews" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6" key="interviews">
              {Object.keys(groupedInterviews).length > 0 ? Object.values(groupedInterviews).map((group, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 border-b pb-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-xs uppercase">
                      {group.user?.name?.charAt(0) || "?"}
                    </div>
                    <h3 className="font-bold text-slate-700">{group.user?.name || "Deleted User"}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.list.map((iv, idx) => (
                      // <div key={idx} className="border border-slate-50 bg-slate-50/50 p-4 rounded-2xl flex justify-between items-center">
                      <div key={idx} 
    onClick={() => navigate(`/report/${iv._id}`)}
    className="border border-slate-50 bg-slate-50/50 p-4 rounded-2xl flex justify-between items-center cursor-pointer hover:border-green-200 hover:bg-green-50 transition-all">
                        <div>
                          <p className="font-bold text-slate-700">{iv.role}</p>
                          <p className="text-xs text-slate-400 uppercase tracking-tighter">{iv.mode} • {new Date(iv.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-green-600">{iv.finalScore || 0}<span className="text-[10px] text-slate-400">/10</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )) : <p className="text-center py-10 text-slate-400 font-medium">No interviews recorded</p>}
            </motion.div>
          )}

          {/* PAYMENTS TAB */}
          {tab === "payments" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-x-auto" key="payments">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="bg-slate-50">
                  <tr className="text-slate-400 text-xs uppercase font-bold">
                    <th className="p-5">Customer</th>
                    <th className="p-5">Plan</th>
                    <th className="p-5">Amount</th>
                    <th className="p-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {payments.length > 0 ? payments.map(p => (
                    <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-5">
                        <p className="font-bold text-slate-700">{p.userId?.name || "Unknown"}</p>
                        <p className="text-xs text-slate-400">{p.userId?.email}</p>
                      </td>
                      <td className="p-5 text-sm font-medium text-slate-600 capitalize">{p.planId}</td>
                      <td className="p-5 font-bold text-slate-800">₹{p.amount}</td>
                      <td className="p-5">
                         <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase">Success</span>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" className="p-10 text-center text-slate-400">No transactions found</td></tr>
                  )}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default AdminDashboard;