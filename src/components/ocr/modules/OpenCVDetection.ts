/**
 * ============================================
 * OPENCV.JS DETECTION MODULE
 * ============================================
 * 
 * License plate detection and preprocessing using OpenCV.js
 * 
 * FEATURES:
 * - Plate detection with contour analysis
 * - Multiple preprocessing strategies
 * - Perspective transform for tilted plates
 * - ROI extraction
 * 
 * @module
 */

import cv from '@techstark/opencv-js';
import type { PlateDetectionResult, PreprocessingResult } from '../types';

/**
 * Safely delete OpenCV objects
 */
const safeDelete = (obj: any) => {
    if (obj && typeof obj.delete === 'function') {
        try {
            obj.delete();
        } catch (e) {
            // Silent cleanup
        }
    }
};

/**
 * Detect license plate in image
 */
export const detectLicensePlate = async (img: HTMLImageElement): Promise<PlateDetectionResult> => {
    let src: cv.Mat | null = null;
    let gray: cv.Mat | null = null;
    let blurred: cv.Mat | null = null;
    let edges: cv.Mat | null = null;
    let contours: cv.MatVector | null = null;
    let hierarchy: cv.Mat | null = null;

    try {
        // Load image into OpenCV
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get canvas context');
        ctx.drawImage(img, 0, 0);

        src = cv.imread(canvas);
        const imageArea = src.cols * src.rows;

        // Convert to grayscale
        gray = new cv.Mat();
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

        // Apply Gaussian blur
        blurred = new cv.Mat();
        cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);

        // Canny edge detection
        edges = new cv.Mat();
        cv.Canny(blurred, edges, 50, 150);

        // Find contours
        contours = new cv.MatVector();
        hierarchy = new cv.Mat();
        cv.findContours(edges, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);

        // Find best plate candidate
        let bestCandidate: any = null;
        let bestScore = 0;

        for (let i = 0; i < contours.size(); i++) {
            const contour = contours.get(i);
            const area = cv.contourArea(contour);
            const rect = cv.boundingRect(contour);

            // Calculate aspect ratio
            const aspectRatio = rect.width / rect.height;
            const areaRatio = area / imageArea;

            // Indian license plate characteristics:
            // - Aspect ratio: 2.0 to 5.5 (typically 3.5-4.5)
            // - Area: 0.5% to 25% of image
            if (aspectRatio >= 2.0 && aspectRatio <= 5.5 && 
                areaRatio >= 0.005 && areaRatio <= 0.25) {
                
                // Score based on ideal characteristics
                const ratioScore = 1 - Math.abs(aspectRatio - 4.0) / 4.0;
                const areaScore = Math.min(areaRatio / 0.05, 1.0);
                const score = ratioScore * 0.7 + areaScore * 0.3;

                if (score > bestScore) {
                    bestScore = score;
                    bestCandidate = rect;
                }
            }
        }

        if (!bestCandidate) {
            return {
                success: false,
                plateRegion: null,
                confidence: 0
            };
        }

        // Extract plate region with padding
        const padding = 10;
        const x = Math.max(0, bestCandidate.x - padding);
        const y = Math.max(0, bestCandidate.y - padding);
        const w = Math.min(src.cols - x, bestCandidate.width + 2 * padding);
        const h = Math.min(src.rows - y, bestCandidate.height + 2 * padding);

        const plateROI = src.roi(new cv.Rect(x, y, w, h));
        const plateCanvas = document.createElement('canvas');
        cv.imshow(plateCanvas, plateROI);

        safeDelete(plateROI);

        return {
            success: true,
            plateRegion: plateCanvas,
            boundingBox: { x, y, width: w, height: h },
            confidence: bestScore * 100
        };

    } catch (error) {
        return {
            success: false,
            plateRegion: null,
            confidence: 0
        };
    } finally {
        // Cleanup
        safeDelete(src);
        safeDelete(gray);
        safeDelete(blurred);
        safeDelete(edges);
        safeDelete(contours);
        safeDelete(hierarchy);
    }
};

/**
 * Preprocess plate image for OCR
 */
export const preprocessPlateImage = async (plateCanvas: HTMLCanvasElement): Promise<HTMLCanvasElement> => {
    let src: cv.Mat | null = null;
    let gray: cv.Mat | null = null;
    let processed: cv.Mat | null = null;

    try {
        src = cv.imread(plateCanvas);

        // Convert to grayscale
        gray = new cv.Mat();
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

        // Resize for better OCR (height = 100px)
        const targetHeight = 100;
        const scale = targetHeight / gray.rows;
        const targetWidth = Math.round(gray.cols * scale);
        const resized = new cv.Mat();
        cv.resize(gray, resized, new cv.Size(targetWidth, targetHeight), 0, 0, cv.INTER_CUBIC);

        // Apply bilateral filter to reduce noise while keeping edges
        const filtered = new cv.Mat();
        cv.bilateralFilter(resized, filtered, 11, 17, 17);

        // Apply adaptive thresholding
        processed = new cv.Mat();
        cv.adaptiveThreshold(
            filtered,
            processed,
            255,
            cv.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv.THRESH_BINARY,
            11,
            2
        );

        // Morphological operations to clean up
        const kernel = cv.Mat.ones(2, 2, cv.CV_8U);
        cv.morphologyEx(processed, processed, cv.MORPH_CLOSE, kernel);
        safeDelete(kernel);

        // Convert to canvas
        const outputCanvas = document.createElement('canvas');
        cv.imshow(outputCanvas, processed);

        safeDelete(resized);
        safeDelete(filtered);

        return outputCanvas;

    } catch (error) {
        // Return original on error
        return plateCanvas;
    } finally {
        safeDelete(src);
        safeDelete(gray);
        safeDelete(processed);
    }
};

/**
 * Apply perspective transform for tilted plates
 */
export const deskewPlate = (plateCanvas: HTMLCanvasElement): HTMLCanvasElement => {
    let src: cv.Mat | null = null;
    let gray: cv.Mat | null = null;
    let edges: cv.Mat | null = null;
    let lines: cv.Mat | null = null;

    try {
        src = cv.imread(plateCanvas);
        gray = new cv.Mat();
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

        edges = new cv.Mat();
        cv.Canny(gray, edges, 50, 150);

        lines = new cv.Mat();
        cv.HoughLinesP(edges, lines, 1, Math.PI / 180, 50, 50, 10);

        let totalAngle = 0;
        let lineCount = 0;

        if (lines.rows > 0) {
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

            const resultCanvas = document.createElement('canvas');
            cv.imshow(resultCanvas, rotated);

            safeDelete(rotationMatrix);
            safeDelete(rotated);

            return resultCanvas;
        }

        return plateCanvas;

    } catch (error) {
        return plateCanvas;
    } finally {
        safeDelete(src);
        safeDelete(gray);
        safeDelete(edges);
        safeDelete(lines);
    }
};
