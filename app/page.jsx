'use client'
import { useState, useEffect, useRef } from 'react'
import { Instagram, Facebook } from 'lucide-react'
import { TRY_TEST_PRODUCTS, PREORDER_PRODUCT, CONTACT_LINKS, SIZES } from '../lib/products'

export default function SwayHome() {
  const [activeSection, setActiveSection] = useState('try-test')
  const [tryOnOpen, setTryOnOpen] = useState(false)
  const [activeProduct, setActiveProduct] = useState(null)
  const [selectedImage, setSelectedImage] = useState('')
  const [selectedSize, setSelectedSize] = useState('L')
  
  const [mode, setMode] = useState('camera')
  const [userImg, setUserImg] = useState(null)
  const [scale, setScale] = useState(100)
  const [offsetY, setOffsetY] = useState(0)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const animationFrameRef = useRef(null)

  // Safe browser check
  const isBrowser = typeof window !== 'undefined'

  // Body scroll lock
  useEffect(() => {
    if (!isBrowser) return
    document.body.style.overflow = tryOnOpen ? 'hidden' : 'unset'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [tryOnOpen, isBrowser])

  // Camera initialization with proper cleanup
  useEffect(() => {
    if (!isBrowser || !tryOnOpen || mode !== 'camera') {
      // Cleanup camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
      return
    }

    // Request camera access
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' } 
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err) {
        console.error("Camera access denied:", err)
      }
    }

    initCamera()

    // Cleanup function
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    }
  }, [tryOnOpen, mode, isBrowser])

  // Canvas rendering loop with proper cleanup
  useEffect(() => {
    if (!isBrowser || !tryOnOpen) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      return
    }

    const garmentImg = new Image()
    garmentImg.crossOrigin = 'anonymous'
    garmentImg.src = selectedImage
    
    const bgImg = new Image()
    bgImg.crossOrigin = 'anonymous'
    if (userImg) {
      bgImg.src = userImg
    }

    const draw = () => {
      const canvas = canvasRef.current
      const video = videoRef.current
      
      if (!canvas) {
        animationFrameRef.current = requestAnimationFrame(draw)
        return
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        animationFrameRef.current = requestAnimationFrame(draw)
        return
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw background
      if (mode === 'camera' && video && video.readyState === video.HAVE_ENOUGH_DATA) {
        ctx.save()
        ctx.translate(canvas.width, 0)
        ctx.scale(-1, 1)
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        ctx.restore()
      } else if (mode === 'upload' && userImg && bgImg.complete) {
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height)
      } else if (mode === 'upload' && !userImg) {
        ctx.fillStyle = '#080808'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      // Draw garment overlay
      if (selectedImage && garmentImg.complete) {
        const w = (canvas.width * (scale / 100))
        const h = w * 1.25
        const x = (canvas.width - w) / 2
        const y = ((canvas.height - h) / 2) + offsetY
        ctx.drawImage(garmentImg, x, y, w, h)
      }

      animationFrameRef.current = requestAnimationFrame(draw)
    }

    draw()

    // Cleanup animation frame
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [tryOnOpen, mode, userImg, selectedImage, scale, offsetY, isBrowser])

  const openTryOn = (prod) => {
    setActiveProduct(prod)
    const initialImage = prod.variants 
      ? prod.variants[0].tryOnImage 
      : (prod.tryOnImage || prod.image)
    setSelectedImage(initialImage)
    setTryOnOpen(true)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target && ev.target.result
      if (result && typeof result === 'string') {
        setUserImg(result)
        setMode('upload')
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex items-center justify-between px-6 py-6 border-b border-white/5">
        <img src="/logo.png" alt="SWAY Logo" className="h-12 md:h-16 object-contain" />
        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-4 mr-4 border-r border-gray-800 pr-4">
            <Instagram className="w-5 h-5 text-gray-400" />
            <Facebook className="w-5 h-5 text-gray-400" />
          </div>
          <button onClick={() => setActiveSection('try-test')}>TRY & TEST</button>
        </div>
      </nav>

      <div className="py-16 text-center">
        <h2 className="text-4xl font-bold">
          {activeSection === 'try-test' ? 'AERO' : 'NEXT'} Collection
        </h2>
      </div>

      <div className="px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto pb-40">
        {(activeSection === 'try-test' ? TRY_TEST_PRODUCTS : [PREORDER_PRODUCT]).map((prod) => (
          <div key={prod.name} className="flex flex-col items-center space-y-4">
            <img 
              src={prod.image} 
              alt={prod.name} 
              className="w-full aspect-[2/3] object-cover rounded-lg"
            />
            <h3 className="text-xl font-semibold">{prod.name}</h3>
            <p className="text-gray-400">EGP {prod.price}</p>
            <button 
              onClick={() => openTryOn(prod)}
              className="px-6 py-3 bg-white text-black rounded-md hover:bg-gray-200 transition-colors font-medium"
            >
              Launch AR Studio
            </button>
          </div>
        ))}
      </div>

      {tryOnOpen && activeProduct && isBrowser && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col h-[100svh]">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-lg font-semibold">{activeProduct.name}</h3>
            <button 
              onClick={() => setTryOnOpen(false)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors"
            >
              Close
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto pb-10 flex items-center justify-center bg-neutral-900">
            <div className="relative">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="hidden" 
              />
              <canvas 
                ref={canvasRef} 
                width={800} 
                height={1066} 
                className="max-w-full h-auto border border-white/10 rounded-lg"
              />
            </div>
          </div>

          <div className="p-4 border-t border-white/10 flex gap-4">
            <button
              onClick={() => setMode('camera')}
              className={`flex-1 py-3 rounded-md transition-colors ${
                mode === 'camera' 
                  ? 'bg-white text-black' 
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              Camera
            </button>
            <label className={`flex-1 py-3 rounded-md transition-colors text-center cursor-pointer ${
              mode === 'upload' 
                ? 'bg-white text-black' 
                : 'bg-white/10 hover:bg-white/20'
            }`}>
              Upload Photo
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}
    </main>
  )
}
