'use client';
import { useState, useEffect, useMemo } from 'react';
import { Upload, Ruler, Weight, Tag, ChevronDown, Sparkles } from 'lucide-react';
// استدعاء الداتا الحقيقية من ملفك
import { TRY_TEST_PRODUCTS, PREORDER_PRODUCT, SIZES, Product } from '@/lib/products'; 

// تجميع كل المنتجات في مصفوفة واحدة لتسهيل العرض
const ALL_PRODUCTS = [...TRY_TEST_PRODUCTS, PREORDER_PRODUCT];

export default function SwayTryOn() {
  const [customerImage, setCustomerImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // User Inputs
  const [height, setHeight] = useState('162');
  const [weight, setWeight] = useState('55');
  
  // State للمنتج المختار (بياخد أول منتج كـ Default)
  const [selectedProduct, setSelectedProduct] = useState<Product>(ALL_PRODUCTS[0]);
  // State للون المختار (لو المنتج فيه Variants)
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  
  const [selectedSize, setSelectedSize] = useState('S');
  const [recommendedSize, setRecommendedSize] = useState('S');

  // تحديث اللون الافتراضي لما العميل يغير المنتج
  useEffect(() => {
    if (selectedProduct.variants && selectedProduct.variants.length > 0) {
      setSelectedVariant(selectedProduct.variants[0].colorName);
    } else {
      setSelectedVariant('');
    }
  }, [selectedProduct]);

  // AI Logic: حساب المقاس المنصوح بيه بناءً على مصفوفة المقاسات
  useEffect(() => {
    const h = parseInt(height) || 0;
    const w = parseInt(weight) || 0;
    
    let rec = "S";
    if (w > 0 && h > 0) {
      if (w < 60) rec = "S";
      else if (w >= 60 && w < 72) rec = "M";
      else if (w >= 72 && w < 85) rec = "L";
      else if (w >= 85 && w < 100) rec = "XL";
      else rec = "2XL";
    }
    setRecommendedSize(rec);
    setSelectedSize(rec);
  }, [height, weight]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomerImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const calculateAIPrompt = () => {
    const sizeIndex: Record<string, number> = { "S": 0, "M": 1, "L": 2, "XL": 3, "2XL": 4 };
    const recIdx = sizeIndex[recommendedSize];
    const chosenIdx = sizeIndex[selectedSize];
    const sizeDifference = chosenIdx - recIdx;
    
    let promptDetail = "";
    const fitType = selectedProduct.type;

    if (sizeDifference === 0) {
      promptDetail = fitType === "oversized" ? "perfectly styled streetwear oversize drop shoulder fit" : "fitted perfectly to the body";
    } else if (sizeDifference === 1) {
      promptDetail = fitType === "oversized" ? "very baggy streetwear fit, longer sleeves" : "slightly loose and relaxed fit";
    } else if (sizeDifference >= 2) {
      promptDetail = "comically large, immensely oversized, swallowing the wearer, huge fit";
    } else if (sizeDifference === -1) {
      promptDetail = "tight fit, showing body shape";
    } else if (sizeDifference <= -2) {
      promptDetail = "extremely tight, undersized, stretched over the body";
    }

    // تجهيز اسم المنتج واللون للـ AI
    const colorDetail = selectedVariant ? `in ${selectedVariant} color` : '';
    return `Generate a highly realistic photo of the person wearing ${selectedProduct.name} ${colorDetail}. The clothing style is ${fitType}, and visually it should look ${promptDetail} on this specific body type.`;
  };

  const handleGenerate = async () => {
    if (!customerImage) {
      alert("Please upload your photo first.");
      return;
    }
    
    setIsLoading(true);
    const finalPrompt = calculateAIPrompt();
    
    // هنجيب الصورة الحقيقية للمنتج عشان نبعتها للـ API
    const targetImageURL = selectedVariant && selectedProduct.variants 
      ? selectedProduct.variants.find(v => v.colorName === selectedVariant)?.url 
      : selectedProduct.image;

    console.log("Sending to AI API:");
    console.log("Prompt:", finalPrompt);
    console.log("Garment Image URL:", targetImageURL);

    // محاكاة استدعاء الـ API
    setTimeout(() => {
      setResultImage("https://via.placeholder.com/600x800/111111/00e5ff?text=AI+Result+Ready");
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-10 font-sans selection:bg-cyan-400 selection:text-black">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 mt-8">
        
        {/* Left Column: UI Controls */}
        <div className="space-y-6">
          
          {/* Upload Area */}
          <div className="bg-[#111] border border-gray-800 rounded-xl p-6 relative overflow-hidden group">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              accept="image/*"
              onChange={handleImageUpload}
            />
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="h-64 w-full object-cover rounded-lg border border-cyan-400/30" />
            ) : (
              <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-lg group-hover:border-cyan-400 transition-colors">
                <Upload className="w-10 h-10 text-cyan-400 mb-3" />
                <p className="text-gray-400 font-medium">Upload your front-facing photo</p>
              </div>
            )}
          </div>

          {/* Form Controls */}
          <div className="bg-[#111] border border-gray-800 rounded-xl p-6 space-y-5">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Height (cm)</label>
                <div className="flex items-center bg-[#1a1a1a] border border-gray-800 rounded-md px-3 py-2 focus-within:border-cyan-400 transition">
                  <Ruler className="w-4 h-4 text-cyan-400 mr-2" />
                  <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="bg-transparent w-full outline-none text-sm text-white" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Weight (kg)</label>
                <div className="flex items-center bg-[#1a1a1a] border border-gray-800 rounded-md px-3 py-2 focus-within:border-cyan-400 transition">
                  <Weight className="w-4 h-4 text-cyan-400 mr-2" />
                  <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="bg-transparent w-full outline-none text-sm text-white" />
                </div>
              </div>
            </div>

            {/* Product Selection */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Select Product</label>
              <div className="relative">
                <select 
                  value={selectedProduct.name} 
                  onChange={(e) => {
                    const prod = ALL_PRODUCTS.find(p => p.name === e.target.value);
                    if (prod) setSelectedProduct(prod);
                  }}
                  className="w-full bg-[#1a1a1a] border border-gray-800 focus:border-cyan-400 rounded-md px-3 py-3 text-sm appearance-none outline-none text-white transition-colors"
                >
                  {ALL_PRODUCTS.map(product => (
                    <option key={product.name} value={product.name} className="bg-[#0a0a0a]">
                      {product.name} - EGP {product.price}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-cyan-400 pointer-events-none" />
              </div>
            </div>

            {/* Variant Selection (يظهر فقط لو المنتج ليه ألوان) */}
            {selectedProduct.variants && selectedProduct.variants.length > 0 && (
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Color Variant</label>
                <div className="relative">
                  <select 
                    value={selectedVariant} 
                    onChange={(e) => setSelectedVariant(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-gray-800 focus:border-cyan-400 rounded-md px-3 py-3 text-sm appearance-none outline-none text-white transition-colors"
                  >
                    {selectedProduct.variants.map(variant => (
                      <option key={variant.colorName} value={variant.colorName} className="bg-[#0a0a0a]">
                        {variant.colorName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-cyan-400 pointer-events-none" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Fit Type</label>
                <div className="w-full bg-[#1a1a1a] border border-gray-800 rounded-md px-3 py-3 text-sm text-cyan-400 font-bold capitalize">
                  {selectedProduct.type} Fit
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Select Size</label>
                <div className="relative">
                  <select 
                    value={selectedSize} 
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-cyan-400 rounded-md px-3 py-3 text-sm appearance-none outline-none text-white"
                  >
                    {SIZES.map(s => (
                      <option key={s} value={s} className="bg-[#0a0a0a]">
                        {s} {s === recommendedSize ? '✓ Recommended' : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-cyan-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full mt-4 bg-cyan-400 text-black font-bold py-4 rounded-md hover:bg-cyan-300 transition-colors flex justify-center items-center gap-2"
            >
              {isLoading ? 'Processing AI...' : (
                <>
                  <Sparkles className="w-5 h-5" /> Generate Try-On
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Output */}
        <div className="bg-[#111] border border-gray-800 rounded-xl flex items-center justify-center overflow-hidden min-h-[500px] relative">
          {resultImage ? (
            <img src={resultImage} alt="AI Generated Fit" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center p-8">
              <Tag className="w-16 h-16 text-gray-800 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Your realistic Try-On will appear here.</p>
              {/* Product Preview Thumbnail */}
              <div className="mt-6 flex justify-center">
                <img 
                  src={selectedVariant && selectedProduct.variants ? selectedProduct.variants.find(v => v.colorName === selectedVariant)?.url : selectedProduct.image} 
                  alt={selectedProduct.name} 
                  className="w-24 h-36 object-cover rounded-md border border-gray-700 opacity-50"
                />
              </div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
