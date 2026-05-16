import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiMessageCircle,
  FiClock,
  FiSend,
  FiChevronDown,
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiLinkedin,
  FiYoutube,
} from 'react-icons/fi'
import MarketingLayout from '../components/MarketingLayout'

const faqs = [
  {
    q: 'How do I contact a vendor?',
    a: "You can visit the vendor's profile and click on the 'Message' button to start a chat.",
  },
  {
    q: 'How do I track my order?',
    a: "Go to 'My Orders' section in your account to track your order status in real-time.",
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept Cash on Delivery, Credit/Debit Cards, Easypaisa, JazzCash and more.',
  },
  {
    q: 'Can I return a product?',
    a: 'Yes! We offer hassle-free returns. Check our Return Policy for more details.',
  },
]

export default function ContactPage() {
  const [visible, setVisible] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })

  useEffect(() => {
    setVisible(true)
  }, [])

  return (
    <MarketingLayout activeNav="contact">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-50/50 to-green-50/30 overflow-hidden border-b border-blue-100/50">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-20 lg:py-24 grid md:grid-cols-2 items-center gap-12">
          <div className={`z-10 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">Contact Us</h1>
            <h2 className="text-3xl md:text-4xl font-bold text-green-600 mb-6">We're Here to Help!</h2>
            <p className="text-lg text-gray-600 mb-10 max-w-lg leading-relaxed">
              Have a question, suggestion, or need support? Our team is always ready to assist you. Reach out to us and
              we'll get back to you as soon as possible.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white/80 backdrop-blur rounded-xl border border-blue-50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiClock size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Fast Response</p>
                  <p className="text-[10px] text-gray-500">Within 24 hours</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/80 backdrop-blur rounded-xl border border-blue-50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiMapPin size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Local Support</p>
                  <p className="text-[10px] text-gray-500">Based in your city</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/80 backdrop-blur rounded-xl border border-blue-50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiMessageCircle size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Customer First</p>
                  <p className="text-[10px] text-gray-500">Our top priority</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`relative flex justify-center lg:justify-end transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <div className="w-full max-w-md aspect-square bg-blue-400/10 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-3xl" />
            <svg viewBox="0 0 500 400" className="w-full h-auto drop-shadow-2xl relative z-10 max-w-lg">
              <defs>
                <linearGradient id="groundGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f1f5f9" />
                  <stop offset="100%" stopColor="#e2e8f0" />
                </linearGradient>
              </defs>
              <rect x="100" y="260" width="300" height="20" fill="url(#groundGrad)" rx="10" />
              {/* Simple stylized vendor/customer representation to match image vibe */}
              <circle cx="200" cy="150" r="45" fill="#334155" />
              <rect x="165" y="195" width="70" height="90" fill="#16a34a" rx="12" />
              <circle cx="340" cy="170" r="40" fill="#1e293b" />
              <rect x="310" y="210" width="60" height="75" fill="#2563eb" rx="12" />
              {/* Floating map pins */}
              <circle cx="420" cy="80" r="12" fill="#2563eb" />
              <path d="M420 80 L428 110 L412 110 Z" fill="#2563eb" />
              <circle cx="80" cy="110" r="12" fill="#16a34a" />
              <path d="M80 110 L88 140 L72 140 Z" fill="#16a34a" />
            </svg>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 lg:py-20 grid lg:grid-cols-3 gap-12 lg:gap-16">
        {/* Contact Form */}
        <div className={`lg:col-span-2 transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h3 className="text-2xl font-bold mb-2">Send Us a Message</h3>
          <p className="text-gray-500 mb-8">Fill out the form below and we'll get back to you.</p>

          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none appearance-none bg-white">
                  <option>How can we help you?</option>
                  <option>Order Support</option>
                  <option>Vendor Inquiry</option>
                  <option>General Feedback</option>
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                rows="5"
                placeholder="Type your message here..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-200"
            >
              <FiSend />
              Send Message
            </button>
            <p className="text-xs text-gray-400 mt-4">
              By submitting this form, you agree to our{' '}
              <Link to="#" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </form>
        </div>

        {/* Contact Info Sidebar */}
        <div className={`space-y-10 transition-all duration-700 delay-400 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div>
            <h3 className="text-2xl font-bold mb-2">Contact Information</h3>
            <p className="text-gray-500 mb-8">Choose the best way to reach us.</p>

            <div className="space-y-4">
              <div className="flex gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:-translate-x-1 transition-all duration-300 cursor-pointer group">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <FiMapPin size={24} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Visit Us</p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    123 Marketivo Street, Johar Town,
                    <br />
                    Lahore, Pakistan
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:-translate-x-1 transition-all duration-300 cursor-pointer group">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <FiPhone size={24} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Call Us</p>
                  <p className="text-sm text-gray-500">+92 300 1234567</p>
                  <p className="text-[10px] text-gray-400">Mon - Sat, 9:00 AM - 8:00 PM</p>
                </div>
              </div>

              <div className="flex gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:-translate-x-1 transition-all duration-300 cursor-pointer group">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <FiMail size={24} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Email Us</p>
                  <p className="text-sm text-blue-600 hover:underline">support@marketivo.com</p>
                  <p className="text-[10px] text-gray-400">We reply within 24 hours</p>
                </div>
              </div>

              <div className="flex gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FiMessageCircle size={24} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Live Chat</p>
                  <p className="text-sm text-gray-500">Chat with our support team</p>
                  <p className="text-[10px] text-green-600 font-medium">Available on website</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">Follow Us</h4>
            <p className="text-sm text-gray-500 mb-6">Stay connected with us on our social media.</p>
            <div className="flex gap-3">
              <button className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                <FiFacebook />
              </button>
              <button className="w-10 h-10 bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-500 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                <FiInstagram />
              </button>
              <button className="w-10 h-10 bg-sky-400 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                <FiTwitter />
              </button>
              <button className="w-10 h-10 bg-blue-800 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                <FiLinkedin />
              </button>
              <button className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                <FiYoutube />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Answers (FAQs) */}
      <div className={`max-w-7xl mx-auto px-4 py-16 lg:py-20 border-t border-gray-100 transition-all duration-700 delay-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold">Quick Answers</h2>
          <Link to="#" className="text-blue-600 font-bold flex items-center gap-1 text-sm">
            View All FAQs &rarr;
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors pr-4">{faq.q}</h4>
                <FiChevronDown className="text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 mt-1" />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </MarketingLayout>
  )
}
