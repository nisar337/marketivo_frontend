import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import {
  FiSearch, FiArrowLeft, FiArrowRight,
  FiShoppingCart, FiBook, FiMonitor, FiHeart,
  FiHome, FiTag, FiPackage, FiStar, FiTruck,
  FiCamera, FiMusic, FiCoffee, FiSmartphone,
  FiWatch, FiGrid,
} from 'react-icons/fi'
import {
  MdSportsBasketball, MdOutlineToys, MdOutlinePets,
  MdOutlineDirectionsCar, MdOutlineYard,
} from 'react-icons/md'
import MarketingLayout from '../components/MarketingLayout'
import ModernLoader from '../components/ModernLoader'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const CATEGORY_STYLES = [
  { bg: 'bg-purple-100',  icon: 'text-purple-500'  },
  { bg: 'bg-orange-100',  icon: 'text-orange-500'  },
  { bg: 'bg-sky-100',     icon: 'text-sky-500'     },
  { bg: 'bg-pink-100',    icon: 'text-pink-500'    },
  { bg: 'bg-green-100',   icon: 'text-green-500'   },
  { bg: 'bg-yellow-100',  icon: 'text-yellow-600'  },
  { bg: 'bg-indigo-100',  icon: 'text-indigo-500'  },
  { bg: 'bg-red-100',     icon: 'text-red-500'     },
  { bg: 'bg-teal-100',    icon: 'text-teal-500'    },
  { bg: 'bg-fuchsia-100', icon: 'text-fuchsia-500' },
  { bg: 'bg-cyan-100',    icon: 'text-cyan-500'    },
  { bg: 'bg-lime-100',    icon: 'text-lime-600'    },
]

const CATEGORY_ICONS = [
  FiShoppingCart, FiBook, FiMonitor, FiHeart,
  FiHome, MdSportsBasketball, MdOutlineToys, FiCamera,
  FiSmartphone, FiWatch, FiMusic, FiCoffee,
  MdOutlineDirectionsCar, MdOutlinePets, FiTruck, FiPackage,
  FiStar, FiTag, MdOutlineYard, FiGrid,
]

function getCategoryMeta(index) {
  return {
    style: CATEGORY_STYLES[index % CATEGORY_STYLES.length],
    Icon: CATEGORY_ICONS[index % CATEGORY_ICONS.length],
  }
}

export default function CategoriesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [search, setSearch] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`${API}/api/categories`)
        setCategories(data.categories || [])
      } catch (err) {
        console.error('Failed to load categories:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  // Auto-select category from ?cat= URL param (e.g. from header dropdown)
  useEffect(() => {
    const catId = searchParams.get('cat')
    if (!catId || categories.length === 0) return
    if (selectedCategory?._id === catId) return
    const match = categories.find((c) => c._id === catId)
    if (match) {
      handleCategoryClick(match)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, categories])

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category)
    setLoadingProducts(true)
    setProducts([])
    setVisible(true)
    try {
      const { data } = await axios.get(`${API}/api/products?category=${category._id}`)
      setProducts(data.products || [])
    } catch (err) {
      console.error('Failed to load products:', err)
    } finally {
      setLoadingProducts(false)
    }
  }

  const handleBackToCategories = () => {
    setSelectedCategory(null)
    setProducts([])
    setVisible(true)
    if (searchParams.get('cat')) {
      const next = new URLSearchParams(searchParams)
      next.delete('cat')
      setSearchParams(next, { replace: true })
    }
  }

  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <MarketingLayout activeNav="categories">
        <div className="min-h-screen bg-gray-50">
          <HeroBanner />
          <div className="flex justify-center py-20">
            <ModernLoader size={64} label="Loading categories…" />
          </div>
        </div>
      </MarketingLayout>
    )
  }

  return (
    <MarketingLayout activeNav="categories">
      <div className="min-h-screen bg-gray-50">

        {/* Hero or back-header */}
        {selectedCategory ? (
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-6 px-4">
            <div className={`max-w-7xl mx-auto transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <button
                onClick={handleBackToCategories}
                className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 px-4 py-2 rounded-xl mb-4 text-sm font-medium transition-colors"
              >
                <FiArrowLeft size={16} /> Back to Categories
              </button>
              <h1 className="text-3xl font-bold">{selectedCategory.name}</h1>
              <p className="text-indigo-200 mt-1">{filteredProducts.length} products found</p>
            </div>
          </div>
        ) : (
          <HeroBanner />
        )}

        <div className="max-w-7xl mx-auto px-4 py-8">
          {selectedCategory ? (
            <>
              <div className={`mb-8 transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="relative max-w-md">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {loadingProducts ? (
                <div className="flex justify-center py-16">
                  <ModernLoader size={56} label="Loading products…" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className={`text-center py-20 transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                    <FiGrid size={36} className="text-indigo-300" />
                  </div>
                  <p className="text-gray-500 text-lg font-medium">
                    {search ? 'No products found matching your search.' : 'No products in this category yet.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredProducts.map((product, i) => (
                    <Link
                      key={product._id}
                      to={`/product/${product._id}`}
                      className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group opacity-0 ${visible ? 'animate-fade-in-up' : ''}`}
                      style={{ animationDelay: `${(i % 8) * 75}ms`, animationFillMode: 'forwards' }}
                    >
                      <div className="aspect-square bg-gray-50 overflow-hidden">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <FiPackage size={40} />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 text-sm truncate group-hover:text-indigo-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-indigo-600 font-bold text-base mt-1">
                          Rs. {product.price?.toLocaleString() || 0}
                        </p>
                        {product.discountPrice && (
                          <p className="text-gray-400 text-xs line-through">
                            Rs. {product.discountPrice?.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {categories.map((category, i) => {
                const { style, Icon } = getCategoryMeta(i)
                return (
                  <button
                    key={category._id}
                    onClick={() => handleCategoryClick(category)}
                    className={`bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group text-left opacity-0 ${visible ? 'animate-fade-in-up' : ''}`}
                    style={{ animationDelay: `${(i % 8) * 75}ms`, animationFillMode: 'forwards' }}
                  >
                    <div className={`w-14 h-14 rounded-full ${style.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={26} className={style.icon} />
                    </div>
                    <h3 className="font-bold text-base text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-400 text-xs mt-1">
                      {category.productCount != null
                        ? `${category.productCount.toLocaleString()}+ Products`
                        : category.description
                          ? category.description.slice(0, 40)
                          : 'Browse products'}
                    </p>
                    <div className="mt-4 flex justify-end">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${style.bg} ${style.icon} group-hover:scale-110 transition-transform duration-200`}>
                        <FiArrowRight size={14} />
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </MarketingLayout>
  )
}

function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl mx-4 mt-4" style={{ background: 'linear-gradient(135deg, #3730a3 0%, #4f46e5 40%, #7c3aed 100%)' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #818cf8 0%, transparent 70%)' }} />
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-white opacity-60"
            style={{
              top: `${[20, 60, 35, 75, 15, 55][i]}%`,
              left: `${[45, 55, 65, 48, 58, 72][i]}%`,
            }}
          />
        ))}
      </div>
      <div className="relative max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
        <div className="text-white max-w-lg">
          <h1 className="text-5xl font-extrabold mb-3 leading-tight">Categories</h1>
          <p className="text-indigo-200 text-base leading-relaxed">
            Browse products by category and find the best<br />local vendors near you.
          </p>
        </div>
        <div className="hidden md:flex items-end gap-4 relative" style={{ height: 180 }}>
          <div className="absolute" style={{ right: 120, bottom: 10, transform: 'rotate(-12deg)' }}>
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-xl">
              <FiCamera size={26} className="text-white" />
            </div>
          </div>
          <div className="absolute" style={{ right: 0, bottom: 60, transform: 'rotate(8deg)' }}>
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-xl">
              <MdSportsBasketball size={26} className="text-white" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="w-36 h-40 rounded-3xl flex flex-col items-center justify-center shadow-2xl" style={{ background: 'linear-gradient(160deg, #6366f1, #8b5cf6)' }}>
              <div className="w-20 h-20 rounded-full bg-white/15 flex items-center justify-center mb-2">
                <FiShoppingCart size={36} className="text-white" />
              </div>
              <div className="flex gap-1.5">
                <div className="w-5 h-5 rounded-full bg-white/30" />
                <div className="w-5 h-5 rounded-full bg-white/30" />
              </div>
            </div>
          </div>
          <div className="absolute" style={{ left: -40, top: 10, transform: 'rotate(-8deg)' }}>
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-xl">
              <FiMonitor size={26} className="text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}