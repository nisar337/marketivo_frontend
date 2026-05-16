import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import { FiSend, FiCheck, FiMessageCircle } from 'react-icons/fi'
import { BsRobot } from 'react-icons/bs'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function ChatBot() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const handleOpen = () => {
    setIsVisible(true)
    setTimeout(() => setIsAnimating(true), 10)
    setIsOpen(true)
  }

  const resetChat = async () => {
    setMessages([])
    setInput('')
    setError(null)
    setIsTyping(false)

    if (!token) return

    try {
      await axios.delete(`${API_BASE_URL}/api/ai/history`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch (err) {
      console.error('Failed to clear chat:', err)
    }
  }

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      setIsVisible(false)
      setIsOpen(false)
    }, 300)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  useEffect(() => {
    if (isOpen && user && token) {
      fetchHistory()
    }
  }, [isOpen, user, token])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  useEffect(() => {
    if (!user && messages.length > 0) {
      resetChat()
    }
  }, [user])

  const fetchHistory = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/ai/history`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMessages(data.messages || [])
    } catch (err) {
      console.error('Failed to fetch chat history:', err)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || isTyping) return

    if (!user || !token) {
      setError('Please log in to use the chat assistant')
      return
    }

    const userMessage = { role: 'user', content: input.trim(), quickLinks: [] }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)
    setError(null)

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/ai/chat`,
        { message: userMessage.content },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const assistantMessage = {
        role: 'assistant',
        content: data.message,
        quickLinks: data.quickLinks || [],
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to get response. Please try again.'
      setError(errorMsg)
    } finally {
      setIsTyping(false)
    }
  }

  const handleQuickLink = (link) => {
    if (link.productId) {
      navigate(`/?product=${link.productId}`)
    } else if (link.categorySlug) {
      navigate(`/?category=${link.categorySlug}`)
    }
    handleClose()
  }

  const formatMessage = (content) => {
    return content.split('\n').map((line, i) => (
      <span key={i}>
        {line.split(/(\*\*[^*]+\*\*)/).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={j} className="font-semibold text-blue-600">
                {part.slice(2, -2)}
              </strong>
            )
          }
          return part
        })}
        {i < content.split('\n').length - 1 && <br />}
      </span>
    ))
  }

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50 group">
        <button
          onClick={() => (isOpen ? handleClose() : handleOpen())}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg transition-all duration-300 hover:bg-blue-600 hover:scale-105"
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
        >
          <BsRobot 
            size={24} 
            className={`absolute transition-all duration-300 ease-out ${isOpen ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}
          />
          <svg 
            className={`h-6 w-6 absolute transition-all duration-300 ease-out ${isOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {!isOpen && (
          <div className="pointer-events-none absolute bottom-full right-0 mb-3 translate-y-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 text-sm font-medium text-white opacity-0 shadow-xl transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
            ✨ Ask AI
            <div className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 bg-blue-500"></div>
          </div>
        )}
      </div>

      {/* Chat Window */}
      {isVisible && (
        <div className={`fixed bottom-24 right-6 z-50 flex h-[400px] w-[300px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 ease-out ${isAnimating ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-95 opacity-0'}`}>
          {/* Header - Blue */}
          <div className="flex items-center gap-3 bg-blue-500 px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <BsRobot size={22} className="text-white" />
            </div>
            <h3 className="font-semibold text-white">Marketivo AI Assistance</h3>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-4 scrollbar-hide">
            {!user ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                    <BsRobot size={32} className="text-blue-500" />
                  </div>
                  <p className="mb-4 text-gray-600">Sign in to start chatting</p>
                  <button
                    onClick={() => {
                      handleClose()
                      navigate('/login')
                    }}
                    className="rounded-lg bg-blue-500 px-6 py-2 text-sm font-medium text-white transition-all hover:bg-blue-600"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            ) : messages.length === 0 && !isTyping ? (
              <div className="space-y-3">
                {/* Suggested Topics */}
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <BsRobot size={18} className="text-blue-500" />
                  </div>
                  <div className="rounded-2xl rounded-tl-none bg-white p-4 shadow-sm">
                    <p className="mb-2 font-semibold text-gray-800">Suggested Topics</p>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <span className="text-gray-400">•</span> Fresh Fruits
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-gray-400">•</span> Local Crafts
                        <FiCheck className="text-blue-500" size={14} />
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Welcome Message */}
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <BsRobot size={18} className="text-blue-500" />
                  </div>
                  <div className="rounded-2xl rounded-tl-none bg-white p-4 shadow-sm">
                    <p className="text-sm text-gray-700">
                      Certainly! Based on your location in Lahore.
                      <FiCheck className="ml-1 inline text-blue-500" size={14} />
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                        <BsRobot size={18} className="text-blue-500" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-2xl p-3 ${
                        msg.role === 'user'
                          ? 'rounded-tr-none bg-blue-500 text-white'
                          : 'rounded-tl-none bg-white text-gray-700 shadow-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{formatMessage(msg.content)}</p>
                      {msg.role === 'assistant' && (
                        <FiCheck className="mt-1 inline text-blue-500" size={14} />
                      )}
                      {msg.quickLinks && msg.quickLinks.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {msg.quickLinks.map((link, linkIdx) => (
                            <button
                              key={linkIdx}
                              onClick={() => handleQuickLink(link)}
                              className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 transition-all hover:bg-blue-100"
                            >
                              {link.label} →
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <BsRobot size={18} className="text-blue-500" />
                    </div>
                    <div className="rounded-2xl rounded-tl-none bg-white p-4 shadow-sm">
                      <div className="flex items-center gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400"></span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
                {error}
              </div>
            )}
          </div>

          {/* Input Area */}
          {user && (
            <div className="border-t border-gray-100 bg-white p-3">
              <form onSubmit={sendMessage}>
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your question here... (e.g., 'mangoes near me')"
                    className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-400 focus:bg-white focus:outline-none"
                    disabled={isTyping}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white transition-all hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FiSend size={18} />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default ChatBot
