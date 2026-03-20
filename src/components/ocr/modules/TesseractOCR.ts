/**
 * ============================================
 * TESSERACT.JS OCR MODULE
 * ============================================
 * 
 * Optimized OCR for license plate recognition
 * 
 * FEATURES:
 * - Character whitelist (A-Z, 0-9)
 * - PSM mode optimization
 * - Worker singleton pattern
 * - High accuracy configuration
 * 
 * @module
 */

import Tesseract, { PSM, OEM } from 'tesseract.js';
import type { OCRResult } from '../types';

// Tesseract worker singleton
let tesseractWorker: Tesseract.Worker | null = null;
let workerInitializing = false;
let workerInitPromise: Promise<Tesseract.Worker> | null = null;

/**
 * Get or create Tesseract worker (singleton pattern)
 */
const getTesseractWorker = async (): Promise<Tesseract.Worker> => {
    if (tesseractWorker) {
        return tesseractWorker;
    }

    if (workerInitializing && workerInitPromise) {
        return workerInitPromise;
    }

    workerInitializing = true;
    workerInitPromise = Tesseract.createWorker('eng', OEM.LSTM_ONLY, {
        logger: () => {}, // Silent in production
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

/**
 * Perform OCR on preprocessed plate image
 */
export const performOCR = async (plateCanvas: HTMLCanvasElement): Promise<OCRResult> => {
    try {
        const worker = await getTesseractWorker();

        // Configure for license plate recognition
        await worker.setParameters({
            tessedit_pageseg_mode: PSM.SINGLE_LINE, // Single line text
            tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', // Only alphanumeric
            preserve_interword_spaces: '0', // No spaces
            tessedit_do_invert: '0',
        });

        // Perform OCR
        const imageData = plateCanvas.toDataURL('image/png');
        const result = await worker.recognize(imageData);

        // Clean up text
        const rawText = result.data.text.trim();
        const cleanedText = rawText.toUpperCase().replace(/[^A-Z0-9]/g, '');

        if (cleanedText.length < 5) {
            return {
                success: false,
                text: '',
                confidence: 0,
                rawText
            };
        }

        // Apply positional character correction
        const correctedText = correctPlateCharacters(cleanedText);

        return {
            success: true,
            text: correctedText,
            confidence: result.data.confidence,
            rawText
        };

    } catch (error) {
        return {
            success: false,
            text: '',
            confidence: 0
        };
    }
};

/**
 * Correct common OCR mistakes based on position
 * 
 * Indian plate format: XX00XX0000
 * - Positions 0-1: Letters (state code)
 * - Positions 2-3: Digits (district code)
 * - Positions 4-5: Letters (series)
 * - Positions 6-9: Digits (number)
 */
const correctPlateCharacters = (text: string): string => {
    if (text.length < 8 || text.length > 13) {
        return text;
    }

    const digitToLetter: Record<string, string> = {
        '0': 'O',
        '1': 'I',
        '5': 'S',
        '8': 'B',
        '6': 'G',
        '2': 'Z'
    };

    const letterToDigit: Record<string, string> = {
        'O': '0',
        'I': '1',
        'S': '5',
        'B': '8',
        'G': '6',
        'Z': '2',
        'Q': '0',
        'D': '0',
        'L': '1'
    };

    let corrected = '';

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        // First 2 characters: must be letters (state code)
        if (i <= 1) {
            corrected += digitToLetter[char] || char;
        }
        // Next 2 characters: must be digits (district code)
        else if (i >= 2 && i <= 3) {
            corrected += letterToDigit[char] || char;
        }
        // Last 4 characters: must be digits (number)
        else if (i >= text.length - 4) {
            corrected += letterToDigit[char] || char;
        }
        // Middle characters (1-2 letters): prefer letters
        else {
            corrected += digitToLetter[letterToDigit[char]] || char;
        }
    }

    return corrected;
};

/**
 * Cleanup worker on app unmount
 */
export const cleanupTesseractWorker = async () => {
    if (tesseractWorker) {
        try {
            await tesseractWorker.terminate();
        } catch (e) {
            // Silent cleanup
        }
        tesseractWorker = null;
    }
};
