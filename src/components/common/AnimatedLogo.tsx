import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Car, Navigation } from 'lucide-react';

export const AnimatedLogo = () => (
    <Link to="/" className="flex items-center gap-4 group">
        <div className="relative w-14 h-14 flex items-center justify-center">
            {/* Dynamic Background Pulse */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.1, 0.3]
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl"
            />

            {/* Main Icon Container */}
            <div className="relative overflow-hidden bg-primary/10 w-full h-full rounded-2xl border border-primary/20 flex items-center justify-center shadow-lg group-hover:bg-primary/20 transition-colors">

                {/* Animated Road Micro-Lines */}
                <div className="absolute inset-x-0 bottom-3 h-[2px] overflow-hidden opacity-30">
                    <motion.div
                        animate={{ x: [-40, 40] }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-10 h-full bg-primary/40 rounded-full"
                    />
                </div>

                {/* The Driving Car */}
                <motion.div
                    animate={{
                        x: [-3, 3, -3],
                        y: [-1, 1, -1],
                        rotate: [0, -2, 2, 0]
                    }}
                    transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="relative z-10"
                >
                    <Car className="text-primary w-7 h-7" strokeWidth={2.5} />

                    {/* Speed Lines */}
                    <motion.div
                        initial={{ opacity: 0, x: 0 }}
                        animate={{
                            opacity: [0, 1, 0],
                            x: [-10, -20]
                        }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                        className="absolute -left-2 top-2 w-3 h-[2px] bg-primary/40 rounded-full"
                    />
                    <motion.div
                        initial={{ opacity: 0, x: 0 }}
                        animate={{
                            opacity: [0, 1, 0],
                            x: [-12, -22]
                        }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: 0.4 }}
                        className="absolute -left-1 top-4 w-2 h-[2px] bg-primary/40 rounded-full"
                    />
                </motion.div>

                {/* Sparkle/Pointer during hover */}
                <motion.div
                    animate={{
                        scale: [0, 1.2, 0],
                        opacity: [0, 0.8, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-2 right-2"
                >
                    <Navigation className="w-2.5 h-2.5 text-primary fill-primary rotate-45" />
                </motion.div>
            </div>
        </div>

        <div className="flex flex-col">
            <div className="flex items-center gap-1">
                <span className="font-display font-black text-2xl tracking-tighter leading-none group-hover:translate-x-0.5 transition-transform duration-300">
                    Agra<span className="text-primary">Ride</span>
                </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-primary transition-colors leading-none">
                    Carpool
                </span>
                <div className="w-1 h-1 rounded-full bg-slate-200 group-hover:bg-primary transition-colors" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-primary transition-colors leading-none">
                    Agra
                </span>
            </div>
        </div>
    </Link>
);
