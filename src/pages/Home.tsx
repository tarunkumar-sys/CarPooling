import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, PlusCircle, Shield, MapPin, IndianRupee, Users, TrendingUp, Clock, Star, CheckCircle, ArrowRight, Zap, Heart } from 'lucide-react';

export const Home = () => (
    <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-orange-50 via-white to-blue-50 overflow-hidden pt-16">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03]">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgb(249 115 22) 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }} />
            </div>
            
            {/* Floating Elements */}
            <motion.div
                animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-20 right-10 w-20 h-20 bg-orange-200/30 rounded-full blur-2xl"
            />
            <motion.div
                animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-20 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-2xl"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold mb-6 border border-orange-200"
                        >
                            <Zap className="w-4 h-4" />
                            <span>Agra's #1 Carpool Network</span>
                        </motion.span>
                        
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-[1.1]">
                            Travel Together,
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-500 mt-2">
                                Save Together.
                            </span>
                        </h1>
                        
                        <p className="text-lg text-gray-600 mb-6 leading-relaxed max-w-xl">
                            Join the future of commuting in Agra. Share rides, split costs, and make your daily travel sustainable and affordable.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <Link to="/search" className="group btn-primary text-lg px-8 py-4 flex items-center justify-center space-x-2 shadow-lg shadow-orange-200/50">
                                <Search className="w-5 h-5" />
                                <span>Find a Ride</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/offer" className="btn-outline text-lg px-8 py-4 flex items-center justify-center space-x-2">
                                <PlusCircle className="w-5 h-5" />
                                <span>Offer a Ride</span>
                            </Link>
                        </div>

                    </motion.div>

                    {/* Right Visual */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative hidden lg:block"
                    >
                        <div className="relative">
                            {/* Main Card */}
                            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                                <div className="flex items-center space-x-4 mb-6">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-bold">
                                        A
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 text-lg">Agra → Delhi</div>
                                        <div className="text-sm text-gray-500">Today, 8:00 AM</div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                        <span className="text-gray-600">Price per seat</span>
                                        <span className="text-2xl font-bold text-orange-600">₹150</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                                        <span className="text-gray-600">Available seats</span>
                                        <span className="text-lg font-bold text-green-600">3 seats</span>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Badge 1 */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 border border-gray-100"
                            >
                                <div className="flex items-center space-x-2">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span className="font-semibold text-gray-900">Verified</span>
                                </div>
                            </motion.div>

                            {/* Floating Badge 2 */}
                            <motion.div
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute -bottom-4 -left-4 bg-orange-600 rounded-2xl shadow-xl p-4 text-white"
                            >
                                <div className="flex items-center space-x-2">
                                    <Star className="w-5 h-5 fill-white" />
                                    <span className="font-bold text-lg">4.9</span>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="text-orange-600 font-semibold text-sm uppercase tracking-wider">Features</span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-4 mb-4">Why choose AgraRide?</h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Built specifically for Agra's commuters with industry-leading safety and convenience features.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        { 
                            icon: Shield, 
                            title: "Verified Profiles", 
                            desc: "Every user undergoes rigorous verification. Travel with confidence knowing your co-passengers are authenticated.", 
                            color: "from-orange-500 to-orange-600",
                            bgColor: "bg-orange-50"
                        },
                        { 
                            icon: MapPin, 
                            title: "Live GPS Tracking", 
                            desc: "Real-time location sharing with family. Track your ride from pickup to destination with precision.", 
                            color: "from-green-500 to-green-600",
                            bgColor: "bg-green-50"
                        },
                        { 
                            icon: IndianRupee, 
                            title: "Save Up to 70%", 
                            desc: "Split fuel costs fairly. Save money on every commute while reducing your carbon footprint.", 
                            color: "from-blue-500 to-blue-600",
                            bgColor: "bg-blue-50"
                        },
                        { 
                            icon: Users, 
                            title: "Community Driven", 
                            desc: "Join a trusted network of 5000+ verified commuters. Rate and review after every ride.", 
                            color: "from-purple-500 to-purple-600",
                            bgColor: "bg-purple-50"
                        },
                        { 
                            icon: Clock, 
                            title: "Flexible Scheduling", 
                            desc: "Book rides that match your schedule. Instant booking or plan ahead for regular commutes.", 
                            color: "from-pink-500 to-pink-600",
                            bgColor: "bg-pink-50"
                        },
                        { 
                            icon: Heart, 
                            title: "Eco-Friendly", 
                            desc: "Reduce traffic congestion and emissions. Every shared ride makes Agra greener.", 
                            color: "from-teal-500 to-teal-600",
                            bgColor: "bg-teal-50"
                        }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -8, transition: { duration: 0.2 } }}
                            className="group relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300"
                        >
                            <div className={`${feature.bgColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="text-orange-600 font-semibold text-sm uppercase tracking-wider">Process</span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-4 mb-4">How it works</h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Get started in three simple steps. It's fast, easy, and secure.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8 relative">
                    {/* Connection Lines */}
                    <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-200 via-orange-300 to-orange-200" style={{ width: '66%', left: '17%' }} />
                    
                    {[
                        { 
                            step: "01", 
                            title: "Create Profile", 
                            desc: "Sign up in seconds. Verify your identity and add your vehicle details if you're offering rides.",
                            icon: Users
                        },
                        { 
                            step: "02", 
                            title: "Find or Offer", 
                            desc: "Search for rides going your way or offer your empty seats to fellow commuters.",
                            icon: Search
                        },
                        { 
                            step: "03", 
                            title: "Travel Safe", 
                            desc: "Connect with verified users, share your ride, and enjoy a safe, affordable journey.",
                            icon: CheckCircle
                        }
                    ].map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="relative"
                        >
                            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-2xl font-bold mb-6 shadow-lg shadow-orange-200">
                                    {step.step}
                                </div>
                                <step.icon className="w-10 h-10 text-orange-600 mb-4" />
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gradient-to-br from-orange-600 to-orange-500 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }} />
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why carpooling matters</h2>
                    <p className="text-lg text-orange-100 max-w-3xl mx-auto">
                        Join the movement towards sustainable and affordable commuting in Agra.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-4 gap-8">
                    {[
                        { value: "70%", label: "Cost Savings", icon: IndianRupee },
                        { value: "50%", label: "Less Traffic", icon: TrendingUp },
                        { value: "100%", label: "Verified", icon: Shield },
                        { value: "24/7", label: "Available", icon: Clock }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="text-center"
                        >
                            <stat.icon className="w-12 h-12 mx-auto mb-4 text-orange-200" />
                            <div className="text-5xl font-bold mb-2">{stat.value}</div>
                            <div className="text-orange-100 text-lg">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        Ready to start your journey?
                    </h2>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                        Join AgraRide today and experience the future of commuting. Safe, affordable, and sustainable.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/register" className="btn-primary text-lg px-10 py-5 flex items-center justify-center space-x-2 shadow-xl shadow-orange-200/50">
                            <span>Get Started Free</span>
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link to="/search" className="btn-outline text-lg px-10 py-5 flex items-center justify-center space-x-2">
                            <Search className="w-5 h-5" />
                            <span>Browse Rides</span>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    </div>
);
