/**
 * ============================================
 * SCROLL TO TOP COMPONENT
 * ============================================
 * 
 * Resets scroll position to top on route changes
 * 
 * FEATURES:
 * - Automatic scroll reset on navigation
 * - Works with all routes
 * - No performance impact
 * - Handles custom scroll containers
 * - Prevents browser scroll restoration conflicts
 * 
 * USAGE:
 * Place inside Router at root level
 * 
 * @component
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Reset window scroll position
        window.scrollTo(0, 0);

        // Reset any custom scroll containers
        const scrollContainers = document.querySelectorAll('[data-scroll-container]');
        scrollContainers.forEach(container => {
            container.scrollTop = 0;
        });

        // Reset body scroll (fallback)
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;

    }, [pathname]); // Trigger on route change

    return null; // This component doesn't render anything
};

export default ScrollToTop;
