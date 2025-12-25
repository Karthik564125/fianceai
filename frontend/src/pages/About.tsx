import { Target, Shield, Zap, TrendingUp, Users } from "lucide-react";

const About = () => {
    return (
        <div className="space-y-12 pb-20">
            {/* Hero Section */}
            <div className="text-center space-y-4 max-w-3xl mx-auto pt-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 text-teal-500 rounded-full text-sm font-bold border border-teal-500/20 mb-4">
                    <Zap size={16} /> Empowering Financial Freedom
                </div>
                <h1 className="text-5xl font-black text-slate-800 dark:text-white tracking-tight">
                    Smart Finance for <span className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">Smart People.</span>
                </h1>
                <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed">
                    FinanceAI combines cutting-edge technology with intuitive design to help you
                    master your money without the stress.
                </p>
            </div>

            {/* Core Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    {
                        title: "Expense Tracking",
                        desc: "Easily log your daily spending and categorize it automatically to see where your money goes.",
                        icon: <TrendingUp className="text-red-500" size={32} />,
                        color: "red"
                    },
                    {
                        title: "Smart Budgeting",
                        desc: "Set monthly limits and get real-time alerts. Our AI helps you stay within your financial bounds.",
                        icon: <Target className="text-teal-500" size={32} />,
                        color: "teal"
                    },
                    {
                        title: "Data Security",
                        desc: "Your financial data is encrypted and secure. We prioritize your privacy above everything else.",
                        icon: <Shield className="text-purple-500" size={32} />,
                        color: "purple"
                    }
                ].map((feature, idx) => (
                    <div key={idx} className="glass-card p-8 rounded-3xl border border-slate-700/50 hover:border-slate-500/50 transition-all group">
                        <div className={`p-4 bg-${feature.color}-500/10 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform`}>
                            {feature.icon}
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                        <p className="text-slate-400 leading-relaxed">
                            {feature.desc}
                        </p>
                    </div>
                ))}
            </div>

            {/* In-Depth Guide */}
            <div className="glass-card p-12 rounded-[3rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-teal-500/5 blur-[60px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/5 blur-[60px] rounded-full" />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-6">How FinanceAI Works?</h2>
                            <div className="space-y-6">
                                {[
                                    { step: "01", title: "Connect & Input", text: "Register and start logging your income sources and daily expenses." },
                                    { step: "02", title: "Set Targets", text: "Define your monthly budget in your profile to trigger smart monitoring." },
                                    { step: "03", title: "Analyze Habits", text: "Visit the Analytics tab to see visual breakdowns of your spending trends." },
                                    { step: "04", title: "Consult AI", text: "Talk to our AI chatbot for personalized advice and financial insights." }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-6 items-start">
                                        <span className="text-4xl font-black text-slate-800 dark:text-slate-800 italic">{item.step}</span>
                                        <div>
                                            <h4 className="font-bold text-white text-lg">{item.title}</h4>
                                            <p className="text-slate-400 text-sm leading-relaxed">{item.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-700/50 p-10 rounded-3xl space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                <Users className="text-blue-500" /> Our Vision
                            </h3>
                            <p className="text-slate-300 leading-relaxed">
                                We're building more than just a tracker. FinanceAI is designed to be your
                                digital financial companion. We believe everyone deserves high-tier
                                financial consulting, and AI is the key to making that accessible to all.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/30">
                                <div className="text-2xl font-black text-teal-400">100%</div>
                                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Privacy Focused</div>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/30">
                                <div className="text-2xl font-black text-purple-400">24/7</div>
                                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">AI Assistance</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-teal-600 to-blue-600 p-12 rounded-[2.5rem] text-center space-y-6 shadow-2xl shadow-teal-500/20">
                <h2 className="text-3xl font-black text-white">Take Control of Your Future.</h2>
                <p className="text-teal-100 max-w-xl mx-auto">
                    Start logging your expenses today and watch your savings grow with the power of AI.
                </p>
                <div className="pt-4 italic text-white/80 font-medium">
                    "The journey to wealth starts with a single tracked expense."
                </div>
            </div>
        </div>
    );
};

export default About;
