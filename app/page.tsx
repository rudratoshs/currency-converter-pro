"use client";
import CurrencyExchange from "@/components/currency-exchange";
import Head from "next/head";
import { ParallaxProvider, Parallax } from "react-scroll-parallax";
import {
  Globe2,
  Zap,
  Shield,
  Clock,
  CreditCard,
  HeadphonesIcon,
} from "lucide-react";
import CurrencyTable from "@/components/currency-table";
import dynamic from "next/dynamic";
const AdComponent = dynamic(() => import("@/components/AdComponent"), { ssr: false });
import { useEffect } from "react";

export default function LandingPage() {
  return (
    <>
      <ParallaxProvider>
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-pink-50">
          <header className="bg-white/50 backdrop-blur-sm sticky top-0 z-50 border-b border-pink-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-8">
                  <div className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 text-transparent bg-clip-text">
                    CurrencySwap
                  </div>
                  <nav className="hidden md:block">
                    <ul className="flex space-x-8">
                      <li>
                        <a
                          href="#exchange"
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Exchange
                        </a>
                      </li>
                      <li>
                        <a
                          href="#features"
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Features
                        </a>
                      </li>
                      <li>
                        <a
                          href="#about"
                          className="text-gray-600 hover:text-gray-900"
                        >
                          About
                        </a>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <section className="text-center mb-16">
              <Parallax translateY={[-20, 20]}>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-red-500 to-pink-500 text-transparent bg-clip-text mb-6">
                  Exchange Currencies with Confidence
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Fast, secure, and reliable currency exchange platform with
                  real-time rates and minimal fees
                </p>
              </Parallax>
            </section>

            <CurrencyExchange />

            {/* Ad Component for First Ad */}
            <AdComponent adSlot="2157275577" />

            <CurrencyTable />

            <section id="features" className="mt-24">
              <Parallax translateY={[20, -20]}>
                <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
                  Why Choose CurrencySwap?
                </h2>
              </Parallax>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FeatureCard
                  icon={<Globe2 className="w-6 h-6 text-blue-500" />}
                  title="Global Coverage"
                  description="Access to over 150+ currencies worldwide with competitive exchange rates"
                />
                <FeatureCard
                  icon={<Zap className="w-6 h-6 text-yellow-500" />}
                  title="Instant Transfers"
                  description="Lightning-fast currency exchanges with immediate confirmation"
                />
                <FeatureCard
                  icon={<Shield className="w-6 h-6 text-green-500" />}
                  title="Secure Platform"
                  description="Bank-grade security measures to protect your transactions"
                />
                <FeatureCard
                  icon={<Clock className="w-6 h-6 text-purple-500" />}
                  title="24/7 Trading"
                  description="Exchange currencies any time, any day, from anywhere"
                />
                <FeatureCard
                  icon={<CreditCard className="w-6 h-6 text-indigo-500" />}
                  title="Multiple Payment Options"
                  description="Support for various payment methods including cards and bank transfers"
                />
                <FeatureCard
                  icon={<HeadphonesIcon className="w-6 h-6 text-pink-500" />}
                  title="Expert Support"
                  description="Dedicated customer support team available round the clock"
                />
              </div>
            </section>

            {/* Ad Component for Second Ad */}
            <AdComponent adSlot="5852876375" />
          </main>

          <footer id="about" className="bg-white mt-24 border-t border-pink-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    About CurrencySwap
                  </h3>
                  <p className="text-gray-600">
                    Your trusted partner for fast and secure currency exchanges
                    worldwide.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Quick Links
                  </h3>
                  <ul className="space-y-2">
                    <li>
                      <a
                        href="#exchange"
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Exchange Rates
                      </a>
                    </li>
                    <li>
                      <a
                        href="#features"
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Features
                      </a>
                    </li>
                    <li>
                      <a
                        href="#about"
                        className="text-gray-600 hover:text-gray-900"
                      >
                        About
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Help Center
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Legal
                  </h3>
                  <ul className="space-y-2">
                    <li>
                      <a href="#" className="text-gray-600 hover:text-gray-900">
                        Privacy Policy
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-gray-600 hover:text-gray-900">
                        Terms of Service
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Contact
                  </h3>
                  <ul className="space-y-2">
                    <li className="text-gray-600">support@currencyswap.com</li>
                    <li className="text-gray-600">+1 (555) 123-4567</li>
                  </ul>
                  <div className="mt-4 flex space-x-4">
                    <a href="#" className="text-blue-500 hover:text-blue-600">
                      Twitter
                    </a>
                    <a href="#" className="text-blue-700 hover:text-blue-800">
                      LinkedIn
                    </a>
                    <a href="#" className="text-blue-600 hover:text-blue-700">
                      Facebook
                    </a>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-pink-100 text-center text-gray-600">
                © {new Date().getFullYear()} CurrencySwap. All rights reserved.
              </div>
            </div>
          </footer>
        </div>
      </ParallaxProvider>
    </>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:scale-105 transition-transform border border-pink-100">
      <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}