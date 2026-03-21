/**
 * ============================================
 * IMAGE UPLOAD DEMO COMPONENT
 * ============================================
 * 
 * Demonstrates all features of the smart image upload system
 * Can be used for testing and showcasing capabilities
 * 
 * @component
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Camera, CheckCircle, XCircle, AlertTriangle, Zap, Shield, Crop, Sparkles } from 'lucide-react';
import { ProfileImageUploader } from './ProfileImageUploader';

export const ImageUploadDemo = () => {
    const [demoImage, setDemoImage] = useState<string>('');
    const [features] = useState([
        {
            icon: Zap,
            title: 'Smart Compression',
            description: 'Automatically compresses images to < 1MB while maintaining quality',
            color: 'text-yellow-600',
            bg: 'bg-yellow-100'
        },
        {
            icon: Sparkles,
            title: 'Face Detection',
            description: 'AI-powered face detection with auto-crop and centering',
            color: 'text-blue-600',
            bg: 'bg-blue-100'
        },
        {
            icon: Shield,
            title: 'NSFW Filter',
            description: 'Blocks inappropriate content using TensorFlow.js',
            color: 'text-red-600',
            bg: 'bg-red-100'
        },
        {
            icon: AlertTriangle,
            title: 'Blur Detection',
            description: 'Detects and rejects blurry images automatically',
            color: 'text-orange-600',
            bg: 'bg-orange-100'
        },
        {
            icon: Crop,
            title: 'Manual Crop',
            description: 'Adjust crop manually with zoom and drag controls',
            color: 'text-green-600',
            bg: 'bg-green-100'
        },
        {
            icon: Camera,
            title: 'Drag & Drop',
            description: 'Easy upload with drag & drop or click to browse',
            color: 'text-purple-600',
            bg: 'bg-purple-100'
        }
    ]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4"
                    >
                        <Sparkles className="w-4 h-4" />
                        AI-Powered Image Processing
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
                    >
                        Smart Profile Image Upload
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-gray-600 max-w-2xl mx-auto"
                    >
                        Upload your profile photo with automatic face detection, blur detection, 
                        NSFW filtering, and smart cropping - all processed in your browser!
                    </motion.p>
                </div>

                {/* Demo Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-12"
                >
                    <div className="flex flex-col items-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Try It Now</h2>
                        <p className="text-gray-600 mb-8 text-center">
                            Upload a photo to see the AI processing in action
                        </p>
                        
                        <ProfileImageUploader
                            currentImage={demoImage}
                            onImageUpdate={setDemoImage}
                            userName="Demo User"
                        />

                        {demoImage && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-8 flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg"
                            >
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-medium">Image processed successfully!</span>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                        >
                            <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}>
                                <feature.icon className={`w-6 h-6 ${feature.color}`} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                            <p className="text-gray-600 text-sm">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Technical Details */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white"
                >
                    <h2 className="text-3xl font-bold mb-6">How It Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                Processing Pipeline
                            </h3>
                            <ul className="space-y-3 text-blue-100">
                                <li className="flex items-start gap-2">
                                    <span className="text-white font-bold">1.</span>
                                    <span>Validate file type and size</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-white font-bold">2.</span>
                                    <span>Compress image using Web Workers</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-white font-bold">3.</span>
                                    <span>Detect blur using Laplacian variance</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-white font-bold">4.</span>
                                    <span>Check for inappropriate content (NSFW)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-white font-bold">5.</span>
                                    <span>Detect face with BlazeFace AI</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-white font-bold">6.</span>
                                    <span>Auto-crop and center face</span>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                Privacy & Security
                            </h3>
                            <ul className="space-y-3 text-blue-100">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-300" />
                                    <span>All processing happens in your browser</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-300" />
                                    <span>No images sent to external servers</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-300" />
                                    <span>AI models run locally with TensorFlow.js</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-300" />
                                    <span>Automatic content filtering for safety</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
