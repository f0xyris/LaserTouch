import React from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
  horizontal?: boolean; // New prop for horizontal layout
}

export function LoadingSpinner({ size = "md", text, fullScreen = false, horizontal = false }: LoadingSpinnerProps) {
  const { t } = useLanguage();
  
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };
  
  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  const spinner = (
    <div className={`flex ${horizontal ? 'flex-row items-center space-x-2' : 'flex-col items-center justify-center space-y-4'}`}>
      {/* Elegant spinning flower/star animation */}
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 animate-spin">
          <svg viewBox="0 0 50 50" className="w-full h-full">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5A7C54" />
                <stop offset="50%" stopColor="#D4A574" />
                <stop offset="100%" stopColor="#5A7C54" />
              </linearGradient>
            </defs>
            {/* Elegant flower petals */}
            <g fill="url(#gradient)">
              <circle cx="25" cy="10" r="3" opacity="0.9" />
              <circle cx="35" cy="15" r="3" opacity="0.8" />
              <circle cx="40" cy="25" r="3" opacity="0.7" />
              <circle cx="35" cy="35" r="3" opacity="0.6" />
              <circle cx="25" cy="40" r="3" opacity="0.5" />
              <circle cx="15" cy="35" r="3" opacity="0.4" />
              <circle cx="10" cy="25" r="3" opacity="0.3" />
              <circle cx="15" cy="15" r="3" opacity="0.2" />
            </g>
            {/* Center dot */}
            <circle cx="25" cy="25" r="2" fill="#D4A574" />
          </svg>
        </div>
        
        {/* Pulsing ring */}
        <div className="absolute inset-0 animate-pulse">
          <div className="w-full h-full border-2 border-sage-200 rounded-full opacity-30"></div>
        </div>
      </div>
      
      {/* Loading text */}
      {text && (
        <div className={`${textSizeClasses[size]} text-sage-700 font-medium ${horizontal ? '' : 'animate-pulse'}`}>
          {text}
        </div>
      )}
      
      {/* Animated dots - only show when not horizontal */}
      {!horizontal && (
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-sage-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-sage-400 rounded-full animate-bounce" style={{animationDelay: "0.1s"}}></div>
          <div className="w-2 h-2 bg-sage-400 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-cream-50/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 mx-4 max-w-sm w-full">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
}

interface MainLoadingSpinnerProps {
  className?: string;
}

export const MainLoadingSpinner: React.FC<MainLoadingSpinnerProps> = ({ className }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-mystical-50 to-accent-50 dark:from-deep-900 dark:to-deep-800", className)}>
      <div className="relative">
        {/* Main spinner */}
        <div className="w-24 h-24 animate-spin">
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              stroke="url(#gradient)" 
              strokeWidth="4" 
              strokeLinecap="round"
              strokeDasharray="283"
              strokeDashoffset="70"
              className="animate-pulse"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="50%" stopColor="#EC4899" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-gradient-to-r from-mystical-500 to-accent-500 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Loading text */}
      <div className="mt-8 text-center">
        <h2 className="text-2xl font-bold text-mystical-700 dark:text-mystical-300 mb-2">
          LaserTouch
        </h2>
        <p className="text-mystical-600 dark:text-mystical-400 animate-pulse">
          Loading your experience...
        </p>
      </div>
      
      {/* Animated dots */}
      <div className="flex space-x-1 mt-4">
        <div className="w-2 h-2 bg-mystical-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-mystical-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-mystical-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
};

// Page loading component with LaserTouch branding
export function PageLoader() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-white flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Logo area */}
        <div className="space-y-4">
          <div className="text-4xl font-playfair font-bold text-sage-800">
            LaserTouch
          </div>
          <div className="text-sage-600 text-lg font-inter">
            {t.common?.beautyStudio || "Beauty Studio"}
          </div>
        </div>
        
        {/* Main spinner */}
        <LoadingSpinner size="lg" text={t.common?.loading || "Loading..."} />
        
        {/* Decorative elements */}
        <div className="flex justify-center space-x-4">
          <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-sage-400 to-transparent"></div>
          <div className="w-2 h-2 bg-gold-400 rounded-full animate-pulse"></div>
          <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-sage-400 to-transparent"></div>
        </div>
      </div>
    </div>
  );
}

// Button loading state
export function ButtonLoader() {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-4 h-4 relative">
        <div className="absolute inset-0 animate-spin">
          <svg viewBox="0 0 20 20" className="w-full h-full">
            <circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="37.7" strokeDashoffset="37.7" className="animate-spin" />
          </svg>
        </div>
      </div>
      <span>Processing...</span>
    </div>
  );
}

// Global transition loader
export const TransitionLoader = ({ isVisible }: { isVisible: boolean }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-sage-200 dark:border-sage-700 border-t-sage-600 dark:border-t-sage-400 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-sage-600 dark:bg-sage-400 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="mt-4 text-sage-600 dark:text-sage-400 font-medium">
          Переходим...
        </p>
      </div>
    </div>
  );
};

// Laser Body Contour Preloader
export const LaserBodyPreloader: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("fixed inset-0 bg-white dark:bg-deep-900 flex items-center justify-center z-50", className)}>
      <div className="relative w-80 h-96">
        {/* Elegant feminine body silhouette */}
        <svg className="w-full h-full" viewBox="0 0 320 384" fill="none">
          <defs>
            {/* Laser beam gradient */}
            <linearGradient id="laserBeam" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0" />
              <stop offset="20%" stopColor="#EC4899" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#EC4899" stopOpacity="1" />
              <stop offset="80%" stopColor="#EC4899" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </linearGradient>
            
            {/* Animated laser dot */}
            <radialGradient id="laserDot" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#EC4899" stopOpacity="1" />
              <stop offset="70%" stopColor="#EC4899" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#EC4899" stopOpacity="0" />
            </radialGradient>
          </defs>
          
          {/* Feminine body outline with graceful curves and defined waist */}
          <path
            d="M160 20 C 125 20, 100 35, 100 60 C 100 85, 125 100, 160 100 C 195 100, 220 85, 220 60 C 220 35, 195 20, 160 20 Z M 120 100 L 120 130 C 120 140, 130 150, 160 150 C 190 150, 200 140, 200 130 L 200 100 M 160 150 L 160 180 C 160 190, 150 200, 140 200 C 130 200, 120 190, 120 180 L 120 160 M 160 150 L 160 180 C 160 190, 170 200, 180 200 C 190 200, 200 190, 200 180 L 200 160 M 140 150 C 140 150, 135 155, 135 160 C 135 165, 140 170, 145 170 C 150 170, 155 165, 155 160 C 155 155, 150 150, 145 150 Z M 160 150 L 160 180 C 160 190, 150 200, 140 200 C 130 200, 120 190, 120 180 L 120 160 M 160 150 L 160 180 C 160 190, 170 200, 180 200 C 190 200, 200 190, 200 180 L 200 160 M 165 150 C 165 150, 170 155, 170 160 C 170 165, 165 170, 160 170 C 155 170, 150 165, 150 160 C 150 155, 155 150, 160 150 Z"
            stroke="#E5E7EB"
            strokeWidth="2"
            fill="none"
            className="dark:stroke-gray-600"
          />
          
          {/* Animated laser dot that follows the silhouette */}
          <circle
            cx="160"
            cy="20"
            r="3"
            fill="url(#laserDot)"
            className="laser-dot-animation"
          />
          
          {/* Laser beam effect that follows the path */}
          <path
            d="M160 20 C 125 20, 100 35, 100 60 C 100 85, 125 100, 160 100 C 195 100, 220 85, 220 60 C 220 35, 195 20, 160 20 Z M 120 100 L 120 130 C 120 140, 130 150, 160 150 C 190 150, 200 140, 200 130 L 200 100 M 160 150 L 160 180 C 160 190, 150 200, 140 200 C 130 200, 120 190, 120 180 L 120 160 M 160 150 L 160 180 C 160 190, 170 200, 180 200 C 190 200, 200 190, 200 180 L 200 160 M 140 150 C 140 150, 135 155, 135 160 C 135 165, 140 170, 145 170 C 150 170, 155 165, 155 160 C 155 155, 150 150, 145 150 Z M 160 150 L 160 180 C 160 190, 150 200, 140 200 C 130 200, 120 190, 120 180 L 120 160 M 160 150 L 160 180 C 160 190, 170 200, 180 200 C 190 200, 200 190, 200 180 L 200 160 M 165 150 C 165 150, 170 155, 170 160 C 170 165, 165 170, 160 170 C 155 170, 150 165, 150 160 C 150 155, 155 150, 160 150 Z"
            stroke="url(#laserBeam)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="8,4"
            className="laser-path-animation"
          />
        </svg>
      </div>
    </div>
  );
};

// Main app preloader that shows until all critical data is loaded
export const AppPreloader: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  if (!isVisible) return null;
  
  return <LaserBodyPreloader />;
};

export default LoadingSpinner;