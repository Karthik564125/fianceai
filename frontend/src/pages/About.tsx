import { motion } from "framer-motion";
import { Target, Shield, Zap, Heart, Star, Layout, Users, BarChart, ExternalLink } from "lucide-react";

const FeatureCard = ({ icon: Icon, title, desc }: any) => (
    <div className="glass-card p-6 rounded-3xl border border-slate-700/50 hover-scale transition-all duration-300 group">
        <div className="p-3 bg-primary/10 rounded-2xl w-fit mb-4 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
            <Icon size={24} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
);

const TimelineItem = ({ year, title, desc }: any) => (
    <div className="flex gap-6 items-start relative pb-12 last:pb-0">
        <div className="absolute top-0 bottom-0 left-[23px] w-px bg-slate-800" />
        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 relative z-10">
            <span className="text-primary text-xs font-black">{year}</span>
        </div>
        <div>
            <h4 className="text-white font-black text-lg mb-1">{title}</h4>
            <p className="text-slate-500 text-sm">{desc}</p>
        </div>
    </div>
);

const About = () => {
    return (
        <div className="max-w-5xl mx-auto pb-24 space-y-16 md:space-y-24 px-4 overflow-x-hidden">
            {/* Hero Section */}
            <section className="text-center pt-10 md:pt-16 relative">
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10" />
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 px-6 py-2 bg-primary/10 rounded-full text-primary text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mb-8 border border-primary/20">
                        <Star size={14} className="fill-primary" /> The Revolution
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tighter">
                        Empowering Personal<br />
                        <span className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient text-transparent bg-clip-text">Financial Freedom</span>
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-medium">
                        SpendWise isn't just a tracker—it's your private financial headquarters.
                        We combine cutting-edge technology with intuitive design to give you
                        total clarity over your money.
                    </p>
                </motion.div>
            </section>

            {/* Core Pillars - Mobile Scroll / Desktop Grid */}
            <section className="space-y-10">
                <div className="text-center">
                    <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter">Core Pillars</h2>
                    <div className="w-20 h-1.5 bg-primary mx-auto mt-4 rounded-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FeatureCard
                        icon={Shield}
                        title="Your Data. Your Privacy."
                        desc="We use secure Firebase infrastructure and end-to-end best practices. No one sees your financial data but you."
                    />
                    <FeatureCard
                        icon={Layout}
                        title="Seamless Experience"
                        desc="Whether you're on iPhone, Android, or Desktop, your finances are perfectly synced and beautiful to look at."
                    />
                    <FeatureCard
                        icon={BarChart}
                        title="Intelligent Insights"
                        desc="Automated budget tracking and visual analytics help you understand your spending habits at a single glance."
                    />
                </div>
            </section>

            {/* The Experience Section */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">Designed for the <span className="text-primary">Modern User</span></h2>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            Personal finance should be empowering, not exhausting. We've removed the clutter
                            of traditional banking apps to focus on what matters most: your growth.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {[
                            { icon: Zap, text: "Instant entry with smart categories" },
                            { icon: Target, text: "Goal-based monthly budgeting" },
                            { icon: Users, text: "Built for families and individuals alike" }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800/50">
                                <item.icon className="text-primary" size={20} />
                                <span className="text-slate-200 font-bold">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card p-10 rounded-[3rem] border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent relative group">
                    <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full scale-75 group-hover:scale-110 transition-transform duration-1000" />
                    <div className="relative space-y-8">
                        <TimelineItem
                            year="V1"
                            title="The Foundation"
                            desc="Launched core expense and income tracking with real-time sync."
                        />
                        <TimelineItem
                            year="V2"
                            title="The Intelligence"
                            desc="Integrated deep analytics and interactive spending charts."
                        />
                        <TimelineItem
                            year="V3"
                            title="The Ecosystem"
                            desc="Custom budgets, profile upgrades, and mobile-first navigation."
                        />
                    </div>
                </div>
            </section>

            {/* Global Stats - Extra Impact */}
            <section className="glass-card p-12 rounded-[3.5rem] border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left bg-slate-950/50">
                <div className="max-w-md">
                    <h2 className="text-3xl font-black text-white leading-tight mb-4">Trusted Infrastructure</h2>
                    <p className="text-slate-500">Built on top of Google's Cloud platform to ensure your financial cockpit is always available.</p>
                </div>
                <div className="grid grid-cols-2 gap-8 md:flex md:gap-16">
                    <div>
                        <p className="text-5xl font-black text-white">99<span className="text-primary">.9</span></p>
                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-2">Uptime (%)</p>
                    </div>
                    <div>
                        <p className="text-5xl font-black text-white">256<span className="text-primary">b</span></p>
                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-2">Encryption</p>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="text-center py-20 relative">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
                <div className="inline-flex items-center gap-3 p-2 px-4 rounded-2xl bg-slate-900 border border-slate-800 mb-8">
                    <Heart size={20} className="text-red-500 fill-red-500 animate-pulse" />
                    <span className="text-white font-black text-sm uppercase tracking-tighter">Your Financial Journey Starts Here</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white mb-10">Stop guessing. Start growing.</h2>
                <div className="flex flex-col items-center gap-6">
                    <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">Designed & Developed by</p>
                    <a
                        href="https://karthik-portfolio-blond.vercel.app/"
                        target="_blank"
                        rel="noreferrer"
                        className="group relative"
                    >
                        {/* Glow Background */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-20 group-hover:opacity-60 transition duration-500"></div>

                        <div className="relative flex items-center gap-4 bg-slate-950 border border-slate-800 px-8 py-4 rounded-2xl transition-all duration-300 group-hover:border-primary/50 group-active:scale-95 shadow-2xl">
                            <div className="flex flex-col items-start">
                                <span className="text-white font-black text-2xl tracking-tighter group-hover:text-primary transition-colors">Karthik</span>
                                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Visit Portfolio</span>
                            </div>
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                <ExternalLink size={20} />
                            </div>
                        </div>
                    </a>
                </div>
            </section>
        </div>
    );
};

export default About;
