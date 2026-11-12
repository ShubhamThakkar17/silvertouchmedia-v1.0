import { brand } from "@/brand";
import { Hero } from "@/components/hero/hero";
import { Intro } from "@/components/sections/intro";
import { brandImage } from "@/lib/brand-images";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Intro image={brandImage(brand.imagery.intro)} />
      {/* M4: channels index, 360° model, surfaces, market snapshot, planner teaser, industries, process, reporting, why us, engagement */}
    </>
  );
}
