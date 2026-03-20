import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Tesseract, { PSM, OEM } from 'tesseract.js';
import cv from '@techstark/opencv-js';

interface LicensePlateOCRProps {
    onPlateDetected: (plateNumber: string) => void;
    onVerificationStatus?: (isVerified: boolean) => void;
}

interface OCRResult {
    plateNumber: string;
    confidence: number;
    isValid: boolean;
}

interface PlateCandidate {
    text: string;
    confidence: number;
}

// Module-level Tesseract worker singleton
let tesseractWorker: Tesseract.Worker | null = null;
let workerInitializing = false;
let workerInitPromise: Promise<Tesseract.Worker> | null = null;

const getTesseractWorker = async (): Promise<Tesseract.Worker> => {
    if (tesseractWorker) {
        return tesseractWorker;
    }
    
    if (workerInitializing && workerInitPromise) {
        return workerInitPromise;
    }
    
    workerInitializing = true;
    workerInitPromise = Tesseract.createWorker('eng', OEM.LSTM_ONLY, {
        logger: () => {},
        errorHandler: () => {},
    }).then(worker => {
        tesseractWorker = worker;
        workerInitializing = false;
        return worker;
    }).catch(err => {
        workerInitializing = false;
        throw err;
    });
    
    return workerInitPromise;
};

// Safely delete OpenCV objects if they exist
const safeDelete = (obj: cv.Mat | cv.CLAHE | cv.MatVector | null | undefined) => {
    if (obj && typeof obj.delete === 'function') {
        try {
            obj.delete();
        } catch (e) {
            // Ignore deletion errors
        }
    }
};

export const LicensePlateOCR = ({ onPlateDetected, onVerificationStatus }: LicensePlateOCRProps) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [result, setResult] = useState<OCRResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [manualPlate, setManualPlate] = useState<string>('');
    const [showManualInput, setShowManualInput] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Indian license plate regex patterns
    const INDIAN_PLATE_PATTERNS = [
        /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/,     // Standard: UP80AB1234
        /^[A-Z]{2}\s\d{2}\s[A-Z]{1,2}\s\d{4}$/, // With spaces: UP 80 AB 1234
        /^[A-Z]{2}\d{2}[A-Z]\d{4}$/,          // Old format: UP80A1234
        /^[A-Z]{2}\d{2}\d{4}$/,               // Very old: UP801234
    ];

    const validateIndianPlate = (text: string): boolean => {
        const cleaned = text.toUpperCase().replace(/\s+/g, '');
        return INDIAN_PLATE_PATTERNS.some(pattern => pattern.test(cleaned));
    };

    // Step 1: Resize image to normalize input
    const resizeImage = useCallback((canvas: HTMLCanvasElement, maxDim: number = 1200): HTMLCanvasElement => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return canvas;

        const width = canvas.width;
        const height = canvas.height;
        const longestEdge = Math.max(width, height);

        if (longestEdge <= maxDim) {
            return canvas;
        }

        const scale = maxDim / longestEdge;
        const newWidth = Math.round(width * scale);
        const newHeight = Math.round(height * scale);

        const newCanvas = document.createElement('canvas');
        newCanvas.width = newWidth;
        newCanvas.height = newHeight;
        const newCtx = newCanvas.getContext('2d');
        
        if (newCtx) {
            newCtx.imageSmoothingEnabled = true;
            newCtx.imageSmoothingQuality = 'high';
            newCtx.drawImage(canvas, 0, 0, newWidth, newHeight);
        }

        return newCanvas;
    }, []);

    // Step 2: Multi-strategy preprocessing
    const preprocessStrategyA = useCallback((src: cv.Mat): cv.Mat => {
        // Strategy A: Clean plates - grayscale → bilateralFilter → OTSU threshold → morphological close
        const gray = new cv.Mat();
        const filtered = new cv.Mat();
        const thresh = new cv.Mat();
        const closed = new cv.Mat();
        
        try {
            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
            cv.bilateralFilter(gray, filtered, 9, 75, 75);
            cv.threshold(filtered, thresh, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);
            
            const kernel = cv.Mat.ones(3, 3, cv.CV_8U);
            cv.morphologyEx(thresh, closed, cv.MORPH_CLOSE, kernel);
            kernel.delete();
        } finally {
            safeDelete(gray);
            safeDelete(filtered);
            safeDelete(thresh);
        }

        return closed;
    }, []);

    const preprocessStrategyB = useCallback((src: cv.Mat): cv.Mat => {
        // Strategy B: Shadows/uneven lighting - grayscale → CLAHE → adaptiveThreshold → morphological open
        const gray = new cv.Mat();
        const enhanced = new cv.Mat();
        const thresh = new cv.Mat();
        const opened = new cv.Mat();
        let clahe: cv.CLAHE | null = null;
        
        try {
            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
            clahe = new cv.CLAHE(3, new cv.Size(8, 8));
            clahe.apply(gray, enhanced);
            cv.adaptiveThreshold(enhanced, thresh, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 15, 4);
            
            const kernel = cv.Mat.ones(2, 2, cv.CV_8U);
            cv.morphologyEx(thresh, opened, cv.MORPH_OPEN, kernel);
            kernel.delete();
        } finally {
            safeDelete(gray);
            safeDelete(enhanced);
            safeDelete(thresh);
            safeDelete(clahe);
        }

        return opened;
    }, []);

    const preprocessStrategyC = useCallback((src: cv.Mat): cv.Mat => {
        // Strategy C: Blur/distance - grayscale → sharpen → bilateralFilter → OTSU threshold
        const gray = new cv.Mat();
        const sharpened = new cv.Mat();
        const filtered = new cv.Mat();
        const thresh = new cv.Mat();
        let sharpenKernel: cv.Mat | null = null;
        
        try {
            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
            
            sharpenKernel = cv.matFromArray(3, 3, cv.CV_32F, [-1, -1, -1, -1, 9, -1, -1, -1, -1]);
            cv.filter2D(gray, sharpened, -1, sharpenKernel);
            cv.bilateralFilter(sharpened, filtered, 9, 75, 75);
            cv.threshold(filtered, thresh, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);
        } finally {
            safeDelete(gray);
            safeDelete(sharpened);
            safeDelete(filtered);
            safeDelete(sharpenKernel);
        }

        return thresh;
    }, []);

    const preprocessStrategyD = useCallback((src: cv.Mat): cv.Mat => {
        // Strategy D: Color-based - RGB → HSV → mask for white OR yellow regions
        const rgb = new cv.Mat();
        const hsv = new cv.Mat();
        const whiteMask = new cv.Mat();
        const yellowMask = new cv.Mat();
        const combinedMask = new cv.Mat();
        const dilatedMask = new cv.Mat();
        const gray = new cv.Mat();
        const result = new cv.Mat();
        const dilatedResult = new cv.Mat();
        
        try {
            // Convert RGBA to RGB first, then to HSV
            cv.cvtColor(src, rgb, cv.COLOR_RGBA2RGB);
            cv.cvtColor(rgb, hsv, cv.COLOR_RGB2HSV);

            // White regions: S < 40, V > 180 (using 4-element arrays with CV_8UC4)
            const whiteLower = new cv.Mat(hsv.rows, hsv.cols, cv.CV_8UC4, [0, 0, 180, 0]);
            const whiteUpper = new cv.Mat(hsv.rows, hsv.cols, cv.CV_8UC4, [180, 40, 255, 255]);
            cv.inRange(hsv, whiteLower, whiteUpper, whiteMask);
            safeDelete(whiteLower);
            safeDelete(whiteUpper);

            // Yellow regions: H 20-35, S > 100, V > 100
            const yellowLower = new cv.Mat(hsv.rows, hsv.cols, cv.CV_8UC4, [20, 100, 100, 0]);
            const yellowUpper = new cv.Mat(hsv.rows, hsv.cols, cv.CV_8UC4, [35, 255, 255, 255]);
            cv.inRange(hsv, yellowLower, yellowUpper, yellowMask);
            safeDelete(yellowLower);
            safeDelete(yellowUpper);

            // Combine masks
            cv.bitwise_or(whiteMask, yellowMask, combinedMask);

            // Dilate mask to connect plate regions
            const kernel = cv.Mat.ones(5, 5, cv.CV_8U);
            cv.dilate(combinedMask, dilatedMask, kernel);
            kernel.delete();

            // Apply mask to original grayscale
            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
            cv.bitwise_and(gray, gray, result, dilatedMask);

            // Additional dilation for OCR optimization
            const dilateKernel = cv.Mat.ones(2, 2, cv.CV_8U);
            cv.dilate(result, dilatedResult, dilateKernel);
            dilateKernel.delete();
        } catch (err) {
            console.error('Strategy D error:', err);
            // Return grayscale fallback on error
            safeDelete(rgb);
            safeDelete(hsv);
            safeDelete(whiteMask);
            safeDelete(yellowMask);
            safeDelete(combinedMask);
            safeDelete(dilatedMask);
            safeDelete(result);
            safeDelete(dilatedResult);
            const fallback = new cv.Mat();
            cv.cvtColor(src, fallback, cv.COLOR_RGBA2GRAY);
            return fallback;
        } finally {
            safeDelete(rgb);
            safeDelete(hsv);
            safeDelete(whiteMask);
            safeDelete(yellowMask);
            safeDelete(combinedMask);
            safeDelete(dilatedMask);
            safeDelete(gray);
            safeDelete(result);
        }

        return dilatedResult;
    }, []);

    const matToCanvas = useCallback((mat: cv.Mat): HTMLCanvasElement => {
        const canvas = document.createElement('canvas');
        canvas.width = mat.cols;
        canvas.height = mat.rows;
        cv.imshow(canvas, mat);
        return canvas;
    }, []);

    // Step 3: Improved plate region detection with scoring
    const detectPlateRegions = useCallback((canvas: HTMLCanvasElement): Array<{ x: number; y: number; width: number; height: number; score: number }> => {
        const src = cv.imread(canvas);
        const gray = new cv.Mat();
        const edges = new cv.Mat();
        const contours = new cv.MatVector();
        const hierarchy = new cv.Mat();
        
        const candidates: Array<{ x: number; y: number; width: number; height: number; score: number }> = [];
        
        try {
            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
            cv.Canny(gray, edges, 50, 150);
            cv.findContours(edges, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

            const imageArea = src.cols * src.rows;

            for (let i = 0; i < contours.size(); i++) {
                const contour = contours.get(i);
                const area = cv.contourArea(contour);
                const rect = cv.boundingRect(contour);
                const aspectRatio = rect.width / rect.height;
                const areaRatio = area / imageArea;

                // Accept candidates where aspectRatio is between 2.0 and 5.5 AND areaRatio is between 0.005 and 0.25
                if (aspectRatio >= 2.0 && aspectRatio <= 5.5 && areaRatio >= 0.005 && areaRatio <= 0.25) {
                    const ratioScore = 1 - Math.abs(aspectRatio - 4.0) / 4.0;
                    const areaScore = Math.min(areaRatio / 0.05, 1.0);
                    const finalScore = ratioScore * 0.6 + areaScore * 0.4;

                    candidates.push({
                        x: rect.x,
                        y: rect.y,
                        width: rect.width,
                        height: rect.height,
                        score: finalScore
                    });
                }
            }
        } finally {
            safeDelete(src);
            safeDelete(gray);
            safeDelete(edges);
            safeDelete(contours);
            safeDelete(hierarchy);
        }

        // Sort by score and return top 3
        return candidates.sort((a, b) => b.score - a.score).slice(0, 3);
    }, []);

    // Step 4: Deskewing using HoughLinesP
    const deskewPlate = useCallback((canvas: HTMLCanvasElement): HTMLCanvasElement => {
        const src = cv.imread(canvas);
        const gray = new cv.Mat();
        const edges = new cv.Mat();
        const lines = new cv.Mat();
        
        try {
            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
            cv.Canny(gray, edges, 50, 150);
            cv.HoughLinesP(edges, lines, 1, Math.PI / 180, 50, 50, 10);

            let totalAngle = 0;
            let lineCount = 0;

            if (lines.rows > 0 && lines.data32S) {
                for (let i = 0; i < lines.rows; i++) {
                    const x1 = lines.data32S[i * 4];
                    const y1 = lines.data32S[i * 4 + 1];
                    const x2 = lines.data32S[i * 4 + 2];
                    const y2 = lines.data32S[i * 4 + 3];
                    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

                    if (Math.abs(angle) < 45) {
                        totalAngle += angle;
                        lineCount++;
                    }
                }
            }

            if (lineCount > 0 && Math.abs(totalAngle / lineCount) > 1) {
                const avgAngle = totalAngle / lineCount;
                const center = new cv.Point(src.cols / 2, src.rows / 2);
                const rotationMatrix = cv.getRotationMatrix2D(center, avgAngle, 1);
                const rotated = new cv.Mat();
                cv.warpAffine(src, rotated, rotationMatrix, new cv.Size(src.cols, src.rows));

                const resultCanvas = matToCanvas(rotated);
                
                safeDelete(rotationMatrix);
                safeDelete(rotated);

                return resultCanvas;
            }
        } finally {
            safeDelete(src);
            safeDelete(gray);
            safeDelete(edges);
            safeDelete(lines);
        }

        return canvas;
    }, [matToCanvas]);

    // Step 5: Tesseract OCR with multiple PSM configs
    const performOCRWithConfigs = useCallback(async (canvas: HTMLCanvasElement): Promise<PlateCandidate[]> => {
        let worker: Tesseract.Worker | null = null;
        const results: PlateCandidate[] = [];

        try {
            worker = await getTesseractWorker();
        } catch (e) {
            console.warn('Failed to initialize Tesseract worker:', e);
            return results;
        }

        let imageData: string;
        try {
            imageData = canvas.toDataURL('image/png');
        } catch (e) {
            console.warn('Failed to convert canvas to data URL:', e);
            return results;
        }

        const configs = [
            { psm: PSM.SINGLE_WORD },
            { psm: PSM.SINGLE_LINE },
            { psm: PSM.RAW_LINE }
        ];

        for (const config of configs) {
            try {
                await worker.setParameters({
                    tessedit_pageseg_mode: config.psm,
                    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
                    preserve_interword_spaces: '0',
                });

                const result = await worker.recognize(imageData);
                const text = result.data.text.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

                if (text.length >= 5) {
                    results.push({
                        text,
                        confidence: result.data.confidence
                    });
                }
            } catch (e) {
                console.warn('OCR config failed:', e);
            }
        }

        return results;
    }, []);

    // Step 6: Post-OCR positional character correction
    const correctPlateCharacters = useCallback((text: string): string => {
        const cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, '');

        if (cleaned.length < 8 || cleaned.length > 10) {
            return cleaned;
        }

        const digitToLetter: Record<string, string> = {
            '0': 'O', '1': 'I', '5': 'S', '8': 'B', '6': 'G', '2': 'Z'
        };

        const letterToDigit: Record<string, string> = {
            'O': '0', 'I': '1', 'S': '5', 'B': '8', 'G': '6', 'Z': '2', 'Q': '0', 'D': '0'
        };

        let corrected = '';

        for (let i = 0; i < cleaned.length; i++) {
            const char = cleaned[i];

            if (i <= 1) {
                // Positions 0-1: must be letters
                corrected += digitToLetter[char] || char;
            } else if (i >= 2 && i <= 3) {
                // Positions 2-3: must be digits
                corrected += letterToDigit[char] || char;
            } else if (i >= cleaned.length - 4) {
                // Last 4 characters: must be digits
                corrected += letterToDigit[char] || char;
            } else {
                // Middle characters (1-2 letters): prefer letters
                corrected += letterToDigit[char] ? digitToLetter[letterToDigit[char]] || char : char;
            }
        }

        return corrected;
    }, []);

    // Step 7: Voting / Consensus
    const selectBestResult = useCallback((candidates: PlateCandidate[]): { text: string; confidence: number } => {
        if (candidates.length === 0) {
            return { text: '', confidence: 0 };
        }

        if (candidates.length === 1) {
            return { text: candidates[0].text, confidence: candidates[0].confidence };
        }

        // Apply positional correction to all candidates
        const correctedCandidates = candidates.map(c => ({
            ...c,
            corrected: correctPlateCharacters(c.text)
        }));

        // Build frequency map
        const frequencyMap: Record<string, number> = {};
        correctedCandidates.forEach(c => {
            frequencyMap[c.corrected] = (frequencyMap[c.corrected] || 0) + 1;
        });

        // Calculate overlap scores
        const calculateOverlap = (str1: string, str2: string): number => {
            const minLen = Math.min(str1.length, str2.length);
            let matches = 0;
            for (let i = 0; i < minLen; i++) {
                if (str1[i] === str2[i]) matches++;
            }
            return matches / minLen;
        };

        const scoredCandidates = correctedCandidates.map(c => {
            let overlapScore = 0;
            correctedCandidates.forEach(other => {
                if (c.corrected !== other.corrected) {
                    overlapScore += calculateOverlap(c.corrected, other.corrected);
                }
            });

            const frequency = frequencyMap[c.corrected] || 1;
            const finalScore = frequency * 2 + overlapScore;

            return {
                text: c.corrected,
                originalConfidence: c.confidence,
                finalScore
            };
        });

        // Sort by final score and pick the best
        scoredCandidates.sort((a, b) => b.finalScore - a.finalScore);
        const best = scoredCandidates[0];

        // Calculate confidence as percentage
        const totalResults = candidates.length;
        const confidence = Math.min(100, (best.finalScore / (totalResults * 2)) * 100);

        return {
            text: best.text,
            confidence
        };
    }, [correctPlateCharacters]);

    // Main processing pipeline with comprehensive error handling
    const processImage = useCallback(async (file: File) => {
        setIsProcessing(true);
        setError(null);
        setResult(null);
        setShowManualInput(false);
        setManualPlate('');

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const imageData = e.target?.result as string;
                if (!imageData) {
                    setError('Failed to read image file');
                    setIsProcessing(false);
                    return;
                }
                
                setPreviewImage(imageData);

                const img = new Image();
                img.onload = async () => {
                    let preprocessedMats: cv.Mat[] = [];
                    
                    try {
                        // Step 1: Draw to canvas and resize to 1200px
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                            ctx.drawImage(img, 0, 0);
                        }
                        const resizedCanvas = resizeImage(canvas, 1200);

                        // Step 2: Run all 4 preprocessing strategies
                        let src: cv.Mat | null = null;
                        try {
                            src = cv.imread(resizedCanvas);
                            preprocessedMats = [
                                preprocessStrategyA(src),
                                preprocessStrategyB(src),
                                preprocessStrategyC(src),
                                preprocessStrategyD(src)
                            ];
                        } finally {
                            safeDelete(src);
                        }

                        const preprocessedCanvases = preprocessedMats.map(mat => matToCanvas(mat));

                        // Step 3 & 4: Detect plate regions, crop with padding, deskew
                        const plateCanvases: HTMLCanvasElement[] = [];

                        for (const procCanvas of preprocessedCanvases) {
                            // Add full canvas as fallback
                            plateCanvases.push(procCanvas);

                            // Detect plate regions
                            const candidates = detectPlateRegions(procCanvas);

                            for (const candidate of candidates) {
                                // Add 15% padding
                                const paddingX = Math.round(candidate.width * 0.15);
                                const paddingY = Math.round(candidate.height * 0.15);
                                const x = Math.max(0, candidate.x - paddingX);
                                const y = Math.max(0, candidate.y - paddingY);
                                const w = Math.min(procCanvas.width - x, candidate.width + 2 * paddingX);
                                const h = Math.min(procCanvas.height - y, candidate.height + 2 * paddingY);

                                // Crop
                                const cropCanvas = document.createElement('canvas');
                                cropCanvas.width = w;
                                cropCanvas.height = h;
                                const cropCtx = cropCanvas.getContext('2d');
                                if (cropCtx) {
                                    cropCtx.drawImage(procCanvas, x, y, w, h, 0, 0, w, h);
                                }

                                // Deskew
                                const deskewedCanvas = deskewPlate(cropCanvas);
                                plateCanvases.push(deskewedCanvas);
                            }
                        }

                        // Step 5: Run Tesseract with all 3 PSM configs on every plate canvas
                        const allOCRResults: PlateCandidate[] = [];

                        for (const plateCanvas of plateCanvases) {
                            const results = await performOCRWithConfigs(plateCanvas);
                            allOCRResults.push(...results);
                        }

                        // Step 6 & 7: Apply correction and voting
                        const bestResult = selectBestResult(allOCRResults);

                        // Step 8: Validate
                        const isValid = validateIndianPlate(bestResult.text);

                        const ocrResult: OCRResult = {
                            plateNumber: bestResult.text,
                            confidence: bestResult.confidence,
                            isValid
                        };

                        setResult(ocrResult);

                        // Step 9: Show manual override if confidence < 60% or not valid
                        if (bestResult.text && (bestResult.confidence < 60 || !isValid)) {
                            setManualPlate(bestResult.text);
                            setShowManualInput(true);
                        }

                        // Step 10: Call callbacks
                        if (bestResult.text) {
                            onPlateDetected(bestResult.text);
                            onVerificationStatus?.(isValid);
                        } else {
                            setError('Could not detect license plate. Please try a clearer photo or enter manually.');
                            onVerificationStatus?.(false);
                        }
                    } catch (err) {
                        const errorMsg = (err as Error).message || 'Unknown processing error';
                        console.error('OCR Processing Error:', err);
                        setError(`Processing failed: ${errorMsg}`);
                        onVerificationStatus?.(false);
                    } finally {
                        // Cleanup preprocessed mats
                        preprocessedMats.forEach(mat => safeDelete(mat));
                        setIsProcessing(false);
                    }
                };
                
                img.onerror = () => {
                    setError('Failed to load image');
                    setIsProcessing(false);
                    onVerificationStatus?.(false);
                };
                
                img.src = imageData;
            };
            
            reader.onerror = () => {
                setError('Failed to read file');
                setIsProcessing(false);
                onVerificationStatus?.(false);
            };
            
            reader.readAsDataURL(file);
        } catch (e) {
            setError('Failed to process image');
            setIsProcessing(false);
            onVerificationStatus?.(false);
        }
    }, [resizeImage, preprocessStrategyA, preprocessStrategyB, preprocessStrategyC, preprocessStrategyD, matToCanvas, detectPlateRegions, deskewPlate, performOCRWithConfigs, selectBestResult, onPlateDetected, onVerificationStatus]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                setError('Image size should be less than 10MB');
                return;
            }
            processImage(file);
        }
    };

    const handleReset = () => {
        setPreviewImage(null);
        setResult(null);
        setError(null);
        setManualPlate('');
        setShowManualInput(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleManualConfirm = () => {
        const cleaned = manualPlate.toUpperCase().replace(/[^A-Z0-9]/g, '');
        const isValid = validateIndianPlate(cleaned);
        onPlateDetected(cleaned);
        onVerificationStatus?.(isValid);
        setResult({
            plateNumber: cleaned,
            confidence: isValid ? 100 : 50,
            isValid
        });
        setShowManualInput(false);
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <AnimatePresence mode="wait">
                {!previewImage ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-orange-400 transition-colors cursor-pointer bg-gray-50"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="flex flex-col items-center space-y-3">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                                <Camera className="w-8 h-8 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">
                                    Click to upload vehicle photo
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Take a clear photo of your license plate
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
                                alt="License plate preview"
                                className="w-full h-48 object-cover"
                            />
                            {isProcessing && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <div className="text-center">
                                        <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-2" />
                                        <p className="text-white text-sm font-medium">Processing...</p>
                                        <p className="text-white/70 text-xs">Detecting license plate</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleReset}
                            className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
                            title="Retake photo"
                        >
                            <RefreshCw className="w-4 h-4 text-gray-600" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results */}
            <AnimatePresence>
                {result && !isProcessing && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-xl p-4 border"
                        style={{
                            backgroundColor: result.isValid ? '#f0fdf4' : '#fef3c7',
                            borderColor: result.isValid ? '#86efac' : '#fcd34d'
                        }}
                    >
                        <div className="flex items-start space-x-3">
                            {result.isValid ? (
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            ) : (
                                <XCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                                <p className="text-sm font-semibold" style={{ color: result.isValid ? '#166534' : '#92400e' }}>
                                    {result.isValid ? 'License Plate Detected' : 'Partial Detection'}
                                </p>
                                {result.plateNumber && (
                                    <p className="text-lg font-bold mt-1" style={{ color: result.isValid ? '#15803d' : '#b45309' }}>
                                        {result.plateNumber}
                                    </p>
                                )}
                                <p className="text-xs mt-1 opacity-75" style={{ color: result.isValid ? '#166534' : '#92400e' }}>
                                    Confidence: {result.confidence.toFixed(1)}%
                                </p>
                                {!result.isValid && result.plateNumber && (
                                    <p className="text-xs mt-2 text-amber-700">
                                        Please verify and correct the plate number manually.
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Manual Override UI */}
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
                                maxLength={10}
                                placeholder="UP14DE6450"
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

            {/* Error */}
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

export default LicensePlateOCR;
