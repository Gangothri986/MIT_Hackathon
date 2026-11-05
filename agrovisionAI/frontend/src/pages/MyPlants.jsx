import React, { useState } from 'react';
import { plantService } from '../services/plantService';
import {
  Sprout,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Eye,
  Calendar,
  Layers,
  X,
} from 'lucide-react';
import { usePlant } from '../context/PlantContext';
import { GROWTH_STAGES } from '../services/plantService';
import { IMAGES } from '../assets/images';

export default function MyPlants() {
  const { plants, addPlant, setSelectedPlant,updateWheatPrediction } = usePlant();
  const getPlantImage = (plant) => {
  // Replace previously saved incorrect image paths
  if (
    plant.imageUrl &&
    !plant.imageUrl.startsWith('/frontend/src/assets/images/')
  ) {
    return plant.imageUrl;
  }

  // Use the correct image based on crop type
  switch (plant.cropType) {
    case 'Tomato':
      return IMAGES.tomatoFlowering;

    case 'Chilli':
      return IMAGES.chilliVegetative;

    case 'Paddy':
      return IMAGES.paddyField;
      
      case 'Wheat':
  return IMAGES.paddyField;

    default:
      return IMAGES.hero;
  }
};

  const [search, setSearch] = useState('');
  const [cropFilter, setCropFilter] = useState('All');
  const [stageFilter, setStageFilter] = useState('All');
  const [healthFilter, setHealthFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [inspectPlant, setInspectPlant] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
const [predicting, setPredicting] = useState(false);
const [predictionError, setPredictionError] = useState('');

  // New Plant Form State
  const [newPlantData, setNewPlantData] = useState({
    name: '',
    cropType: 'Tomato',
    variety: 'Table Tomato',
    location: 'North Greenhouse - Bed 2',
    plantedDate: new Date().toISOString().split('T')[0],
    currentStage: 'Vegetative Growth',
  });

  const filteredPlants = plants.filter((plant) => {
    if (cropFilter !== 'All' && plant.cropType !== cropFilter) return false;
    if (stageFilter !== 'All' && plant.currentStage !== stageFilter) return false;
    if (healthFilter !== 'All' && plant.healthStatus !== healthFilter) return false;
    if (riskFilter !== 'All' && plant.riskLevel !== riskFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        plant.name.toLowerCase().includes(q) ||
        plant.id.toLowerCase().includes(q) ||
        plant.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

 const handleCreatePlant = async (e) => {
  e.preventDefault();

  if (!newPlantData.name.trim()) return;

  let defaultImg = IMAGES.tomatoFlowering;

  if (newPlantData.cropType === 'Chilli') {
    defaultImg = IMAGES.chilliFlowering;
  } else if (newPlantData.cropType === 'Paddy') {
    defaultImg = IMAGES.paddyField;
  } else if (newPlantData.cropType === 'Wheat') {
    defaultImg = IMAGES.paddyField;
  }

  try {
    await addPlant({
      ...newPlantData,
      imageUrl: defaultImg,
    });

    setIsAddModalOpen(false);

    setNewPlantData({
  name: '',
  cropType: 'Tomato',
  variety: 'Table Tomato',
  location: 'North Greenhouse - Bed 2',
  plantedDate: new Date().toISOString().split('T')[0],
  currentStage: 'Vegetative Growth',
});
  } catch (error) {
    console.error('Plant creation failed:', error);
    alert('Could not save plant. Please check your backend.');
  }
};
const handleWheatPrediction = async () => {
  if (!selectedImage || !inspectPlant) {
    setPredictionError('Please select a Wheat image first.');
    return;
  }

  const plantId = inspectPlant._id || inspectPlant.customId || inspectPlant.id;

  try {
    setPredicting(true);
    setPredictionError('');

    const result = await plantService.predictWheatStage(
      plantId,
      selectedImage
    );

    updateWheatPrediction(plantId, result.prediction);

    setInspectPlant((prev) => ({
      ...prev,
      ...result.plant,
      currentStage: result.prediction.stage,
      stageIndex: result.prediction.stageIndex,
      confidence: result.prediction.confidence,
    }));

    setSelectedImage(null);
  } catch (error) {
    console.error('Wheat prediction error:', error);
    setPredictionError(
      error.response?.data?.message || 'Prediction failed. Please check the backend.'
    );
  } finally {
    setPredicting(false);
  }
};
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-emerald-800 tracking-wide uppercase">
            Cultivar Registry & Telemetry
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
            Smart Farm & Plant Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Directory of all tagged plants across your farm plots with continuous biophysical tracking.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#123B2A] hover:bg-[#16A36A] text-white text-xs font-semibold rounded-xl transition-all shadow-sm self-start"
        >
          <Plus className="w-4 h-4 text-[#B7E46A]" />
          <span>Register New Plant</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID, or plot..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Crop Filter */}
          <select
            value={cropFilter}
            onChange={(e) => setCropFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
          >
            <option value="All">All Crops</option>
<option value="Tomato">Tomato</option>
<option value="Chilli">Chilli</option>
<option value="Paddy">Paddy</option>
<option value="Wheat">Wheat</option>
<option value="Other">Other</option>
          </select>

          {/* Stage Filter */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
          >
            <option value="All">All Growth Stages</option>
           {[
  ...GROWTH_STAGES,
  { id: 7, name: 'Fruiting' },
  { id: 8, name: 'Mature' },
].map((s) => (
  <option key={s.id} value={s.name}>
    {s.name}
  </option>
))}
          </select>

          {/* Health Filter */}
          <select
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
          >
            <option value="All">All Health Statuses</option>
            <option value="Healthy">Healthy</option>
            <option value="Attention Needed">Attention Needed</option>
            <option value="Diseased">Diseased</option>
          </select>

          {/* Risk Level Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
          >
            <option value="All">All Risk Levels</option>
            <option value="Low">Low Risk</option>
            <option value="Moderate">Moderate Risk</option>
            <option value="High">High Risk</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>Showing <strong>{filteredPlants.length}</strong> monitored plants</span>
          {(cropFilter !== 'All' || stageFilter !== 'All' || healthFilter !== 'All' || riskFilter !== 'All' || search) && (
            <button
              onClick={() => {
                setCropFilter('All');
                setStageFilter('All');
                setHealthFilter('All');
                setRiskFilter('All');
                setSearch('');
              }}
              className="text-emerald-700 font-semibold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Plants Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPlants.map((plant) => (
          <div
            key={plant.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all overflow-hidden flex flex-col justify-between group"
          >
            <div>
              {/* Plant Card Image & Overlay */}
              <div className="relative aspect-16/9 bg-slate-100 overflow-hidden">
               <img
  src={getPlantImage(plant)}
  alt={plant.name}
  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
/>
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0B241B]/90 text-white backdrop-blur-xs">
                    {plant.id}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 text-slate-900 backdrop-blur-xs">
                    {plant.cropType}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      plant.healthStatus === 'Healthy'
                        ? 'bg-emerald-500 text-white'
                        : plant.healthStatus === 'Diseased'
                        ? 'bg-red-500 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {plant.healthStatus}
                  </span>
                </div>
              </div>

              {/* Plant Info Body */}
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="text-base font-bold font-display text-slate-900 group-hover:text-emerald-800 transition-colors">
                    {plant.name}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">{plant.location}</p>
                </div>

                {/* Growth Stage & Progress */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">
  Stage {(Number(plant.stageIndex) || 0) + 1} of {
  plant.cropType === 'Wheat' ? 4 : 6
}
</span>
                    <strong className="text-emerald-800">{plant.currentStage}</strong>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{
  width: `${
    ((plant.cropType === 'Wheat'
      ? plant.stageIndex + 1
      : plant.stageIndex) /
      (plant.cropType === 'Wheat' ? 4 : 6)) * 100
  }%`,
}}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{plant.daysAfterPlanting} DAP</span>
                    <span>{plant.confidence}% confidence</span>
                  </div>
                </div>

                {/* Health & GDD Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Health Score</span>
                    <span className="font-bold text-slate-900 font-display tabular-nums">
                      {plant.healthScore}/100
                    </span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Accumulated GDD</span>
                    <span className="font-bold text-slate-900 font-mono tabular-nums">
                      {plant.gddAccumulated} °C-d
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Action Footer */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400 font-mono">
                Last scan: {plant.lastAnalysedDate}
              </span>
              <button
                onClick={() => setInspectPlant(plant)}
                className="font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 transition-colors"
              >
                <span>View Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Inspect Plant Profile Modal */}
      {inspectPlant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
            <div className="px-6 py-4 bg-[#0B241B] text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-[#B7E46A] font-mono">{inspectPlant.id}</span>
                <h3 className="font-display font-bold text-lg text-white">{inspectPlant.name}</h3>
              </div>
              <button
                onClick={() => setInspectPlant(null)}
                className="p-1.5 text-emerald-300 hover:text-white rounded-lg hover:bg-[#123B2A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="flex gap-4 items-center">
                <img
  src={getPlantImage(inspectPlant)}
  alt={inspectPlant.name}
  className="w-28 h-28 rounded-xl object-cover border border-slate-200 shrink-0"
/>
                <div className="space-y-1">
                  <p><strong>Crop Variety:</strong> {inspectPlant.cropType} ({inspectPlant.variety || 'Hybrid'})</p>
                  <p><strong>Location:</strong> {inspectPlant.location}</p>
                  <p><strong>Planted Date:</strong> {inspectPlant.plantedDate} ({inspectPlant.daysAfterPlanting} Days After Planting)</p>
                  <p><strong>Soil Moisture:</strong> {inspectPlant.soilMoisture}</p>
                  <p><strong>Health Score:</strong> <span className="font-bold text-emerald-700">{inspectPlant.healthScore}/100</span></p>
                </div>
              </div>
                  {inspectPlant.cropType === 'Wheat' && (
  <div className="p-4 rounded-xl bg-slate-50 border border-emerald-200 space-y-3">
    <h4 className="font-bold text-emerald-900">
      Wheat Growth Stage Prediction
    </h4>

    <p className="text-slate-600">
      Upload a Wheat plant image to predict its current growth stage using Nyckel AI.
    </p>

    <input
      type="file"
      accept="image/*"
      onChange={(e) => {
        setSelectedImage(e.target.files?.[0] || null);
        setPredictionError('');
      }}
      className="w-full text-xs"
    />

    {selectedImage && (
      <p className="text-emerald-700">
        Selected: {selectedImage.name}
      </p>
    )}

    <button
      onClick={handleWheatPrediction}
      disabled={!selectedImage || predicting}
      className="px-4 py-2 bg-[#123B2A] hover:bg-[#16A36A] disabled:opacity-50 text-white font-semibold rounded-xl"
    >
      {predicting ? 'Predicting...' : 'Predict Growth Stage'}
    </button>

    {predictionError && (
      <p className="text-red-600">{predictionError}</p>
    )}
  </div>
)}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                <span className="font-bold text-emerald-950">Next Projected Milestone:</span>
                <p className="text-emerald-900">
                  {inspectPlant.estimatedNextMilestone.stage} anticipated in ~{inspectPlant.estimatedNextMilestone.daysRemaining} days ({inspectPlant.estimatedNextMilestone.estimatedDate}).
                </p>
              </div>

              {/* Historical Timeline */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Growth Timeline Log
                </h4>
                <div className="divide-y divide-slate-100">
                  {inspectPlant.history.map((h, i) => (
                    <div key={i} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{h.stage}</span>
                        <p className="text-[11px] text-slate-500">{h.note}</p>
                      </div>
                      <span className="font-mono text-slate-400 text-[11px]">{h.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register New Plant Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-[#0B241B] text-white flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-white">Register Monitored Specimen</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-emerald-300 hover:text-white rounded-lg hover:bg-[#123B2A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlant} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Specimen / Row Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tomato Arka Rakshak - Row 8"
                  value={newPlantData.name}
                  onChange={(e) => setNewPlantData({ ...newPlantData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Crop Type</label>
                  <select
                    value={newPlantData.cropType}
                    onChange={(e) => setNewPlantData({ ...newPlantData, cropType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
                  >
                    <option value="Tomato">Tomato</option>
                    <option value="Chilli">Chilli</option>
                    <option value="Paddy">Paddy</option>
                    <option value="Wheat">Wheat</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Variety / Cultivar</label>
                  <input
                    type="text"
                    placeholder="Arka Rakshak"
                    value={newPlantData.variety}
                    onChange={(e) => setNewPlantData({ ...newPlantData, variety: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Plot Location</label>
                <input
                  type="text"
                  value={newPlantData.location}
                  onChange={(e) => setNewPlantData({ ...newPlantData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Planting Date</label>
                  <input
                    type="date"
                    value={newPlantData.plantedDate}
                    onChange={(e) => setNewPlantData({ ...newPlantData, plantedDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Growth Stage</label>
                  <select
                    value={newPlantData.currentStage}
                    onChange={(e) => setNewPlantData({ ...newPlantData, currentStage: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
                  >
                    {GROWTH_STAGES.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#123B2A] hover:bg-[#16A36A] text-white font-semibold rounded-xl"
                >
                  Register Specimen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
