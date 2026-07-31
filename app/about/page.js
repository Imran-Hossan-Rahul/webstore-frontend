import Background from "@/components/Background";
import InnerDiv from "@/components/InnerDiv";
import GlassNavbar from "@/components/dashboard/GlassNavbar";
import TrackerPatron from "@/components/TrackerPatron";
import AboutMain from "@/components/AboutComponents/AboutMain";

export default function About() {
  return (
    <Background>
      <TrackerPatron />
      <InnerDiv>
        <GlassNavbar />
        <main className="w-full">
          <AboutMain />
        </main>
      </InnerDiv>
    </Background>
  );
}

