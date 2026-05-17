import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { FiSearch, FiGrid, FiArrowLeft } from 'react-icons/fi'
import MarketingLayout from '../components/MarketingLayout'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

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
          <div className="bg-gradient-to-r from-blue-600 to-gray-700 text-white py-4">
            <div className="max-w-7xl mx-auto px-4">
              <h1 className="text-3xl font-bold mb-2">Categories</h1>
              <p className="text-blue-100">
                Browse products by category
              </p>
            </div>
          </div>
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        </div>
      </MarketingLayout>
    )
  }

  return (
    <MarketingLayout activeNav="categories">
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 to-gray-700 text-white py-4">
          <div className={`max-w-7xl mx-auto px-4 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {selectedCategory ? (
              <div>
                <button
                  onClick={handleBackToCategories}
                  className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg mb-4 transition-colors"
                >
                  <FiArrowLeft size={18} /> Back to Categories
                </button>
                <h1 className="text-3xl font-bold mb-2">{selectedCategory.name}</h1>
                <p className="text-blue-100">{filteredProducts.length} products found</p>
              </div>
            ) : (
              <div>
                <h1 className="text-3xl font-bold mb-2">Categories</h1>
                <p className="text-blue-100">
                  Browse products by category
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {selectedCategory ? (
            <>
              <div className={`mb-8 transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="relative max-w-md">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {loadingProducts ? (
                <div className="flex justify-center py-16">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className={`text-center py-16 transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <FiGrid size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">
                    {search ? 'No products found matching your search.' : 'No products in this category yet.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredProducts.map((product, i) => (
                    <Link
                      key={product._id}
                      to={`/product/${product._id}`}
                      className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 group opacity-0 ${visible ? 'animate-fade-in-up' : ''}`}
                      style={{ animationDelay: `${(i % 6) * 100}ms`, animationFillMode: 'forwards' }}
                    >
                      <div className="aspect-square bg-gray-100 overflow-hidden">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-blue-600 font-bold text-lg mt-1">
                          Rs. {product.price?.toLocaleString() || 0}
                        </p>
                        {product.discountPrice && (
                          <p className="text-gray-400 text-xs line-through mt-1">
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((category, i) => (
                <button
                  key={category._id}
                  onClick={() => handleCategoryClick(category)}
                  className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 group text-left opacity-0 ${visible ? 'animate-fade-in-up' : ''}`}
                  style={{ animationDelay: `${(i % 6) * 100}ms`, animationFillMode: 'forwards' }}
                >
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 text-blue-600">
                    <FiGrid size={28} />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">{category.description}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </MarketingLayout>
  )
}