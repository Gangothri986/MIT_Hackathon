
import React, { useState, useRef, useEffect } from 'react';

import {
  UploadCloud,
  Camera,
  ScanEye,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Languages,
} from 'lucide-react';

import {
  predictionService,
  GROWTH_STAGES,
} from '../services/plantService';

import { usePlant } from '../context/PlantContext';
import { IMAGES } from '../assets/images';

export default function PlantAnalysis() {
  const { addPlant } = usePlant();

  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const shouldSubmitVoiceRef = useRef(false);

  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [selectedLocation, setSelectedLocation] = useState(
    'North Greenhouse - Bed 2'
  );

  const [previewUrl, setPreviewUrl] = useState(IMAGES.tomatoFlowering);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [result, setResult] = useState(null);
  const [simulatedCamera, setSimulatedCamera] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Response language
  const [language, setLanguage] = useState('en');

  // Farmer assistant
  const [farmerQuestion, setFarmerQuestion] = useState('');
  const [assistantAnswer, setAssistantAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState('');

  const isKannada = language === 'kn';

  const t = {
    assistantTitle: isKannada
      ? 'ರೈತರ ಧ್ವನಿ ಸಹಾಯಕ'
      : 'Farmer Voice Assistant',

    assistantDescription: isKannada
      ? 'ನಿಮ್ಮ ಬೆಳೆ ಮತ್ತು ಅದರ ಬೆಳವಣಿಗೆಯ ಹಂತದ ಬಗ್ಗೆ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ.'
      : 'Ask questions about your crop and its growth stage.',

    questionPlaceholder: isKannada
      ? 'ನಿಮ್ಮ ಕೃಷಿ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಬರೆಯಿರಿ ಅಥವಾ ಮೈಕ್ರೊಫೋನ್ ಬಳಸಿ ಮಾತನಾಡಿ...'
      : 'Type your farming question here or use the microphone...',

    askByVoice: isKannada ? 'ಮಾತನಾಡಿ' : 'Ask by Voice',

    stopListening: isKannada
      ? 'ಆಲಿಸುವುದನ್ನು ನಿಲ್ಲಿಸಿ'
      : 'Stop Listening',

    getAnswer: isKannada ? 'ಉತ್ತರ ಪಡೆಯಿರಿ' : 'Ask Gemini',

    gettingAnswer: isKannada
      ? 'ಉತ್ತರ ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ...'
      : 'Getting Answer...',

    listening: isKannada
      ? 'ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಕನ್ನಡದಲ್ಲಿ ಹೇಳಿ...'
      : 'Speak your question in English...',

    answerTitle: isKannada
      ? 'ಕೃಷಿ ಸಹಾಯಕನ ಉತ್ತರ'
      : 'AI Assistant Answer',

    speaking: isKannada
      ? 'ಉತ್ತರವನ್ನು ಧ್ವನಿಯಲ್ಲಿ ಓದಲಾಗುತ್ತಿದೆ...'
      : 'Reading the answer aloud...',

    unsupported: isKannada
      ? 'ನಿಮ್ಮ ಬ್ರೌಸರ್ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆಯನ್ನು ಬೆಂಬಲಿಸುವುದಿಲ್ಲ. Google Chrome ಬಳಸಿ.'
      : 'Voice recognition is not supported. Please use Google Chrome.',

    permissionDenied: isKannada
      ? 'ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ಅನುಮತಿ ನೀಡಿ.'
      : 'Microphone permission denied. Please allow microphone access.',

    noSpeech: isKannada
      ? 'ನಿಮ್ಮ ಧ್ವನಿ ಕೇಳಿಸಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.'
      : 'No speech detected. Please speak and try again.',

    voiceError: isKannada
      ? 'ಧ್ವನಿಯನ್ನು ಗುರುತಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.'
      : 'Unable to recognize your voice. Please try again.',

    answerError: isKannada
      ? 'ಪ್ರಶ್ನೆಗೆ ಉತ್ತರಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.'
      : 'Unable to answer your question. Please try again.',

    uploadFirst: isKannada
      ? 'ದಯವಿಟ್ಟು ಮೊದಲು ಸಸ್ಯದ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.'
      : 'Please upload or select a plant image first.',

    analyzingImage: isKannada
      ? 'ನಿಮ್ಮ ಸಸ್ಯದ ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...'
      : 'First, analysing your plant image...',
  };

  const SAMPLE_PRESETS = [
    {
      label: 'Tomato',
      crop: 'Tomato',
      image: IMAGES.tomatoFlowering,
    },
    {
      label: 'Chilli',
      crop: 'Chilli',
      image: IMAGES.chilliVegetative,
    },
    {
      label: 'Paddy',
      crop: 'Paddy',
      image: IMAGES.paddyField,
    },
    {
      label: 'Tomato Leaf',
      crop: 'Tomato',
      image: IMAGES.leafDisease,
    },
  ];

  // ======================================================
  // STOP LISTENING
  // ======================================================

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        // Allow onend to submit the final spoken question.
        shouldSubmitVoiceRef.current = true;
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Recognition stop error:', error);
      }
    }

    setIsListening(false);
  };

  // ======================================================
  // STOP SPEAKING
  // ======================================================

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
  };

  // ======================================================
  // RESET ASSISTANT
  // ======================================================

  const resetAssistant = () => {
    shouldSubmitVoiceRef.current = false;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (error) {
        console.error(error);
      }

      recognitionRef.current = null;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    finalTranscriptRef.current = '';

    setFarmerQuestion('');
    setAssistantAnswer('');
    setIsListening(false);
    setIsSpeaking(false);
    setIsAsking(false);
    setVoiceError('');
  };

  // ======================================================
  // CHANGE LANGUAGE
  // ======================================================

  const handleLanguageChange = (newLanguage) => {
    if (language === newLanguage) return;

    resetAssistant();
    setLanguage(newLanguage);
  };

  // ======================================================
  // CLEANUP
  // ======================================================

  useEffect(() => {
    return () => {
      shouldSubmitVoiceRef.current = false;

      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (error) {
          console.error(error);
        }
      }

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // ======================================================
  // IMAGE UPLOAD
  // ======================================================

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image.');
      e.target.value = '';
      return;
    }

    resetAssistant();

    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    const url = URL.createObjectURL(file);

    setPreviewUrl(url);
    setSelectedFile(file);
    setResult(null);
    setIsSaved(false);

    e.target.value = '';
  };

  // ======================================================
  // SAMPLE PRESET SELECTION
  // ======================================================

  const handleSelectPreset = async (preset) => {
    try {
      const imageResponse = await fetch(preset.image);

      if (!imageResponse.ok) {
        throw new Error('Could not load the sample image.');
      }

      const blob = await imageResponse.blob();
      const extension = blob.type.split('/')[1] || 'jpg';

      const imageFile = new File(
        [blob],
        `${preset.crop.toLowerCase()}-sample.${extension}`,
        {
          type: blob.type || 'image/jpeg',
        }
      );

      resetAssistant();

      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }

      setSelectedCrop(preset.crop);
      setSelectedFile(imageFile);
      setPreviewUrl(preset.image);
      setResult(null);
      setIsSaved(false);
    } catch (error) {
      console.error('Preset loading error:', error);

      alert(
        'Could not load this sample image. Please upload an image manually.'
      );
    }
  };

  // ======================================================
  // SHARED GEMINI GROWTH ANALYSIS
  // Used by BOTH Analyse Plant and Voice/Text Ask
  // ======================================================

  const performGrowthAnalysis = async () => {
    if (!selectedFile) {
      throw new Error(t.uploadFirst);
    }

    setAnalyzing(true);
    setAnalysisStep(1);
    setResult(null);
    setIsSaved(false);

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      setAnalysisStep(2);

      const response = await predictionService.analyzeGrowthStage({
        imageFile: selectedFile,
        cropType: selectedCrop,
        location: selectedLocation,
      });

      setAnalysisStep(3);

      if (!response || response.success === false) {
        throw new Error(
          response?.message || 'Gemini could not analyse this image.'
        );
      }

      if (
        !response.currentStage ||
        !response.stageProgression?.length
      ) {
        throw new Error(
          'The API returned an incomplete growth-stage prediction.'
        );
      }

      setResult(response);

      return response;
    } finally {
      setAnalyzing(false);
      setAnalysisStep(0);
    }
  };

  // ======================================================
  // MANUAL ANALYSIS BUTTON
  // ======================================================

  const handleAnalyze = async () => {
    if (!selectedFile) {
      alert(t.uploadFirst);
      return;
    }

    if (analyzing || isAsking) return;

    resetAssistant();

    try {
      await performGrowthAnalysis();
    } catch (error) {
      console.error('Plant analysis error:', error);

      alert(
        error.response?.data?.message ||
        error.message ||
        'Plant analysis failed. Please check the backend and Gemini API key.'
      );
    }
  };

  // ======================================================
  // TEXT TO SPEECH
  // ======================================================

  const speakAnswer = (text) => {
    if (!('speechSynthesis' in window)) {
      setVoiceError('Voice output is not supported in this browser.');
      return;
    }

    if (!text?.trim()) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = isKannada ? 'kn-IN' : 'en-IN';
    utterance.rate = 0.9;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();

    const preferredVoice = voices.find((voice) =>
      voice.lang.toLowerCase().startsWith(
        isKannada ? 'kn' : 'en-in'
      )
    ) || voices.find((voice) =>
      voice.lang.toLowerCase().startsWith(
        isKannada ? 'kn' : 'en'
      )
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // ======================================================
  // ASK GEMINI
  // Automatically analyses image if no result exists.
  // ======================================================

  const handleAskGrowthQuestion = async (
    question,
    speakResponse = false
  ) => {
    if (!question?.trim()) {
      setVoiceError(
        isKannada
          ? 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ನಮೂದಿಸಿ.'
          : 'Please enter your question.'
      );
      return;
    }

    if (!selectedFile) {
      setVoiceError(t.uploadFirst);
      return;
    }

    if (analyzing || isAsking) return;

    try {
      setIsAsking(true);
      setAssistantAnswer('');
      setVoiceError('');

      stopSpeaking();

      let plantResult = result;

      // IMPORTANT:
      // If the farmer has not clicked Analyse Plant,
      // automatically analyse the selected image first.

      if (!plantResult) {
        setVoiceError('');
        plantResult = await performGrowthAnalysis();
      }

      if (!plantResult?.currentStage) {
        throw new Error('Growth-stage analysis was unsuccessful.');
      }

      // Now ask Gemini using the actual analysis result.

      const response = await predictionService.askGrowthQuestion({
        question: question.trim(),
        language,

        plantContext: {
          cropType: plantResult.cropType || selectedCrop,
          currentStage: plantResult.currentStage,
          confidence: plantResult.confidence,

          visualCharacteristics:
            plantResult.visualCharacteristics || [],

          recommendations:
            plantResult.recommendations || [],

          nextStage: plantResult.nextStage,
          uncertainty: plantResult.uncertainty,
          isReliable: plantResult.isReliable,
        },
      });

      if (!response?.answer) {
        throw new Error('Gemini returned an empty answer.');
      }

      setAssistantAnswer(response.answer);

      if (speakResponse) {
        speakAnswer(response.answer);
      }
    } catch (error) {
      console.error('Farmer assistant error:', error);

      setVoiceError(
        error.response?.data?.message ||
        error.message ||
        t.answerError
      );
    } finally {
      setIsAsking(false);
    }
  };

  // ======================================================
  // SPEECH TO TEXT
  // ======================================================

  const startListening = () => {
    if (!selectedFile) {
      setVoiceError(t.uploadFirst);
      return;
    }

    if (analyzing || isAsking) return;

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError(t.unsupported);
      return;
    }

    if (recognitionRef.current) {
      shouldSubmitVoiceRef.current = false;

      try {
        recognitionRef.current.abort();
      } catch (error) {
        console.error(error);
      }

      recognitionRef.current = null;
    }

    stopSpeaking();

    setVoiceError('');
    setAssistantAnswer('');
    setFarmerQuestion('');

    finalTranscriptRef.current = '';
    shouldSubmitVoiceRef.current = true;

    const recognition = new SpeechRecognition();

    recognition.lang = isKannada ? 'kn-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let finalText = finalTranscriptRef.current;
      let interimText = '';

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        const transcript =
          event.results[i][0]?.transcript?.trim();

        if (!transcript) continue;

        if (event.results[i].isFinal) {
          finalText = `${finalText} ${transcript}`.trim();
        } else {
          interimText = `${interimText} ${transcript}`.trim();
        }
      }

      finalTranscriptRef.current = finalText;

      setFarmerQuestion(
        `${finalText} ${interimText}`.trim()
      );

      setVoiceError('');
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);

      setIsListening(false);

      if (
        event.error === 'not-allowed' ||
        event.error === 'service-not-allowed'
      ) {
        shouldSubmitVoiceRef.current = false;
        setVoiceError(t.permissionDenied);
      } else if (event.error === 'no-speech') {
        shouldSubmitVoiceRef.current = false;
        setVoiceError(t.noSpeech);
      } else if (event.error !== 'aborted') {
        shouldSubmitVoiceRef.current = false;
        setVoiceError(t.voiceError);
      }
    };

    recognition.onend = () => {
      setIsListening(false);

      const spokenQuestion =
        finalTranscriptRef.current.trim();

      const shouldSubmit = shouldSubmitVoiceRef.current;

      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }

      shouldSubmitVoiceRef.current = false;

      setFarmerQuestion(spokenQuestion);

      if (spokenQuestion && shouldSubmit) {
        handleAskGrowthQuestion(spokenQuestion, true);
      } else if (!spokenQuestion && shouldSubmit) {
        setVoiceError(t.noSpeech);
      }
    };

    try {
      recognition.start();
    } catch (error) {
      console.error('Could not start microphone:', error);

      recognitionRef.current = null;
      shouldSubmitVoiceRef.current = false;
      setIsListening(false);
      setVoiceError(t.voiceError);
    }
  };

  // ======================================================
  // SAVE PLANT TO FARM
  // ======================================================

  const handleSaveToFarm = async () => {
    if (!result || isSaved) return;

    if (!result.imageUrl) {
      alert('Image URL is missing. Please analyse the image again.');
      return;
    }

    try {
      const plantData = {
        name: `${result.cropType || selectedCrop} Field Specimen`,
        cropType: result.cropType || selectedCrop,
        variety: 'Commercial Variety',
        location: result.location || selectedLocation,

        plantedDate: new Date(
          Date.now() - 48 * 60 * 60 * 1000
        ).toISOString().split('T')[0],

        currentStage: result.currentStage,
        stageIndex: Number(result.stageIndex),
        confidence: Number(result.confidence),
        imageUrl: result.imageUrl,

        lastAnalysedDate: new Date()
          .toISOString()
          .split('T')[0],

        history: [
          {
            date: new Date().toISOString().split('T')[0],
            stage: result.currentStage,
            healthScore: 90,
            imageUrl: result.imageUrl,
            note: `AI growth-stage prediction with ${result.confidence}% confidence.`,
          },
        ],
      };

      const savedPlant = await addPlant(plantData);

      if (!savedPlant) {
        throw new Error('Plant could not be saved.');
      }

      setIsSaved(true);
      alert('Plant successfully saved to My Plants!');
    } catch (error) {
      console.error('Save plant error:', error);

      alert(
        error.response?.data?.message ||
        error.message ||
        'Unable to save plant. Please try again.'
      );
    }
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}

      <div>
        <span className="text-xs font-semibold text-emerald-800 tracking-wide uppercase">
          Computer Vision Phenology Model
        </span>

        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
          AI Plant Growth Stage Detection
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
          Upload or capture plant imagery to identify its current
          growth stage, measure GDD accumulation, and forecast
          floral and maturity milestones.
        </p>
      </div>

      {/* RESPONSE LANGUAGE */}

      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

        <div>
          <h3 className="text-xs font-semibold text-slate-900">
            Response Language
          </h3>

          <p className="text-[10px] text-slate-500 mt-0.5">
            Choose the language for AI answers and voice responses.
          </p>
        </div>

        <div className="flex items-center gap-2">

          <button
            type="button"
            onClick={() => handleLanguageChange('en')}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              language === 'en'
                ? 'bg-[#123B2A] text-white border-[#123B2A]'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-600'
            }`}
          >
            English
          </button>

          <button
            type="button"
            onClick={() => handleLanguageChange('kn')}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              language === 'kn'
                ? 'bg-[#123B2A] text-white border-[#123B2A]'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-600'
            }`}
          >
            ಕನ್ನಡ
          </button>

        </div>
      </div>

      {/* MAIN WORKSPACE */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN */}

        <div className="lg:col-span-5 space-y-4">

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">

            <h3 className="font-display font-bold text-sm text-slate-900">
              Upload or Select Specimen Image
            </h3>

            {/* SAMPLE PRESETS */}

            <div>
              <p className="text-[11px] font-semibold text-slate-500 mb-2">
                1-Click Test Presets for Judges:
              </p>

              <div className="grid grid-cols-2 gap-2">
                {SAMPLE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    disabled={analyzing || isAsking}
                    className={`text-left p-2 rounded-xl border text-[11px] font-medium transition-all disabled:opacity-50 ${
                      previewUrl === preset.image
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
                    }`}
                  >
                    <span className="line-clamp-1">
                      {preset.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* IMAGE UPLOAD */}

            <div
              onClick={() => {
                if (!analyzing && !isAsking) {
                  fileInputRef.current?.click();
                }
              }}
              className="relative aspect-4/3 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-600 bg-slate-50/50 hover:bg-emerald-50/20 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center text-center p-4 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={analyzing || isAsking}
              />

              {previewUrl ? (
                <div className="relative w-full h-full">
                  <img
                    src={previewUrl}
                    alt="Plant Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />

                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 rounded-lg">
                    <RefreshCw className="w-4 h-4" />
                    <span>Change Image</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                    <UploadCloud className="w-6 h-6" />
                  </div>

                  <p className="text-xs font-bold text-slate-800">
                    Drag & drop plant photo
                  </p>
                </div>
              )}
            </div>

            {/* CAMERA */}

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setSimulatedCamera(!simulatedCamera)}
                disabled={analyzing || isAsking}
                className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-700 font-medium disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />

                {simulatedCamera
                  ? 'Close Camera View'
                  : 'Use Live Camera'}
              </button>

              <span className="text-[10px] text-slate-400 font-mono">
                1080p Crop Sensor
              </span>
            </div>

            {simulatedCamera && (
              <div className="p-3 bg-[#0B241B] rounded-xl text-white text-xs space-y-2">

                <div className="flex items-center justify-between text-[11px] text-emerald-300">
                  <span>Field Camera Simulation Active</span>
                  <span>Sensor: OV5640</span>
                </div>

                <div className="h-32 bg-slate-900 rounded-lg overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Camera view"
                    className="w-full h-full object-cover opacity-80"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSimulatedCamera(false);
                    fileInputRef.current?.click();
                  }}
                  className="w-full py-1.5 bg-[#16A36A] text-white text-xs font-semibold rounded-lg"
                >
                  Select Image for Analysis
                </button>

              </div>
            )}

            {/* CROP AND LOCATION */}

            <div className="grid grid-cols-2 gap-3 pt-2">

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Crop Type
                </label>

                <select
                  value={selectedCrop}
                  onChange={(e) => {
                    setSelectedCrop(e.target.value);
                    setResult(null);
                    setIsSaved(false);
                    resetAssistant();
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  disabled={analyzing || isAsking}
                >
                  <option value="Tomato">Tomato</option>
                  <option value="Chilli">Chilli</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Paddy">Paddy / Rice</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Field / Plot
                </label>

                <select
                  value={selectedLocation}
                  onChange={(e) => {
                    setSelectedLocation(e.target.value);
                    setResult(null);
                    setIsSaved(false);
                    resetAssistant();
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  disabled={analyzing || isAsking}
                >
                  <option value="North Greenhouse - Bed 2">
                    North Greenhouse - Bed 2
                  </option>
                  <option value="South Open Bed 1">
                    South Open Bed 1
                  </option>
                  <option value="Lowland Canal Plot">
                    Lowland Canal Plot
                  </option>
                  <option value="West Plot Open Field">
                    West Plot Open Field
                  </option>
                </select>
              </div>

            </div>

            {/* MANUAL ANALYSE BUTTON */}

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!selectedFile || analyzing || isAsking}
              className="w-full py-3 px-4 bg-[#123B2A] hover:bg-[#16A36A] disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Processing Deep Learning Pipeline...
                </>
              ) : (
                <>
                  <ScanEye className="w-4 h-4" />
                  Analyse Plant Growth Stage
                </>
              )}
            </button>

            {/* ANALYSIS PROGRESS */}

            {analyzing && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs">

                <div className="flex items-center justify-between text-emerald-900 font-semibold">
                  <span>Deep Learning Pipeline Progress</span>
                  <span>Step {analysisStep} of 3</span>
                </div>

                <div className="w-full h-1.5 bg-emerald-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-700 transition-all"
                    style={{
                      width: `${(analysisStep / 3) * 100}%`,
                    }}
                  />
                </div>

                <p className="text-[10px] text-emerald-800">
                  {analysisStep === 1 &&
                    'Preparing plant image...'}

                  {analysisStep === 2 &&
                    'Examining plant structure, leaves, flowers and fruits...'}

                  {analysisStep === 3 &&
                    'Identifying growth stage and calculating milestones...'}
                </p>

              </div>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN */}

        <div className="lg:col-span-7 space-y-4">

          {/* FARMER VOICE ASSISTANT - ALWAYS VISIBLE */}

          <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm space-y-3">

            <div>
              <h4 className="text-sm font-bold text-slate-900">
                <Languages className="w-4 h-4 inline mr-1 text-emerald-700" />
                {t.assistantTitle}
              </h4>

              <p className="text-xs text-slate-500 mt-1">
                {t.assistantDescription}
              </p>
            </div>

            {/* QUESTION INPUT */}

            <textarea
              value={farmerQuestion}
              onChange={(e) => {
                setFarmerQuestion(e.target.value);
                finalTranscriptRef.current = e.target.value;
              }}
              placeholder={t.questionPlaceholder}
              rows={3}
              disabled={isListening || isAsking || analyzing}
              className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 resize-none disabled:bg-slate-50"
            />

            {/* ASSISTANT ACTIONS */}

            <div className="flex flex-wrap gap-2">

              <button
                type="button"
                onClick={
                  isListening
                    ? stopListening
                    : startListening
                }
                disabled={!selectedFile || isAsking || analyzing}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-40 ${
                  isListening
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-[#123B2A] hover:bg-[#16A36A] text-white'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}

                {isListening
                  ? t.stopListening
                  : t.askByVoice}
              </button>

              <button
                type="button"
                onClick={() =>
                  handleAskGrowthQuestion(
                    farmerQuestion,
                    true
                  )
                }
                disabled={
                  !selectedFile ||
                  !farmerQuestion.trim() ||
                  isAsking ||
                  isListening ||
                  analyzing
                }
                className="px-4 py-2.5 rounded-xl bg-emerald-100 text-emerald-900 hover:bg-emerald-200 disabled:opacity-40 text-xs font-bold"
              >
                {isAsking ? (
                  <>
                    <RefreshCw className="w-3 h-3 inline mr-1 animate-spin" />
                    {t.gettingAnswer}
                  </>
                ) : (
                  t.getAnswer
                )}
              </button>

              {isSpeaking && (
                <button
                  type="button"
                  onClick={stopSpeaking}
                  className="px-4 py-2.5 rounded-xl bg-red-100 text-red-700 text-xs font-bold flex items-center gap-2"
                >
                  <VolumeX className="w-4 h-4" />
                  Stop Speaking
                </button>
              )}

            </div>

            {/* IMAGE REQUIREMENT */}

            {!selectedFile && (
              <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-2">
                Upload or select a plant image to enable voice and text questions.
              </p>
            )}

            {/* AUTOMATIC ANALYSIS STATUS */}

            {isAsking && analyzing && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                {t.analyzingImage}
              </div>
            )}

            {/* LISTENING STATUS */}

            {isListening && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                {t.listening}
              </div>
            )}

            {/* VOICE ERROR */}

            {voiceError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {voiceError}
              </div>
            )}

            {/* ANSWER LOADING */}

            {isAsking && !analyzing && (
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" />
                {t.gettingAnswer}
              </div>
            )}

            {/* AI ANSWER */}

            {assistantAnswer && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">

                <div className="flex items-center justify-between gap-2">
                  <h5 className="text-xs font-bold text-emerald-900">
                    {t.answerTitle}
                  </h5>

                  <span className="text-[10px] text-emerald-700">
                    {isKannada ? 'ಕನ್ನಡ' : 'English'}
                  </span>
                </div>

                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {assistantAnswer}
                </p>

                {isSpeaking && (
                  <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5" />
                    {t.speaking}
                  </p>
                )}

              </div>
            )}

            <p className="text-[10px] text-slate-400">
              Voice recognition requires microphone permission and browser support.
              Kannada speech output depends on whether a Kannada voice is available
              on your device.
            </p>

          </div>

          {/* GROWTH ANALYSIS RESULT */}

          {result ? (

            <div className="space-y-4 animate-fade-in">

              <div className="bg-white p-6 rounded-2xl border-2 border-emerald-600/30 shadow-sm space-y-4">

                {/* CLASSIFICATION RESULT */}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">

                  <div>
                    <span className="text-[11px] font-semibold text-emerald-800 font-mono">
                      CLASSIFICATION RESULT
                    </span>

                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                      {result.currentStage}
                    </h3>

                    <p className="text-xs text-slate-500">
                      Detected for {result.cropType} · {result.location}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-emerald-700 font-mono">
                      {result.confidence}%
                    </span>

                    <p className="text-[11px] text-slate-500">
                      Model Confidence
                    </p>
                  </div>

                </div>

                {/* LOW CONFIDENCE WARNING */}

                {result.isReliable === false && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                    <strong>Low-confidence prediction</strong>

                    <p className="mt-1">
                      This is an approximate AI estimate. Please verify
                      the growth stage visually or upload a clearer
                      full-plant image.
                    </p>
                  </div>
                )}

                {/* GROWTH TIMELINE */}

                <div className="space-y-2">

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      {result.cropType} Growth Progression
                    </span>

                    <span className="text-emerald-700 font-mono text-[11px]">
                      Stage {Number(result.stageIndex) + 1} of{' '}
                      {result.stageProgression.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {result.stageProgression.map((stage) => (
                      <div
                        key={stage.id}
                        className={`p-2.5 rounded-xl border text-center ${
                          stage.isCurrent
                            ? 'bg-[#123B2A] text-white border-[#123B2A] shadow-md'
                            : stage.isCompleted
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                      >
                        <div className="text-[10px] font-mono font-bold">
                          {stage.isCompleted ? '✓' : `0${stage.id}`}
                        </div>

                        <div className="text-[11px] font-semibold mt-1 truncate">
                          {stage.name.split('/')[0]}
                        </div>

                        <div className="text-[9px] mt-0.5">
                          {stage.isCurrent
                            ? 'Current'
                            : stage.isCompleted
                            ? 'Done'
                            : 'Upcoming'}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

                {/* MILESTONES */}

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">

                  <div>
                    <span className="text-slate-500 text-[11px] block">
                      Next Developmental Milestone
                    </span>

                    <strong className="text-slate-900 text-sm block mt-1">
                      {result.nextStage || 'Not available'}
                    </strong>

                    <span className="text-slate-500 text-[11px]">
                      Estimated next growth stage based on crop progression.
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[11px] block">
                      Thermal Accumulation (GDD)
                    </span>

                    <strong className="text-slate-900 text-sm font-mono block mt-1">
                      {result.accumulatedGDD != null &&
                      result.targetGDDToNext != null
                        ? `${result.accumulatedGDD} / ${result.targetGDDToNext} °C-days`
                        : 'Not calculated'}
                    </strong>

                    <span className="text-slate-500 text-[11px]">
                      Requires field temperature data and crop-specific parameters.
                    </span>
                  </div>

                </div>

                {/* VISUAL OBSERVATIONS */}

                <div className="space-y-2">

                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Detected Visual Features & Biophysical Attributes
                  </h4>

                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {(result.visualCharacteristics || []).map(
                      (obs, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 bg-emerald-50/40 p-2 rounded-lg"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{obs}</span>
                        </li>
                      )
                    )}
                  </ul>

                </div>

                {/* RECOMMENDATIONS */}

                <div className="space-y-2 pt-2 border-t border-slate-100">

                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Agronomic Next Actions for {result.currentStage}
                  </h4>

                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {(result.recommendations || []).map(
                      (rec, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      )
                    )}
                  </ul>

                </div>

                {/* SAVE TO MY PLANTS */}

                <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-3">

                  <button
                    type="button"
                    onClick={handleSaveToFarm}
                    disabled={isSaved}
                    className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 ${
                      isSaved
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-[#123B2A] hover:bg-[#16A36A] text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />

                    {isSaved
                      ? 'Saved to My Plants Registry'
                      : 'Save to My Plants'}
                  </button>

                </div>

              </div>
            </div>

          ) : (

            /* EMPTY STATE */

            <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 text-center space-y-4">

              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <ScanEye className="w-8 h-8" />
              </div>

              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="font-display font-bold text-base text-slate-900">
                  Ready for Plant Growth Analysis
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Select a sample preset or upload your own plant image.
                  You can either click <strong>Analyse Plant Growth Stage</strong>
                  or ask the Voice Assistant to analyse the image and tell
                  you its current growth stage.
                </p>
              </div>

              {/* SUPPORTED GROWTH STAGES */}

              <div className="pt-4 border-t border-slate-100 max-w-lg mx-auto">

                <p className="text-[11px] font-semibold text-slate-400 mb-2">
                  Supported Growth Stages:
                </p>

                <div className="flex flex-wrap justify-center gap-1.5 text-[11px] text-slate-600">
                  {GROWTH_STAGES.map((stage, idx) => (
                    <span
                      key={stage.id}
                      className="px-2 py-0.5 rounded bg-slate-100 text-slate-700"
                    >
                      {idx + 1}. {stage.name}
                    </span>
                  ))}
                </div>

              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
