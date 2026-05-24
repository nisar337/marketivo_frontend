import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import {
  FiArrowLeft,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiCopy,
  FiHeart,
  FiMapPin,
  FiMinus,
  FiPlus,
  FiShare2,
  FiShoppingCart,
  FiStar,
} from 'react-icons/fi'
import MarketingLayout from '../components/MarketingLayout'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const WISHLIST_KEY = 'marketivo_wishlist'

const formatPrice = (value) =>
  `Rs. ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`

const getImageUrl = (image) => {
  if (!image) return ''
  if (typeof image === 'string') return image
  return image.url || ''
}

const loadWishlist = () => {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart, items } = useCart()
  const { user, token } = useAuth()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedImage, setSelectedImage] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [shareMessage, setShareMessage] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [reviews, setReviews] = useState([])
  const [reviewCount, setReviewCount] = useState(0)
  const [averageRating, setAverageRating] = useState(0)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewMessage, setReviewMessage] = useState('')

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      setError('')
      setActionMessage('')
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined
        const { data } = await axios.get(`${API}/api/products/${id}`, { headers })
        setProduct(data.product)
        setSelectedImage(getImageUrl(data.product?.images?.[0]))
        setIsWishlisted(loadWishlist().includes(data.product?._id))
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product.')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id, token])

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await axios.get(`${API}/api/reviews/product/${id}`)
        setReviews(data.reviews || [])
        setReviewCount(data.reviewCount || 0)
        setAverageRating(data.averageRating || 0)
      } catch {
        setReviews([])
        setReviewCount(0)
        setAverageRating(0)
      }
    }

    if (id) {
      fetchReviews()
    }
  }, [id])

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product) return
      try {
        const params = { limit: 4 }
        if (product.category?._id) params.category = product.category._id
        const { data } = await axios.get(`${API}/api/products`, { params })
        setRelatedProducts((data.products || []).filter((item) => item._id !== product._id).slice(0, 4))
      } catch {
        setRelatedProducts([])
      }
    }

    fetchRelatedProducts()
  }, [product])

  useEffect(() => {
    setQuantity(1)
  }, [id])

  useEffect(() => {
    if (!shareMessage && !actionMessage) return undefined
    const timer = setTimeout(() => {
      setShareMessage('')
      setActionMessage('')
    }, 2200)
    return () => clearTimeout(timer)
  }, [shareMessage, actionMessage])

  useEffect(() => {
    if (!reviewMessage) return undefined
    const timer = setTimeout(() => setReviewMessage(''), 2400)
    return () => clearTimeout(timer)
  }, [reviewMessage])

  const imageList = useMemo(() => {
    if (!product?.images?.length) return []
    return product.images.map((image) => getImageUrl(image)).filter(Boolean)
  }, [product])

  const displayImage = selectedImage || imageList[0] || ''
  const currentPrice = product?.discountPrice || product?.price || 0
  const discountPercent = product?.discountPrice && product?.price
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : 0
  const cartItem = items.find((item) => item.productId === product?._id)
  const currentInCart = cartItem?.quantity || 0
  const availableStock = Math.max(Number(product?.stockQuantity || 0), 0)
  const remainingStock = Math.max(availableStock - currentInCart, 0)
  const isOutOfStock = availableStock < 1
  const canPurchase = user?.role !== 'vendor' && user?.role !== 'admin' && !isOutOfStock
  const vendorId = product?.vendorId?._id
  const soldCount = Math.max(10, Number(product?.soldCount || 0))

  const setSafeQuantity = (next) => {
    const maxAllowed = Math.max(remainingStock, 1)
    setQuantity(Math.max(1, Math.min(maxAllowed, next)))
  }

  const handleAddToCart = (goToCheckout = false) => {
    if (!product) return
    if (user?.role === 'vendor' || user?.role === 'admin') {
      setActionMessage('This action is only available for customers.')
      return
    }
    if (remainingStock < 1) {
      setActionMessage('No more stock is available for this item.')
      return
    }

    setAdding(true)
    addToCart(product, quantity)
    setActionMessage(goToCheckout ? 'Added to cart. Redirecting to checkout...' : 'Added to cart successfully.')
    setTimeout(() => {
      setAdding(false)
      if (goToCheckout) navigate('/checkout')
    }, 500)
  }

  const handleToggleWishlist = () => {
    if (!product) return
    const existing = loadWishlist()
    const next = existing.includes(product._id)
      ? existing.filter((entry) => entry !== product._id)
      : [...existing, product._id]
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(next))
    setIsWishlisted(next.includes(product._id))
    setActionMessage(next.includes(product._id) ? 'Added to wishlist.' : 'Removed from wishlist.')
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareMessage('Product link copied.')
    } catch {
      setShareMessage('Unable to copy link.')
    }
  }

  const handleSubmitReview = async () => {
    if (!user || !token) {
      setReviewMessage('Please log in to submit a review.')
      return
    }
    if (user.role !== 'customer') {
      setReviewMessage('Only customers can submit reviews.')
      return
    }
    if (!reviewComment.trim()) {
      setReviewMessage('Please write a short review.')
      return
    }

    setReviewSubmitting(true)
    try {
      const { data } = await axios.post(
        `${API}/api/reviews`,
        { productId: id, rating: reviewRating, comment: reviewComment.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setReviews((prev) => [data.review, ...prev])
      setReviewCount((prev) => prev + 1)
      setAverageRating((prev) => {
        const total = prev * reviewCount + data.review.rating
        return total / (reviewCount + 1)
      })
      setReviewComment('')
      setReviewRating(5)
      setReviewMessage('Review submitted successfully.')
    } catch (err) {
      setReviewMessage(err.response?.data?.message || 'Failed to submit review.')
    } finally {
      setReviewSubmitting(false)
    }
  }

  const handleImageMove = (direction) => {
    if (imageList.length < 2) return
    const currentIndex = imageList.findIndex((image) => image === displayImage)
    const nextIndex = direction === 'next'
      ? (currentIndex + 1) % imageList.length
      : (currentIndex - 1 + imageList.length) % imageList.length
    setSelectedImage(imageList[nextIndex])
  }

  return (
    <MarketingLayout activeNav="none">
      <div className="max-w-5xl mx-auto md:py-10">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <FiChevronRight size={14} className="text-gray-400" />
          <Link to="/deals" className="hover:text-blue-600 transition-colors">
            {product?.category?.name || 'Products'}
          </Link>
          <FiChevronRight size={14} className="text-gray-400" />
          <span className="font-semibold text-gray-900">{product?.name || 'Product'}</span>
        </div>

        {loading ? (
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="animate-pulse">
              <div className="h-[460px] rounded-[28px] border border-gray-200 bg-gray-100" />
              <div className="mt-6 flex gap-3">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="h-20 w-20 rounded-2xl bg-gray-100" />
                ))}
              </div>
            </div>
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-40 rounded bg-gray-100" />
              <div className="h-12 w-72 rounded bg-gray-100" />
              <div className="h-6 w-60 rounded bg-gray-100" />
              <div className="h-10 w-56 rounded bg-gray-100" />
              <div className="h-24 rounded bg-gray-100" />
              <div className="h-14 w-36 rounded bg-gray-100" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-14 rounded-2xl bg-gray-100" />
                <div className="h-14 rounded-2xl bg-gray-100" />
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="mx-auto max-w-2xl rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Product not available</h1>
            <p className="mt-3 text-sm text-red-700">{error}</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link to="/deals" className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                Browse Products
              </Link>
              <Link to="/" className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                Go Home
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <div className="relative overflow-hidden rounded-[28px] border border-gray-200 bg-[#fbfbfd]">
                  {discountPercent > 0 && (
                    <div className="absolute left-4 top-4 z-10 rounded-lg bg-green-600 px-3 py-1 text-sm font-semibold text-white">
                      -{discountPercent}%
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleToggleWishlist}
                    className={`absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
                      isWishlisted
                        ? 'border-red-200 bg-red-50 text-red-500'
                        : 'border-gray-200 bg-white text-gray-500 hover:text-red-500'
                    }`}
                  >
                    <FiHeart size={20} className={isWishlisted ? 'fill-current' : ''} />
                  </button>

                  {displayImage ? (
                    <img src={displayImage} alt={product.name} className="h-[460px] w-full object-contain p-8 md:p-10" />
                  ) : (
                    <div className="flex h-[460px] items-center justify-center text-sm text-gray-400">
                      No product image
                    </div>
                  )}
                </div>

                {imageList.length > 0 && (
                  <div className="mt-6 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleImageMove('prev')}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600"
                    >
                      <FiChevronLeft size={18} />
                    </button>

                    <div className="flex flex-1 gap-3 overflow-x-auto pb-1">
                      {imageList.map((image, index) => (
                        <button
                          key={`${image}-${index}`}
                          type="button"
                          onClick={() => setSelectedImage(image)}
                          className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-white transition-all ${
                            displayImage === image ? 'border-blue-600 shadow-sm' : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <img src={image} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleImageMove('next')}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600"
                    >
                      <FiChevronRight size={18} />
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {product.category?.name || 'Grocery'}
                  </span>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {product.vendorId?.name || 'Fresh Fruits'}
                  </span>
                </div>

                <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">{product.name}</h1>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1 text-yellow-400">
                    {[...Array(5)].map((_, index) => (
                      <FiStar
                        key={index}
                        size={16}
                        className={index < Math.round(averageRating) ? 'fill-current' : ''}
                      />
                    ))}
                  </div>
                  <span className="font-medium text-gray-800">{averageRating.toFixed(1)}</span>
                  <span>({reviewCount} Reviews)</span>
                  <span className="text-gray-300">|</span>
                  <span>Sold {soldCount}+</span>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <span className="text-2xl font-bold leading-none text-green-600">{formatPrice(currentPrice)}</span>
                  {product.discountPrice && (
                    <span className="text-2xl text-gray-400 line-through">{formatPrice(product.price)}</span>
                  )}
                  {discountPercent > 0 && (
                    <span className="rounded-lg bg-green-100 px-3 py-1.5 text-sm font-semibold text-green-700">
                      -{discountPercent}%
                    </span>
                  )}
                </div>

                <div className="mt-6 max-w-xl space-y-2 text-[15px] leading-7 text-gray-600">
                  <p>
                    {product.description?.trim() || 'Crisp, juicy and naturally sweet produce sourced from trusted local farms.'}
                  </p>
                  
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 font-medium text-green-600">
                    <FiCheckCircle size={16} />
                    <span>{isOutOfStock ? 'Out of Stock' : 'In Stock'}</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium text-red-500">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
                    <span>{isOutOfStock ? 'Currently unavailable' : `Only ${availableStock} items left`}</span>
                  </div>
                </div>

                {vendorId && (
                  <div className="mt-5">
                    <Link to={`/vendor/${vendorId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700">
                      <FiMapPin size={16} />
                      View vendor: {product.vendorId?.name}
                    </Link>
                  </div>
                )}

                {(actionMessage || shareMessage) && (
                  <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                    {actionMessage || shareMessage}
                  </div>
                )}

                <div className="mt-8">
                  <p className="text-sm font-semibold text-gray-900">Quantity</p>
                  <div className="mt-3 inline-flex items-center rounded-xl border border-gray-200 bg-white shadow-sm">
                    <button
                      type="button"
                      onClick={() => setSafeQuantity(quantity - 1)}
                      className="px-5 py-3 text-gray-600 hover:bg-gray-50"
                    >
                      <FiMinus size={16} />
                    </button>
                    <span className="min-w-14 px-4 text-center text-base font-semibold text-gray-900">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setSafeQuantity(quantity + 1)}
                      className="px-5 py-3 text-gray-600 hover:bg-gray-50"
                      disabled={remainingStock < 1}
                    >
                      <FiPlus size={16} />
                    </button>
                  </div>
                  {currentInCart > 0 && (
                    <p className="mt-2 text-xs text-gray-500">
                      Already in cart: {currentInCart}. Remaining available: {remainingStock}.
                    </p>
                  )}
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(false)}
                    disabled={!canPurchase || adding}
                    className={`flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-semibold transition-all ${
                      canPurchase
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'cursor-not-allowed bg-gray-200 text-gray-500'
                    }`}
                  >
                    {adding ? <FiCheckCircle size={18} /> : <FiShoppingCart size={18} />}
                    {adding ? 'Added to Cart' : 'Add to Cart'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddToCart(true)}
                    disabled={!canPurchase}
                    className={`rounded-xl border px-6 py-4 text-base font-semibold transition-all ${
                      canPurchase
                        ? 'border-blue-200 bg-white text-blue-700 hover:border-blue-400 hover:bg-blue-50'
                        : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                    }`}
                  >
                    Buy Now
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-8 text-sm font-medium text-gray-700">
                  <button type="button" onClick={handleToggleWishlist} className="inline-flex items-center gap-2 hover:text-blue-600">
                    <FiHeart size={18} className={isWishlisted ? 'fill-current text-red-500' : ''} />
                    Add to Wishlist
                  </button>
                  <button type="button" onClick={handleShare} className="inline-flex items-center gap-2 hover:text-blue-600">
                    <FiShare2 size={18} />
                    Share
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-gray-600 hover:border-blue-200 hover:text-blue-600"
                    aria-label="Copy product link"
                  >
                    <FiCopy size={16} />
                  </button>
                </div>

                

                <Link to="/deals" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700">
                  <FiArrowLeft size={16} />
                  Back to all products
                </Link>
              </div>
            </div>

            <div className="mt-16 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
                    <p className="text-sm text-gray-500">
                      {reviewCount} reviews • {averageRating.toFixed(1)} average rating
                    </p>
                  </div>
                </div>

                {reviews.length ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review._id} className="rounded-2xl border border-gray-200 bg-white p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {review.user?.name || 'Customer'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-400">
                            {[...Array(5)].map((_, index) => (
                              <FiStar
                                key={index}
                                size={14}
                                className={index < (review.rating || 0) ? 'fill-current' : ''}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-gray-700">{review.comment || 'No comment provided.'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
                    No reviews yet. Be the first to share your feedback.
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900">Write a Review</h3>
                <p className="mt-1 text-sm text-gray-500">Share your experience with this product.</p>

                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-900">Your Rating</p>
                  <div className="mt-2 flex items-center gap-2 text-yellow-400">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setReviewRating(value)}
                        className="focus:outline-none"
                        aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
                      >
                        <FiStar size={20} className={value <= reviewRating ? 'fill-current' : ''} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-sm font-semibold text-gray-900">Your Review</label>
                  <textarea
                    rows="4"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="What did you like about this product?"
                    className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {reviewMessage && (
                  <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm text-blue-700">
                    {reviewMessage}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={reviewSubmitting}
                  className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>

            {relatedProducts.length > 0 && (
              <div className="mt-16">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
                    <p className="mt-1 text-sm text-gray-500">More items you may like.</p>
                  </div>
                  <Link to="/deals" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                    View All
                  </Link>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  {relatedProducts.map((item) => (
                    <Link
                      key={item._id}
                      to={`/product/${item._id}`}
                      className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                    >
                      {getImageUrl(item.images?.[0]) ? (
                        <img src={getImageUrl(item.images?.[0])} alt={item.name} className="h-48 w-full object-cover" />
                      ) : (
                        <div className="flex h-48 items-center justify-center bg-gray-100 text-sm text-gray-400">
                          No image
                        </div>
                      )}
                      <div className="p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                          {item.category?.name || 'Product'}
                        </p>
                        <h3 className="mt-2 line-clamp-2 font-semibold text-gray-900">{item.name}</h3>
                        <div className="mt-3 flex items-center gap-2">
                          <span className="font-bold text-gray-900">{formatPrice(item.discountPrice || item.price)}</span>
                          {item.discountPrice && (
                            <span className="text-xs text-gray-400 line-through">{formatPrice(item.price)}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MarketingLayout>
  )
}
