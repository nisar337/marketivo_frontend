import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { FiSearch, FiTag, FiArrowLeft, FiShoppingCart } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import MarketingLayout from '../components/MarketingLayout'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function DealsPage() {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [visible, setVisible] = useState(false)
  const [addingToCart, setAddingToCart] = useState(null)
  const { addToCart } = useCart()
  const { user } = useAuth()

  useEffect(() => {
    setVisible(true)
    const q = searchParams.get('q')
    if (q) setSearch(q)
  }, [searchParams])

  useEffect(() => {
    setVisible(true)
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get(`${API}/api/products`)
        setProducts(data.products || [])
      } catch (err) {
        console.error('Failed to load products:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  )

  const handleAddToCart = (product) => {
    addToCart(product)
    setAddingToCart(product._id)
    setTimeout(() => setAddingToCart(null), 1500)
  }

  if (loading) {
    return (
      <MarketingLayout activeNav="deals">
        <div className="min-h-screen bg-gray-50">
          <div className="bg-gradient-to-r from-blue-600 to-gray-700 text-white py-4">
            <div className="max-w-7xl mx-auto px-4">
              <h1 className="text-3xl font-bold mb-2">Deals</h1>
              <p className="text-blue-100">
                Discover amazing deals from our vendors
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
    <MarketingLayout activeNav="deals">
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 to-gray-700 text-white py-4">
          <div className={`max-w-7xl mx-auto px-4 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-center gap-3 mb-2">
              <FiTag size={28} />
              <h1 className="text-3xl font-bold">Deals</h1>
            </div>
            <p className="text-blue-100 mb-4">
              Discover amazing deals from our vendors
            </p>
            <div className="relative max-w-md">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search for deals..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {filteredProducts.length === 0 ? (
            <div className={`text-center py-16 transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <FiTag size={64} className="mx-auto mb-4 text-gray-300" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No deals found</h2>
              <p className="text-gray-500">
                {search ? 'Try a different search term' : 'Check back later for amazing deals'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-6 gap-4">
              {filteredProducts.map((product, index) => (
                <div
                  key={product._id}
                  className={`bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden animate-fade-in-up`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Link to={`/product/${product._id}`} className="block">
                    <div className="relative">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-full h-40 object-cover"
                        />
                      ) : (
                        <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">No image</span>
                        </div>
                      )}
                      {product.discountPrice && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          -{Math.round((1 - product.discountPrice / product.price) * 100)}%
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-3">
                    <Link to={`/product/${product._id}`} className="block">
                      <h3 className="font-semibold text-gray-900 text-sm truncate hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">
                      {product.category?.name || 'Uncategorized'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {product.discountPrice ? (
                        <>
                          <span className="text-blue-600 font-bold">Rs. {product.discountPrice}</span>
                          <span className="text-gray-400 text-xs line-through">Rs. {product.price}</span>
                        </>
                      ) : (
                        <span className="text-blue-600 font-bold">Rs. {product.price}</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={user?.role === 'vendor' || user?.role === 'admin'}
                      className={`w-full mt-3 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                        addingToCart === product._id
                          ? 'bg-green-500 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white'
                      }`}
                    >
                      <FiShoppingCart size={14} />
                      {addingToCart === product._id ? 'Added!' : (user?.role === 'vendor' || user?.role === 'admin' ? 'Not Available' : 'Add to Cart')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MarketingLayout>
  )
}