/**
 * ============================================
 * PLATE VALIDATOR MODULE
 * ============================================
 * 
 * Validation and information extraction for license plates
 * 
 * FEATURES:
 * - Indian plate format validation
 * - State code extraction
 * - Country detection
 * - Structured data extraction
 * 
 * @module
 */

import type { VehicleInfo } from '../types';

/**
 * Indian state codes mapping
 */
const INDIAN_STATE_CODES: Record<string, string> = {
    'AP': 'Andhra Pradesh',
    'AR': 'Arunachal Pradesh',
    'AS': 'Assam',
    'BR': 'Bihar',
    'CG': 'Chhattisgarh',
    'GA': 'Goa',
    'GJ': 'Gujarat',
    'HR': 'Haryana',
    'HP': 'Himachal Pradesh',
    'JH': 'Jharkhand',
    'KA': 'Karnataka',
    'KL': 'Kerala',
    'MP': 'Madhya Pradesh',
    'MH': 'Maharashtra',
    'MN': 'Manipur',
    'ML': 'Meghalaya',
    'MZ': 'Mizoram',
    'NL': 'Nagaland',
    'OD': 'Odisha',
    'OR': 'Odisha',
    'PB': 'Punjab',
    'RJ': 'Rajasthan',
    'SK': 'Sikkim',
    'TN': 'Tamil Nadu',
    'TS': 'Telangana',
    'TR': 'Tripura',
    'UP': 'Uttar Pradesh',
    'UK': 'Uttarakhand',
    'WB': 'West Bengal',
    'AN': 'Andaman and Nicobar',
    'CH': 'Chandigarh',
    'DD': 'Daman and Diu',
    'DL': 'Delhi',
    'JK': 'Jammu and Kashmir',
    'LA': 'Ladakh',
    'LD': 'Lakshadweep',
    'PY': 'Puducherry'
};

/**
 * Indian license plate regex patterns
 */
const INDIAN_PLATE_PATTERNS = [
    /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/,     // Standard: UP80AB1234
    /^[A-Z]{2}\s?\d{2}\s?[A-Z]{1,2}\s?\d{4}$/, // With spaces: UP 80 AB 1234
    /^[A-Z]{2}\d{2}[A-Z]\d{4}$/,          // Old format: UP80A1234
    /^[A-Z]{2}\d{2}\d{4}$/,               // Very old: UP801234
];

/**
 * Validate Indian license plate format
 */
export const validateIndianPlate = (text: string): boolean => {
    if (!text) return false;
    const cleaned = text.toUpperCase().replace(/\s+/g, '');
    return INDIAN_PLATE_PATTERNS.some(pattern => pattern.test(cleaned));
};

/**
 * Extract vehicle information from plate number
 */
export const extractPlateInfo = (plateNumber: string): VehicleInfo => {
    const cleaned = plateNumber.toUpperCase().replace(/\s+/g, '');
    const isValid = validateIndianPlate(cleaned);

    // Extract state code (first 2 characters)
    const stateCode = cleaned.substring(0, 2);
    const state = INDIAN_STATE_CODES[stateCode] || null;

    // Determine country
    const country = state ? 'India' : 'Other';

    // Format plate number with spaces for readability
    const formatted = formatPlateNumber(cleaned);

    return {
        plateNumber: formatted,
        country,
        state,
        stateCode: state ? stateCode : null,
        isValid,
        format: state ? 'indian' : 'other'
    };
};

/**
 * Format plate number with proper spacing
 * Example: UP80AB1234 → UP 80 AB 1234
 */
const formatPlateNumber = (plateNumber: string): string => {
    if (plateNumber.length < 8) return plateNumber;

    // Standard format: XX 00 XX 0000
    if (plateNumber.length >= 10) {
        const state = plateNumber.substring(0, 2);
        const district = plateNumber.substring(2, 4);
        const series = plateNumber.substring(4, plateNumber.length - 4);
        const number = plateNumber.substring(plateNumber.length - 4);
        return `${state} ${district} ${series} ${number}`;
    }

    // Old format: XX 00 X 0000
    if (plateNumber.length === 9) {
        const state = plateNumber.substring(0, 2);
        const district = plateNumber.substring(2, 4);
        const series = plateNumber.substring(4, 5);
        const number = plateNumber.substring(5);
        return `${state} ${district} ${series} ${number}`;
    }

    // Very old format: XX 00 0000
    if (plateNumber.length === 8) {
        const state = plateNumber.substring(0, 2);
        const district = plateNumber.substring(2, 4);
        const number = plateNumber.substring(4);
        return `${state} ${district} ${number}`;
    }

    return plateNumber;
};

/**
 * Get state name from state code
 */
export const getStateName = (stateCode: string): string | null => {
    return INDIAN_STATE_CODES[stateCode.toUpperCase()] || null;
};

/**
 * Check if state code is valid
 */
export const isValidStateCode = (stateCode: string): boolean => {
    return stateCode.toUpperCase() in INDIAN_STATE_CODES;
};
