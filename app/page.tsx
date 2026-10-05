import { Conditions } from "@/components/site/conditions";
import { FamilySafe } from "@/components/site/family-safe";
import { GetAPrice } from "@/components/site/get-a-price";
import { Hero } from "@/components/site/hero";
import { HowItWorks } from "@/components/site/how-it-works";
import { WhyJbc } from "@/components/site/why-jbc";

/**
 * The landing page. Six sections in the order set by design-style-guide.md
 * §Landing Page Sections, each with its own layout so the page does not
 * repeat one template down its length.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <WhyJbc />
      <Conditions />
      <FamilySafe />
      <HowItWorks />
      <GetAPrice />
    </>
  );
}