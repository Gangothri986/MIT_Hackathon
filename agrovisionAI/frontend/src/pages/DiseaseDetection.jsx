
import React, { useState, useRef, useEffect } from 'react';
import {
  Activity,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Pill,
  Clock,
  History,
  Eye,
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
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const SAMPLE_DIAGNOSTICS = [
    {
      label: 'Tomato Early Blight (Alternaria)',
      crop: 'Tomato',
      image: IMAGES.leafDisease,
    },
    {
      label: 'Chilli Leaf Curl Virus (ChiLCV)',
      crop: 'Chilli',
      image: IMAGES.chilliVegetative,
    },
    {
      label: 'Rice Blast (Magnaporthe)',
      crop: 'Paddy',
      image: IMAGES.paddyField,
    },
    {
      label: 'Healthy Tomato Canopy',
      crop: 'Tomato',
      image: IMAGES.tomatoFlowering,
    },
  ];

  // ==========================================
  // FETCH HISTORY FROM MONGODB
  // ==========================================

  const loadDiseaseHistory = async () => {
    setHistoryLoading(true);

    try {
      const records = await diseaseService.getDiseaseHistory();
      setHistory(Array.isArray(records) ? records : []);
    } catch (err) {
      console.error('Disease history loading failed:', err);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadDiseaseHistory();
  }, []);

  // ==========================================
  // SELECT SAMPLE IMAGE
  // ==========================================

  const handleSelectSample = (sample) => {
    setSelectedCrop(sample.crop);
    setPreviewUrl(sample.image);
    setSelectedFile(null);
    setResult(null);
    setError('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ==========================================
  // UPLOAD IMAGE
  // ==========================================

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      setError('Please select a JPG, PNG or WEBP image.');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('Image size must be less than 8 MB.');
      return;
    }

    setSelectedFile(file);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    setResult(null);
    setError('');
  };

  // ==========================================
  // DETECT DISEASE
  // ==========================================

  const handleDetect = async () => {
    if (!previewUrl) {
      setError('Please select or upload a plant image.');
      return;
    }

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

      // Fetch the latest records from MongoDB.
      await loadDiseaseHistory();

    } catch (err) {
      console.error('Disease detection error:', err);

      setError(
        err.message || 'Unable to analyze the plant image.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  // ==========================================
  // VIEW EXISTING HISTORY RECORD
  // ==========================================

  const handleViewHistory = (item) => {
    setResult({
      ...item,
      name: item.diseaseName || item.name,
      crop: item.crop,
      isHealthy: item.status === 'Healthy',
      symptoms: item.symptoms || [],
      organicManagement: item.organicManagement || [],
      chemicalTreatment: item.chemicalTreatment || [],
      preventiveMeasures: item.preventiveMeasures || [],
      confidence: item.confidence ?? 0,
      imageUrl: item.imageUrl,
    });

    setSelectedCrop(item.crop || 'Tomato');
    setPreviewUrl(item.imageUrl || IMAGES.leafDisease);
    setSelectedFile(null);
    setError('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // ==========================================
  // SAFE ARRAY HELPER
  // ==========================================

  const safeArray = (value) => {
    return Array.isArray(value) ? value : [];
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>
        <span className="text-xs font-semibold text-emerald-800 tracking-wide uppercase">
          Diagnostic Pathology Engine
        </span>

        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
          Plant Disease Intelligence &amp; Pathology
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
          Identify visible plant health problems from photographs.
          Receive disease screening results, severity rankings,
          organic management suggestions and chemical treatment guidance.
        </p>
      </div>

      {/* MAIN GRID */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT: IMAGE UPLOAD */}

        <div className="lg:col-span-5 space-y-4">

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">

            <h3 className="font-display font-bold text-sm text-slate-900">
              Upload Leaf or Canopy Photo
            </h3>

            {/* SAMPLE IMAGES */}

            <div>
              <p className="text-[11px] font-semibold text-slate-500 mb-2">
                1-Click Pathology Presets for Evaluation:
              </p>

              <div className="space-y-1.5">

                {SAMPLE_DIAGNOSTICS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    disabled={analyzing}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-between disabled:opacity-50 ${
                      previewUrl === sample.image && !selectedFile
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/40'
                    }`}
                  >
                    <span>{sample.label}</span>

                    <span className="text-[10px] text-slate-400 font-mono">
                      {sample.crop}
                    </span>
                  </button>
                ))}

              </div>
            </div>

            {/* IMAGE UPLOAD AREA */}

            <div
              onClick={() => {
                if (!analyzing) {
                  fileInputRef.current?.click();
                }
              }}
              className="relative aspect-4/3 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-600 bg-slate-50/60 hover:bg-emerald-50/20 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center p-4 group"
            >

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              {previewUrl ? (
                <div className="relative w-full h-full">

                  <img
                    src={previewUrl}
                    alt="Plant disease preview"
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
                    <p className="text-xs font-bold text-slate-800">
                      Upload Leaf or Canopy Photo
                    </p>

                    <p className="text-[11px] text-slate-400">
                      JPEG, PNG or WEBP
                    </p>
                  </div>

                </div>
              )}

            </div>

            {selectedFile && (
              <p className="text-[11px] text-slate-500 truncate">
                Selected: {selectedFile.name}
              </p>
            )}

            {/* CROP SELECTOR */}

            <div>

              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Host Crop Species
              </label>

              <select
                value={selectedCrop}
                disabled={analyzing}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
              >
                <option value="Tomato">
                  Tomato (Solanum lycopersicum)
                </option>

                <option value="Chilli">
                  Chilli (Capsicum annuum)
                </option>

                <option value="Paddy">
                  Paddy / Rice (Oryza sativa)
                </option>
              </select>

            </div>

            {/* DETECT BUTTON */}

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

            {/* ERROR */}

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {error}
              </div>
            )}

          </div>
        </div>

        {/* RIGHT: RESULT AND HISTORY */}

        <div className="lg:col-span-7 space-y-4">

          {/* DIAGNOSIS RESULT */}

          {result ? (

            <div className="space-y-4 animate-fade-in">

              {/* HEALTHY RESULT */}

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
                        {result.name || 'No Visible Disease Detected'}
                      </h3>

                      <p className="text-xs text-slate-500 mt-0.5">
                        Model confidence:{' '}
                        <strong className="font-mono text-emerald-700">
                          {result.confidence}%
                        </strong>
                      </p>

                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-1.5">

                    <p className="font-semibold text-emerald-950">
                      Visual Observations:
                    </p>

                    {safeArray(result.symptoms).length > 0 ? (
                      <ul className="space-y-1 text-emerald-900">

                        {safeArray(result.symptoms).map((s, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{s}</span>
                          </li>
                        ))}

                      </ul>
                    ) : (
                      <p className="text-emerald-800">
                        No significant visible symptoms reported.
                      </p>
                    )}

                  </div>

                  {safeArray(result.organicManagement).length > 0 && (
                    <div className="text-xs text-slate-600">
                      <strong>Recommended Practice:</strong>{' '}
                      {result.organicManagement[0]}
                    </div>
                  )}

                </div>

              ) : (

                /* INFECTED RESULT */

                <div className="bg-white p-6 rounded-2xl border-2 border-red-500/40 shadow-sm space-y-4">

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">

                    <div>

                      <div className="flex items-center gap-2">

                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-red-100 text-red-800">
                          {result.severity || 'Unknown'} Severity
                        </span>

                        <span className="text-[11px] text-slate-400 font-mono">
                          {result.pathogenType || 'Pathogen not specified'}
                        </span>

                      </div>

                      <h3 className="text-xl font-bold font-display text-slate-900 tracking-tight mt-1">
                        {result.name || result.diseaseName || 'Disease detected'}
                      </h3>

                      <p className="text-xs text-slate-500">
                        Target Crop: {result.crop || selectedCrop}
                        {' · '}
                        Affected: {result.affectedParts || 'Not specified'}
                      </p>

                    </div>

                    <div className="text-right flex sm:flex-col items-center sm:items-end justify-between">

                      <span className="text-2xl font-bold font-display text-red-700 font-mono tabular-nums">
                        {result.confidence ?? 0}%
                      </span>

                      <span className="text-[11px] text-slate-400">
                        Pathology Confidence
                      </span>

                    </div>

                  </div>

                  {/* ALTERNATIVE DIAGNOSIS */}

                  {result.alternativeDiagnosis && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                      <strong>Alternative possibility:</strong>{' '}
                      {result.alternativeDiagnosis}
                    </div>
                  )}

                  {/* SYMPTOMS */}

                  <div className="space-y-2">

                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Identified Symptoms &amp; Visual Markers
                    </h4>

                    {safeArray(result.symptoms).length > 0 ? (
                      <ul className="space-y-1.5 text-xs text-slate-700">

                        {safeArray(result.symptoms).map((sym, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span>{sym}</span>
                          </li>
                        ))}

                      </ul>
                    ) : (
                      <p className="text-xs text-slate-500">
                        No symptoms were returned.
                      </p>
                    )}

                  </div>

                  {/* ORGANIC MANAGEMENT */}

                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2 text-xs">

                    <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-700" />
                      <span>Biological &amp; Organic Control Protocol</span>
                    </h4>

                    {safeArray(result.organicManagement).length > 0 ? (
                      <ul className="space-y-1 text-emerald-900">

                        {safeArray(result.organicManagement).map((org, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-700 font-bold">•</span>
                            <span>{org}</span>
                          </li>
                        ))}

                      </ul>
                    ) : (
                      <p className="text-emerald-800">
                        No organic recommendations provided.
                      </p>
                    )}

                  </div>

                  {/* CHEMICAL TREATMENT */}

                  <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2 text-xs">

                    <h4 className="font-bold text-amber-950 flex items-center gap-1.5">
                      <Pill className="w-4 h-4 text-amber-700" />
                      <span>Chemical / Fungicidal Intervention (if needed)</span>
                    </h4>

                    {safeArray(result.chemicalTreatment).length > 0 ? (
                      <ul className="space-y-1 text-amber-900">

                        {safeArray(result.chemicalTreatment).map((chem, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-amber-700 font-bold">•</span>
                            <span>{chem}</span>
                          </li>
                        ))}

                      </ul>
                    ) : (
                      <p className="text-amber-800">
                        No chemical treatment recommendations provided.
                      </p>
                    )}

                  </div>

                  {/* PREVENTION */}

                  <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">

                    <p className="font-semibold text-slate-800">
                      Preventative Field Measures:
                    </p>

                    <p>
                      {safeArray(result.preventiveMeasures).length > 0
                        ? result.preventiveMeasures.join(' · ')
                        : 'No preventive measures provided.'}
                    </p>

                  </div>

                </div>
              )}

            </div>

          ) : (

            /* EMPTY RESULT STATE */

            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">

              <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <Activity className="w-8 h-8" />
              </div>

              <h3 className="font-display font-bold text-base text-slate-900">
                Awaiting Specimen
              </h3>

              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Choose a sample diagnostic preset or upload a leaf photo,
                then click Diagnose Plant Disease to inspect the specimen.
              </p>

            </div>
          )}

          {/* DISEASE HISTORY */}

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">

            <div className="flex items-center justify-between gap-2">

              <div className="flex items-center gap-2">

                <History className="w-4 h-4 text-emerald-700" />

                <h3 className="font-display font-bold text-sm text-slate-900">
                  Diagnostic History Log
                </h3>

              </div>

              <div className="flex items-center gap-2">

                <span className="text-[11px] font-mono text-slate-400">
                  {history.length} records
                </span>

                <button
                  type="button"
                  onClick={loadDiseaseHistory}
                  disabled={historyLoading}
                  title="Refresh history"
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      historyLoading ? 'animate-spin' : ''
                    }`}
                  />
                </button>

              </div>

            </div>

            {historyLoading ? (

              <div className="py-8 text-center text-xs text-slate-500">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-700" />
                Loading diagnosis history...
              </div>

            ) : history.length === 0 ? (

              <div className="py-8 text-center">

                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />

                <p className="text-xs font-semibold text-slate-600">
                  No diagnosis records yet
                </p>

                <p className="text-[11px] text-slate-400 mt-1">
                  Your MongoDB diagnosis history will appear here.
                </p>

              </div>

            ) : (

              <div className="divide-y divide-slate-100 text-xs">

                {history.map((item) => (

                  <div
                    key={item.id || item.logId}
                    className="py-2.5 flex items-center justify-between gap-3"
                  >

                    <div className="flex items-center gap-2.5 min-w-0">

                      <img
                        src={item.imageUrl || IMAGES.leafDisease}
                        alt={item.diseaseName || 'Plant'}
                        onError={(e) => {
                          e.currentTarget.src = IMAGES.leafDisease;
                        }}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                      />

                      <div className="min-w-0">

                        <p className="font-bold text-slate-900 truncate">
                          {item.diseaseName || item.name || 'Unknown disease'}
                        </p>

                        <p className="text-[11px] text-slate-500">
                          {item.plantId || 'N/A'}
                          {' · '}
                          {item.crop || 'Unknown crop'}
                          {' · '}
                          <span className="font-mono">
                            {item.confidence ?? 0}% conf
                          </span>
                        </p>

                      </div>

                    </div>

                    <div className="flex items-center gap-2 shrink-0">

                      <div className="text-right">

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.status === 'Healthy'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.status || 'Infected'}
                        </span>

                        <p className="text-[10px] text-slate-400 font-mono mt-1">
                          {item.date || ''}
                        </p>

                      </div>

                      <button
                        type="button"
                        onClick={() => handleViewHistory(item)}
                        title="View diagnosis"
                        className="p-2 rounded-lg border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 text-emerald-800"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                    </div>

                  </div>

                ))}

              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
