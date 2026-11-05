import React, { useState, useRef } from 'react';
import {
  Activity,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Clock,
  Pill,
  Droplets,
  Calendar,
} from 'lucide-react';
import { diseaseService } from '../services/diseaseService';
import { IMAGES } from '../assets/images';

export default function DiseaseDetection() {
  const fileInputRef = useRef(null);
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
const [previewUrl, setPreviewUrl] = useState(IMAGES.leafDisease);
const [selectedFile, setSelectedFile] = useState(null);
const [error, setError] = useState('');
const [analyzing, setAnalyzing] = useState(false);
const [result, setResult] = useState(null);
const [history, setHistory] = useState(() => diseaseService.getDiseaseHistory());

  // Quick disease test samples for hackathon judges
  const SAMPLE_DIAGNOSTICS = [
    { label: 'Tomato Early Blight (Alternaria)', crop: 'Tomato', image: IMAGES.leafDisease, healthy: false },
    { label: 'Chilli Leaf Curl Virus (ChiLCV)', crop: 'Chilli', image: IMAGES.chilliVegetative, healthy: false },
    { label: 'Rice Blast (Magnaporthe)', crop: 'Paddy', image: IMAGES.paddyField, healthy: false },
    { label: 'Healthy Tomato Canopy', crop: 'Tomato', image: IMAGES.tomatoFlowering, healthy: true },
  ];

  const handleSelectSample = (sample) => {
  setSelectedCrop(sample.crop);
  setPreviewUrl(sample.image);
  setSelectedFile(null);
  setResult(null);
  setError('');
};

  const handleFileChange = (e) => {
  const file = e.target.files?.[0];

  if (file) {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError('');
  }
};

  const handleDetect = async () => {
  setAnalyzing(true);
  setResult(null);
  setError('');

  try {
    const response = await diseaseService.detectDisease({
      imageFile: selectedFile,
      imageUrl: previewUrl,
      cropType: selectedCrop,
    });

    setResult(response);
    setHistory(diseaseService.getDiseaseHistory());

  } catch (err) {
    console.error('Disease detection error:', err);
    setError(err.message || 'Unable to analyze the plant image.');
  } finally {
    setAnalyzing(false);
  }
};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold text-emerald-800 tracking-wide uppercase">
          Diagnostic Pathology Engine
        </span>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
          Plant Disease Intelligence & Pathology
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
          Identify foliar fungal, bacterial, and viral pathogens from plant photographs. Receive biosecurity severity rankings, organic biological control measures, and chemical treatment regimens.
        </p>
      </div>

      {/* Main Grid: Upload & Inspection Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input & Image Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-display font-bold text-sm text-slate-900">Upload Leaf or Canopy Photo</h3>

            {/* Quick Test Presets for Judges */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 mb-2">1-Click Pathology Presets for Evaluation:</p>
              <div className="space-y-1.5">
                {SAMPLE_DIAGNOSTICS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-between ${
                      previewUrl === sample.image
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/40'
                    }`}
                  >
                    <span>{sample.label}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{sample.crop}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative aspect-4/3 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-600 bg-slate-50/60 hover:bg-emerald-50/20 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center p-4 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {previewUrl ? (
                <div className="relative w-full h-full">
                  <img
                    src={previewUrl}
                    alt="Pathology sample preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 rounded-lg">
                    <RefreshCw className="w-4 h-4" />
                    <span>Upload Alternate Sample</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-center">
                  <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Upload Leaf or Canopy Photo</p>
                    <p className="text-[11px] text-slate-400">JPEG, PNG with clear lesion focus</p>
                  </div>
                </div>
              )}
            </div>

            {/* Crop Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Host Crop Species</label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
              >
                <option value="Tomato">Tomato (Solanum lycopersicum)</option>
                <option value="Chilli">Chilli (Capsicum annuum)</option>
                <option value="Paddy">Paddy / Rice (Oryza sativa)</option>
              </select>
            </div>

            {/* Run Button */}
           <button
  type="button"
  onClick={handleDetect}
  disabled={analyzing}
  className="w-full py-3 px-4 bg-[#123B2A] hover:bg-[#16A36A] active:scale-[0.99] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
>
  {analyzing ? (
    <>
      <RefreshCw className="w-4 h-4 animate-spin text-[#B7E46A]" />
      <span>Scanning Pathological Signatures...</span>
    </>
  ) : (
    <>
      <Activity className="w-4 h-4 text-[#B7E46A]" />
      <span>Diagnose Plant Disease</span>
    </>
  )}
</button>

{/* Error Message */}
{error && (
  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
    {error}
  </div>
)}
          </div>
        </div>

        {/* Right: Diagnostic Card & History (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="space-y-4 animate-fade-in">
              {/* Healthy Specimen Banner if Healthy */}
              {result.isHealthy ? (
                <div className="bg-white p-6 rounded-2xl border-2 border-emerald-500 shadow-sm space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <span className="text-[11px] font-bold font-mono text-emerald-800">
                        DIAGNOSIS: HEALTHY
                      </span>
                      <h3 className="text-xl font-bold font-display text-slate-900 tracking-tight">
                        No Pathogenic Infection Detected
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Foliar epidermal tissue intact · Model confidence:{' '}
                        <strong className="font-mono text-emerald-700">{result.confidence}%</strong>
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-1.5">
                    <p className="font-semibold text-emerald-950">Visual Observations:</p>
                    <ul className="space-y-1 text-emerald-900">
                      {result.symptoms.map((s, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-xs text-slate-600">
                    <strong>Recommended Practice:</strong> {result.organicManagement[0]}
                  </div>
                </div>
              ) : (
                /* Infected Disease Diagnostic Card */
                <div className="bg-white p-6 rounded-2xl border-2 border-red-500/40 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-red-100 text-red-800">
                          {result.severity} Severity
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {result.pathogenType}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold font-display text-slate-900 tracking-tight mt-1">
                        {result.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Target Crop: {result.crop} · Affected: {result.affectedParts}
                      </p>
                    </div>

                    <div className="text-right flex sm:flex-col items-center sm:items-end justify-between">
                      <span className="text-2xl font-bold font-display text-red-700 font-mono tabular-nums">
                        {result.confidence}%
                      </span>
                      <span className="text-[11px] text-slate-400">Pathology Confidence</span>
                    </div>
                  </div>

                  {/* Symptoms & Visual Observations */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Identified Symptoms & Visual Markers
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {result.symptoms.map((sym, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>{sym}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Organic & Biological Management */}
                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2 text-xs">
                    <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-700" />
                      <span>Biological & Organic Control Protocol</span>
                    </h4>
                    <ul className="space-y-1 text-emerald-900">
                      {result.organicManagement.map((org, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-700 font-bold">•</span>
                          <span>{org}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Chemical Treatment & Fungicide Management */}
                  <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2 text-xs">
                    <h4 className="font-bold text-amber-950 flex items-center gap-1.5">
                      <Pill className="w-4 h-4 text-amber-700" />
                      <span>Chemical / Fungicidal Intervention (if needed)</span>
                    </h4>
                    <ul className="space-y-1 text-amber-900">
                      {result.chemicalTreatment.map((chem, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-700 font-bold">•</span>
                          <span>{chem}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Preventative measures */}
                  <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <p className="font-semibold text-slate-800">Preventative Field Measures:</p>
                    <p>{result.preventiveMeasures.join(' · ')}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <Activity className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-base text-slate-900">Awaiting Specimen</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Choose a sample diagnostic preset or upload a leaf photo, then click <strong>Diagnose Plant Disease</strong> to inspect for viral, fungal, and bacterial lesions.
              </p>
            </div>
          )}

          {/* Disease Detection History Table */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-slate-900">Diagnostic History Log</h3>
              <span className="text-[11px] font-mono text-slate-400">{history.length} records</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {history.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.imageUrl}
                      alt={item.diseaseName}
                      className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{item.diseaseName}</p>
                      <p className="text-[11px] text-slate-500">
                        {item.plantId} · {item.crop} · <span className="font-mono">{item.confidence}% conf</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'Healthy'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.status}
                    </span>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
