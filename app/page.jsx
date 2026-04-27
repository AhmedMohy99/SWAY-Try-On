'use client';
import { useState, useEffect, useMemo } from 'react';
import { Upload, Ruler, Weight, Tag, ChevronDown, Sparkles } from 'lucide-react';

export default function SwayTryOn() {
  const [customerImage, setCustomerImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // User Inputs
  const [height, setHeight] = useState('162');
  const [weight, setWeight] = useState('55');
  const [selectedProduct, setSelectedProduct] = useState('The Catalyst Tee');
  const [selectedSize, setSelectedSize] = useState('1 (S)');
  const [recommendedSize, setRecommendedSize] = useState('1 (S)');

  // SWAY Product Categories from your screenshot
  const products = {
    "Over Size T-Shirts": [
      "The Maverick Phoenix (White)", "The Catalyst Tee", 
      "Yellowish Splash", "Greenish Splash", 
      "Eternity Protocol (Navy)", "Eternity Protocol (White)"
    ],
    "Regular Size Fits": [
      "The Powder Blue Venture Tee", "Bluish Splash", "CYBER CRESCENT"
    ],
    "Sweatpants": [
      "Black Flux Sweatpants", "Light Code Sweatpants"
    ]
  };

  const sizes = ["1 (S)", "2 (M)", "3 (L)", "4 (XL)", "5 (XXL)"];

  // Determine Fit Type based on selected product
  const fitType = useMemo(() => {
    if (products["Over Size T-Shirts"].includes(selectedProduct)) return "Over Size Fit";
    if (products["Sweatpants"].includes(selectedProduct)) return "Baggy Fit";
    return "Regular Fit";
  }, [selectedProduct]);

  // AI Logic: Calculate Recommended Size based on Height/Weight matrix
  useEffect(() => {
    const h = parseInt(height) || 0;
    const w = parseInt(weight) || 0;
    
    let rec = "1 (S)";
    if (w > 0 && h > 0) {
      if (w < 60) rec = "1 (S)";
      else if (w >= 60 && w < 72) rec = "2 (M)";
      else if (w >= 72 && w < 85) rec = "3 (L)";
      else if (w >= 85 && w < 100) rec = "4 (XL)";
      else rec = "5 (XXL)";
    }
    setRecommendedSize(rec);
    
    // Auto-select recommended size if user changes weight/height
    setSelectedSize(rec);
  }, [height, weight]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCustomerImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // The Magic Algorithm: Calculating how the AI should draw the clothes
  const calculateAIPrompt = () => {
    const sizeIndex = { "1 (S)": 0, "2 (M)": 1, "3 (L)": 2, "4 (XL)": 3, "5 (XXL)": 4 };
    const recIdx = sizeIndex[recommendedSize];
    const chosenIdx = sizeIndex[selectedSize];
    
    // Calculate the jump in sizes (e.g., Recommended S (0) to Chosen XXL (4) = +4 sizes difference)
    const sizeDifference = chosenIdx - recIdx;
    
    let promptDetail = "";

    // Adapting visually based on the Fit Type matrix and size difference
    if (sizeDifference === 0) {
      promptDetail = fitType === "Over Size Fit" ? "perfectly styled streetwear oversize drop shoulder fit" : "fitted perfectly to the body";
    } else if (sizeDifference === 1) {
      promptDetail = fitType === "Over Size Fit" ? "very baggy streetwear fit, longer sleeves" : "slightly loose and relaxed fit";
    } else if (sizeDifference === 2) {
      promptDetail = "extremely oversized, very baggy, fabric draping heavily off the shoulders, very wide chest";
    } else if (sizeDifference >= 3) {
      // The 2XL on a 55kg body scenario
      promptDetail = "comically large, immensely oversized, swallowing the wearer, sleeves reaching past the elbows, very long length dropping below the hips, exaggerated huge fit";
    } else if (sizeDifference === -1) {
      promptDetail = "tight fit, showing body shape";
    } else if (sizeDifference <= -2) {
      promptDetail = "extremely tight, undersized, stretched over the body";
    }

    return `Generate a highly realistic photo of the person wearing ${selectedProduct}. The clothing style is ${fitType}, and visually it should look ${promptDetail} on this specific body type.`;
  };

  const handleGenerate = async () => {
    if (!customerImage) {
      alert("Please upload your photo first.");
      return;
    }
    
    setIsLoading(true);
    const finalPrompt = calculateAIPrompt();
    console.log("Sending AI Prompt:", finalPrompt); // You can see this in your browser console

    // Simulate API call to AI Generator
    setTimeout(() => {
      setResultImage("https://via.placeholder.com/600x800/111111/00e5ff?text=AI+Result+Ready");
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-10 font-sans selection:bg-cyan-400 selection:text-black">
      {/* Header matching your design */}
      <header className="flex justify-between items-center mb-10 max-w-6xl mx-auto border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-3xl font-black text-cyan-400 italic tracking-wider">SWAY</h1>
          <p className="text-[10px] text-cyan-400 tracking-[0.2em] uppercase mt-1">Crafted for the Maverick</p>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-bold text-cyan-400">
          <a href="#" className="hover:text-white transition">HOME</a>
          <a href="#" className="hover:text-white transition">SHOP</a>
          <a href="#" className="hover:text-white transition">OUR STORY</a>
        </nav>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Left Column: UI Controls (Matches your dark/cyan theme) */}
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
                  <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="bg-transparent w-full outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Weight (kg)</label>
                <div className="flex items-center bg-[#1a1a1a] border border-gray-800 rounded-md px-3 py-2 focus-within:border-cyan-400 transition">
                  <Weight className="w-4 h-4 text-cyan-400 mr-2" />
                  <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="bg-transparent w-full outline-none text-sm" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Select Product</label>
              <div className="relative">
                <select 
                  value={selectedProduct} 
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-cyan-400 rounded-md px-3 py-3 text-sm appearance-none outline-none text-white"
                >
                  {Object.keys(products).map(category => (
                    <optgroup key={category} label={category} className="text-cyan-400 font-bold bg-[#0a0a0a]">
                      {products[category].map(item => (
                        <option key={item} value={item} className="text-white font-normal">{item}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-cyan-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Fit Type</label>
              <div className="w-full bg-[#1a1a1a] border border-gray-800 rounded-md px-3 py-3 text-sm text-cyan-400 font-bold">
                {fitType}
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
                  {sizes.map(s => (
                    <option key={s} value={s} className="bg-[#0a0a0a]">
                      {s} {s === recommendedSize ? '✓ Recommended' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-cyan-400 pointer-events-none" />
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
              <p className="text-gray-700 text-sm mt-2">Adjust your stats and see how the fit changes.</p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
