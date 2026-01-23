import { motion } from "framer-motion";
import { Info, Target, Shield, Zap, Heart } from "lucide-react";

const FeatureCard = ({ icon: Icon, title, desc }: any) => (
    <div className="glass-card p-6 rounded-3xl border border-slate-700/50 hover-scale transition-all duration-300">
        <div className="p-3 bg-primary/10 rounded-2xl w-fit mb-4 text-primary">
            <Icon size={24} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
);

const About = () => {
    return (
        <div className="max-w-4xl mx-auto pb-20 space-y-16">
            {/* Hero Section */}
            <section className="text-center pt-10 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-xs font-black uppercase tracking-widest mb-6">
                        <Zap size={14} /> Mission Control
                    </div>
                    <h1 className="text-5xl font-black text-white mb-6 leading-tight">
                        Master Your Money with <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">AI Intelligence</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                        FinanceAI is built for the modern era—simple, powerful, and driven by insights that help you build real wealth without the headache.
                    </p>
                </motion.div>
            </section>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                <FeatureCard
                    icon={Shield}
                    title="Military-Grade Security"
                    desc="Your data is encrypted and protected by Firebase Shield, ensuring your financial secrets stay yours."
                />
                <FeatureCard
                    icon={Target}
                    title="Precision Tracking"
                    desc="Track every rupee with granular categories and real-time updates across all your devices."
                />
            </div>

            {/* Our Vision */}
            <section className="glass-card p-10 rounded-[2.5rem] border border-primary/20 bg-gradient-to-br from-slate-900/50 to-primary/5 relative overflow-hidden">
                <div className="absolute bottom-0 right-0 p-10 opacity-5">
                    <Heart size={200} className="text-primary" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                            <Info size={20} />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Our Vision</h2>
                    </div>
                    <p className="text-slate-300 text-lg leading-relaxed mb-8">
                        We believe that financial literacy is a fundamental right. Our goal is to provide the tools
                        and AI-driven insights that make managing money as easy as sending a text.
                    </p>
                    <div className="flex flex-wrap gap-8 pt-8 border-t border-slate-700/50">
                        <div>
                            <p className="text-primary font-black text-3xl">99%</p>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Uptime</p>
                        </div>
                        <div>
                            <p className="text-accent font-black text-3xl">Gemini</p>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Core Intelligence</p>
                        </div>
                        <div>
                            <p className="text-emerald-400 font-black text-3xl">Firebase</p>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Auth & Data</p>
                        </div>

                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="text-center py-10">
                <h2 className="text-2xl font-bold text-white mb-6">Built for the future of finance.</h2>
                <div className="flex items-center justify-center gap-2 text-slate-500 text-sm font-medium">
                    <Heart size={16} className="text-red-500" /> Made by FinanceAI Team
                </div>
            </section>
        </div>
    );
};

export default About;
