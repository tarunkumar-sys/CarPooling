/**
 * ============================================
 * VEHICLE LICENSE PLATE RECOGNITION SYSTEM
 * ============================================
 * 
 * Production-ready browser-based ALPR system
 * 
 * FEATURES:
 * - OpenCV.js for plate detection and preprocessing
 * - Tesseract.js for OCR
 * - Indian license plate validation
 * - Auto-fill form with structured data
 * - High accuracy with multiple preprocessing strategies
 * 
 * ARCHITECTURE:
 * - Modular design with separated concerns
 * - Async processing with proper error handling
 * - Debounced operations for performance
 * - Zero console logs in production
 * 
 * @component
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload, Loader2, CheckCircle, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Import modules
import { detectLicensePlate, preprocessPlateImage } from './modules/OpenCVDetection';
import { performOCR } from './modules/TesseractOCR';
import { validateIndianPlate, extractPlateInfo } from './modules/PlateValidator';
import type { PlateDetectionResult, OCRResult, VehicleInfo } from './types';

interface VehiclePlateRecognitionProps {
    onVehicleDetected: (info: VehicleInfo) => void;
    onVerificationStatus?: (isVerified: boolean) => void;
}

export const VehiclePlateRecognition: React.FC<VehiclePlateRecognitionProps> = ({
    onVehicleDetected,
    onVerificationStatus
}) => {
    // State management
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [detectedPlate, setDetectedPlate] = useState<PlateDetectionResult | null>(null);
    const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
    const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [manualPlate, setManualPlate] = useState<string>('');
    const [showManualInput, setShowManualInput] = useState(false);
    const [processingStage, setProcessingStage] = useState<string>('');

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    /**
     * Main image processing pipeline
     */
    const processImage = useCallback(async (file: File) => {
        // Clear previous timeout
        if (processingTimeoutRef.current) {
            clearTimeout(processingTimeoutRef.current);
        }

        setIsProcessing(true);
        setError(null);
        setDetectedPlate(null);
        setOcrResult(null);
        setVehicleInfo(null);
        setShowManualInput(false);
        setManualPlate('');

        try {
            // Validate file
            if (!file.type.startsWith('image/')) {
                throw new Error('Please select a valid image file');
            }
            if (file.size > 10 * 1024 * 1024) {
                throw new Error('Image size should be less than 10MB');
            }

            // Read image file
            const reader = new FileReader();
            reader.onload = async (e) => {
                const imageData = e.target?.result as string;
                if (!imageData) {
                    throw new Error('Failed to read image file');
                }

                setPreviewImage(imageData);

                // Load image
                const img = new Image();
                img.onload = async () => {
                    try {
                        // STAGE 1: Detect License Plate
                        setProcessingStage('Detecting license plate...');
                        const detection = await detectLicensePlate(img);

                        if (!detection.success || !detection.plateRegion) {
                            throw new Error('No license plate detected. Please ensure the plate is clearly visible.');
                        }

                        setDetectedPlate(detection);

                        // STAGE 2: Preprocess Plate Image
                        setProcessingStage('Preprocessing plate image...');
                        const preprocessed = await preprocessPlateImage(detection.plateRegion);

                        // STAGE 3: Perform OCR
                        setProcessingStage('Reading plate number...');
                        const ocr = await performOCR(preprocessed);

                        if (!ocr.success || !ocr.text) {
                            throw new Error('Could not read plate number. Please try a clearer image.');
                        }

                        setOcrResult(ocr);

                        // STAGE 4: Validate and Extract Info
                        setProcessingStage('Validating plate format...');
                        const isValid = validateIndianPlate(ocr.text);
                        const info = extractPlateInfo(ocr.text);

                        setVehicleInfo(info);

                        // STAGE 5: Auto-fill form
                        onVehicleDetected(info);
                        onVerificationStatus?.(isValid);

                        // Show manual input if confidence is low or invalid
                        if (ocr.confidence < 70 || !isValid) {
                            setManualPlate(ocr.text);
                            setShowManualInput(true);
                        }

                        setProcessingStage('');
                    } catch (err) {
                        const errorMsg = (err as Error).message || 'Processing failed';
                        setError(errorMsg);
                        onVerificationStatus?.(false);
                        setProcessingStage('');
                    } finally {
                        setIsProcessing(false);
                    }
                };

                img.onerror = () => {
                    setError('Failed to load image');
                    setIsProcessing(false);
                    setProcessingStage('');
                    onVerificationStatus?.(false);
                };

                img.src = imageData;
            };

            reader.onerror = () => {
                setError('Failed to read file');
                setIsProcessing(false);
                setProcessingStage('');
                onVerificationStatus?.(false);
            };

            reader.readAsDataURL(file);
        } catch (e) {
            setError((e as Error).message || 'Failed to process image');
            setIsProcessing(false);
            setProcessingStage('');
            onVerificationStatus?.(false);
        }
    }, [onVehicleDetected, onVerificationStatus]);

    /**
     * Handle file selection
     */
    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processImage(file);
        }
    }, [processImage]);

    /**
     * Handle reset
     */
    const handleReset = useCallback(() => {
        setPreviewImage(null);
        setDetectedPlate(null);
        setOcrResult(null);
        setVehicleInfo(null);
        setError(null);
        setManualPlate('');
        setShowManualInput(false);
        setProcessingStage('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    /**
     * Handle manual confirmation
     */
    const handleManualConfirm = useCallback(() => {
        const cleaned = manualPlate.toUpperCase().replace(/[^A-Z0-9]/g, '');
        const isValid = validateIndianPlate(cleaned);
        const info = extractPlateInfo(cleaned);

        setVehicleInfo(info);
        onVehicleDetected(info);
        onVerificationStatus?.(isValid);
        setShowManualInput(false);
    }, [manualPlate, onVehicleDetected, onVerificationStatus]);

    /**
     * Cleanup on unmount
     */
    useEffect(() => {
        return () => {
            if (processingTimeoutRef.current) {
                clearTimeout(processingTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <AnimatePresence mode="wait">
                {!previewImage ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="flex flex-col items-center space-y-3">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                <Camera className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">
                                    Upload vehicle image
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Take a clear photo of the license plate
                                </p>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-400">
                                <Upload className="w-4 h-4" />
                                <span>Supports: JPG, PNG (max 10MB)</span>
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative"
                    >
                        <div className="relative rounded-xl overflow-hidden border border-gray-200">
                            <img
                                src={previewImage}
                                alt="Vehicle preview"
                                className="w-full h-64 object-cover"
                            />
                            {isProcessing && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <div className="text-center">
                                        <Loader2 className="w-10 h-10 text-white animate-spin mx-auto mb-3" />
                                        <p className="text-white text-sm font-medium">{processingStage}</p>
                                        <p className="text-white/70 text-xs mt-1">Please wait...</p>
                                    </div>
                                </div>
                            )}
                            {detectedPlate?.plateRegion && !isProcessing && (
                                <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Plate Detected
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleReset}
                            className="absolute top-2 left-2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
                            title="Retake photo"
                        >
                            <RefreshCw className="w-4 h-4 text-gray-600" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Detected Plate Preview */}
            <AnimatePresence>
                {detectedPlate?.plateRegion && !isProcessing && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-xl p-4 border border-blue-200 bg-blue-50"
                    >
                        <p className="text-sm font-semibold text-blue-900 mb-2">Detected License Plate</p>
                        <img
                            src={detectedPlate.plateRegion.toDataURL()}
                            alt="Detected plate"
                            className="w-full max-w-xs mx-auto rounded-lg border-2 border-blue-300"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* OCR Results */}
            <AnimatePresence>
                {vehicleInfo && !isProcessing && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-xl p-4 border"
                        style={{
                            backgroundColor: vehicleInfo.isValid ? '#f0fdf4' : '#fef3c7',
                            borderColor: vehicleInfo.isValid ? '#86efac' : '#fcd34d'
                        }}
                    >
                        <div className="flex items-start space-x-3">
                            {vehicleInfo.isValid ? (
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                                <p className="text-sm font-semibold" style={{ color: vehicleInfo.isValid ? '#166534' : '#92400e' }}>
                                    {vehicleInfo.isValid ? 'Vehicle Detected' : 'Partial Detection'}
                                </p>
                                <div className="mt-2 space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-xs font-medium opacity-75">Vehicle Number:</span>
                                        <span className="text-sm font-bold">{vehicleInfo.plateNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs font-medium opacity-75">Country:</span>
                                        <span className="text-sm font-semibold">{vehicleInfo.country}</span>
                                    </div>
                                    {vehicleInfo.state && (
                                        <div className="flex justify-between">
                                            <span className="text-xs font-medium opacity-75">State:</span>
                                            <span className="text-sm font-semibold">{vehicleInfo.state}</span>
                                        </div>
                                    )}
                                    {ocrResult && (
                                        <div className="flex justify-between">
                                            <span className="text-xs font-medium opacity-75">Confidence:</span>
                                            <span className="text-sm font-semibold">{ocrResult.confidence.toFixed(1)}%</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Manual Override */}
            <AnimatePresence>
                {showManualInput && !isProcessing && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-xl p-4 border border-blue-200 bg-blue-50"
                    >
                        <p className="text-sm font-medium text-blue-800 mb-2">Verify Plate Number</p>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={manualPlate}
                                onChange={(e) => setManualPlate(e.target.value.toUpperCase())}
                                className="flex-1 px-3 py-2 border border-blue-300 rounded-lg font-mono uppercase tracking-widest text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                maxLength={13}
                                placeholder="DL01AB1234"
                            />
                            <button
                                onClick={handleManualConfirm}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                                Confirm
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Display */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-xl p-4 bg-red-50 border border-red-200"
                    >
                        <div className="flex items-center space-x-2">
                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hidden canvas for processing */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export default VehiclePlateRecognition;
