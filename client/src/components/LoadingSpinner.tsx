import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
  horizontal?: boolean;
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
      {/* Simple spinning circle */}
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 animate-spin">
          <svg viewBox="0 0 50 50" className="w-full h-full">
            <circle 
              cx="25" 
              cy="25" 
              r="20" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="4" 
              strokeDasharray="125.6" 
              strokeDashoffset="125.6"
              className="animate-spin"
            />
          </svg>
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

// Modern 2025 Preloader Component
export const ModernPreloader: React.FC<{ isVisible: boolean; onComplete?: () => void }> = ({ isVisible, onComplete }) => {
  const { t } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [showContent, setShowContent] = useState(false);

  const steps = [
    { name: "Инициализация", duration: 800 },
    { name: "Загрузка ресурсов", duration: 1200 },
    { name: "Подготовка интерфейса", duration: 1000 },
    { name: "Завершение", duration: 600 }
  ];

  useEffect(() => {
    if (!isVisible) return;

    setShowContent(true);
    let currentProgress = 0;
    let stepIndex = 0;

    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        const step = steps[stepIndex];
        const stepProgress = step.duration / 100;
        
        currentProgress += stepProgress;
        setProgress(Math.min(currentProgress, 100));
        
        if (currentProgress >= (stepIndex + 1) * 25) {
          setCurrentStep(stepIndex + 1);
          stepIndex++;
        }
      } else {
        clearInterval(interval);
        setTimeout(() => {
          onComplete?.();
        }, 500);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-mystical-900 via-deep-900 to-accent-900">
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-mystical-400 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Laser grid effect */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="url(#laserGradient)" strokeWidth="0.1" opacity="0.3"/>
              </pattern>
              <linearGradient id="laserGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-8 max-w-md mx-auto px-6">
          {/* Logo with laser effect */}
          <div className="relative">
            <div className="text-6xl font-playfair font-bold text-white mb-2 relative">
              <span className="bg-gradient-to-r from-mystical-400 via-accent-400 to-mystical-400 bg-clip-text text-mystical-400">
                LaserTouch
              </span>
              {/* Laser scan effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 laser-scan-animation" />
            </div>
            <div className="text-xl text-mystical-300 font-inter tracking-wide">
              Beauty Studio
            </div>
          </div>

          {/* Laser animation */}
          <div className="relative w-32 h-32 mx-auto">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Laser path */}
              <path
                d="M 20 50 Q 50 20 80 50 Q 50 80 20 50"
                fill="none"
                stroke="url(#laserPathGradient)"
                strokeWidth="2"
                className="laser-path-animation"
              />
              <defs>
                <linearGradient id="laserPathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              
              {/* Laser dot */}
              <circle
                cx="20"
                cy="50"
                r="3"
                fill="#ec4899"
                className="laser-dot-animation"
              />
            </svg>
          </div>

          {/* Progress bar */}
          <div className="space-y-4">
            <div className="relative h-2 bg-mystical-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-mystical-500 via-accent-500 to-mystical-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
              {/* Glow effect */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-mystical-400 via-accent-400 to-mystical-400 rounded-full blur-sm opacity-50"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {/* Progress text */}
            <div className="text-mystical-300 font-medium">
              {progress.toFixed(0)}%
            </div>
            
            {/* Current step */}
            {currentStep < steps.length && (
              <div className="text-mystical-400 text-sm animate-pulse">
                {steps[currentStep].name}...
              </div>
            )}
          </div>

          {/* Decorative elements */}
          <div className="flex justify-center space-x-3">
            <div className="w-2 h-2 bg-mystical-400 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-accent-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
            <div className="w-2 h-2 bg-mystical-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-8 left-8 w-16 h-16 border border-mystical-500 rounded-lg opacity-30 animate-pulse" />
      <div className="absolute top-8 right-8 w-16 h-16 border border-accent-500 rounded-lg opacity-30 animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-8 left-8 w-16 h-16 border border-mystical-500 rounded-lg opacity-30 animate-pulse" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-8 right-8 w-16 h-16 border border-accent-500 rounded-lg opacity-30 animate-pulse" style={{ animationDelay: "3s" }} />
    </div>
  );
};

// Simple logo preloader
export const SimpleLogoPreloader: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900", className)}>
      <div className="text-center space-y-8">
        {/* Logo */}
        <div className="space-y-4">
          <div className="text-4xl font-playfair font-bold text-sage-800 dark:text-sage-200">
            LaserTouch
          </div>
          <div className="text-sage-600 dark:text-sage-400 text-lg font-inter">
            Beauty Studio
          </div>
        </div>
        
        {/* Simple spinner */}
        <div className="flex justify-center">
          <div className="w-8 h-8 border-2 border-sage-300 border-t-sage-600 rounded-full animate-spin"></div>
        </div>
        
        {/* Loading text */}
        <div className="text-sage-600 dark:text-sage-400 font-light">
          Loading...
        </div>
      </div>
    </div>
  );
};

// Main app preloader
export const AppPreloader: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  if (!isVisible) return null;
  
  return <ModernPreloader isVisible={isVisible} />;
};

// Page loading component
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

export default LoadingSpinner;