import  { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Define the structure for hero slide data
interface HeroSlide {
  backgroundImage: string;
  title: string;
  subtitle: string;
  description: string;
}

export default function HeroSection() {
  const { isAuthenticated } = useAuth();
  
  // Hero slides data with French text and professional car images
  const heroData: HeroSlide[] = [
    {
      backgroundImage: 'assets/index-back1.jpg',
      title: 'Découvrez',
      subtitle: 'L\'Excellence Automobile',
      description: 'Des véhicules de prestige qui racontent une histoire unique.'
    },
    {
      backgroundImage: 'assets/index-back2.jpg',
      title: 'Performance',
      subtitle: 'Sans Compromis',
      description: 'Chaque courbe, chaque détail conçu pour l\'émotion pure.'
    },
    {
      backgroundImage: 'assets/index-back3.jpg',
      title: 'Innovation',
      subtitle: 'Électrique et Élégant',
      description: 'L\'avenir de la mobilité, aujourd\'hui à votre portée.'
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prevSlide) => 
        (prevSlide + 1) % heroData.length
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(slideInterval);
  }, [heroData.length]);

  const currentHeroData = heroData[currentSlide];

  return (
    <div 
      className="relative h-[80vh] bg-cover bg-center transition-all duration-1000 ease-in-out"
      style={{ 
        backgroundImage: `url(${currentHeroData.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black opacity-50"></div>
      
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center text-white max-w-4xl px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fadeIn">
            <span className="block text-3xl md:text-5xl mb-2 text-primary-300">
              {currentHeroData.title}
            </span>
            <span className="block text-primary-100">
              {currentHeroData.subtitle}
            </span>
          </h1>
          <p className="text-lg md:text-xl mb-8 animate-fadeIn delay-500">
            {currentHeroData.description}
          </p>
          
          <div className="flex justify-center space-x-4">
            <Link
              to="/cars"
              className="btn btn-primary px-8 py-3 text-lg rounded-full hover:scale-105 transition-transform"
            >
              Découvrir Notre Flotte
            </Link>
            {isAuthenticated ? (
              <Link
                to="/dashboard/my-listings"
                className="btn btn-secondary px-8 py-3 text-lg rounded-full hover:scale-105 transition-transform"
              >
                Mes Annonces
              </Link>
            ) : (
              <Link
                to="/auth/login"
                className="btn btn-outline btn-primary px-8 py-3 text-lg rounded-full hover:scale-105 transition-transform"
              >
                Connexion
              </Link>
            )}
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {heroData.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentSlide === index 
                    ? 'bg-primary-500 w-6' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}