
import Navbar from "../components/Header";
import HeroSection from "../components/HeroSection";
import FeaturedCars from "../components/FeaturedCars";
import RepresentativeSection from "../components/RepresentativeSection";
import BrandSection from "../components/BrandSection";
import WhyChooseUs from "../components/WhyChooseUs";
import TrustSection from "../components/TrustSection";
import TestimonialsSection from "../components/TestimonialsSection";
import CallToAction from "../components/CallToAction";
import Footer from "../components/Footer";

function Index() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturedCars />
      <RepresentativeSection />
      <BrandSection />
      <WhyChooseUs />
      <TrustSection />
      <TestimonialsSection />
      <CallToAction />
      <Footer />
      
    </div>
  );
}

export default Index;