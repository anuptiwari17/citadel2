'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, BookOpen, Users, Clock, Shield, BarChart3, CheckCircle, Menu, X } from 'lucide-react';

export default function CitadelLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">Citadel</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">
                Features
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">
                How it Works
              </a>
              <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">
                Testimonials
              </a>
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">
                Login
              </Link>
              <Link href="/signup" className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition">
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="px-6 py-4 space-y-3">
              <a href="#features" className="block text-sm font-medium text-gray-600">Features</a>
              <a href="#how-it-works" className="block text-sm font-medium text-gray-600">How it Works</a>
              <a href="#testimonials" className="block text-sm font-medium text-gray-600">Testimonials</a>
              <Link href="/login" className="block w-full text-left text-sm font-medium text-gray-600">Login</Link>
              <Link href="/signup" className="block w-full px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-full mb-6">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-blue-700">Trusted by NIT Jalandhar</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Smart Library Management for Modern Institutions
            </h1>

            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Manage 10,000+ books, 1,000+ users with zero hassle. Automated tracking, instant search, and seamless operations.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="px-8 py-4 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition flex items-center space-x-2 group">
                <span><Link href="/signup">Get Started Free</Link></span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </button>
              <button className="px-8 py-4 bg-white text-gray-900 font-medium rounded-xl border-2 border-gray-200 hover:border-gray-300 transition">
                View Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-gray-100">
              <div>
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">10,000+</div>
                <div className="text-sm text-gray-600">Books Managed</div>
              </div>
              <div>
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">1,000+</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div>
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">99%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Everything you need to manage your library
            </h2>
            <p className="text-lg text-gray-600">
              Powerful features designed for librarians, students, and administrators
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <BookOpen className="w-6 h-6" />,
                title: "Smart Book Search",
                description: "Lightning-fast search by title, author, ISBN, or category. Find any book in under 1 second."
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: "Automated Tracking",
                description: "Automatic overdue detection, fine calculation, and email reminders. No manual work."
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Multi-Role Access",
                description: "Separate dashboards for students, faculty, librarians, and admins with role-based permissions."
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Secure & Reliable",
                description: "Bank-level encryption, secure authentication, and 99% uptime guarantee."
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: "Advanced Reports",
                description: "Generate detailed reports on borrowing trends, popular books, and user activity."
              },
              {
                icon: <CheckCircle className="w-6 h-6" />,
                title: "Easy to Use",
                description: "Intuitive interface that requires only 2 hours of training. Works on any device."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl hover:shadow-lg transition border border-gray-100">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Get started in minutes
            </h2>
            <p className="text-lg text-gray-600">
              Simple three-step process to modernize your library
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Register Account",
                description: "Create your account with name, email, and role. Get instant Member ID."
              },
              {
                step: "02",
                title: "Search Books",
                description: "Browse 10,000+ books using our lightning-fast search. Check availability instantly."
              },
              {
                step: "03",
                title: "Borrow & Track",
                description: "Issue books at the desk. Track due dates, get reminders, and manage fines automatically."
              }
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="text-7xl font-bold text-gray-100 mb-4">{step.step}</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-transparent -z-10"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Why libraries choose Citadel
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Built specifically for academic institutions with real-world needs in mind
              </p>

              <div className="space-y-6">
                {[
                  { title: "Lightning Fast", desc: "1-second search, instant book availability" },
                  { title: "Zero Paperwork", desc: "Fully digital operations, automated records" },
                  { title: "Cost Effective", desc: "Replace expensive legacy systems" },
                  { title: "24/7 Support", desc: "Dedicated team for quick resolution" }
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">{item.title}</div>
                      <div className="text-gray-600">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: "Books Capacity", value: "10,000+" },
                  { label: "Concurrent Users", value: "20" },
                  { label: "Response Time", value: "< 1 sec" },
                  { label: "Uptime", value: "99%" },
                  { label: "Student Limit", value: "3 books" },
                  { label: "Faculty Limit", value: "5 books" }
                ].map((stat, index) => (
                  <div key={index} className="p-6 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Loved by librarians and students
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Citadel reduced our manual work by 90%. Book tracking is now fully automated.",
                name: "Priya Sharma",
                role: "Head Librarian, NIT Jalandhar"
              },
              {
                quote: "Finding books is instant. The interface is so clean and easy to use.",
                name: "Rahul Kumar",
                role: "B.Tech Student"
              },
              {
                quote: "Best library system we've used. Reports and analytics are incredibly helpful.",
                name: "Dr. Vijay Kumar",
                role: "Faculty, IT Department"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition">
                <div className="text-4xl text-blue-600 mb-4">&#34;</div>
                <p className="text-gray-700 mb-6 leading-relaxed">{testimonial.quote}</p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full"></div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to modernize your library?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Join NIT Jalandhar and start managing your library the smart way
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-8 py-4 bg-white text-gray-900 font-medium rounded-xl hover:bg-gray-100 transition flex items-center space-x-2 group">
              <span> <Link href="/signup">Get Started Free</Link></span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </button>
            <button className="px-8 py-4 bg-transparent text-white font-medium rounded-xl border-2 border-gray-700 hover:border-gray-600 transition">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-8 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-gray-900">Citadel</span>
              </div>
              <p className="text-gray-600 text-sm">
                Smart library management for modern institutions
              </p>
            </div>

            <div>
              <div className="font-semibold text-gray-900 mb-4">Product</div>
              <div className="space-y-2 text-sm text-gray-600">
                <div>Features</div>
                <div>Pricing</div>
                <div>Demo</div>
              </div>
            </div>

            <div>
              <div className="font-semibold text-gray-900 mb-4">Resources</div>
              <div className="space-y-2 text-sm text-gray-600">
                <div>Documentation</div>
                <div>Support</div>
                <div>FAQ</div>
              </div>
            </div>

            <div>
              <div className="font-semibold text-gray-900 mb-4">Contact</div>
              <div className="space-y-2 text-sm text-gray-600">
                <div>citadel@nitj.ac.in</div>
                <div>NIT Jalandhar, Punjab</div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
            <div>© 2025 Citadel LMS. All rights reserved.</div>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}