import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Sparkles, Hand, Leaf, CheckCircle } from "lucide-react";
import { ImageSlider } from "@/components/ImageSlider";
import { StaffSlider } from "@/components/StaffSlider";
import { LocationMap } from "@/components/LocationMap";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useMemo, lazy, Suspense } from "react";

// Ленивая загрузка тяжелых компонентов
const LazyStaffSlider = lazy(() => import("@/components/StaffSlider").then(module => ({ default: module.StaffSlider })));
const LazyLocationMap = lazy(() => import("@/components/LocationMap").then(module => ({ default: module.LocationMap })));

// Изображения для слайдера
const HERO_IMAGES = {
  hero1: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=70",
  hero2: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=70",
  hero3: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=70",
  hero4: "https://images.unsplash.com/photo-1552693673-1bf958298935?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=70",
  features: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=70"
};

// Компонент для сервисов
const ServicesSection = ({ t }: { t: any }) => {
  const services = useMemo(() => [
    {
      icon: Sparkles,
      title: t.laserHairRemoval,
      description: t.laserHairRemovalDesc,
      price: "1500 zł"
    },
    {
      icon: Hand,
      title: t.massage,
      description: t.massageDesc,
      price: "2500 zł"
    },
    {
      icon: Leaf,
      title: t.spaServices,
      description: t.spaDesc,
      price: "3500 zł"
    }
  ], [t]);

  return (
    <section className="py-20 bg-white dark:bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-playfair font-bold text-mystical-600 dark:text-mystical-400 mb-4">
            {t.servicesTitle}
          </h2>
          <p className="text-muted-foreground dark:text-muted-foreground text-lg max-w-2xl mx-auto">
            {t.servicesDescription}
          </p>
        </div>
        
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.map((service, index) => (
            <Card key={index} className="bg-background dark:bg-card hover:shadow-xl dark:hover:shadow-mystical-500/20 transition-all duration-300 border-mystical-200 dark:border-mystical-700 group h-full">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gradient-to-r from-mystical-600 to-accent-600 dark:from-mystical-500 dark:to-accent-500 rounded-lg flex items-center justify-center mb-4 shadow-lg group-hover:shadow-mystical-500/50 transition-all">
                  <service.icon className="text-mystical-600 dark:text-white text-2xl" />
                </div>
                <h3 className="text-xl font-playfair font-semibold text-mystical-600 dark:text-mystical-400 mb-3">{service.title}</h3>
                <p className="text-muted-foreground dark:text-muted-foreground mb-4">
                  {service.description}
                </p>
                <div className="text-accent-600 dark:text-accent-400 font-semibold">{t.priceFrom} {service.price}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// Компонент для преимуществ
const FeaturesSection = ({ t }: { t: any }) => {
  const features = useMemo(() => [
    {
      title: t.modernEquipment,
      description: t.modernEquipmentDesc
    },
    {
      title: t.experiencedSpecialists,
      description: t.experiencedSpecialistsDesc
    },
    {
      title: t.individualApproach,
      description: t.individualApproachDesc
    }
  ], [t]);

  return (
    <section className="py-20 bg-white dark:bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <img 
              src={HERO_IMAGES.features}
              alt="Professional spa equipment" 
              className="w-full h-auto rounded-xl shadow-xl"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-playfair font-bold text-mystical-600 dark:text-mystical-400">
              {t.whyChooseUs}
            </h2>
            
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <CheckCircle className="text-mystical-600 dark:text-mystical-400 text-xl mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-playfair font-semibold text-mystical-600 dark:text-mystical-300">{feature.title}</h3>
                    <p className="text-muted-foreground dark:text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};



const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { t } = useLanguage();
  
  const heroSlides = useMemo(() => [
    {
      image: HERO_IMAGES.hero1,
      title: t.slide1Title,
      subtitle: t.slide1Subtitle,
      description: t.slide1Description
    },
    {
      image: HERO_IMAGES.hero2,
      title: t.slide2Title,
      subtitle: t.slide2Subtitle,
      description: t.slide2Description
    },
    {
      image: HERO_IMAGES.hero3,
      title: t.slide3Title,
      subtitle: t.slide3Subtitle,
      description: t.slide3Description
    },
    {
      image: HERO_IMAGES.hero4,
      title: t.trainingTitle,
      subtitle: t.trainingTitle,
      description: t.trainingDescription
    }
  ], [t]);

  const currentSlideData = heroSlides[currentSlide];

  return (
    <main className="relative">
      {/* Hero Slider Section */}
      <section className="relative h-[calc(100vh-64px)] min-h-[500px]">
        {/* Background Images Slider */}
        <div className="absolute inset-0 z-0">
          <ImageSlider 
            slides={heroSlides} 
            interval={6000} 
            currentSlide={currentSlide}
            onSlideChange={setCurrentSlide}
          />
        </div>
        
        {/* Content overlay */}
        <div className="relative z-10 h-full w-full bg-black bg-opacity-40 flex items-center justify-center pointer-events-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex flex-col justify-center items-center h-full py-8">
              {/* Text content */}
              <div className="mb-8 min-h-[200px] sm:min-h-[280px] flex flex-col justify-center">
                <h1 className="text-2xl sm:text-4xl lg:text-6xl font-playfair font-bold text-white leading-tight drop-shadow-2xl mb-4 sm:mb-6 px-4">
                  {currentSlideData.title}
                </h1>
                <p className="text-base sm:text-xl text-gray-200 leading-relaxed max-w-3xl mx-auto drop-shadow-lg mb-3 sm:mb-4 px-4">
                  {currentSlideData.subtitle}
                </p>
                <p className="text-sm sm:text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto drop-shadow-lg px-4">
                  {currentSlideData.description}
                </p>
              </div>
              
              {/* Button */}
              <div className="flex justify-center pointer-events-auto px-4">
                <Link href="/booking">
                  <Button className="bg-gradient-to-r from-mystical-500 to-accent-500 text-white px-6 sm:px-8 py-3 font-semibold w-full sm:w-auto">
                    {t.bookNow}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <ServicesSection t={t} />

      {/* Features Section */}
      <FeaturesSection t={t} />

      {/* Staff Slider Section */}
      <Suspense fallback={<div className="py-20 bg-white dark:bg-muted/50"><LoadingSpinner /></div>}>
        <LazyStaffSlider />
      </Suspense>

      {/* Location Map Section */}
      <Suspense fallback={<div className="py-20 bg-white dark:bg-background"><LoadingSpinner /></div>}>
        <LazyLocationMap />
      </Suspense>
    </main>
  );
};

export default Home;
