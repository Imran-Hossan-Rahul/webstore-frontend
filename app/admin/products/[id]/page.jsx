"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, UploadCloud, Code, Image as ImageIcon, Video, 
  Github, ShieldCheck, Lock, Layers, Save, CheckCircle2, X
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/ToastProvider';
import { api } from '@/utils/api';

export default function EditProductPage({ params }) {
  const id = params.id;
  const { showToast } = useToast();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [zipFile, setZipFile] = useState(null);
  
  const [formDataState, setFormDataState] = useState({
    title: '',
    productType: 'Company Website',
    description: '',
    techStack: '',
    demoUrl: ''
  });

  const [prices, setPrices] = useState({
    single: { enabled: true, regular: 99, sale: 49 },
    commercial: { enabled: true, regular: 299, sale: 149 },
    extended: { enabled: true, regular: 999, sale: 499 }
  });

  React.useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/market/products/${id}`);
        const p = res.data || res.product || res;
        
        setFormDataState({
          title: p.title || '',
          productType: p.productType || 'Company Website',
          description: p.description || '',
          techStack: p.techStack ? (typeof p.techStack === 'string' ? JSON.parse(p.techStack).join(', ') : (Array.isArray(p.techStack) ? p.techStack.join(', ') : '')) : '',
          demoUrl: p.demoUrl || ''
        });

        if (p.photos) {
          try {
            const photos = typeof p.photos === 'string' ? JSON.parse(p.photos) : p.photos;
            setPreviews(photos.map(url => ({ url, type: 'image', name: 'Existing', isExisting: true })));
          } catch(e) {}
        }
        
        // We could populate prices from variantGroups, but for now we leave default or user can re-adjust.
      } catch (e) {
        showToast("Failed to load product", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleZipUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setZipFile(e.target.files[0]);
    }
  };

  const removeZip = (e) => {
    e.preventDefault();
    setZipFile(null);
  };

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    setMediaFiles(prev => [...prev, ...files]);
    
    // Create previews
    const newPreviews = files.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image',
      name: file.name
    }));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeMedia = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const formData = new FormData();
      formData.append('title', formDataState.title || 'Updated Digital Asset');
      formData.append('productType', formDataState.productType || 'Company Website');
      formData.append('description', formDataState.description || 'A premium digital asset updated by admin.');
      if (formDataState.demoUrl) {
        formData.append('demoUrl', formDataState.demoUrl);
      }
      if (formDataState.techStack) {
        formData.append('techStack', JSON.stringify(formDataState.techStack.split(',').map(s => s.trim())));
      }

      const activeLicenses = [];
      let basePrice = 0;
      let baseRegular = 0;
      
      if (prices.single.enabled) {
          basePrice = prices.single.sale;
          baseRegular = prices.single.regular;
          activeLicenses.push({ label: "Single License", priceDifference: 0, originalPriceDifference: 0 });
      } else if (prices.commercial.enabled) {
          basePrice = prices.commercial.sale;
          baseRegular = prices.commercial.regular;
          activeLicenses.push({ label: "Commercial License", priceDifference: 0, originalPriceDifference: 0 });
      } else if (prices.extended.enabled) {
          basePrice = prices.extended.sale;
          baseRegular = prices.extended.regular;
          activeLicenses.push({ label: "Extended License", priceDifference: 0, originalPriceDifference: 0 });
      }

      if (prices.commercial.enabled && prices.single.enabled) {
          activeLicenses.push({ 
              label: "Commercial License", 
              priceDifference: Math.max(0, prices.commercial.sale - basePrice),
              originalPriceDifference: Math.max(0, prices.commercial.regular - baseRegular)
          });
      }
      
      if (prices.extended.enabled && (prices.single.enabled || prices.commercial.enabled)) {
          activeLicenses.push({ 
              label: "Extended License", 
              priceDifference: Math.max(0, prices.extended.sale - basePrice),
              originalPriceDifference: Math.max(0, prices.extended.regular - baseRegular)
          });
      }

      formData.append('selling_price', basePrice.toString());
      formData.append('original_price', baseRegular.toString());
      
      // We don't overwrite cost_price or status here unless needed, backend might retain if not sent
      // Or we can just omit them if the backend merges. If it replaces, we should send them.
      
      const variants = [
        {
          name: "License Type",
          options: activeLicenses
        }
      ];
      formData.append('variantGroups', JSON.stringify(variants));

      if (zipFile) formData.append('media', zipFile);
      mediaFiles.forEach(f => formData.append('media', f));

      // Append existing photos back
      const existingPhotos = previews.filter(p => p.isExisting).map(p => p.url);
      if (existingPhotos.length > 0) {
        formData.append('photos', JSON.stringify(existingPhotos));
      }

      await api.post(`/market/products/${id}`, formData);

      showToast("Product updated successfully!", "success");
      router.push('/admin/products');
    } catch (err) {
      showToast(err.message || "Failed to save product", "error");
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/60 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-display font-medium text-white">Create Digital Asset</h1>
            <p className="text-white/60 text-[14px]">Upload source code, templates, or define a custom service.</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-brand-cyan text-black font-medium hover:bg-brand-cyan/90 transition-colors disabled:opacity-70"
        >
          {isSaving ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? 'Saving...' : 'Save Asset'}</span>
        </button>
      </div>

      <div className="w-full">
        <div className="space-y-8">
            
            <div id="general" className="bg-[#080808] border border-white/10 rounded-2xl p-6 shadow-xl scroll-mt-6">
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white border-b border-white/10 pb-4">Basic Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[13px] text-white/60 mb-2">Asset Title</label>
                    <input id="asset-title" type="text" value={formDataState.title} onChange={(e) => setFormDataState({...formDataState, title: e.target.value})} placeholder="e.g. Next.js SaaS Boilerplate" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-[14px] focus:outline-none focus:border-brand-cyan/50 focus:ring-1 focus:ring-brand-cyan/50" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] text-white/60 mb-2">Product Type</label>
                      <select id="product-type" value={formDataState.productType} onChange={(e) => setFormDataState({...formDataState, productType: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-[14px] focus:outline-none focus:border-brand-cyan/50">
                        <option className="bg-[#080808] text-white">Company Website</option>
                        <option className="bg-[#080808] text-white">E-Commerce Website</option>
                        <option className="bg-[#080808] text-white">SaaS Tool</option>
                        <option className="bg-[#080808] text-white">Web Template</option>
                        <option className="bg-[#080808] text-white">Custom Service</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[13px] text-white/60 mb-2">Tech Stack (comma separated)</label>
                      <input id="tech-stack" type="text" value={formDataState.techStack} onChange={(e) => setFormDataState({...formDataState, techStack: e.target.value})} placeholder="React, Node, Tailwind..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-[14px] focus:outline-none focus:border-brand-cyan/50" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] text-white/60 mb-2">Description</label>
                    <textarea id="asset-desc" rows={5} value={formDataState.description} onChange={(e) => setFormDataState({...formDataState, description: e.target.value})} placeholder="Write a detailed description..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-[14px] focus:outline-none focus:border-brand-cyan/50 focus:ring-1 focus:ring-brand-cyan/50" />
                  </div>
                </div>
              </div>
            </div>

            <div id="media" className="bg-[#080808] border border-white/10 rounded-2xl p-6 shadow-xl scroll-mt-6">
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white border-b border-white/10 pb-4">Media & Demo</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-[13px] text-white/60 mb-2">Live Demo URL</label>
                    <input id="demo-url" type="url" value={formDataState.demoUrl} onChange={(e) => setFormDataState({...formDataState, demoUrl: e.target.value})} placeholder="https://demo.codalina.com/..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-[14px] focus:outline-none focus:border-brand-cyan/50" />
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 text-[13px] text-white/60 mb-2">
                      <UploadCloud className="w-4 h-4 text-white/80" /> Upload Images & Video Demo (Cloudinary)
                    </label>
                    <label className="w-full h-32 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center hover:border-brand-cyan/50 hover:bg-brand-cyan/5 transition-colors cursor-pointer text-white/40">
                      <UploadCloud className="w-6 h-6 mb-2" />
                      <span className="text-[14px]">Click or drag to upload high-res images and videos</span>
                      <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleMediaUpload} />
                    </label>

                    {previews.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {previews.map((file, i) => (
                          <div key={i} className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group bg-black">
                            {file.type === 'video' ? (
                              <video src={file.url} className="w-full h-full object-contain" />
                            ) : (
                              <img src={file.url} alt="Preview" className="w-full h-full object-cover" />
                            )}
                            <button 
                              onClick={() => removeMedia(i)}
                              className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            {file.type === 'video' && (
                              <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] text-white font-medium flex items-center gap-1">
                                <Video className="w-3 h-3" /> Video
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div id="assets" className="bg-[#080808] border border-white/10 rounded-2xl p-6 shadow-xl scroll-mt-6">
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white border-b border-white/10 pb-4">Source Code & Deliverables</h3>
                
                <div className="space-y-6">
                  <div className="p-6 rounded-xl bg-white/5 border border-white/20">
                    <h4 className="flex items-center gap-2 text-[15px] font-medium text-white mb-2">
                      <Github className="w-4 h-4 text-white" /> Link Private GitHub Repository
                    </h4>
                    <p className="text-[13px] text-white/60 mb-4">Grant access to clients automatically upon purchase using our GitHub App integration.</p>
                    <input type="url" placeholder="https://github.com/codalinahq/..." className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-white text-[14px] focus:outline-none focus:border-white/50" />
                  </div>
                  
                  <div className="relative text-center text-white/40 text-[13px] my-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                    <span className="relative bg-[#080808] px-4 uppercase font-medium">OR</span>
                  </div>

                  <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                    <h4 className="flex items-center gap-2 text-[15px] font-medium text-white mb-2">
                      <UploadCloud className="w-4 h-4 text-brand-cyan" /> Upload ZIP Archive
                    </h4>
                    <p className="text-[13px] text-white/60 mb-4">Upload the source code directly. We will securely store it in AWS S3 and generate 1-click expiring links for buyers.</p>
                    {zipFile ? (
                      <div className="w-full border border-brand-cyan/30 bg-brand-cyan/5 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-brand-cyan/10 rounded-lg text-brand-cyan">
                            <Layers className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-[14px] font-medium text-white truncate max-w-[200px] sm:max-w-xs">
                              {zipFile.name}
                            </p>
                            <p className="text-[12px] text-white/50">
                              {(zipFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={removeZip}
                          className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-red-400 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-full h-40 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center hover:border-brand-cyan/50 hover:bg-brand-cyan/5 transition-colors cursor-pointer text-white/40">
                        <UploadCloud className="w-8 h-8 mb-3 text-white/60" />
                        <span className="text-[14px] font-medium text-white mb-1">Select ZIP File</span>
                        <span className="text-[12px]">Max 500MB. Automatically scanned for malware.</span>
                        <input type="file" accept=".zip,.rar,.tar.gz" className="hidden" onChange={handleZipUpload} />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div id="security" className="bg-[#080808] border border-white/10 rounded-2xl p-6 shadow-xl scroll-mt-6">
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white border-b border-white/10 pb-4">Security & Licensing</h3>
                
                <div className="space-y-4">
                  <label className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                    <div className="flex items-center h-5">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-[#080808] border-white/20 text-brand-cyan focus:ring-brand-cyan" />
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-white mb-1 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-red-400" /> Require Domain/IP Lock
                      </p>
                      <p className="text-[13px] text-white/50">Restricts the source code to run only on authorized domains or IP addresses. Prevents reselling.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                    <div className="flex items-center h-5">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-[#080808] border-white/20 text-brand-cyan focus:ring-brand-cyan" />
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-white mb-1 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-brand-cyan" /> Enable Auto-Watermarking (BuildFingerprint)
                      </p>
                      <p className="text-[13px] text-white/50">Injects hidden digital signatures into the code before download to trace leaked scripts back to the buyer.</p>
                    </div>
                  </label>

                  <div>
                    <label className="block text-[13px] text-white/60 mb-3 mt-4">Available License Types</label>
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                        <input type="checkbox" checked={prices.single.enabled} onChange={(e) => setPrices({...prices, single: {...prices.single, enabled: e.target.checked}})} className="mt-0.5 w-4 h-4 rounded bg-[#080808] border-white/20 text-brand-cyan focus:ring-brand-cyan" />
                        <div>
                          <span className="text-[13px] font-medium text-white block">Single License (Max 1 Domain)</span>
                          <span className="text-[12px] text-white/50">Use for 1 project/website (For yourself or 1 Client).</span>
                        </div>
                      </label>
                      <label className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                        <input type="checkbox" checked={prices.commercial.enabled} onChange={(e) => setPrices({...prices, commercial: {...prices.commercial, enabled: e.target.checked}})} className="mt-0.5 w-4 h-4 rounded bg-[#080808] border-white/20 text-brand-cyan focus:ring-brand-cyan" />
                        <div>
                          <span className="text-[13px] font-medium text-white block">Commercial License (Max 3 Domains)</span>
                          <span className="text-[12px] text-white/50">Use for up to 3 projects/websites (Clients or Yourself).</span>
                        </div>
                      </label>
                      <label className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                        <input type="checkbox" checked={prices.extended.enabled} onChange={(e) => setPrices({...prices, extended: {...prices.extended, enabled: e.target.checked}})} className="mt-0.5 w-4 h-4 rounded bg-[#080808] border-white/20 text-brand-cyan focus:ring-brand-cyan" />
                        <div>
                          <span className="text-[13px] font-medium text-white block">Extended License (Unlimited)</span>
                          <span className="text-[12px] text-white/50">Unlimited projects/domains and full resell rights.</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div id="pricing" className="bg-[#080808] border border-white/10 rounded-2xl p-6 shadow-xl scroll-mt-6">
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white border-b border-white/10 pb-4">License Pricing & Tiers (BDT)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Single License */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white font-medium mb-1">
                          <input type="checkbox" checked={prices.single.enabled} onChange={(e) => setPrices({...prices, single: {...prices.single, enabled: e.target.checked}})} className="w-4 h-4 rounded bg-[#080808] border-white/20 text-brand-cyan focus:ring-brand-cyan cursor-pointer" />
                          <span className="w-2 h-2 rounded-full bg-brand-cyan"></span>
                          Single License
                        </div>
                      </div>
                      <p className="text-[12px] text-white/50 h-8">Base price. Allows use on 1 domain.</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-white/40 mb-1 uppercase tracking-wider">Regular Price</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">৳</span>
                          <input 
                            type="number" 
                            value={prices.single.regular}
                            onChange={(e) => setPrices({...prices, single: { ...prices.single, regular: Number(e.target.value) }})}
                            className="w-full bg-[#040608] border border-white/10 rounded-lg pl-7 pr-3 py-2 text-white/60 line-through text-[13px] focus:outline-none focus:border-white/20" 
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] text-brand-cyan/80 mb-1 uppercase tracking-wider font-medium">Sale Price</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-cyan/80">৳</span>
                          <input 
                            type="number" 
                            value={prices.single.sale}
                            onChange={(e) => setPrices({...prices, single: { ...prices.single, sale: Number(e.target.value) }})}
                            className="w-full bg-[#040608] border border-brand-cyan/30 rounded-lg pl-7 pr-3 py-2 text-white text-[13px] focus:outline-none focus:border-brand-cyan" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Commercial License */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white font-medium mb-1">
                          <input type="checkbox" checked={prices.commercial.enabled} onChange={(e) => setPrices({...prices, commercial: {...prices.commercial, enabled: e.target.checked}})} className="w-4 h-4 rounded bg-[#080808] border-white/20 text-brand-cyan focus:ring-brand-cyan cursor-pointer" />
                          <span className="w-2 h-2 rounded-full bg-[#0E7C86]"></span>
                          Commercial
                        </div>
                      </div>
                      <p className="text-[12px] text-white/50 h-8">Allows use on up to 3 domains/clients.</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-white/40 mb-1 uppercase tracking-wider">Regular Price</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">৳</span>
                          <input 
                            type="number" 
                            value={prices.commercial.regular}
                            onChange={(e) => setPrices({...prices, commercial: { ...prices.commercial, regular: Number(e.target.value) }})}
                            className="w-full bg-[#040608] border border-white/10 rounded-lg pl-7 pr-3 py-2 text-white/60 line-through text-[13px] focus:outline-none focus:border-white/20" 
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] text-white/80 mb-1 uppercase tracking-wider font-medium">Sale Price</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/80">৳</span>
                          <input 
                            type="number" 
                            value={prices.commercial.sale}
                            onChange={(e) => setPrices({...prices, commercial: { ...prices.commercial, sale: Number(e.target.value) }})}
                            className="w-full bg-[#040608] border border-white/30 rounded-lg pl-7 pr-3 py-2 text-white text-[13px] focus:outline-none focus:border-white/60" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Extended License */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white font-medium mb-1">
                          <input type="checkbox" checked={prices.extended.enabled} onChange={(e) => setPrices({...prices, extended: {...prices.extended, enabled: e.target.checked}})} className="w-4 h-4 rounded bg-[#080808] border-white/20 text-brand-cyan focus:ring-brand-cyan cursor-pointer" />
                          <span className="w-2 h-2 rounded-full bg-white/60"></span>
                          Extended
                        </div>
                      </div>
                      <p className="text-[12px] text-white/50 h-8">Unlimited domains + resell rights.</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-white/40 mb-1 uppercase tracking-wider">Regular Price</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">৳</span>
                          <input 
                            type="number" 
                            value={prices.extended.regular}
                            onChange={(e) => setPrices({...prices, extended: { ...prices.extended, regular: Number(e.target.value) }})}
                            className="w-full bg-[#040608] border border-white/10 rounded-lg pl-7 pr-3 py-2 text-white/60 line-through text-[13px] focus:outline-none focus:border-white/20" 
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] text-white/80 mb-1 uppercase tracking-wider font-medium">Sale Price</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/80">৳</span>
                          <input 
                            type="number" 
                            value={prices.extended.sale}
                            onChange={(e) => setPrices({...prices, extended: { ...prices.extended, sale: Number(e.target.value) }})}
                            className="w-full bg-[#040608] border border-white/30 rounded-lg pl-7 pr-3 py-2 text-white text-[13px] focus:outline-none focus:border-white/60" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

        </div>
      </div>
    </div>
  );
}
