import "./HomePage.scss";
import HeroSection from "../../components/HeroSection/HeroSection"
import FeatureSection from "../../components/FeatureSection/FeatureSection";
import HowItWorks from "../../components/HowItWorks/HowItWorks";
import Testimonial from "../../components/Testimonial/Testimonial";
import AISection from "../../components/AISection/AISection";
import MyAccordian from "../../components/MyAccordian/MyAccordian";
import TemplatePreview from "../../components/TemplatePreview/TemplatePreview";


const HomePage = () => {

  return (
    <div >
      <HeroSection/>
      <FeatureSection/>
      <HowItWorks/>
      <AISection/>
      <TemplatePreview/>
      <Testimonial/>
      <MyAccordian/>
    </div>
  );
};

export default HomePage;

