import React from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/ui/PageContainer';
import { Mail, MessageCircleQuestion, MapPin, Phone, Facebook, Instagram } from 'lucide-react';

export const metadata = {
  title: 'Contact Us | Codalina',
  description: 'Get in touch with the Codalina team.',
};

export default function ContactPage() {
  return (
    <div className="w-full h-full relative z-10 flex flex-col min-h-screen">
      <div className="w-full bg-transparent font-sans pb-16">
        
        {/* Header */}
        <section className="text-center pt-[80px] pb-[60px] px-6">
          <PageContainer maxWidth="max-w-[980px]">
            <div className="flex flex-col items-center">
              <h1 className="text-[40px] md:text-[56px] font-display font-medium text-slate-900 leading-[1.1] mb-[20px] w-full max-w-[1000px] md:whitespace-nowrap">
                Let's talk about your next project.
              </h1>
              <p className="text-[18px] md:text-[21px] font-sans text-slate-500 max-w-[768px] mx-auto mb-[24px]">
                Whether you have a question, need technical support, or want to discuss a custom web development project, our team is ready to help.
              </p>
            </div>
          </PageContainer>
        </section>

        {/* Contact Info Cards */}
        <section className="px-6 relative z-10">
          <PageContainer maxWidth="max-w-[1000px]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Email */}
              <div className="bg-white/30 backdrop-blur-3xl border border-white/50 p-8 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col items-center text-center transition-transform hover:-translate-y-1">
                <div className="w-14 h-14 bg-brand-blue/10 rounded-full flex items-center justify-center mb-6">
                  <Mail className="w-6 h-6 text-[#0071e3]" />
                </div>
                <h3 className="text-[20px] font-display font-medium text-slate-900 mb-2">Email Us</h3>
                <p className="text-[15px] font-sans text-slate-600 mb-6 flex-1">
                  For general inquiries, partnerships, and technical questions.
                </p>
                <a href="mailto:info@codalina.com" className="text-[15px] font-medium text-[#0071e3] hover:underline">
                  info@codalina.com
                </a>
              </div>

              {/* Live Chat */}
              <div className="bg-white/30 backdrop-blur-3xl border border-white/50 p-8 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col items-center text-center transition-transform hover:-translate-y-1">
                <div className="w-14 h-14 bg-brand-blue/10 rounded-full flex items-center justify-center mb-6">
                  <MessageCircleQuestion className="w-6 h-6 text-[#0071e3]" />
                </div>
                <h3 className="text-[20px] font-display font-medium text-slate-900 mb-2">Live Chat</h3>
                <p className="text-[15px] font-sans text-slate-600 mb-6 flex-1">
                  Talk to our support team instantly directly from the platform.
                </p>
                <Link href="/support" className="text-[15px] font-medium text-[#0071e3] hover:underline">
                  Open Support Chat
                </Link>
              </div>

              {/* Location */}
              <div className="bg-white/30 backdrop-blur-3xl border border-white/50 p-8 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col items-center text-center transition-transform hover:-translate-y-1">
                <div className="w-14 h-14 bg-brand-blue/10 rounded-full flex items-center justify-center mb-6">
                  <MapPin className="w-6 h-6 text-[#0071e3]" />
                </div>
                <h3 className="text-[20px] font-display font-medium text-slate-900 mb-2">Our Office</h3>
                <p className="text-[15px] font-sans text-slate-600 mb-6 flex-1">
                  Engineered with precision in Dhaka, Bangladesh.
                </p>
                <span className="text-[15px] font-medium text-slate-400">
                  Dhaka, BD
                </span>
              </div>

              {/* Phone */}
              <div className="bg-white/30 backdrop-blur-3xl border border-white/50 p-8 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col items-center text-center transition-transform hover:-translate-y-1">
                <div className="w-14 h-14 bg-brand-blue/10 rounded-full flex items-center justify-center mb-6">
                  <Phone className="w-6 h-6 text-[#0071e3]" />
                </div>
                <h3 className="text-[20px] font-display font-medium text-slate-900 mb-2">Phone</h3>
                <p className="text-[15px] font-sans text-slate-600 mb-6 flex-1">
                  Call us directly for urgent inquiries.
                </p>
                <a href="tel:+8801900000000" className="text-[15px] font-medium text-[#0071e3] hover:underline">
                  +880 1900 000000
                </a>
              </div>

              {/* Facebook */}
              <div className="bg-white/30 backdrop-blur-3xl border border-white/50 p-8 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col items-center text-center transition-transform hover:-translate-y-1">
                <div className="w-14 h-14 bg-brand-blue/10 rounded-full flex items-center justify-center mb-6">
                  <Facebook className="w-6 h-6 text-[#0071e3]" />
                </div>
                <h3 className="text-[20px] font-display font-medium text-slate-900 mb-2">Facebook</h3>
                <p className="text-[15px] font-sans text-slate-600 mb-6 flex-1">
                  Follow us for the latest updates and announcements.
                </p>
                <a href="https://www.facebook.com/profile.php?id=61591711877853" target="_blank" rel="noreferrer" className="text-[15px] font-medium text-[#0071e3] hover:underline">
                  @codalinaglobal
                </a>
              </div>

              {/* Instagram */}
              <div className="bg-white/30 backdrop-blur-3xl border border-white/50 p-8 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col items-center text-center transition-transform hover:-translate-y-1">
                <div className="w-14 h-14 bg-brand-blue/10 rounded-full flex items-center justify-center mb-6">
                  <Instagram className="w-6 h-6 text-[#0071e3]" />
                </div>
                <h3 className="text-[20px] font-display font-medium text-slate-900 mb-2">Instagram</h3>
                <p className="text-[15px] font-sans text-slate-600 mb-6 flex-1">
                  Check out behind-the-scenes and our daily stories.
                </p>
                <a href="https://www.instagram.com/codalinaglobal/" target="_blank" rel="noreferrer" className="text-[15px] font-medium text-[#0071e3] hover:underline">
                  @codalinaglobal
                </a>
              </div>

            </div>
          </PageContainer>
        </section>

      </div>
    </div>
  );
}
