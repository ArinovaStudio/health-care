"use client";

import Navbar from "./components/Navbar";
import { Stethoscope, User, FileText, Link2 } from "lucide-react";
import { Pause } from "lucide-react";
import Footer from "./components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { useState } from "react";
import axios from "axios";
import toast from 'react-hot-toast';
import Login from "./components/Login";
import SignUp from "./components/SignUp.jsx";
import OTP from "./components/verifyOTP";
import { backendUrl } from "./actions/auth";

const steps = [
  {
    icon: User,
    title: "Add Profile",
    description: "Create your digital health profile.",
  },
  {
    icon: FileText,
    title: "Add Medical Credentials",
    description: "Upload prescriptions, reports, and history.",
  },
  {
    icon: Link2,
    title: "Share Credentials (Emergency)",
    description: "Generate a secure emergency-sharing link.",
  },
  {
    icon: Stethoscope,
    title: "Doctor Access & Updates",
    description: "Doctors can view and update medications.",
  },
];

const faqs = [
  {
    question: "Is my medical data secure?",
    answer:
      "Yes, absolutely. We use bank-level encryption to protect your health data. All information is stored securely and only accessible by people you explicitly grant access to.",
  },
  {
    question: "How do I share my medical records in an emergency?",
    answer:
      "You can generate a secure, time-limited emergency sharing link from your dashboard. This link can be shared with healthcare providers and will give them access to your essential medical information.",
  },
  {
    question: "Can my doctor update my medications directly?",
    answer:
      "Yes, once you grant access to your healthcare provider, they can view your profile and update medications, prescriptions, and medical notes in real-time.",
  },
  {
    question: "What types of documents can I upload?",
    answer:
      "You can upload prescriptions, lab reports, imaging results, vaccination records, insurance documents, and any other medical documents in PDF, JPG, or PNG format.",
  },
  {
    question: "Is there a mobile app available?",
    answer:
      "Our web platform is fully responsive and works seamlessly on mobile devices. A dedicated mobile app is currently in development and will be available soon.",
  },
  {
    question: "How much does it cost?",
    answer:
      "We offer a free basic plan for individuals. Premium plans with additional features for families and advanced sharing options start at $9.99/month.",
  },
];

export default function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isOtpOpen, setIsOtpOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${backendUrl}/api/contact/send`, formData); 

      if (res.status === 200 || res.data.success) {
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
        toast.success("Message sent successfully!");
      }

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Hero Section */}
      <main
        id="home"
        className="bg-teal-100 w-full flex justify-center items-center px-4 sm:px-6 lg:px-20 py-16 md:py-24"
      >
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column: Text Content and Button */}
          <div className="flex flex-col justify-center min-h-[50vh] lg:min-h-[70vh] order-2 lg:order-1">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 md:mb-6 leading-tight">
              Your Health, Your Data,
            </h1>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 text-teal-500 leading-tight">
              Safely in Your Hands
            </h1>
            <p className="text-lg text-gray-700 max-w-lg">
              Manage your medical records, connect with care, and stay safe with MyHealthRecord
            </p>
            <button 
              onClick={() => setIsLoginOpen(true)} 
              className="mt-8 bg-teal-500 font-semibold tracking-wider text-lg text-white px-8 py-4 rounded-full hover:bg-teal-700 transition-all duration-300 w-full sm:w-64 max-w-xs"
            >
              Get Started Free
            </button>
          </div>

          {/* Right Column: Info Card */}
          <div className="order-1 hidden md:block lg:order-2">
            <div className="w-full bg-white flex flex-col rounded-3xl p-6 sm:p-10 shadow-2xl">
              <div className="flex justify-start items-center">
                <Stethoscope size={40} className="text-teal-500 flex-shrink-0" />
                <div className="flex flex-col ml-4">
                  <h2 className="text-teal-400 text-sm sm:text-base">Trusted by</h2>
                  <h1 className="font-bold text-xl sm:text-2xl">Patients</h1>
                </div>
              </div>
              <div className="mt-8">
                <ul className="list-disc marker:text-teal-500 list-color-green list-inside space-y-2 text-base sm:text-lg">
                  <li>Secure Medical Records</li>
                  <li>24/7 Emergency Access</li>
                  <li>Drug Interaction Alerts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section
        id="features"
        className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center"
      >
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="bg-teal-100 text-teal-700 px-4 py-1 rounded-full text-sm tracking-wide font-medium">
            Powerful Features
          </span>

          <h2 className="font-bold text-3xl md:text-5xl text-gray-900 mt-4 leading-snug">
            Everything You Need to <br className="hidden sm:block"/>
            <span className="text-teal-500">Manage Your Health</span>
          </h2>

          <p className="text-base md:text-lg text-gray-600 mt-4 leading-relaxed">
            From emergency access to secure storage, we've got you covered with
            comprehensive health management tools.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 md:mt-16 w-full max-w-7xl">
          {/* --- Feature Card Component (Mapping logic is unchanged but layout is responsive) --- */}
          {[
            {
              title: "Drug & Allergy Interaction Alerts",
              desc: "Automatic safety checks when adding medications. Get instant alerts about dangerous interactions and allergy conflicts.",
              badge: "Critical Safety Feature",
              gradient: "from-red-50 to-orange-50",
              border: "border-red-100",
              iconBg: "from-red-500 to-orange-500",
              textColor: "text-red-600",
              icon: (
                <svg
                  className="lucide lucide-shield h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                </svg>
              ),
            },
            {
              title: "Emergency Access Mode",
              desc: "Generate QR codes for instant access to critical medical info. Paramedics can scan and view your blood type, allergies instantly.",
              badge: "Life-Saving Technology",
              gradient: "from-amber-50 to-yellow-50",
              border: "border-amber-100",
              iconBg: "from-amber-500 to-yellow-500",
              textColor: "text-amber-700",
              icon: (
                <svg
                  className="lucide lucide-qr-code h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect width="5" height="5" x="3" y="3" rx="1" />
                  <rect width="5" height="5" x="16" y="3" rx="1" />
                  <rect width="5" height="5" x="3" y="16" rx="1" />
                  <path d="M21 16h-3a2 2 0 0 0-2 2v3"></path>
                  <path d="M21 21v.01"></path>
                </svg>
              ),
            },
            {
              title: "Medical Record Storage",
              desc: "Store lab reports, prescriptions, X-rays, and scans securely. Access your complete history anytime, anywhere.",
              badge: "Unlimited Storage",
              gradient: "from-emerald-50 to-green-50",
              border: "border-emerald-100",
              iconBg: "from-emerald-500 to-green-500",
              textColor: "text-emerald-700",
              icon: (
                <svg
                  className="lucide lucide-cloud h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                </svg>
              ),
            },
            {
              title: "Download & Share Options",
              desc: "Export your entire health history as PDF or share specific records securely with hospitals and doctors.",
              badge: "Seamless Sharing",
              gradient: "from-blue-50 to-cyan-50",
              border: "border-blue-100",
              iconBg: "from-blue-500 to-cyan-500",
              textColor: "text-blue-700",
              icon: (
                <svg
                  className="lucide lucide-share2 h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                </svg>
              ),
            },
            {
              title: "Complete Data Ownership",
              desc: "Bank-level encryption keeps your data safe. You decide who has access. Your health, your rules.",
              badge: "256-bit Encryption",
              gradient: "from-slate-50 to-gray-50",
              border: "border-slate-200",
              iconBg: "from-slate-600 to-gray-700",
              textColor: "text-slate-700",
              icon: (
                <svg
                  className="lucide lucide-lock h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              ),
            },
            {
              title: "Personalized Health Profile",
              desc: "Create a complete health profile including allergies, chronic conditions, and medical history.",
              badge: "All-In-One Dashboard",
              gradient: "from-violet-50 to-purple-50",
              border: "border-violet-100",
              iconBg: "from-violet-500 to-purple-500",
              textColor: "text-violet-700",
              icon: (
                <svg
                  className="lucide lucide-user h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="7" r="4"></circle>
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                </svg>
              ),
            },
          ].map((f, i) => (
            <div
              key={i}
              className={`group bg-gradient-to-br ${f.gradient} p-6 sm:p-8 rounded-2xl border ${f.border} hover:shadow-xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-28 h-28 bg-white opacity-20 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>

              <div className="relative">
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center mb-4 sm:mb-5 shadow-lg bg-gradient-to-br ${f.iconBg} group-hover:scale-110 transition-transform duration-300`}
                >
                  {f.icon}
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                  {f.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {f.desc}
                </p>

                <div
                  className={`flex items-center ${f.textColor} font-medium text-sm`}
                >
                  <span>{f.badge}</span>
                  <svg
                    className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* how it works */}
      <section id="how" className="px-4 sm:px-6 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <span
              className="inline-block bg-teal-100 text-teal-900 
            px-4 sm:px-6 py-2 rounded-full tracking-wide font-semibold shadow-sm text-sm"
            >
              How It Works
            </span>

            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mt-4 leading-tight">
              Your Complete Healthcare Companion
            </h2>

            <p className="text-[#1A1A1A] max-w-xl mx-auto mt-4 text-base md:text-lg leading-relaxed">
              In four simple, secure steps
            </p>
          </div>

          {/* Cards Grid */}
          {/* Default to 1 column, switch to 2 columns on md, and 4 columns on lg */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_20px_40px_0_rgba(0,168,154,0.12)] hover:shadow-[0_24px_48px_0_rgba(0,168,154,0.15)] transition-shadow duration-300"
                >
                  {/* Icon Container */}
                  <div className="flex justify-center mb-6">
                    <div className="w-14 h-14 flex items-center justify-center rounded-full bg-[#DFFCF7]">
                      <Icon className="w-7 h-7 text-[#00A89A] stroke-2" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className
                    ="text-center">
                    <h3 className="text-[#000000] font-semibold text-lg mb-2">
                      {step.title}
                    </h3>
                    <p className="text-[#1A1A1A] text-sm md:text-base">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* faq */}
      <section id="faq" className="px-4 sm:px-6 py-16 md:py-24 bg-[#F9FAFB]">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg">
              Find answers to common questions about our healthcare platform
            </p>
          </div>

          {/* FAQ Card */}
          <div className="bg-white rounded-3xl p-6 md:p-12 shadow-[0px_20px_45px_rgba(0,0,0,0.08)] border border-gray-100">
            <Accordion type="single" collapsible className="w-full space-y-2 md:space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border-b border-gray-200 pb-3 md:pb-4 last:border-b-0"
                >
                  <AccordionTrigger className="text-left text-gray-900 font-semibold hover:text-[#00A89A] transition-all text-base md:text-lg cursor-pointer py-3">
                    {faq.question}
                  </AccordionTrigger>

                  <AccordionContent className="text-gray-600 leading-relaxed text-sm md:text-base pt-2 pr-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* contact */}
      <section id="contact" className="px-4 sm:px-6 py-16 md:py-24 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg">
              Have questions? We're here to help and would love to hear from you.
            </p>
          </div>

          {/* Two Column Layout (Default to 1 column, switch to 2 columns on lg) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Contact Form */}
            <div className="bg-white rounded-3xl p-6 md:p-12 shadow-[0_20px_45px_rgba(0,0,0,0.08)] border border-gray-100">
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6 md:mb-8">
                Send us a message
              </h3>

              <form className="space-y-5 md:space-y-6" onSubmit={handleSubmit}>
                <div>
                  <Label htmlFor="name" className="text-gray-700 text-sm">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    type="text"
                    placeholder="John Doe"
                    className="mt-2 h-10 md:h-12 rounded-xl border-gray-300 bg-gray-50 text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-700 text-sm">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="john@example.com"
                    className="mt-2 h-10 md:h-12 rounded-xl border-gray-300 bg-gray-50 text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="subject" className="text-gray-700 text-sm">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    type="text"
                    placeholder="How can we help?"
                    className="mt-2 h-10 md:h-12 rounded-xl border-gray-300 bg-gray-50 text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-gray-700 text-sm">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    rows={4} // Reduced rows for smaller screens
                    placeholder="Tell us more about your inquiry..."
                    className="mt-2 rounded-xl border-gray-300 bg-gray-50 resize-none text-base"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 md:h-12 rounded-xl text-white bg-[#00A89A] hover:bg-teal-700 transition-colors"
                >
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-6 md:space-y-8">
              {/* Email Card */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_20px_45px_rgba(0,0,0,0.08)] border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#DFFCF7] flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#00A89A]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">
                      Email
                    </h4>
                    <p className="text-gray-600 text-base">sgunjal4777@gmail.com</p>
                  </div>
                </div>
              </div>

              {/* Phone Card */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_20px_45px_rgba(0,0,0,0.08)] border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#DFFCF7] flex-shrink-0">
                    <Phone className="w-5 h-5 text-[#00A89A]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">
                      Phone
                    </h4>
                    <p className="text-gray-600 text-base">+91 7744881228</p>
                  </div>
                </div>
              </div>

              {/* Office Card */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_20px_45px_rgba(0,0,0,0.08)] border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#DFFCF7] flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#00A89A]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">
                      Office
                    </h4>
                    <p className="text-gray-600 leading-relaxed text-base">
                      422605 , Maharashtra Sangamner
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial/CTA Section */}
      <div className="w-full min-h-[30vh] md:min-h-[40vh] bg-gradient-to-b from-teal-50 to-white flex justify-center items-center px-4 sm:px-6 py-16">
        <div className="w-full max-w-2xl bg-white rounded-3xl flex flex-col justify-center text-center p-8 md:p-12 items-center shadow-2xl">
          <Pause className="w-8 h-8 text-gray-400" />
          <p className="mt-6 md:mt-8 text-gray-700 italic text-base md:text-lg max-w-xl">
            MyHealthRecord gave me my life back as passbook knowing all
            favourite info is digitalized and foreseeable, especially,{" "}
            <span className="text-teal-400 font-semibold">Highly Recommended!</span>
          </p>
          <button 
            onClick={() => setIsSignUpOpen(true)} 
            className="mt-6 md:mt-8 bg-teal-600 text-white px-8 py-3 rounded-full shadow-2xl hover:bg-teal-700 hover:-translate-y-1 transition-all duration-300 font-semibold text-base"
          >
            Signup Now
          </button>
        </div>
      </div>

      <Footer />
      {/* Modals are already responsive, no change needed */}
      <Login
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToSignUp={() => {
          setIsLoginOpen(false);
          setIsSignUpOpen(true);
        }}
      />

      <SignUp
        isOpen={isSignUpOpen}
        onClose={() => setIsSignUpOpen(false)}
        onSwitchToLogin={() => {
          setIsSignUpOpen(false);
          setIsLoginOpen(true);
        }}
        onOpenOtp={() => setIsOtpOpen(true)}
      />

      <OTP
        isOpen={isOtpOpen}
        onClose={() => setIsOtpOpen(false)}
        onOpenLogin={() => setIsLoginOpen(true)}
      />
    </div>
  );
}