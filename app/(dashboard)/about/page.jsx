import React from 'react';
import AboutMain from "@/components/AboutComponents/AboutMain";

export const metadata = {
  title: 'About Codalina | Web Development Experts',
  description: 'Learn about Codalina, our web development services, and our mission.',
};

export default function AboutPage() {
  return (
    <div className="w-full h-full relative z-10 flex flex-col min-h-screen">
      <AboutMain />
    </div>
  );
}
