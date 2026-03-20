/**
 * Type definitions for Vehicle Plate Recognition System
 */

export interface PlateDetectionResult {
    success: boolean;
    plateRegion: HTMLCanvasElement | null;
    boundingBox?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    confidence: number;
}

export interface OCRResult {
    success: boolean;
    text: string;
    confidence: number;
    rawText?: string;
}

export interface VehicleInfo {
    plateNumber: string;
    country: string;
    state: string | null;
    stateCode: string | null;
    isValid: boolean;
    format: 'indian' | 'other';
}

export interface PreprocessingResult {
    canvas: HTMLCanvasElement;
    method: string;
}
