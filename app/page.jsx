'use client';
import { useState } from 'react';
import { Upload, Ruler, Weight, Shirt } from 'lucide-react';

export default function SwayTryOn() {
  const [customerImage, setCustomerImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // User Inputs
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [size, setSize] = useState('M');

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCustomerImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const calculateFitPrompt = () => {
    // Basic logic to generate the AI prompt based on inputs
    const h = parseInt(height);
    const w = parseInt(weight);
    
    let fitStyle = "regular fit";
    
    if (size === '2XL' || size === 'XL') {
      if (w < 70) fitStyle = "extremely oversized, huge, baggy fit, drooping shoulders";
      else fitStyle = "oversized streetwear fit";
    } else if (size === 'S' && w > 80) {
      fitStyle = "very tight fit, muscle fit";
    }

    return fitStyle;
  };

  const handleGenerate = async () => {
    if (!customerImage || !height || !weight) {
      alert("Please upload an image and fill in your details.");
      return;
    }

    setIsLoading(true);
    const fitPrompt = calculateFitPrompt();

    // Convert image to base64 to send to our API
    const reader = new FileReader();
    reader.readAsDataURL(customerImage);
    reader.onloadend = async () => {
      const base64data = reader.result;

      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64data,
            fitPrompt: fitPrompt,
            garmentType: "black oversized t-shirt with SWAY logo" // You can make this dynamic later
          })
        });

        const data = await response.json();
        if (data.success) {
          setResultImage(data.imageUrl); // The AI generated image
        } else {
          alert("Error generating image.");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-cyan-400 mb-2">SWAY Try On</h1>
        <p className="text-gray-400 mb-8">Experience your perfect fit instantly.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center mb-6 relative hover:border-cyan-400 transition-colors">
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/*"
                onChange={handleImageUpload}
              />
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="h-48 mx-auto object-contain rounded" />
              ) : (
                <div className="flex flex-col items-center pointer-events-none">
                  <Upload className="w-12 h-12 text-cyan-400 mb-2" />
                  <p>Upload your front-facing photo</p>
                </div>
              )}
            </div>

            {/* Stats Form */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-black p-3 rounded border border-gray-800">
                <Ruler className="text-cyan-400 w-5 h-5" />
                <input 
                  type="number" 
                  placeholder="Height (cm)" 
                  className="bg-transparent outline-none w-full"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-4 bg-black p-3 rounded border border-gray-800">
                <Weight className="text-cyan-400 w-5 h-5" />
                <input 
                  type="number" 
                  placeholder="Weight (kg)" 
                  className="bg-transparent outline-none w-full"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-4 bg-black p-3 rounded border border-gray-800">
                <Shirt className="text-cyan-400 w-5 h-5" />
                <select 
                  className="bg-transparent outline-none w-full appearance-none"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                >
                  <option value="S" className="bg-gray-900">Size: S</option>
                  <option value="M" className="bg-gray-900">Size: M</option>
                  <option value="L" className="bg-gray-900">Size: L</option>
                  <option value="XL" className="bg-gray-900">Size: XL</option>
                  <option value="2XL" className="bg-gray-900">Size: 2XL</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full mt-6 bg-cyan-400 text-black font-bold py-4 rounded hover:bg-cyan-300 transition-colors"
            >
              {isLoading ? 'Processing AI...' : 'Generate Try-On'}
            </button>
          </div>

          {/* Result Section */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 flex flex-col items-center justify-center min-h-[400px]">
            {resultImage ? (
              <img src={resultImage} alt="AI Result" className="w-full h-auto rounded-lg shadow-2xl" />
            ) : (
              <p className="text-gray-500 text-center">Your realistic try-on will appear here.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
