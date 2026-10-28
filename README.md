# AgriSense AI — Smart Agriculture Monitoring System

An enterprise-grade precision agriculture platform combining interactive **Three.js 3D Digital Twin** modeling, real-time IoT soil and micro-climate telemetry, automated closed-loop drip irrigation, and **Gemini 3.8 Flash** multimodal crop disease diagnostics.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-black.svg)](https://threejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8.svg)](https://tailwindcss.com/)
[![Gemini API](https://img.shields.io/badge/Google_Gemini-3.8_Flash-8e75ff.svg)](https://ai.google.dev/)

---

## 🌟 Key Features

### 1. Interactive Three.js 3D Precision Farm Twin
- **Procedural 3D Crop Parcels**: Realistic 3D terrain featuring an Apple Orchard with textured canopies, a Center-Pivot Corn field, a modern glass Greenhouse, and trellised Vineyard terraces.
- **Dynamic Irrigation Actuators**: Functional center-pivot truss arm that rotates and sprays animated water droplet particles in real time.
- **Autonomous UAV Drone Scout**: Multi-part drone with spinning propellers patrolling the farm along waypoint vectors with down-looking multispectral scanner cones.
- **Interactive Raycasting**: Click any field parcel or IoT sensor node in 3D to smoothly focus camera presets and display localized data.
- **NDVI False-Color Heatmap**: Toggle between natural true-color terrain and multispectral chlorophyll density visualization.

### 2. Multi-Depth IoT Soil & Microclimate Telemetry
- **Soil Stratum Profiling**: Volumetric water content (VWC) across surface ($10\text{ cm}$), core root zone ($30\text{ cm}$), and deep subsoil ($60\text{ cm}$).
- **Vapor Pressure Deficit (VPD)**: Atmospheric moisture and transpirational pull calculations to safeguard crop stomatal regulation.
- **Foliar Wetness & Spore Hazard**: Detection of leaf wetness windows to predict fungal sporulation before visible infection.
- **NPK Macronutrients & pH**: Real-time optical probe monitoring of Nitrogen, Phosphorus, Potassium ($\text{mg/kg}$), and soil pH bioavailability.
- **Interactive Simulator**: Sliders to simulate droughts, heatwaves, and rainstorms on the fly.

### 3. Multimodal AI Crop Disease Diagnostics (Gemini 3.8 Flash)
- **Foliar Specimen Analysis**: Upload custom photos or inspect pre-loaded reference specimens (Tomato Early Blight, Northern Corn Leaf Blight, Healthy Grapevine).
- **Comprehensive Pathology Reports**:
  - Latin binomial classification & confidence score
  - Severity level & percentage of affected foliar canopy
  - Micro-climate correlation linking infection to ambient humidity and leaf wetness
  - 24–48 hour action checklists
  - OMRI-certified organic bio-controls vs. targeted chemical rotation protocols

### 4. Smart Irrigation & Fertigation Actuators
- **Closed-Loop Automation**: Automated solenoid valve activation when soil moisture breaches critical thresholds ($<22\%$), auto-shutting off at target field capacity ($>50\%$).
- **Manual Flow Rate Override**: Proportional flow adjustments ($10\text{–}120\text{ L/min}$).
- **Venturi Fertigation Pump**: Injects soluble NPK micronutrients directly through drip lines.
- **Water Conservation**: Pre-dawn scheduling calculations reducing evaporative water loss by $26.4\%$.

### 5. AI Agronomist Copilot
- Natural language agronomic assistant grounded in active field telemetry to provide customized operational guidance, irrigation runtimes, and fertilizer dosage recommendations.

### 6. Historical Telemetry & Data Export
- 24-hour time-series graphs for moisture, temperature, and humidity.
- One-click CSV and JSON telemetry log exports.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Three.js, Lucide Icons, Motion, Tailwind CSS v4
- **Backend**: Node.js & Express server with server-side proxy routes for `@google/genai`
- **AI Engine**: Google Gemini 3.8 Flash multimodal reasoning model with automated domain fallback
- **Build Tool**: Vite 8 with TSX runtime

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v20.x` or `v22.x`
- npm `v10.x` or higher

### Installation

1. Clone your repository:
   ```bash
   git clone https://github.com/<your-username>/<your-repo-name>.git
   cd <your-repo-name>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key in `.env`:
   ```env
   GEMINI_API_KEY="your_actual_gemini_api_key_here"
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. Build for production:
   ```bash
   npm run build
   npm start
   ```

---

## 📄 License
This project is licensed under the Apache-2.0 License.
