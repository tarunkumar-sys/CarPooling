/**
 * Toast Notification System
 * Professional toast notifications for all user feedback
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
    onClose: (id: string) => void;
}

interface ToastItemProps extends ToastProps {
    key?: string;
}

const toastConfig = {
    success: {
        icon: CheckCircle,
        bgColor: 'bg-[var(--color-success-50)]',
        borderColor: 'border-[var(--color-success-500)]',
        iconColor: 'text-[var(--color-success-600)]',
        textColor: 'text-[var(--color-success-700)]',
    },
    error: {
        icon: XCircle,
        bgColor: 'bg-[var(--color-danger-50)]',
        borderColor: 'border-[var(--color-danger-500)]',
        iconColor: 'text-[var(--color-danger-600)]',
        textColor: 'text-[var(--color-danger-700)]',
    },
    warning: {
        icon: AlertCircle,
        bgColor: 'bg-[var(--color-warning-50)]',
        borderColor: 'border-[var(--color-warning-500)]',
        iconColor: 'text-[var(--color-warning-600)]',
        textColor: 'text-[var(--color-warning-700)]',
    },
    info: {
        icon: Info,
        bgColor: 'bg-[var(--color-info-50)]',
        borderColor: 'border-[var(--color-info-500)]',
        iconColor: 'text-[var(--color-info-600)]',
        textColor: 'text-[var(--color-info-700)]',
    },
};

export const Toast = ({ id, type, message, duration = 5000, onClose }: ToastProps) => {
    const config = toastConfig[type];
    const Icon = config.icon;

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            className={`${config.bgColor} ${config.borderColor} border-l-4 rounded-lg shadow-lg p-4 mb-3 flex items-start gap-3 min-w-[320px] max-w-md`}
        >
            <Icon className={`${config.iconColor} w-5 h-5 flex-shrink-0 mt-0.5`} />
            <p className={`${config.textColor} text-sm font-medium flex-1 leading-relaxed`}>
                {message}
            </p>
            <button
                onClick={() => onClose(id)}
                className={`${config.iconColor} hover:opacity-70 transition-opacity flex-shrink-0`}
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
};

export const ToastContainer = ({ toasts, onClose }: { toasts: ToastProps[]; onClose: (id: string) => void }) => {
    return (
        <div className="fixed top-20 right-4 z-[9999] pointer-events-none">
            <div className="pointer-events-auto">
                <AnimatePresence>
                    {toasts.map((toast) => {
                        // Extract key separately to avoid TypeScript error with React 19
                        const { id, ...toastProps } = toast;
                        return <Toast key={id} id={id} {...toastProps as any} onClose={onClose} />;
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};
