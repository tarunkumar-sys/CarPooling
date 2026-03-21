/**
 * ============================================
 * IMAGE PROCESSING HOOK
 * ============================================
 * 
 * Handles all image processing operations:
 * - Compression
 * - Face detection
 * - Blur detection
 * - NSFW detection
 * 
 * @hook
 */

import { useState, useCallback, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import * as blazeface from '@tensorflow-models/blazeface';
import * as tf from '@tensorflow/tfjs';
import * as nsfwjs from 'nsfwjs';

interface ProcessingResult {
    success: boolean;
    processedImage?: string;
    croppedImage?: string;
    error?: string;
    warning?: string;
    faceDetected?: boolean;
    isBlurry?: boolean;
    isNSFW?: boolean;
}

interface FaceBox {
    topLeft: [number, number];
    bottomRight: [number, number];
}

export const useImageProcessing = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const blazefaceModelRef = useRef<blazeface.BlazeFaceModel | null>(null);
    const nsfwModelRef = useRef<nsfwjs.NSFWJS | null>(null);

    /**
     * Load BlazeFace model (lazy loading)
     */
    const loadBlazeFaceModel = useCallback(async () => {
        if (blazefaceModelRef.current) return blazefaceModelRef.current;
        
        try {
            await tf.ready();
            const model = await blazeface.load();
            blazefaceModelRef.current = model;
            return model;
        } catch (error) {
            console.error('Failed to load BlazeFace model:', error);
            throw new Error('Face detection model failed to load');
        }
    }, []);

    /**
     * Load NSFW model (lazy loading)
     */
    const loadNSFWModel = useCallback(async () => {
        if (nsfwModelRef.current) return nsfwModelRef.current;
        
        try {
            await tf.ready();
            const model = await nsfwjs.load();
            nsfwModelRef.current = model;
            return model;
        } catch (error) {
            console.error('Failed to load NSFW model:', error);
            throw new Error('Content detection model failed to load');
        }
    }, []);

    /**
     * Compress image using browser-image-compression
     */
    const compressImage = useCallback(async (file: File): Promise<File> => {
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1024,
            useWebWorker: true,
            fileType: 'image/jpeg',
            initialQuality: 0.85
        };

        try {
            const compressedFile = await imageCompression(file, options);
            return compressedFile;
        } catch (error) {
            console.error('Compression failed:', error);
            return file; // Return original if compression fails
        }
    }, []);

    /**
     * Detect blur using Laplacian variance method
     */
    const detectBlur = useCallback((imageElement: HTMLImageElement): boolean => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return false;

        // Resize for faster processing
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(imageElement, 0, 0, size, size);

        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;

        // Convert to grayscale
        const gray: number[] = [];
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            gray.push(avg);
        }

        // Calculate Laplacian variance
        let sum = 0;
        let count = 0;
        for (let y = 1; y < size - 1; y++) {
            for (let x = 1; x < size - 1; x++) {
                const idx = y * size + x;
                const laplacian = Math.abs(
                    -gray[idx - size - 1] - gray[idx - size] - gray[idx - size + 1] -
                    gray[idx - 1] + 8 * gray[idx] - gray[idx + 1] -
                    gray[idx + size - 1] - gray[idx + size] - gray[idx + size + 1]
                );
                sum += laplacian;
                count++;
            }
        }

        const variance = sum / count;
        const blurThreshold = 10; // Adjust based on testing
        
        return variance < blurThreshold;
    }, []);

    /**
     * Detect face and get bounding box
     */
    const detectFace = useCallback(async (imageElement: HTMLImageElement): Promise<FaceBox | null> => {
        try {
            const model = await loadBlazeFaceModel();
            const predictions = await model.estimateFaces(imageElement, false);

            if (predictions.length === 0) {
                return null;
            }

            // Use the first detected face
            const face = predictions[0];
            return {
                topLeft: face.topLeft as [number, number],
                bottomRight: face.bottomRight as [number, number]
            };
        } catch (error) {
            console.error('Face detection failed:', error);
            return null;
        }
    }, [loadBlazeFaceModel]);

    /**
     * Crop image around detected face
     */
    const cropFace = useCallback((
        imageElement: HTMLImageElement,
        faceBox: FaceBox
    ): string => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context not available');

        const [x1, y1] = faceBox.topLeft;
        const [x2, y2] = faceBox.bottomRight;

        // Calculate face dimensions
        const faceWidth = x2 - x1;
        const faceHeight = y2 - y1;

        // Add padding around face (50% on each side)
        const padding = Math.max(faceWidth, faceHeight) * 0.5;
        
        // Calculate crop box (square)
        const centerX = (x1 + x2) / 2;
        const centerY = (y1 + y2) / 2;
        const size = Math.max(faceWidth, faceHeight) + padding * 2;

        // Ensure crop box stays within image bounds
        let cropX = Math.max(0, centerX - size / 2);
        let cropY = Math.max(0, centerY - size / 2);
        let cropSize = Math.min(size, imageElement.width - cropX, imageElement.height - cropY);

        // Adjust if crop box goes out of bounds
        if (cropX + cropSize > imageElement.width) {
            cropX = imageElement.width - cropSize;
        }
        if (cropY + cropSize > imageElement.height) {
            cropY = imageElement.height - cropSize;
        }

        // Set canvas to square
        canvas.width = 512;
        canvas.height = 512;

        // Draw cropped and centered face
        ctx.drawImage(
            imageElement,
            cropX, cropY, cropSize, cropSize,
            0, 0, 512, 512
        );

        return canvas.toDataURL('image/jpeg', 0.9);
    }, []);

    /**
     * Check if image contains NSFW content
     */
    const checkNSFW = useCallback(async (imageElement: HTMLImageElement): Promise<boolean> => {
        try {
            const model = await loadNSFWModel();
            const predictions = await model.classify(imageElement);

            // Check for inappropriate content
            const nsfwCategories = ['Porn', 'Hentai', 'Sexy'];
            const threshold = 0.6; // 60% confidence threshold

            for (const prediction of predictions) {
                if (nsfwCategories.includes(prediction.className) && prediction.probability > threshold) {
                    return true;
                }
            }

            return false;
        } catch (error) {
            console.error('NSFW detection failed:', error);
            // Fail open - allow image if detection fails
            return false;
        }
    }, [loadNSFWModel]);

    /**
     * Process uploaded image
     */
    const processImage = useCallback(async (file: File): Promise<ProcessingResult> => {
        setIsProcessing(true);
        setProgress(0);

        try {
            // Step 1: Compress image (20%)
            setProgress(20);
            const compressedFile = await compressImage(file);

            // Step 2: Load image
            setProgress(30);
            const imageUrl = URL.createObjectURL(compressedFile);
            const imageElement = await new Promise<HTMLImageElement>((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = imageUrl;
            });

            // Step 3: Check blur (40%)
            setProgress(40);
            const isBlurry = detectBlur(imageElement);
            if (isBlurry) {
                URL.revokeObjectURL(imageUrl);
                return {
                    success: false,
                    warning: 'Image is too blurry. Please upload a clearer photo.',
                    isBlurry: true
                };
            }

            // Step 4: NSFW detection (60%)
            setProgress(60);
            const isNSFW = await checkNSFW(imageElement);
            if (isNSFW) {
                URL.revokeObjectURL(imageUrl);
                return {
                    success: false,
                    error: 'Inappropriate image not allowed. Please upload a suitable profile photo.',
                    isNSFW: true
                };
            }

            // Step 5: Face detection (80%)
            setProgress(80);
            const faceBox = await detectFace(imageElement);
            
            if (!faceBox) {
                // No face detected - return original with warning
                URL.revokeObjectURL(imageUrl);
                return {
                    success: true,
                    processedImage: imageUrl,
                    warning: 'No face detected. Consider uploading a clear photo with your face visible.',
                    faceDetected: false
                };
            }

            // Step 6: Crop face (90%)
            setProgress(90);
            const croppedImage = cropFace(imageElement, faceBox);

            // Cleanup
            URL.revokeObjectURL(imageUrl);
            setProgress(100);

            return {
                success: true,
                processedImage: imageUrl,
                croppedImage,
                faceDetected: true
            };

        } catch (error) {
            console.error('Image processing failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to process image'
            };
        } finally {
            setIsProcessing(false);
            setProgress(0);
        }
    }, [compressImage, detectBlur, checkNSFW, detectFace, cropFace]);

    return {
        processImage,
        isProcessing,
        progress
    };
};
