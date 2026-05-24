"use client";

export default function AboutMain() {
  return (
    <div className="dashboard absolute left-20 top-16 md:w-[1800px] pr-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-black mb-8 text-center">
          About Our Platform
        </h1>

        <div className="space-y-8 text-lg text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-3xl font-semibold text-black mb-4">Our Mission</h2>
            <p>
              We're building a platform where craftsmen can showcase their work, share
              knowledge, and connect with opportunities. Whether you're a developer,
              designer, or content craftsman, this is your space to shine.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-semibold text-black mb-4">What We Offer</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Create and share artifacts with the community</li>
              <li>Write codex and share your learning journey</li>
              <li>Earn from your creations</li>
              <li>Connect with patrons and find opportunities</li>
              <li>Build your portfolio and showcase your skills</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-semibold text-black mb-4">Join Us</h2>
            <p>
              Ready to start your journey? Sign up today and become part of our
              growing community of craftsmen!
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}




