
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
  Mic,
  Volume2,
  VolumeX,
} from 'lucide-react';

import { diseaseService } from '../services/diseaseService';
import { IMAGES } from '../assets/images';

// ======================================================
// ENGLISH AND KANNADA TRANSLATIONS
// ======================================================

const translations = {
  en: {
    title: 'Plant Disease Intelligence & Pathology',
    subtitle: 'Identify visible plant health problems from photographs and receive disease screening and treatment guidance.',
    upload: 'Upload Leaf or Canopy Photo',
    presets: '1-Click Pathology Presets for Evaluation:',
    crop: 'Host Crop Species',
    diagnose: 'Diagnose Plant Disease',
    analyzing: 'Scanning Pathological Signatures...',
    language: 'Response Language',
    english: 'English',
    kannada: 'ಕನ್ನಡ',
    voice: 'Speak about the plant problem',
    listening: 'Listening...',
    stopListening: 'Stop Listening',
    voiceHint: 'Describe the symptoms using your voice. The description is optional.',
    placeholder: 'Describe the plant problem (optional)',
    healthy: 'DIAGNOSIS: HEALTHY',
    confidence: 'Model confidence',
    observations: 'Visual Observations:',
    noSymptoms: 'No significant visible symptoms reported.',
    recommended: 'Recommended Practice:',
    severity: 'Severity',
    targetCrop: 'Target Crop:',
    affected: 'Affected:',
    pathologyConfidence: 'Pathology Confidence',
    alternative: 'Alternative possibility:',
    symptoms: 'Identified Symptoms & Visual Markers',
    noSymptomsReturned: 'No symptoms were returned.',
    organic: 'Biological & Organic Control Protocol',
    noOrganic: 'No organic recommendations provided.',
    chemical: 'Chemical / Fungicidal Intervention (if needed)',
    noChemical: 'No chemical treatment recommendations provided.',
    prevention: 'Preventative Field Measures:',
    noPrevention: 'No preventive measures provided.',
    history: 'Diagnostic History Log',
    records: 'records',
    loading: 'Loading diagnosis history...',
    noHistory: 'No diagnosis records yet',
    historyHint: 'Your MongoDB diagnosis history will appear here.',
    awaiting: 'Awaiting Specimen',
    awaitingHint: 'Choose a sample diagnostic preset or upload a leaf photo, then click Diagnose Plant Disease to inspect the specimen.',
    read: 'Read diagnosis aloud',
    stopRead: 'Stop reading',
    voiceUnsupported: 'Speech recognition is not supported in this browser. Please use Chrome.',
    voiceError: 'Voice recognition failed. Please try again.',
    micPermission: 'Microphone permission denied. Please allow microphone access.',
    noSpeech: 'No speech detected. Please speak clearly and try again.',
  },

  kn: {
    title: 'ಸಸ್ಯ ರೋಗ ಪತ್ತೆ ಮತ್ತು ವಿಶ್ಲೇಷಣೆ',
    subtitle: 'ಸಸ್ಯದ ಫೋಟೋದಿಂದ ಗೋಚರಿಸುವ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗಳನ್ನು ಗುರುತಿಸಿ ಮತ್ತು ಚಿಕಿತ್ಸೆಯ ಸಲಹೆಗಳನ್ನು ಪಡೆಯಿರಿ.',
    upload: 'ಎಲೆ ಅಥವಾ ಸಸ್ಯದ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    presets: 'ಪರೀಕ್ಷೆಗಾಗಿ ಮಾದರಿ ಚಿತ್ರಗಳು:',
    crop: 'ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ',
    diagnose: 'ಸಸ್ಯದ ರೋಗ ಪತ್ತೆ ಮಾಡಿ',
    analyzing: 'ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...',
    language: 'ಪ್ರತಿಕ್ರಿಯೆಯ ಭಾಷೆ',
    english: 'English',
    kannada: 'ಕನ್ನಡ',
    voice: 'ಸಸ್ಯದ ಸಮಸ್ಯೆಯನ್ನು ಮಾತನಾಡಿ',
    listening: 'ಕೇಳಲಾಗುತ್ತಿದೆ...',
    stopListening: 'ಕೇಳುವುದನ್ನು ನಿಲ್ಲಿಸಿ',
    voiceHint: 'ನಿಮ್ಮ ಧ್ವನಿಯಲ್ಲಿ ಸಸ್ಯದ ಲಕ್ಷಣಗಳನ್ನು ವಿವರಿಸಿ. ಇದು ಐಚ್ಛಿಕವಾಗಿದೆ.',
    placeholder: 'ಸಸ್ಯದ ಸಮಸ್ಯೆಯನ್ನು ವಿವರಿಸಿ (ಐಚ್ಛಿಕ)',
    healthy: 'ರೋಗ ಪತ್ತೆಯಾಗಿಲ್ಲ: ಆರೋಗ್ಯಕರ ಸಸ್ಯ',
    confidence: 'AI ವಿಶ್ವಾಸ ಮಟ್ಟ',
    observations: 'ಗೋಚರಿಸುವ ಲಕ್ಷಣಗಳು:',
    noSymptoms: 'ಗಮನಾರ್ಹ ಲಕ್ಷಣಗಳು ಕಂಡುಬಂದಿಲ್ಲ.',
    recommended: 'ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ರಮ:',
    severity: 'ತೀವ್ರತೆ',
    targetCrop: 'ಬೆಳೆ:',
    affected: 'ಬಾಧಿತ ಭಾಗ:',
    pathologyConfidence: 'AI ವಿಶ್ವಾಸ ಮಟ್ಟ',
    alternative: 'ಪರ್ಯಾಯ ಸಾಧ್ಯತೆ:',
    symptoms: 'ಗುರುತಿಸಲಾದ ಲಕ್ಷಣಗಳು',
    noSymptomsReturned: 'ಯಾವುದೇ ಲಕ್ಷಣಗಳು ಲಭ್ಯವಿಲ್ಲ.',
    organic: 'ಸಾವಯವ ನಿರ್ವಹಣೆ',
    noOrganic: 'ಸಾವಯವ ಸಲಹೆಗಳು ಲಭ್ಯವಿಲ್ಲ.',
    chemical: 'ರಾಸಾಯನಿಕ ಚಿಕಿತ್ಸೆ (ಅಗತ್ಯವಿದ್ದರೆ)',
    noChemical: 'ರಾಸಾಯನಿಕ ಚಿಕಿತ್ಸೆಯ ಸಲಹೆಗಳು ಲಭ್ಯವಿಲ್ಲ.',
    prevention: 'ತಡೆಗಟ್ಟುವ ಕ್ರಮಗಳು:',
    noPrevention: 'ತಡೆಗಟ್ಟುವ ಕ್ರಮಗಳು ಲಭ್ಯವಿಲ್ಲ.',
    history: 'ರೋಗ ಪತ್ತೆ ಇತಿಹಾಸ',
    records: 'ದಾಖಲೆಗಳು',
    loading: 'ಇತಿಹಾಸವನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...',
    noHistory: 'ಇನ್ನೂ ಯಾವುದೇ ದಾಖಲೆಗಳಿಲ್ಲ',
    historyHint: 'MongoDB ಯಲ್ಲಿನ ರೋಗ ಪತ್ತೆ ದಾಖಲೆಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.',
    awaiting: 'ಚಿತ್ರಕ್ಕಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ',
    awaitingHint: 'ಮಾದರಿ ಚಿತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ಎಲೆಯ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
    read: 'ಫಲಿತಾಂಶವನ್ನು ಓದಿ',
    stopRead: 'ಓದುವುದನ್ನು ನಿಲ್ಲಿಸಿ',
    voiceUnsupported: 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಲಭ್ಯವಿಲ್ಲ. Chrome ಬಳಸಿ.',
    voiceError: 'ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ವಿಫಲವಾಗಿದೆ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    micPermission: 'ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಅನುಮತಿ ನೀಡಿ.',
    noSpeech: 'ಧ್ವನಿ ಕೇಳಿಸಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಮಾತನಾಡಿ.',
  },
};

// ======================================================
// COMPONENT
// ======================================================

export default function DiseaseDetection() {
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Holds only the final recognized words.
  const finalTranscriptRef = useRef('');

  // Preserves text that the farmer typed before speaking.
  const initialQueryRef = useRef('');

  const recognitionErrorRef = useRef(false);

  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [previewUrl, setPreviewUrl] = useState(IMAGES.leafDisease);
  const [selectedFile, setSelectedFile] = useState(null);

  const [error, setError] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Language and voice states
  const [language, setLanguage] = useState('en');
  const [farmerQuery, setFarmerQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const t = translations[language];

  // ======================================================
  // SAMPLE DIAGNOSTIC IMAGES
  // ======================================================

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

  // ======================================================
  // SAFE ARRAY HELPER
  // ======================================================

  function safeArray(value) {
    return Array.isArray(value) ? value : [];
  }

  // ======================================================
  // STOP SPEECH RECOGNITION
  // ======================================================

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.log('Recognition already stopped.');
      }
    }

    setIsListening(false);
  };

  // ======================================================
  // STOP TEXT-TO-SPEECH
  // ======================================================

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
  };

  // ======================================================
  // RESET VOICE FEATURES
  // ======================================================

  const resetVoice = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (err) {
        console.log('Recognition already stopped.');
      }

      recognitionRef.current = null;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    finalTranscriptRef.current = '';
    initialQueryRef.current = '';
    recognitionErrorRef.current = false;

    setIsListening(false);
    setIsSpeaking(false);
  };

  // ======================================================
  // FETCH DISEASE HISTORY
  // ======================================================

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

  // ======================================================
  // INITIAL LOAD AND CLEANUP
  // ======================================================

  useEffect(() => {
    loadDiseaseHistory();

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (err) {
          // Ignore cleanup errors.
        }
      }

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // ======================================================
  // START KANNADA / ENGLISH SPEECH RECOGNITION
  // ======================================================

  const startListening = () => {
    if (analyzing) return;

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(t.voiceUnsupported);
      return;
    }

    // Stop any previous recognition session.
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (err) {
        // Ignore previous session errors.
      }

      recognitionRef.current = null;
    }

    // Stop any currently playing speech.
    stopSpeaking();

    const recognition = new SpeechRecognition();

    // Set language based on the selected interface language.
    recognition.lang = language === 'kn' ? 'kn-IN' : 'en-IN';

    // One speech session at a time.
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    // Preserve manually entered text.
    initialQueryRef.current = farmerQuery.trim();

    // Reset the recognized transcript.
    finalTranscriptRef.current = '';
    recognitionErrorRef.current = false;

    setError('');
    setIsListening(true);

    recognitionRef.current = recognition;

    // --------------------------------------------------
    // SPEECH RECOGNITION STARTED
    // --------------------------------------------------

    recognition.onstart = () => {
      console.log('Speech recognition started:', recognition.lang);
      setIsListening(true);
    };

    // --------------------------------------------------
    // SPEECH RESULTS
    // --------------------------------------------------

    recognition.onresult = (event) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.trim();

        if (!transcript) continue;

        if (event.results[i].isFinal) {
          finalTranscriptRef.current += `${transcript} `;
        } else {
          interimTranscript += `${transcript} `;
        }
      }

      const finalText = finalTranscriptRef.current.trim();

      const updatedText = [
        initialQueryRef.current,
        finalText,
        interimTranscript.trim(),
      ]
        .filter(Boolean)
        .join(' ');

      setFarmerQuery(updatedText);

      console.log('Recognized speech:', updatedText);
    };

    // --------------------------------------------------
    // SPEECH RECOGNITION ERROR
    // --------------------------------------------------

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);

      recognitionErrorRef.current = true;
      setIsListening(false);

      if (event.error === 'no-speech') {
        setError(t.noSpeech);
      } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError(t.micPermission);
      } else if (event.error !== 'aborted') {
        setError(t.voiceError);
      }
    };

    // --------------------------------------------------
    // SPEECH RECOGNITION ENDED
    // --------------------------------------------------

    recognition.onend = () => {
      console.log('Speech recognition ended');

      setIsListening(false);

      const finalText = [
        initialQueryRef.current,
        finalTranscriptRef.current.trim(),
      ]
        .filter(Boolean)
        .join(' ')
        .trim();

      if (finalText) {
        setFarmerQuery(finalText);
      }

      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }
    };

    // --------------------------------------------------
    // START MICROPHONE
    // --------------------------------------------------

    try {
      recognition.start();
    } catch (err) {
      console.error('Microphone start error:', err);

      recognitionRef.current = null;
      setIsListening(false);
      setError('Unable to start microphone. Please try again.');
    }
  };

  // ======================================================
  // TEXT-TO-SPEECH: READ DIAGNOSIS
  // ======================================================

  const speakResult = () => {
    if (!result) return;

    if (!('speechSynthesis' in window)) {
      setError('Text-to-speech is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();

    const textToSpeak = [
      result.name || result.diseaseName,
      `${t.severity}: ${result.severity || 'Unknown'}`,
      `${t.confidence}: ${result.confidence ?? 0}%`,
      result.alternativeDiagnosis,
      ...safeArray(result.symptoms),
      ...safeArray(result.organicManagement),
      ...safeArray(result.chemicalTreatment),
      ...safeArray(result.preventiveMeasures),
    ]
      .filter(Boolean)
      .join('. ');

    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    utterance.lang = language === 'kn' ? 'kn-IN' : 'en-IN';
    utterance.rate = 0.9;
    utterance.pitch = 1;

    // Select a matching installed voice if available.
    const voices = window.speechSynthesis.getVoices();

    const preferredVoice = voices.find((voice) =>
      voice.lang.toLowerCase().startsWith(language === 'kn' ? 'kn' : 'en-in')
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setError('Unable to read the diagnosis aloud.');
    };

    window.speechSynthesis.speak(utterance);
  };

  // ======================================================
  // SELECT SAMPLE IMAGE
  // ======================================================

  const handleSelectSample = (sample) => {
    resetVoice();

    setSelectedCrop(sample.crop);
    setPreviewUrl(sample.image);
    setSelectedFile(null);

    setResult(null);
    setFarmerQuery('');
    setError('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ======================================================
  // UPLOAD IMAGE
  // ======================================================

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Please select a JPG, PNG or WEBP image.');
      e.target.value = '';
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('Image size must be less than 8 MB.');
      e.target.value = '';
      return;
    }

    resetVoice();

    setSelectedFile(file);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    setResult(null);
    setFarmerQuery('');
    setError('');

    e.target.value = '';
  };

  // ======================================================
  // DETECT DISEASE
  // ======================================================

  const handleDetect = async () => {
    if (!previewUrl) {
      setError('Please select or upload a plant image.');
      return;
    }

    if (isListening) {
      stopListening();
    }

    stopSpeaking();

    setAnalyzing(true);
    setResult(null);
    setError('');

    try {
      const response = await diseaseService.detectDisease({
        imageFile: selectedFile,
        imageUrl: previewUrl,
        cropType: selectedCrop,
        language,
        farmerQuery: farmerQuery.trim(),
      });

      if (!response) {
        throw new Error('The disease detection API returned an empty response.');
      }

      setResult({
        ...response,
        language,
      });

      await loadDiseaseHistory();

    } catch (err) {
      console.error('Disease detection error:', err);

      setError(
        err.response?.data?.message ||
        err.message ||
        'Unable to analyze the plant image.'
      );

    } finally {
      setAnalyzing(false);
    }
  };

  // ======================================================
  // VIEW EXISTING HISTORY RECORD
  // ======================================================

  const handleViewHistory = (item) => {
    resetVoice();

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
      language,
    });

    setSelectedCrop(item.crop || 'Tomato');
    setPreviewUrl(item.imageUrl || IMAGES.leafDisease);
    setSelectedFile(null);

    setFarmerQuery('');
    setError('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // ======================================================
  // CHANGE RESPONSE LANGUAGE
  // ======================================================

  const handleLanguageChange = (newLanguage) => {
    if (newLanguage === language) return;

    resetVoice();
    setLanguage(newLanguage);
    setError('');
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>
        <span className="text-xs font-semibold text-emerald-800 tracking-wide uppercase">
          Diagnostic Pathology Engine
        </span>

        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
          {t.title}
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
          {t.subtitle}
        </p>
      </div>

      {/* LANGUAGE SELECTOR */}

      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

        <div>
          <p className="text-xs font-bold text-slate-800">
            {t.language}
          </p>

          <p className="text-[11px] text-slate-500">
            Choose the language for the AI diagnosis and voice response.
          </p>
        </div>

        <div className="flex gap-2">

          <button
            type="button"
            onClick={() => handleLanguageChange('en')}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
              language === 'en'
                ? 'bg-[#123B2A] text-white border-[#123B2A]'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            {t.english}
          </button>

          <button
            type="button"
            onClick={() => handleLanguageChange('kn')}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
              language === 'kn'
                ? 'bg-[#123B2A] text-white border-[#123B2A]'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            {t.kannada}
          </button>

        </div>
      </div>

      {/* MAIN GRID */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ==================================================
            LEFT COLUMN: IMAGE UPLOAD
        ================================================== */}

        <div className="lg:col-span-5 space-y-4">

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">

            <h3 className="font-display font-bold text-sm text-slate-900">
              {t.upload}
            </h3>

            {/* SAMPLE IMAGES */}

            <div>
              <p className="text-[11px] font-semibold text-slate-500 mb-2">
                {t.presets}
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
                      {t.upload}
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
                {t.crop}
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

            {/* ==================================================
                FARMER VOICE INPUT
            ================================================== */}

            <div className="space-y-2">

              <label className="block text-[11px] font-semibold text-slate-700">
                {t.voice}
              </label>

              <div className="flex gap-2">

                <textarea
                  value={farmerQuery}
                  onChange={(e) => setFarmerQuery(e.target.value)}
                  rows={3}
                  placeholder={t.placeholder}
                  disabled={analyzing || isListening}
                  className="flex-1 min-w-0 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 resize-y disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={
                    isListening
                      ? stopListening
                      : startListening
                  }
                  disabled={analyzing}
                  title={isListening ? t.stopListening : t.voice}
                  className={`self-start p-3 rounded-xl transition disabled:opacity-50 ${
                    isListening
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-[#123B2A] text-white hover:bg-emerald-700'
                  }`}
                >
                  <Mic className="w-5 h-5" />
                </button>

              </div>

              <p className="text-[10px] text-slate-400">
                {isListening ? t.listening : t.voiceHint}
              </p>

              {isListening && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-[11px] text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  {language === 'kn'
                    ? 'ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ಕನ್ನಡದಲ್ಲಿ ವಿವರಿಸಿ...'
                    : 'Speak clearly to describe the plant symptoms...'}
                </div>
              )}

              {farmerQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setFarmerQuery('');
                    finalTranscriptRef.current = '';
                    initialQueryRef.current = '';
                  }}
                  disabled={isListening || analyzing}
                  className="text-[10px] text-red-600 hover:underline disabled:opacity-50"
                >
                  {language === 'kn' ? 'ವಿವರಣೆಯನ್ನು ಅಳಿಸಿ' : 'Clear voice description'}
                </button>
              )}

            </div>

            {/* DETECT BUTTON */}

            <button
              type="button"
              onClick={handleDetect}
              disabled={analyzing || isListening}
              className="w-full py-3 px-4 bg-[#123B2A] hover:bg-[#16A36A] active:scale-[0.99] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#B7E46A]" />
                  <span>{t.analyzing}</span>
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4 text-[#B7E46A]" />
                  <span>{t.diagnose}</span>
                </>
              )}
            </button>

            {/* ERROR MESSAGE */}

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {error}
              </div>
            )}

          </div>
        </div>

        {/* ==================================================
            RIGHT COLUMN: RESULTS AND HISTORY
        ================================================== */}

        <div className="lg:col-span-7 space-y-4">

          {/* DIAGNOSIS RESULT */}

          {result ? (

            <div className="space-y-4 animate-fade-in">

              {/* VOICE OUTPUT BUTTON */}

              <div className="flex justify-end">

                <button
                  type="button"
                  onClick={isSpeaking ? stopSpeaking : speakResult}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#123B2A] text-white text-xs font-semibold hover:bg-emerald-700"
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-4 h-4" />
                      {t.stopRead}
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      {t.read}
                    </>
                  )}
                </button>

              </div>

              {/* HEALTHY RESULT */}

              {result.isHealthy ? (

                <div className="bg-white p-6 rounded-2xl border-2 border-emerald-500 shadow-sm space-y-4">

                  <div className="flex items-start gap-4">

                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-7 h-7" />
                    </div>

                    <div className="flex-1">

                      <span className="text-[11px] font-bold font-mono text-emerald-800">
                        {t.healthy}
                      </span>

                      <h3 className="text-xl font-bold font-display text-slate-900 tracking-tight">
                        {result.name || 'No Visible Disease Detected'}
                      </h3>

                      <p className="text-xs text-slate-500 mt-0.5">
                        {t.confidence}:{' '}
                        <strong className="font-mono text-emerald-700">
                          {result.confidence}%
                        </strong>
                      </p>

                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-1.5">

                    <p className="font-semibold text-emerald-950">
                      {t.observations}
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
                        {t.noSymptoms}
                      </p>
                    )}

                  </div>

                  {safeArray(result.organicManagement).length > 0 && (
                    <div className="text-xs text-slate-600">
                      <strong>{t.recommended}</strong>{' '}
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
                          {result.severity || 'Unknown'} {t.severity}
                        </span>

                        <span className="text-[11px] text-slate-400 font-mono">
                          {result.pathogenType || 'Pathogen not specified'}
                        </span>

                      </div>

                      <h3 className="text-xl font-bold font-display text-slate-900 tracking-tight mt-1">
                        {result.name || result.diseaseName || 'Disease detected'}
                      </h3>

                      <p className="text-xs text-slate-500">
                        {t.targetCrop} {result.crop || selectedCrop}
                        {' · '}
                        {t.affected} {result.affectedParts || 'Not specified'}
                      </p>

                    </div>

                    <div className="text-right flex sm:flex-col items-center sm:items-end justify-between">

                      <span className="text-2xl font-bold font-display text-red-700 font-mono tabular-nums">
                        {result.confidence ?? 0}%
                      </span>

                      <span className="text-[11px] text-slate-400">
                        {t.pathologyConfidence}
                      </span>

                    </div>
                  </div>

                  {/* ALTERNATIVE DIAGNOSIS */}

                  {result.alternativeDiagnosis && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                      <strong>{t.alternative}</strong>{' '}
                      {result.alternativeDiagnosis}
                    </div>
                  )}

                  {/* SYMPTOMS */}

                  <div className="space-y-2">

                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {t.symptoms}
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
                        {t.noSymptomsReturned}
                      </p>
                    )}

                  </div>

                  {/* ORGANIC MANAGEMENT */}

                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2 text-xs">

                    <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-700" />
                      <span>{t.organic}</span>
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
                        {t.noOrganic}
                      </p>
                    )}

                  </div>

                  {/* CHEMICAL TREATMENT */}

                  <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2 text-xs">

                    <h4 className="font-bold text-amber-950 flex items-center gap-1.5">
                      <Pill className="w-4 h-4 text-amber-700" />
                      <span>{t.chemical}</span>
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
                        {t.noChemical}
                      </p>
                    )}

                  </div>

                  {/* PREVENTION */}

                  <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">

                    <p className="font-semibold text-slate-800">
                      {t.prevention}
                    </p>

                    <p>
                      {safeArray(result.preventiveMeasures).length > 0
                        ? result.preventiveMeasures.join(' · ')
                        : t.noPrevention}
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
                {t.awaiting}
              </h3>

              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                {t.awaitingHint}
              </p>

            </div>
          )}

          {/* ==================================================
              DISEASE HISTORY
          ================================================== */}

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">

            <div className="flex items-center justify-between gap-2">

              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-700" />

                <h3 className="font-display font-bold text-sm text-slate-900">
                  {t.history}
                </h3>
              </div>

              <div className="flex items-center gap-2">

                <span className="text-[11px] font-mono text-slate-400">
                  {history.length} {t.records}
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
                {t.loading}
              </div>

            ) : history.length === 0 ? (

              <div className="py-8 text-center">

                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />

                <p className="text-xs font-semibold text-slate-600">
                  {t.noHistory}
                </p>

                <p className="text-[11px] text-slate-400 mt-1">
                  {t.historyHint}
                </p>

              </div>

            ) : (

              <div className="divide-y divide-slate-100 text-xs">

                {history.map((item, index) => (

                  <div
                    key={item.id || item.logId || item._id || index}
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
