import React, { useState, useRef } from 'react';
import { SAMPLE_CROP_IMAGES } from '../data/mockFarmData';
import { FarmZone, DiseaseDiagnosis } from '../types/agriculture';
import {
  Camera,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Droplet,
  Sparkles,
  Info,
} from 'lucide-react';

interface CropDiseaseDiagnosticProps {
  activeZone: FarmZone;
}

export const CropDiseaseDiagnostic: React.FC<CropDiseaseDiagnosticProps> = ({
  activeZone,
}) => {
  const [selectedImage, setSelectedImage] = useState<string>(SAMPLE_CROP_IMAGES[0].path);
  const [selectedCropName, setSelectedCropName] = useState<string>('Tomato');
  const [diagnosis, setDiagnosis] = useState<DiseaseDiagnosis | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSelectedImage(reader.result);
          setSelectedCropName(file.name.replace(/\.[^/.]+$/, ''));
          setDiagnosis(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSample = (sample: typeof SAMPLE_CROP_IMAGES[0]) => {
    setSelectedImage(sample.path);
    setSelectedCropName(sample.crop);
    setDiagnosis(null);
  };

  const handleRunDiagnosis = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError(null);

    try {
      let base64Payload = selectedImage;

      if (selectedImage.startsWith('/src/assets/images')) {
        const res = await fetch(selectedImage);
        const blob = await res.blob();
        base64Payload = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      const response = await fetch('/api/diagnose-crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Payload,
          mimeType: 'image/jpeg',
          cropType: selectedCropName,
          zoneName: activeZone.name,
          sensorContext: {
            soilMoisture: activeZone.telemetry.soilMoisture,
            ambientTemp: activeZone.telemetry.ambientTemp,
            humidity: activeZone.telemetry.humidity,
            leafWetness: activeZone.telemetry.leafWetness,
            vpd: activeZone.telemetry.vpd,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze crop image');
      }

      setDiagnosis(data.data);
    } catch (err: any) {
      console.error('Diagnosis error:', err);
      setError(err.message || 'Error communicating with diagnostic engine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-700 font-mono mb-1 font-semibold">
            <span>MULTIMODAL COMPUTER VISION</span>
            <span aria-hidden="true">·</span>
            <span>Gemini 3.8 Flash Plant Pathology</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            AI Crop Disease & Foliar Health Diagnostics
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Active Context:</span>
          <span className="font-semibold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
            {activeZone.name} ({activeZone.crop})
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Selection & Upload */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-4/3 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-xs">
            <img
              src={selectedImage}
              alt="Crop inspection target"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-70" />

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
              <span className="font-semibold bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/20">
                Target: {selectedCropName}
              </span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-white/90 hover:bg-white text-slate-900 font-semibold backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-600" />
                <span>Upload Photo</span>
              </button>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          {/* Quick Pre-Loaded Sample Library */}
          <div>
            <div className="text-xs font-semibold text-slate-600 mb-2">
              Select Sample Leaf Specimen (Instant Diagnosis Demo):
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {SAMPLE_CROP_IMAGES.map((sample) => {
                const isSelected = selectedImage === sample.path;
                return (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer overflow-hidden ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="aspect-square rounded-lg overflow-hidden mb-1.5 bg-slate-100">
                      <img
                        src={sample.path}
                        alt={sample.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="text-[11px] font-bold text-slate-900 truncate">{sample.title}</div>
                    <div className="text-[10px] text-slate-500 truncate">{sample.crop}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleRunDiagnosis}
            disabled={loading}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-emerald-600/20"
          >
            {loading ? (
              <>
                <Cpu className="w-4 h-4 animate-spin text-white" />
                <span>Analyzing Botanical Pathology with Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>Run AI Pathology Diagnosis</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Diagnostic Results Report */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 mb-4">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Diagnostic Evaluation Error</div>
                <div>{error}</div>
              </div>
            </div>
          )}

          {!diagnosis && !loading && (
            <div className="h-full flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-slate-300 text-center bg-slate-50/50">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3 shadow-2xs">
                <Cpu className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Awaiting Specimen Analysis
              </h3>
              <p className="text-xs text-slate-500 max-w-md mb-4 leading-relaxed">
                Click <strong className="text-emerald-700">"Run AI Pathology Diagnosis"</strong> to inspect foliar venation, chlorosis, necrotic lesion patterns, and correlate with active field humidity ({activeZone.telemetry.humidity}%) and leaf wetness ({activeZone.telemetry.leafWetness}).
              </p>
              <div className="text-[11px] text-slate-400">
                Backed by Gemini 3.8 Flash multimodal reasoning & agronomic models
              </div>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center p-8 rounded-xl border border-slate-200 bg-white text-center space-y-4 shadow-xs">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin mx-auto" />
                <Sparkles className="w-6 h-6 text-emerald-600 absolute inset-0 m-auto" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Multispectral Pathology In Progress</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Correlating foliar lesion morphology with {activeZone.name} telemetry ({activeZone.telemetry.ambientTemp}°C, {activeZone.telemetry.humidity}% RH)...
                </p>
              </div>
            </div>
          )}

          {diagnosis && !loading && (
            <div className="space-y-4">
              {/* Diagnosis Header Badge */}
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        diagnosis.healthStatus === 'Healthy'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-rose-50 border-rose-300 text-rose-800'
                      }`}
                    >
                      {diagnosis.healthStatus} · {diagnosis.pathogenType}
                    </span>
                    <span className="text-xs text-slate-600 font-mono font-semibold">
                      Confidence: {diagnosis.confidenceScore}%
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    {diagnosis.conditionName}
                  </h3>
                  <div className="text-xs italic text-slate-500 font-medium">{diagnosis.scientificName}</div>
                </div>

                <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
                  <div className="text-[11px] text-slate-500">Affected Canopy</div>
                  <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                    {diagnosis.affectedSurfacePercentage}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">Severity: {diagnosis.severityLevel}</div>
                </div>
              </div>

              {/* Symptoms Identified */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 text-xs shadow-2xs">
                <div className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-600" />
                  <span>Identified Botanical Symptoms</span>
                </div>
                <ul className="space-y-1.5 text-slate-700">
                  {diagnosis.visualSymptoms.map((symptom, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <span>{symptom}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Microclimate Correlation */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 text-xs shadow-2xs">
                <div className="font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-500" />
                  <span>IoT Telemetry Micro-Climate Correlation</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {diagnosis.microclimateCorrelation}
                </p>
              </div>

              {/* Treatment Protocols */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 shadow-2xs">
                  <div className="font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>OMRI Organic Biocontrol</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-[11px]">
                    {diagnosis.organicTreatment}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-sky-50/80 border border-sky-200 shadow-2xs">
                  <div className="font-bold text-sky-900 mb-1 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-sky-600" />
                    <span>Targeted Chemical / FRAC</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-[11px]">
                    {diagnosis.chemicalTreatment}
                  </p>
                </div>
              </div>

              {/* Immediate 24h Remediation Steps */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 text-xs shadow-2xs">
                <div className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Immediate Remediation Protocol (24h - 48h)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {diagnosis.immediateRemediation.map((step, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-700 flex items-start gap-2 shadow-2xs">
                      <span className="font-bold text-emerald-600 font-mono">{idx + 1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Irrigation Advice */}
              <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 text-xs flex items-start gap-2 text-sky-900 shadow-2xs">
                <Droplet className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-sky-800">Irrigation Actuator Recommendation: </strong>
                  {diagnosis.irrigationAdvice}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
