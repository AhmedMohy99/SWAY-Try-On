'use client'

import { useState, useEffect, useRef } from 'react'
import { Instagram, Facebook, Home } from 'lucide-react' // ضفنا الأيقونات هنا
import {
  TRY_TEST_PRODUCTS,
  PREORDER_PRODUCT,
  CONTACT_LINKS,
  SIZES,
} from '@/lib/products' // تأكد إن مسار الداتا صح زي ما عملناه قبل كده، لو جاب إيرور خليه '../lib/products'

export default function SwayHome() {
  const [activeSection, setActiveSection] = useState('try-test')
  const [tryOnOpen, setTryOnOpen] = useState(false)
  const [activeProduct, setActiveProduct] = useState(null)
  const [selectedImage, setSelectedImage] = useState('')
  const [selectedSize, setSelectedSize] = useState('L')
  
  // AR Engine State
  const [mode, setMode] = useState('camera')
  const [userImg, setUserImg] = useState(null)
  const [scale, setScale] = useState(100)
  const [offsetY, setOffsetY] = useState(0)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  // 1. Lock Background Scroll when Modal is Open
  useEffect(() => {
    document.body.style.overflow = tryOnOpen ? 'hidden' : 'unset'
  }, [tryOnOpen])

  // 2. Camera Management
  useEffect(() => {
    if (tryOnOpen && mode === 'camera') {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then(stream => { if (videoRef.current) videoRef.current.srcObject = stream })
        .catch(err => console.error("Camera denied or unavailable.", err))
    } else {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop())
      }
    }
  }, [tryOnOpen, mode])

  // 3. AR Rendering Engine
  useEffect(() => {
    let frameId;
    
    const garmentImg = new Image()
    garmentImg.src = selectedImage
    
    const bgImg = new Image()
    if (userImg) bgImg.src = userImg

    const draw = () => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // A. Draw Background
      if (mode === 'camera' && videoRef.current) {
        ctx.save()
        ctx.translate(canvas.width, 0)
        ctx.scale(-1, 1)
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
        ctx.restore()
      } else if (mode === 'upload' && userImg && bgImg.complete) {
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height)
      } else if (mode === 'upload' && !userImg) {
        ctx.fillStyle = '#080808'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      // B. Draw Garment
      if (selectedImage && garmentImg.complete) {
        const w = (canvas.width * (scale / 100))
        const h = w * 1.25
        const x = (canvas.width - w) / 2
        const y = ((canvas.height - h) / 2) + offsetY
        ctx.drawImage(garmentImg, x, y, w, h)
      }
      
      frameId = requestAnimationFrame(draw)
    }

    if (tryOnOpen) draw()
    return () => cancelAnimationFrame(frameId)
  }, [tryOnOpen, mode, userImg, selectedImage, scale, offsetY])

  const openTryOn = (prod) => {
    setActiveProduct(prod)
    setSelectedImage(prod.variants ? prod.variants[0].tryOnImage : (prod.tryOnImage || prod.image))
    setTryOnOpen(true)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => { 
        setUserImg(ev.target?.result)
        setMode('upload') 
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-cyan-400 selection:text-black">
      
      {/* --- HEADER --- */}
      <nav className="flex items-center justify-between px-6 py-6 border-b border-white/5">
        <div className="flex flex-col items-start">
          {/* دمجنا اللوجو الجديد هنا بدل الكلمة القديمة */}
          <img src="/logo.png" alt="SWAY Logo" className="h-12 md:h-16 object-contain" />
        </div>
        
        {/* زراير السوشيال ميديا والتنقل */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-4 mr-4 border-r border-gray-800 pr-4">
            <a href="https://instagram.com" target="_blank" className="text-gray-400 hover:text-cyan-400 transition">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://facebook.com" target="_blank" className="text-gray-400 hover:text-cyan-400 transition">
              <Facebook className="w-5 h-5" />
            </a>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setActiveSection('try-test')} 
              className={`px-4 py-2 rounded-full text-[9px] font-black uppercase transition-all ${activeSection === 'try-test' ? 'bg-cyan-400 text-black shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'border border-zinc-800 text-zinc-500'}`}
            >
              TRY & TEST
            </button>
            <button 
              onClick={() => setActiveSection('preorder')} 
              className={`px-4 py-2 rounded-full text-[9px] font-black uppercase transition-all ${activeSection === 'preorder' ? 'bg-cyan-400 text-black shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'border border-zinc-800 text-zinc-500'}`}
            >
              PRE ORDER
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION TITLE --- */}
      <div className="py-16 text-center">
        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic">
          {activeSection === 'try-test' ? 'AERO' : 'NEXT'} <span className="text-zinc-900 drop-shadow-[0_0_1px_rgba(255,255,255,0.2)]">Collection</span>
        </h2>
      </div>

      {/* --- PRODUCT GRID --- */}
      <div className="px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto pb-40">
        {(activeSection === 'try-test' ? TRY_TEST_PRODUCTS : [PREORDER_PRODUCT]).map((prod) => (
          <div key={prod.name} className="flex flex-col items-center group">
            <div className="relative w-full aspect-[3/4] bg-zinc-950 rounded-3xl overflow-hidden mb-6 shadow-2xl border border-white/5">
              <img src={prod.image} alt={prod.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <button 
                onClick={() => openTryOn(prod)}
                className="absolute inset-x-8 bottom-8 bg-cyan-400 text-black py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)] active:scale-95"
              >
                Launch AR Studio
              </button>
            </div>
            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">{prod.name}</h3>
            <div className="flex gap-3 items-center">
              <p className="text-[11px] font-black text-cyan-400 uppercase">EGP {prod.price}</p>
              {prod.oldPrice && <p className="text-[10px] text-zinc-600 line-through">EGP {prod.oldPrice}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* --- FULLSCREEN AR STUDIO MODAL --- */}
      {tryOnOpen && activeProduct && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col h-[100svh] overflow-hidden animate-in fade-in duration-300">
          
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 bg-black/80 backdrop-blur-md z-10">
            <div className="flex items-center gap-4">
               <img src="/logo.png" alt="SWAY" className="h-8 object-contain" />
               <h2 className="text-sm md:text-xl font-black italic uppercase tracking-tighter text-cyan-400 border-l border-gray-800 pl-4">
                 {activeProduct.name}
               </h2>
            </div>
            <button 
              onClick={() => setTryOnOpen(false)} 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 text-zinc-500 hover:text-white hover:bg-red-500/20 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto pb-10 no-scrollbar">
            <div className="flex flex-col items-center p-6">
              
              {/* Mode Selector */}
              <div className="flex gap-2 mb-6 w-full max-w-md bg-zinc-900/50 p-1 rounded-full border border-white/5">
                <button onClick={() => setMode('camera')} className={`flex-1 py-3 rounded-full text-[9px] font-black uppercase transition-all ${mode === 'camera' ? 'bg-cyan-400 text-black shadow-lg' : 'text-zinc-600'}`}>
                  📷 Live Camera
                </button>
                <label className={`flex-1 py-3 text-center rounded-full text-[9px] font-black uppercase cursor-pointer transition-all ${mode === 'upload' ? 'bg-cyan-400 text-black shadow-lg' : 'text-zinc-600'}`}>
                  🖼️ Upload Photo
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </label>
              </div>

              {/* Engine Canvas Area */}
              <div className="w-full max-w-md aspect-[3/4] rounded-[32px] overflow-hidden bg-zinc-950 border border-white/10 relative shadow-2xl">
                 <video ref={videoRef} autoPlay playsInline className="hidden" />
                 <canvas ref={canvasRef} width={800} height={1066} className="w-full h-full object-cover" />
                 
                 {/* Floating Nudge Controls */}
                 <div className="absolute right-4 bottom-4 flex flex-col gap-2">
                    <button onClick={() => setOffsetY(prev => prev - 15)} className="w-10 h-10 bg-black/40 backdrop-blur-xl rounded-full border border-cyan-400/30 text-cyan-400 shadow-2xl active:bg-cyan-400 active:text-black">↑</button>
                    <button onClick={() => setOffsetY(prev => prev + 15)} className="w-10 h-10 bg-black/40 backdrop-blur-xl rounded-full border border-cyan-400/30 text-cyan-400 shadow-2xl active:bg-cyan-400 active:text-black">↓</button>
                 </div>
              </div>

              {/* Scale Slider */}
              <div className="w-full max-w-md mt-8 px-2">
                <div className="flex justify-between mb-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Garment Scale</span>
                  <span className="text-cyan-400 font-black text-[10px]">{scale}%</span>
                </div>
                <input 
                  type="range" min="50" max="150" value={scale} 
                  onChange={(e) => setScale(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Color Variants (Horizontal Scroll) */}
              {activeProduct.variants && (
                <div className="mt-8 flex gap-2 w-full max-w-md overflow-x-auto pb-2 no-scrollbar">
                  {activeProduct.variants.map(v => (
                    <button 
                      key={v.colorName} 
                      onClick={() => setSelectedImage(v.tryOnImage)}
                      className={`whitespace-nowrap px-6 py-3 rounded-full text-[9px] font-black uppercase border-2 transition-all ${selectedImage === v.tryOnImage ? 'border-cyan-400 text-cyan-400 bg-cyan-400/5' : 'border-white/5 text-zinc-600'}`}
                    >
                      {v.colorName}
                    </button>
                  ))}
                </div>
              )}

              {/* Size Selector */}
              <div className="mt-6 flex gap-2 w-full max-w-md justify-between">
                {(activeProduct.type === 'regular' ? SIZES : SIZES.slice(0, 4)).map(s => (
                  <button 
                    key={s} 
                    onClick={() => setSelectedSize(s)}
                    className={`flex-1 h-14 rounded-2xl font-black text-xs transition-all border-2 ${selectedSize === s ? 'bg-cyan-400 border-cyan-400 text-black shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'bg-zinc-950 border-white/5 text-zinc-600'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* WhatsApp Order Button */}
              <button 
                 onClick={() => window.open(`${CONTACT_LINKS.whatsapp}&text=Order: ${activeProduct.name} | Color: ${activeProduct.variants?.find(v => v.tryOnImage === selectedImage)?.colorName || 'Default'} | Size: ${selectedSize}`)}
                 className="mt-10 mb-8 w-full max-w-md bg-cyan-400 text-black py-6 rounded-3xl font-black uppercase text-[11px] tracking-[0.2em] shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
              >
                Confirm Order via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
