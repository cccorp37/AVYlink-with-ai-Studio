import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import ProfileDemo from "@/components/ProfileDemo";
import CTA from "@/components/CTA";
import Reviews from "@/components/Reviews";
import Footer from "@/components/Footer";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) return null;

  return (
    <div className="min-h-screen font-inter">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <ProfileDemo />
        <Pricing />
        <CTA />
        <Reviews />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
