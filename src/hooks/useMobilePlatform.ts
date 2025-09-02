import { useState, useEffect } from 'react';

/**
 * Hook to detect if the current device is a mobile platform (Android, iOS, or iPadOS).
 * This includes iPadOS devices that may masquerade as Mac by checking for touch points.
 * 
 * @returns {boolean} isMobilePlatform - true if running on Android, iOS, or iPadOS
 */
export function useMobilePlatform(): boolean {
  const [isMobilePlatform, setIsMobilePlatform] = useState<boolean>(false);

  useEffect(() => {
    const detectMobilePlatform = (): boolean => {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        return false;
      }

      const userAgent = navigator.userAgent.toLowerCase();
      
      // Check for Android
      if (userAgent.includes('android')) {
        return true;
      }
      
      // Check for iOS (iPhone, iPad, iPod)
      if (/iphone|ipad|ipod/.test(userAgent)) {
        return true;
      }
      
      // Check for iPadOS masquerading as Mac
      // iPadOS 13+ reports as Mac in user agent, but has touch capabilities
      if (userAgent.includes('mac') && 'ontouchend' in document) {
        // Additional check for touch points if available
        if (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) {
          return true;
        }
      }
      
      // Check for other potential mobile indicators
      if (userAgent.includes('mobile')) {
        return true;
      }
      
      return false;
    };

    setIsMobilePlatform(detectMobilePlatform());
  }, []);

  return isMobilePlatform;
}