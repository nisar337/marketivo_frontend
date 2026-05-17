import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { FiMapPin, FiPhone, FiGlobe, FiArrowLeft, FiShoppingCart } from 'react-icons/fi'
import { MdStorefront } from 'react-icons/md'
import MarketingLayout from '../components/MarketingLayout'
import VerifiedBadge from '../components/VerifiedBadge'
import { useCart } from '../context/CartContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function VendorProfilePage() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const [vendor, setVendor] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vendorRes, productsRes] = await Promise.all([
          axios.get(`${API}/api/vendors/${id}`),
          axios.get(`${API}/api/products`, { params: { vendor: id } }),
        ])
        setVendor(vendorRes.data.vendor)
        setProducts(productsRes.data.products || [])
      } catch (err) {
        console.error('Failed to load vendor:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleAddToCart = (product) => {
    addToCart(product)
    setAddingToCart(product._id)
    setTimeout(() => setAddingToCart(null), 1500)
  }

  if (loading) {
    return (
      <MarketingLayout activeNav="vendors">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      </MarketingLayout>
    )
  }

  if (!vendor) {
    return (
      <MarketingLayout activeNav="vendors">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <MdStorefront size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Vendor Not Found</h2>
            <p className="text-gray-500 mb-6">This vendor may not exist or has been removed.</p>
            <Link
              to="/vendors"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <FiArrowLeft size={18} />
              Back to Vendors
            </Link>
          </div>
        </div>
      </MarketingLayout>
    )
  }

  return (
    <MarketingLayout activeNav="vendors">
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <Link
              to="/vendors"
              className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-6 transition-colors"
            >
              <FiArrowLeft size={18} />
              Back to Vendors
            </Link>

            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center overflow-hidden shadow-lg">
                {vendor.logo ? (
                  <img src={vendor.logo} alt={vendor.storeName} className="w-full h-full object-cover" />
                ) : (
                  <MdStorefront size={48} className="text-blue-600" />
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{vendor.storeName}</h1>
                  {(vendor.verified ?? vendor.status === 'approved') && <VerifiedBadge />}
                </div>
                {(vendor.verified ?? vendor.status === 'approved') && (
                  <p className="text-sm text-blue-100/90 mb-3">
                    <span className="font-semibold text-green-400">Verified</span> vendor — approved by Marketivo
                  </p>
                )}
                {vendor.description && (
                  <p className="text-blue-100 mb-4 max-w-2xl">{vendor.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {vendor.businessAddress && (
                    <span className="flex items-center gap-2 bg-blue-700/50 px-3 py-1.5 rounded-full">
                      <FiMapPin size={16} />
                      {vendor.businessAddress}
                    </span>
                  )}
                  {vendor.phone && (
                    <span className="flex items-center gap-2 bg-blue-700/50 px-3 py-1.5 rounded-full">
                      <FiPhone size={16} />
                      {vendor.phone}
                    </span>
                  )}
                  {vendor.website && (
                    <span className="flex items-center gap-2 bg-blue-700/50 px-3 py-1.5 rounded-full">
                      <FiGlobe size={16} />
                      {vendor.website}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Products by {vendor.storeName}
            <span className="ml-2 text-gray-500 text-lg font-normal">({products.length})</span>
          </h2>

          {products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <FiShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No products available from this vendor yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-200 group"
                >
                  <Link to={`/product/${product._id}`} className="block">
                    <div className="aspect-square bg-gray-100 overflow-hidden">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <MdStorefront size={48} />
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-4">
                    <Link to={`/product/${product._id}`} className="block">
                      <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                      {product.category && (
                        <p className="text-xs text-gray-500 mt-1">{product.category.name}</p>
                      )}
                      <p className="text-lg font-bold text-blue-600 mt-2">
                        Rs. {product.price?.toFixed(2) || '0.00'}
                      </p>
                    </Link>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={addingToCart === product._id}
                      className={`mt-3 w-full py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                        addingToCart === product._id
                          ? 'bg-green-600 text-white'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {addingToCart === product._id ? (
                        'Added!'
                      ) : (
                        <>
                          <FiShoppingCart size={16} />
                          Add to Cart
                        </>
                      )}
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