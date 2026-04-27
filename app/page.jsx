'use client';
import { useState, useEffect } from 'react';
import { Upload, Ruler, Weight, Tag, ChevronDown, Sparkles } from 'lucide-react';
// استدعاء الداتا الحقيقية من ملفك
import { TRY_TEST_PRODUCTS, PREORDER_PRODUCT, SIZES } from '@/lib/products'; 

const ALL_PRODUCTS = [...TRY_TEST_PRODUCTS, PREORDER_PRODUCT];

export default function SwayTryOn() {
  const [customerImage, setCustomerImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [height, setHeight] = useState('162');
  const [weight, setWeight] = useState('55');
  
  const [selectedProduct, setSelectedProduct] = useState(ALL_PRODUCTS[0]);
  const [selectedVariant, setSelectedVariant] = useState('');
  
  const [selectedSize, setSelectedSize] = useState('S');
  const [recommendedSize, setRecommendedSize] = useState('S');

  useEffect(() => {
    if (selectedProduct.variants && selectedProduct.variants.length > 0) {
      setSelectedVariant(selectedProduct.variants[0].colorName);
    } else {
      setSelectedVariant('');
    }
  }, [selectedProduct]);

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

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomerImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const calculateAIPrompt = () => {
    const sizeIndex = { "S": 0, "M": 1, "L": 2, "XL": 3, "2XL": 4 };
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
    
    const targetImageURL = selectedVariant && selectedProduct.variants 
      ? selectedProduct.variants.find(v => v.colorName === selectedVariant)?.url 
      : selectedProduct.image;

    console.log("Sending to AI API:");
    console.log("Prompt:", finalPrompt);
    console.log("Garment Image URL:", targetImageURL);

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
          
          <div className="bg-[#111] border border-gray-800 rounded-xl p-6 relative overflow-hidden group">
            <input
