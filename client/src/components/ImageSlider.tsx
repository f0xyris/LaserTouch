import { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Slide {
  image: string;
  title: string;
  subtitle: string;
  description: string;
}

interface ImageSliderProps {
  slides: Slide[];
  interval?: number;
  currentSlide: number;
  onSlideChange: (index: number) => void;
}

// Компонент для предзагрузки изображений
const ImagePreloader = ({ slides }: { slides: Slide[] }) => {
  useEffect(() => {
    slides.forEach(slide => {
      const img = new Image();
      img.src = slide.image;
    });
  }, [slides]);

  return null;
};

export const ImageSlider = ({ slides, interval = 5000, currentSlide, onSlideChange }: ImageSliderProps) => {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Мемоизируем обработчики
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }, [slides.length]);

  const handleSlideChange = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Мемоизируем рендер точек
  const dotsIndicator = useMemo(() => {
    if (slides.length <= 1) return null;

    return (
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSlideChange(index);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSlideChange(index);
              }
              if (e.key === 'ArrowLeft') {
                e.preventDefault();
                goToPrevious();
              }
              if (e.key === 'ArrowRight') {
                e.preventDefault();
                goToNext();
              }
            }}
            tabIndex={0}
            aria-label={`${t.loading} ${index + 1}`}
            className={`w-6 h-6 rounded-full transition-all duration-300 border-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black active:scale-95 pointer-events-auto ${
              index === currentIndex 
                ? "bg-mystical-500 border-mystical-400 shadow-lg scale-110 dark:bg-mystical-400 dark:border-mystical-300" 
                : "bg-white bg-opacity-70 border-white border-opacity-90 hover:bg-mystical-300 hover:scale-105 hover:shadow-md dark:bg-mystical-600 dark:bg-opacity-70 dark:border-mystical-500 dark:hover:bg-mystical-500"
            }`}
          />
        ))}
      </div>
    );
  }, [slides.length, currentIndex, handleSlideChange, goToPrevious, goToNext, t.loading]);

  // Мемоизируем рендер слайдов
  const slidesRender = useMemo(() => {
    return slides.map((slide, index) => (
      <div
        key={index}
        className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ${
          index === currentIndex ? "opacity-100" : "opacity-0"
        }`}
        style={{
          backgroundImage: `url(${slide.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    ));
  }, [slides, currentIndex]);

  useEffect(() => {
    if (slides.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, interval);

    return () => clearInterval(timer);
  }, [slides.length, interval]);

  // Sync with parent component's currentSlide prop
  useEffect(() => {
    setCurrentIndex(currentSlide);
  }, [currentSlide]);

  // Notify parent when internal state changes
  useEffect(() => {
    onSlideChange(currentIndex);
  }, [currentIndex, onSlideChange]);

  if (slides.length === 0) {
    return (
      <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-mystical-700 via-deep-800 to-mystical-900">
        <div className="absolute inset-0 bg-black opacity-30"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Предзагрузка изображений */}
      <ImagePreloader slides={slides} />
      
      <div className="absolute inset-0 bg-black opacity-40 z-10"></div>
      
      {slidesRender}

      {/* Dots Indicator */}
      {dotsIndicator}
    </div>
  );
};