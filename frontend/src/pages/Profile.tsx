import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
    Save,
    Shield, Loader2, Key, MailCheck, Wallet
} from "lucide-react";
import LottieIcon from "../components/LottieIcon";
import profileData from "../assets/animations/profile.json";
import ConfirmModal from "../components/ConfirmModal";
import { Trash2 } from "lucide-react";

const Profile = () => {
    const { user, setUser, deleteAccount } = useAuth();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phone: "",
        dob: "",
        budget: 0,
    });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.uid) {
                setLoading(false);
                return;
            }
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setProfile({
                        name: data.fullName || "",
                        email: data.email || user.email || "",
                        phone: data.phone || "",
                        dob: data.dob || "",
                        budget: data.budget || 0,
                    });
                } else {
                    setProfile(prev => ({
                        ...prev,
                        name: user.name || "",
                        email: user.email || "",
                    }));
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                toast.error("Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user?.uid, user?.email]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.uid) return;
        setUpdating(true);
        try {
            await updateDoc(doc(db, "users", user.uid), {
                fullName: profile.name,
                phone: profile.phone,
                dob: profile.dob,
                budget: profile.budget,
            });
            setUser({ ...user, name: profile.name });
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Failed to update profile");
        } finally {
            setUpdating(false);
        }
    };

    const handleResetPasswordEmail = async () => {
        if (!user?.email) {
            toast.error("No email found for password reset.");
            return;
        }
        try {
            await sendPasswordResetEmail(auth, user.email);
            toast.success("Password reset email sent!");
        } catch (error: any) {
            toast.error(error.message || "Failed to send reset email");
        }
    };

    const handleDeleteAccount = async () => {
        setDeleting(true);
        try {
            await deleteAccount();
            toast.success("Account deleted successfully");
        } catch (error: any) {
            console.error("Delete error:", error);
            toast.error(error.message || "Failed to delete account. Please re-login and try again.");
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin text-teal-500" size={48} />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-4">
            <div className="flex items-center gap-4 mb-8">
                <div className="bg-indigo-500/10 p-3 rounded-2xl">
                    <LottieIcon animationData={profileData} size={40} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Profile</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage your personal information</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Avatar & Quick Actions */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="glass-card p-10 rounded-3xl text-center relative overflow-hidden group shadow-xl">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-500 to-blue-500" />
                        <div className="w-36 h-36 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white dark:border-slate-900 shadow-2xl relative group overflow-hidden">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="scale-110">
                                    <LottieIcon animationData={profileData} size={150} />
                                </div>
                            )}
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white leading-tight mb-1">
                            {profile.name || "User"}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{profile.email}</p>
                    </div>

                    {/* Box 6: Danger Zone / Delete Account */}
                    <div className="glass-card p-8 rounded-3xl border border-rose-500/10 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-rose-500/50" />
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-400">
                                    <Trash2 size={20} />
                                </div>
                                <h3 className="text-xl font-black text-white uppercase tracking-wider">Danger Zone</h3>
                            </div>

                            <div className="space-y-4">
                                <p className="text-sm text-slate-500 font-bold italic leading-relaxed">
                                    "Handle with care, bestie! This action is permanent. No cap." ✨💅🔥
                                    "You can always create a new account if you change your mind."
                                    "thanks for using our app!"
                                </p>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    disabled={deleting}
                                    className="w-full py-4 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white rounded-2xl text-sm font-black transition-all border border-rose-500/20 flex items-center justify-center gap-2 group/del"
                                >
                                    {deleting ? (
                                        <Loader2 className="animate-spin" size={18} />
                                    ) : (
                                        <Trash2 size={18} className="group-hover/del:scale-110 transition-transform" />
                                    )}
                                    DELETE ACCOUNT
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Box 1: Account Settings */}
                    <div className="glass-card p-8 rounded-3xl border border-teal-500/10 shadow-xl relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 left-0 w-1 h-full bg-teal-500/50" />
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-teal-500/10 rounded-xl text-teal-400">
                                    <Shield size={20} />
                                </div>
                                <h3 className="text-xl font-black text-white uppercase tracking-wider">Account</h3>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-teal-500 transition-all font-bold"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Date of Birth</label>
                                    <input
                                        type="date"
                                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-teal-500 transition-all font-bold"
                                        value={profile.dob}
                                        onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <button onClick={handleUpdateProfile} disabled={updating} className="mt-8 w-full bg-teal-600 text-white py-4 rounded-2xl font-black hover:bg-teal-500 transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-2">
                            {updating ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save Account
                        </button>
                    </div>

                    {/* Box 2: Contact Info */}
                    <div className="glass-card p-8 rounded-3xl border border-blue-500/10 shadow-xl relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50" />
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
                                    <MailCheck size={20} />
                                </div>
                                <h3 className="text-xl font-black text-white uppercase tracking-wider">Contact</h3>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl px-5 py-4 text-white opacity-40 font-bold cursor-not-allowed"
                                        value={profile.email}
                                        disabled
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 transition-all font-bold"
                                        value={profile.phone}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <button onClick={handleUpdateProfile} disabled={updating} className="mt-8 w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-500 transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-2">
                            {updating ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save Contact
                        </button>
                    </div>

                    {/* Box 3: Budget Settings */}
                    <div className="glass-card p-8 rounded-3xl border border-emerald-500/10 shadow-xl relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50" />
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
                                    <Wallet size={20} />
                                </div>
                                <h3 className="text-xl font-black text-white uppercase tracking-wider">Budget</h3>
                            </div>
                            <div className="space-y-6">
                                <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-700/50 shadow-inner">
                                    <p className="text-slate-500 text-[10px] font-black uppercase mb-3 tracking-[0.2em]">Monthly Limit</p>
                                    <div className="text-3xl font-black text-white flex items-baseline gap-2">
                                        <span className="text-xl text-emerald-500 font-bold">₹</span>
                                        <input
                                            type="number"
                                            className="bg-transparent border-none p-0 text-white focus:outline-none focus:ring-0 w-full"
                                            value={profile.budget}
                                            onChange={(e) => setProfile({ ...profile, budget: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button onClick={handleUpdateProfile} disabled={updating} className="mt-8 w-full bg-emerald-600 text-white py-4 rounded-2xl font-black hover:bg-emerald-500 transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-2">
                            {updating ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save Budget
                        </button>
                    </div>

                    {/* Box 4: Security */}
                    <div className="glass-card p-8 rounded-3xl border border-indigo-500/10 shadow-xl relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50" />
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
                                    <Key size={20} />
                                </div>
                                <h3 className="text-xl font-black text-white uppercase tracking-wider">Security</h3>
                            </div>
                            <div className="space-y-4">
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                    Protect your account by regularly updating your password.
                                </p>
                                <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Status</p>
                                    <p className="text-xs font-bold text-slate-300">Secure & Verified</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={handleResetPasswordEmail} className="mt-8 w-full bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-500 transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-2">
                            <MailCheck size={16} /> Send Reset Link
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteAccount}
                title="Delete Account"
                message="Are you sure you want to delete your account? This action is permanent and will delete all your data including expenses and incomes. You may need to login again before deleting for security reasons."
            />
        </div >
    );
};

export default Profile;
