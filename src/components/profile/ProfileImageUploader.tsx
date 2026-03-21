/**
 * ============================================
 * PROFILE IMAGE UPLOADER
 * ============================================
 *
 * Smart profile image upload with:
 * - Compression
 * - Face detection & auto-crop
 * - Blur detection
 * - NSFW detection
 * - Manual crop fallback
 * - Drag & drop support
 *
 * BUG FIX: Added useEffect to sync `previewImage` state with the `currentImage`
 * prop. Previously, useState(currentImage || null) only captured the value at
 * mount time. Profile.tsx fetches fresh user data asynchronously after mount,
 * so the updated currentImage prop was silently ignored — causing the saved
 * profile photo to disappear on every page load/refresh.
 *
 * @component
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Upload, X, Check, AlertCircle, Loader2, Trash2, Edit3 } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop';
import { useImageProcessing } from '../../hooks/useImageProcessing';
import { useToast } from '../../contexts/ToastContext';

interface ProfileImageUploaderProps {
    currentImage?: string;
    onImageUpdate: (imageData: string) => void;
    userName?: string;
    isEditing?: boolean;
}

export const ProfileImageUploader = ({
    currentImage,
    onImageUpdate,
    userName = 'User',
    isEditing = false
}: ProfileImageUploaderProps) => {
    const [previewImage, setPreviewImage] = useState<string | null>(currentImage || null);
    const [showCropper, setShowCropper] = useState(false);
    const [cropImage, setCropImage] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { processImage, isProcessing, progress } = useImageProcessing();
    const toast = useToast();

    /**
     * FIX: Sync previewImage with currentImage prop.
     *
     * Profile.tsx fetches fresh user data from /api/users/:id after mount.
     * Without this effect the previewImage state (initialized once at mount)
     * would never reflect the updated prop, so the persisted profile photo
     * would appear missing every time the page loads.
     *
     * We skip the sync when the user is actively uploading a new image
     * (isProcessing) to avoid overwriting the in-progress preview.
     */
    useEffect(() => {
        if (!isProcessing) {
            setPreviewImage(currentImage || null);
        }
    }, [currentImage]); // eslint-disable-line react-hooks/exhaustive-deps

    /**
     * Validate file before processing
     */
    const validateFile = (file: File): string | null => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            return 'Please upload a JPG, PNG, or WebP image';
        }

        const maxSize = 3 * 1024 * 1024; // 3MB
        if (file.size > maxSize) {
            return 'Image size must be less than 3MB';
        }

        return null;
    };

    /**
     * Handle file selection
     */
    const handleFileSelect = useCallback(async (file: File) => {
        console.log('=== ProfileImageUploader Debug ===');
        console.log('File selected:', file.name, file.size, file.type);

        const error = validateFile(file);
        if (error) {
            console.error('Validation error:', error);
            toast.error(error);
            return;
        }

        console.log('Processing image...');
        const result = await processImage(file);
        console.log('Processing result:', result);

        if (!result.success) {
            if (result.error) {
                console.error('Processing error:', result.error);
                toast.error(result.error);
            } else if (result.warning) {
                console.warn('Processing warning:', result.warning);
                toast.warning(result.warning);
            }
            return;
        }

        if (result.warning) {
            console.warn('Warning:', result.warning);
            toast.warning(result.warning);
        }

        const imageToUse = result.croppedImage || result.processedImage;
        console.log('Image to use:', imageToUse ? `${imageToUse.substring(0, 50)}...` : 'NULL');

        if (imageToUse) {
            setPreviewImage(imageToUse);
            console.log('Calling onImageUpdate with image data');
            onImageUpdate(imageToUse);
            // Note: success toast is now shown by Profile.tsx after the DB save
        }
    }, [processImage, toast, onImageUpdate]);

    /**
     * Handle input change
     */
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    /**
     * Handle drag and drop
     */
    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    /**
     * Handle manual crop complete
     */
    const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    /**
     * Create cropped image
     */
    const createCroppedImage = useCallback(async () => {
        if (!cropImage || !croppedAreaPixels) return;

        try {
            const image = await new Promise<HTMLImageElement>((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = cropImage;
            });

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            canvas.width = 512;
            canvas.height = 512;

            ctx.drawImage(
                image,
                croppedAreaPixels.x,
                croppedAreaPixels.y,
                croppedAreaPixels.width,
                croppedAreaPixels.height,
                0,
                0,
                512,
                512
            );

            const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
            setPreviewImage(croppedImageUrl);
            onImageUpdate(croppedImageUrl);
            setShowCropper(false);
            setCropImage(null);
        } catch (error) {
            toast.error('Failed to crop image');
        }
    }, [cropImage, croppedAreaPixels, onImageUpdate, toast]);

    /**
     * Remove photo
     */
    const handleRemovePhoto = () => {
        setPreviewImage(null);
        onImageUpdate('');
    };

    /**
     * Open manual cropper
     */
    const handleManualCrop = () => {
        if (previewImage) {
            setCropImage(previewImage);
            setShowCropper(true);
        }
    };

    return (
        <>
            <div className="flex flex-col items-center">
                {/* Avatar with conditional upload overlay */}
                <div className="relative group">
                    <div
                        className={`relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl transition-all ${
                            isEditing && isDragging ? 'ring-4 ring-blue-500 scale-105' : ''
                        }`}
                        onDragOver={isEditing ? handleDragOver : undefined}
                        onDragLeave={isEditing ? handleDragLeave : undefined}
                        onDrop={isEditing ? handleDrop : undefined}
                    >
                        {previewImage ? (
                            <img
                                src={previewImage}
                                alt={userName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                <span className="text-4xl font-bold text-blue-600">
                                    {userName.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}

                        {/* Hover overlay - ONLY in Edit Mode */}
                        {isEditing && !isProcessing && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                <Camera className="w-8 h-8 text-white" />
                            </button>
                        )}

                        {/* Processing overlay */}
                        {isEditing && isProcessing && (
                            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
                                <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                                <span className="text-white text-xs font-medium">{progress}%</span>
                            </div>
                        )}

                        {/* Drag overlay */}
                        {isEditing && isDragging && (
                            <div className="absolute inset-0 bg-blue-500/80 flex items-center justify-center">
                                <Upload className="w-8 h-8 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Camera icon badge - ONLY in Edit Mode */}
                    {isEditing && (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isProcessing}
                            className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-4 border-white"
                        >
                            <Camera className="w-5 h-5 text-white" />
                        </button>
                    )}
                </div>

                {/* Action buttons - ONLY in Edit Mode */}
                {isEditing && (
                    <>
                        <div className="flex items-center gap-2 mt-4">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isProcessing}
                                className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                {previewImage ? 'Change Photo' : 'Upload Photo'}
                            </button>

                            {previewImage && !isProcessing && (
                                <>
                                    <button
                                        onClick={handleManualCrop}
                                        className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        Adjust
                                    </button>
                                    <button
                                        onClick={handleRemovePhoto}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Remove photo"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="text-center mt-2">
                            <p className="text-sm text-gray-600">
                                JPG, PNG or WebP • Max 3MB
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Drag & drop or click to upload
                            </p>
                        </div>
                    </>
                )}

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleInputChange}
                    className="hidden"
                />
            </div>

            {/* Manual Crop Modal */}
            <AnimatePresence>
                {showCropper && cropImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900">Adjust Photo</h3>
                                <button
                                    onClick={() => {
                                        setShowCropper(false);
                                        setCropImage(null);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Cropper */}
                            <div className="relative h-96 bg-gray-900">
                                <Cropper
                                    image={cropImage}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    cropShape="round"
                                    showGrid={false}
                                    onCropChange={setCrop}
                                    onZoomChange={setZoom}
                                    onCropComplete={onCropComplete}
                                />
                            </div>

                            {/* Zoom control */}
                            <div className="p-4 border-t border-gray-200">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Zoom
                                </label>
                                <input
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    value={zoom}
                                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                                    className="w-full"
                                />
                            </div>

                            {/* Actions */}
                            <div className="p-4 border-t border-gray-200 flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowCropper(false);
                                        setCropImage(null);
                                    }}
                                    className="btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={createCroppedImage}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                                >
                                    <Check className="w-4 h-4" />
                                    Apply
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
