import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiUsers, FiTarget, FiHeart, FiAward, FiMapPin, FiChevronDown, FiTrendingUp, FiShield } from 'react-icons/fi'
import MarketingLayout from '../components/MarketingLayout'

function HeroIllustration() {
  return (
    <svg viewBox="0 0 420 280" className="w-full h-auto max-h-72" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="abSky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#dbeafe" />
          <stop offset="100%" stopColor="#eff6ff" />
        </linearGradient>
      </defs>
      <rect width="420" height="280" fill="url(#abSky)" rx="12" />
      <rect x="20" y="160" width="55" height="90" fill="#cbd5e1" opacity="0.45" rx="2" />
      <rect x="85" y="140" width="65" height="110" fill="#cbd5e1" opacity="0.4" rx="2" />
      <rect x="300" y="150" width="50" height="100" fill="#cbd5e1" opacity="0.45" rx="2" />
      <rect x="355" y="130" width="45" height="120" fill="#cbd5e1" opacity="0.35" rx="2" />
      <ellipse cx="210" cy="248" rx="160" ry="18" fill="#bfdbfe" opacity="0.5" />
      <rect x="120" y="175" width="180" height="70" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" rx="6" />
      <path d="M120 175 L210 130 L300 175" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
      <circle cx="165" cy="210" r="14" fill="#fdba74" />
      <rect x="155" y="224" width="20" height="28" fill="#2563eb" rx="3" />
      <circle cx="210" cy="200" r="14" fill="#fcd34d" />
      <rect x="200" y="214" width="20" height="36" fill="#16a34a" rx="3" />
      <circle cx="255" cy="210" r="14" fill="#fdba74" />
      <rect x="245" y="224" width="20" height="28" fill="#2563eb" rx="3" />
      <rect x="155" y="248" width="180" height="8" fill="#e2e8f0" rx="2" />
      <circle cx="95" cy="95" r="10" fill="#16a34a" />
      <circle cx="325" cy="88" r="10" fill="#2563eb" />
    </svg>
  )
}

const faqs = [
  {
    q: 'What is Marketivo?',
    a: 'Marketivo is a local marketplace that connects shoppers with trusted vendors in your area—so you can discover products nearby and support small businesses.',
  },
  {
    q: 'How do you verify vendors?',
    a: 'We review vendor profiles, contact details, and listing quality. Our team works to keep the platform safe and reliable for customers.',
  },
  {
    q: 'Is my payment information secure?',
    a: 'We follow industry best practices for secure checkout and never store your full card details on our servers.',
  },
  {
    q: 'How does Marketivo help the community?',
    a: 'Every purchase strengthens local businesses, creates jobs close to home, and keeps more value circulating in your neighborhood.',
  },
]

export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
  }, [])

  return (
    <MarketingLayout activeNav="about">
      {/* Hero — Contact page style */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-100/90 via-blue-50 to-white border-b border-blue-100/80">
        <div className="absolute inset-0 opacity-[0.35] pointer-events-none" aria-hidden>
          <svg className="w-full h-48" preserveAspectRatio="none" viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80 L100 60 L200 75 L320 45 L440 70 L560 40 L680 65 L800 50 L920 72 L1040 55 L1200 80 L1200 120 L0 120 Z" fill="#93c5fd" opacity="0.25" />
            <path d="M0 95 L150 78 L300 92 L450 65 L600 88 L750 70 L900 90 L1050 75 L1200 95 L1200 120 L0 120 Z" fill="#60a5fa" opacity="0.2" />
          </svg>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-12 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">About Us</h1>
              <p className="mt-3 text-2xl md:text-3xl font-bold text-green-600">Built for local commerce.</p>
              <p className="mt-4 text-gray-600 text-lg leading-relaxed max-w-xl">
                We believe neighborhoods thrive when shoppers and sellers meet on fair, simple, human terms. Marketivo exists to make that connection effortless.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <div className="flex items-start gap-3 rounded-xl bg-white/80 border border-blue-100 px-4 py-3 shadow-sm min-w-[140px] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                    <FiTrendingUp size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Growth minded</p>
                    <p className="text-xs text-gray-600">Tools vendors actually use</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-white/80 border border-green-100 px-4 py-3 shadow-sm min-w-[140px] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white">
                    <FiMapPin size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Local first</p>
                    <p className="text-xs text-gray-600">Nearby vendors & delivery</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-white/80 border border-blue-100 px-4 py-3 shadow-sm min-w-[140px] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                    <FiShield size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Customer first</p>
                    <p className="text-xs text-gray-600">Support when you need it</p>
                  </div>
                </div>
              </div>
            </div>
            <div className={`flex justify-center lg:justify-end transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
              <div className="w-full max-w-md rounded-2xl border border-white shadow-lg bg-white/60 p-4 backdrop-blur-sm">
                <HeroIllustration />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two-column story + highlights */}
      <section className={`max-w-7xl mx-auto px-4 py-14 lg:py-20 transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
          <div className="lg:col-span-3 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Our story</h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Marketivo started with a simple observation: the best products and services are often hiding just around the corner—but finding them online was harder than it should be. We set out to build a storefront experience that feels as familiar as your favorite big marketplace, while putting local vendors at the center.
              </p>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Today we work with sellers across categories, from fresh food to fashion, helping them reach new customers without losing what makes them special—their personality, their craft, and their connection to the community.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-4 text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <p className="text-2xl font-bold text-blue-600">500+</p>
                <p className="text-xs font-medium text-gray-600 mt-1">Local vendors</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-green-50 to-white p-4 text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <p className="text-2xl font-bold text-green-600">50k+</p>
                <p className="text-xs font-medium text-gray-600 mt-1">Happy orders</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-4 text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <p className="text-2xl font-bold text-blue-600">24/7</p>
                <p className="text-xs font-medium text-gray-600 mt-1">Support</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">At a glance</h3>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex gap-4 hover:shadow-md hover:-translate-x-1 transition-all duration-300 cursor-pointer group">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white group-hover:scale-110 transition-transform">
                <FiTarget size={22} />
              </div>
              <div>
                <p className="font-bold text-gray-900">Our mission</p>
                <p className="text-sm text-gray-600 mt-1">Give every local vendor a fair shot online—with tools, visibility, and buyers who care.</p>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex gap-4 hover:shadow-md hover:-translate-x-1 transition-all duration-300 cursor-pointer group">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-white group-hover:scale-110 transition-transform">
                <FiHeart size={22} />
              </div>
              <div>
                <p className="font-bold text-gray-900">Our values</p>
                <p className="text-sm text-gray-600 mt-1">Transparency, respect for sellers, and shopping that feels personal—not transactional.</p>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex gap-4 hover:shadow-md hover:-translate-x-1 transition-all duration-300 cursor-pointer group">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white group-hover:scale-110 transition-transform">
                <FiUsers size={22} />
              </div>
              <div>
                <p className="font-bold text-gray-900">Who we serve</p>
                <p className="text-sm text-gray-600 mt-1">Neighborhood customers, growing businesses, and anyone who wants to keep commerce human.</p>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex gap-4 hover:shadow-md hover:-translate-x-1 transition-all duration-300 cursor-pointer group">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-white group-hover:scale-110 transition-transform">
                <FiAward size={22} />
              </div>
              <div>
                <p className="font-bold text-gray-900">Quality focus</p>
                <p className="text-sm text-gray-600 mt-1">We spotlight vendors who take pride in what they sell—so you can shop with confidence.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className={`bg-gradient-to-r from-sky-100 via-blue-50 to-indigo-50 border-y border-blue-100 transition-all duration-700 delay-400 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="hidden sm:block w-36 flex-shrink-0">
              <HeroIllustration />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Support local. Sell local.</h2>
              <p className="mt-2 text-gray-600 max-w-lg">
                Join thousands of vendors reaching customers who want to shop nearby. List your products and grow with Marketivo.
              </p>
            </div>
          </div>
          <Link
            to="/register?vendor=1"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all hover:scale-[1.02]"
          >
            Become a vendor
          </Link>
        </div>
      </section>

      {/* FAQ — Quick answers */}
      <section className={`max-w-7xl mx-auto px-4 py-14 lg:py-20 transition-all duration-700 delay-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-10">Quick answers</h2>
        <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
          {faqs.map((item, i) => {
            const open = openFaq === i
            return (
              <button
                key={item.q}
                type="button"
                onClick={() => setOpenFaq(open ? -1 : i)}
                className={`text-left rounded-2xl border transition-all p-5 ${open ? 'border-blue-200 bg-blue-50/50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-semibold text-gray-900 pr-2">{item.q}</span>
                  <FiChevronDown className={`flex-shrink-0 text-blue-600 transition-transform ${open ? 'rotate-180' : ''}`} size={22} />
                </div>
                {open && <p className="mt-3 text-sm text-gray-600 leading-relaxed border-t border-blue-100/80 pt-3">{item.a}</p>}
              </button>
            )
          })}
        </div>
      </section>
    </MarketingLayout>
  )
}
