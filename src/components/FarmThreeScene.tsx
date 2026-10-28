import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FarmZone } from '../types/agriculture';
import {
  Camera,
  Layers,
  Droplets,
  Navigation,
  Eye,
  Maximize2,
  Minimize2,
  Sparkles,
  Sun,
  Compass,
} from 'lucide-react';

interface FarmThreeSceneProps {
  zones: FarmZone[];
  selectedZoneId: string;
  onSelectZone: (zoneId: string) => void;
  isIrrigating: boolean;
  onToggleIrrigation: (zoneId: string) => void;
}

export const FarmThreeScene: React.FC<FarmThreeSceneProps> = ({
  zones,
  selectedZoneId,
  onSelectZone,
  isIrrigating,
  onToggleIrrigation,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ndviMode, setNdviMode] = useState(false);
  const [activeCameraView, setActiveCameraView] = useState<'overview' | 'zone-a' | 'zone-b' | 'zone-c' | 'zone-d' | 'drone'>('overview');
  const [droneEnabled, setDroneEnabled] = useState(true);

  // Mutable refs for Three.js render loop without teardowns
  const sceneRef = useRef<{
    renderer?: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    zonesMeshes?: Map<string, THREE.Mesh>;
    pivotArm?: THREE.Group;
    waterParticles?: THREE.Points;
    droneGroup?: THREE.Group;
    dronePropellers?: THREE.Mesh[];
    targetCamPos?: THREE.Vector3;
    targetCamLook?: THREE.Vector3;
    animFrameId?: number;
    clock?: THREE.Clock;
    isSoftwareGl?: boolean;
    raycaster?: THREE.Raycaster;
    mouse?: THREE.Vector2;
  }>({});

  // Trigger camera view update
  const setCameraPreset = (view: 'overview' | 'zone-a' | 'zone-b' | 'zone-c' | 'zone-d' | 'drone') => {
    setActiveCameraView(view);
    const s = sceneRef.current;
    if (!s.targetCamPos || !s.targetCamLook) return;

    if (view === 'overview') {
      s.targetCamPos.set(0, 48, 56);
      s.targetCamLook.set(0, 0, 0);
    } else if (view === 'zone-a') {
      s.targetCamPos.set(-20, 18, -12);
      s.targetCamLook.set(-18, 0, -18);
      onSelectZone('zone-a');
    } else if (view === 'zone-b') {
      s.targetCamPos.set(16, 20, -12);
      s.targetCamLook.set(18, 0, -18);
      onSelectZone('zone-b');
    } else if (view === 'zone-c') {
      s.targetCamPos.set(-18, 16, 22);
      s.targetCamLook.set(-18, 0, 18);
      onSelectZone('zone-c');
    } else if (view === 'zone-d') {
      s.targetCamPos.set(18, 16, 22);
      s.targetCamLook.set(18, 0, 18);
      onSelectZone('zone-d');
    }
  };

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 480;

    // Detect software WebGL as mandated by Three.js skill
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Scene & Light Background (Pure crisp daylight aesthetic)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc); // Clean porcelain white background
    scene.fog = new THREE.Fog(0xf8fafc, 65, 140);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 300);
    camera.position.set(0, 48, 56);
    camera.lookAt(0, 0, 0);

    const targetCamPos = new THREE.Vector3(0, 48, 56);
    const targetCamLook = new THREE.Vector3(0, 0, 0);
    const currentCamLook = new THREE.Vector3(0, 0, 0);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting Rig (Warm golden sun + cool sky fill for authentic outdoor daylight)
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xe2e8f0, 0.85);
    scene.add(hemisphereLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.4);
    sunLight.position.set(45, 60, 35);
    sunLight.castShadow = !isSoftwareGl;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 160;
    const shadowD = 45;
    sunLight.shadow.camera.left = -shadowD;
    sunLight.shadow.camera.right = shadowD;
    sunLight.shadow.camera.top = shadowD;
    sunLight.shadow.camera.bottom = -shadowD;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Ambient fill
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // 5. Procedural Farm Terrain & Zoned Parcels
    // Farm Base Plane
    const groundGeo = new THREE.PlaneGeometry(160, 160, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9, // Very light warm clay soil border
      roughness: 0.9,
      metalness: 0.05,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -0.05;
    groundMesh.receiveShadow = !isSoftwareGl;
    scene.add(groundMesh);

    // Subtle farm grid line roads
    const roadMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8 });
    const roadHoriz = new THREE.Mesh(new THREE.PlaneGeometry(84, 2.5), roadMat);
    roadHoriz.rotation.x = -Math.PI / 2;
    roadHoriz.position.set(0, 0.01, 0);
    scene.add(roadHoriz);

    const roadVert = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 84), roadMat);
    roadVert.rotation.x = -Math.PI / 2;
    roadVert.position.set(0, 0.01, 0);
    scene.add(roadVert);

    // Parcels Definitions
    const zonesMeshes = new Map<string, THREE.Mesh>();
    const parcelConfig = [
      { id: 'zone-a', name: 'Zone A - Orchard', x: -18, z: -18, color: 0xa7f3d0, ndviColor: 0x10b981 }, // Emerald Green
      { id: 'zone-b', name: 'Zone B - Pivot Corn', x: 18, z: -18, color: 0xfef08a, ndviColor: 0xf59e0b }, // Warm Golden Corn
      { id: 'zone-c', name: 'Zone C - Greenhouse', x: -18, z: 18, color: 0xbae6fd, ndviColor: 0x0ea5e9 }, // Sky Blue Clean
      { id: 'zone-d', name: 'Zone D - Vineyard', x: 18, z: 18, color: 0xddd6fe, ndviColor: 0x8b5cf6 }, // Violet Grape
    ];

    parcelConfig.forEach((p) => {
      const pGeo = new THREE.PlaneGeometry(32, 32, 16, 16);
      const pMat = new THREE.MeshStandardMaterial({
        color: p.color,
        roughness: 0.85,
        metalness: 0.05,
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.rotation.x = -Math.PI / 2;
      pMesh.position.set(p.x, 0.02, p.z);
      pMesh.receiveShadow = !isSoftwareGl;
      pMesh.userData = { zoneId: p.id, name: p.name, baseColor: p.color, ndviColor: p.ndviColor };
      scene.add(pMesh);
      zonesMeshes.set(p.id, pMesh);

      // Add border outline
      const borderGeo = new THREE.EdgesGeometry(pGeo);
      const borderMat = new THREE.LineBasicMaterial({ color: 0xcbdfd8, linewidth: 2 });
      const borderLine = new THREE.LineSegments(borderGeo, borderMat);
      borderLine.rotation.x = -Math.PI / 2;
      borderLine.position.set(p.x, 0.03, p.z);
      scene.add(borderLine);
    });

    // 6. Zone A: Procedural Apple Trees (Group of 3-5 parts: trunk, canopy layers, apples)
    const orchardGroup = new THREE.Group();
    const treeTrunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 1.8, 6);
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const treeCanopyGeo = new THREE.SphereGeometry(1.2, 8, 8);
    const treeCanopyMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 });
    const appleGeo = new THREE.SphereGeometry(0.18, 5, 5);
    const appleMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });

    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        const tree = new THREE.Group();
        const trunk = new THREE.Mesh(treeTrunkGeo, treeTrunkMat);
        trunk.position.y = 0.9;
        trunk.castShadow = !isSoftwareGl;
        tree.add(trunk);

        const canopy = new THREE.Mesh(treeCanopyGeo, treeCanopyMat);
        canopy.position.y = 2.4;
        canopy.scale.set(1 + (r % 2) * 0.15, 1, 1 + (c % 2) * 0.15);
        canopy.castShadow = !isSoftwareGl;
        tree.add(canopy);

        // Apples
        const apple1 = new THREE.Mesh(appleGeo, appleMat);
        apple1.position.set(0.7, 2.3, 0.6);
        tree.add(apple1);

        const apple2 = new THREE.Mesh(appleGeo, appleMat);
        apple2.position.set(-0.6, 2.1, -0.5);
        tree.add(apple2);

        tree.position.set(-18 + r * 5.2, 0, -18 + c * 5.2);
        orchardGroup.add(tree);
      }
    }
    scene.add(orchardGroup);

    // 7. Zone B: Procedural Corn Stalks & Circular Center-Pivot Irrigation System
    const cornGroup = new THREE.Group();
    const cornStalkGeo = new THREE.CylinderGeometry(0.08, 0.12, 1.6, 4);
    const cornStalkMat = new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.6 });
    const cornTasselGeo = new THREE.ConeGeometry(0.3, 0.6, 4);
    const cornTasselMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.7 });

    for (let i = 0; i < 48; i++) {
      const angle = (i / 48) * Math.PI * 2;
      const radius = 3.5 + (i % 3) * 3.8;
      const stalk = new THREE.Group();
      const stem = new THREE.Mesh(cornStalkGeo, cornStalkMat);
      stem.position.y = 0.8;
      stalk.add(stem);

      const tassel = new THREE.Mesh(cornTasselGeo, cornTasselMat);
      tassel.position.y = 1.7;
      stalk.add(tassel);

      stalk.position.set(18 + Math.cos(angle) * radius, 0, -18 + Math.sin(angle) * radius);
      cornGroup.add(stalk);
    }
    scene.add(cornGroup);

    // Center-Pivot Irrigation Arm (Center Tower + Rotating Truss + Wheels)
    const pivotArm = new THREE.Group();
    pivotArm.position.set(18, 0, -18);

    // Center Tower
    const towerGeo = new THREE.CylinderGeometry(0.5, 0.8, 3.2, 8);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.25 });
    const tower = new THREE.Mesh(towerGeo, metalMat);
    tower.position.y = 1.6;
    pivotArm.add(tower);

    // Rotating Truss Arm
    const trussArm = new THREE.Group();
    const pipeGeo = new THREE.CylinderGeometry(0.12, 0.12, 13, 8);
    pipeGeo.rotateZ(Math.PI / 2);
    const pipe = new THREE.Mesh(pipeGeo, metalMat);
    pipe.position.set(6.5, 2.8, 0);
    trussArm.add(pipe);

    // Wheel support tower at arm tip
    const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.8, 6);
    const leg1 = new THREE.Mesh(legGeo, metalMat);
    leg1.position.set(12.5, 1.4, 0.4);
    leg1.rotation.z = 0.2;
    trussArm.add(leg1);

    const leg2 = new THREE.Mesh(legGeo, metalMat);
    leg2.position.set(12.5, 1.4, -0.4);
    leg2.rotation.z = -0.2;
    trussArm.add(leg2);

    // Wheel
    const wheelGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.3, 12);
    wheelGeo.rotateX(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.position.set(12.8, 0.6, 0);
    trussArm.add(wheel);

    pivotArm.add(trussArm);
    scene.add(pivotArm);

    // Water Particle Spray Emitter along the truss arm
    const particleCount = 180;
    const waterGeo = new THREE.BufferGeometry();
    const waterPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      waterPos[i * 3] = 18 + Math.random() * 12;
      waterPos[i * 3 + 1] = 0.5 + Math.random() * 2.2;
      waterPos[i * 3 + 2] = -18 + (Math.random() - 0.5) * 1.5;
    }
    waterGeo.setAttribute('position', new THREE.BufferAttribute(waterPos, 3));
    const waterMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.28,
      transparent: true,
      opacity: 0.75,
    });
    const waterParticles = new THREE.Points(waterGeo, waterMat);
    waterParticles.visible = isIrrigating;
    scene.add(waterParticles);

    // 8. Zone C: Modern Hydroponic Greenhouse Architecture
    const ghGroup = new THREE.Group();
    ghGroup.position.set(-18, 0, 18);

    // Foundation
    const ghBaseGeo = new THREE.BoxGeometry(22, 0.6, 14);
    const ghBaseMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8 });
    const ghBase = new THREE.Mesh(ghBaseGeo, ghBaseMat);
    ghBase.position.y = 0.3;
    ghGroup.add(ghBase);

    // Glass walls & pitched roof (Transparent glass)
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.1,
      transmission: isSoftwareGl ? 0 : 0.6,
      depthWrite: false,
    });

    const ghRoofGeo = new THREE.ConeGeometry(8.5, 4, 4);
    ghRoofGeo.rotateY(Math.PI / 4);
    ghRoofGeo.scale(1.3, 0.8, 1);
    const ghRoof = new THREE.Mesh(ghRoofGeo, glassMat);
    ghRoof.position.y = 4.2;
    ghGroup.add(ghRoof);

    // Hydroponic gutter grow tables inside
    const tableGeo = new THREE.BoxGeometry(18, 0.8, 1.8);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.5 });
    for (let i = -2; i <= 2; i++) {
      const table = new THREE.Mesh(tableGeo, tableMat);
      table.position.set(0, 1.0, i * 2.2);
      ghGroup.add(table);
    }
    scene.add(ghGroup);

    // 9. Zone D: Vineyard Trellised Rows
    const vineGroup = new THREE.Group();
    vineGroup.position.set(18, 0, 18);
    const trellisPostGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.2, 6);
    const trellisMat = new THREE.MeshStandardMaterial({ color: 0x713f12, roughness: 0.9 });
    const vineFoliageGeo = new THREE.BoxGeometry(20, 1.2, 0.8);
    const vineFoliageMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.7 });

    for (let row = -3; row <= 3; row++) {
      const zOffset = row * 3.4;
      const foliage = new THREE.Mesh(vineFoliageGeo, vineFoliageMat);
      foliage.position.set(0, 1.3, zOffset);
      foliage.castShadow = !isSoftwareGl;
      vineGroup.add(foliage);

      // Trellis support posts at ends and center
      [-9, 0, 9].forEach((xPos) => {
        const post = new THREE.Mesh(trellisPostGeo, trellisMat);
        post.position.set(xPos, 1.1, zOffset);
        vineGroup.add(post);
      });
    }
    scene.add(vineGroup);

    // 10. IoT Sensor Nodes (Solar Pole + Beacon Antenna + Glowing Light Ring)
    const sensorNodesGroup = new THREE.Group();
    parcelConfig.forEach((p) => {
      const node = new THREE.Group();
      node.position.set(p.x, 0, p.z);

      // Pole
      const poleGeo = new THREE.CylinderGeometry(0.1, 0.1, 4.2, 6);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.y = 2.1;
      node.add(pole);

      // Solar Panel
      const panelGeo = new THREE.BoxGeometry(1.2, 0.08, 0.8);
      const panelMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, metalness: 0.8 });
      const panel = new THREE.Mesh(panelGeo, panelMat);
      panel.position.set(0, 4.2, 0);
      panel.rotation.x = 0.4;
      node.add(panel);

      // Glowing Beacon Ring on ground
      const ringGeo = new THREE.RingGeometry(1.2, 1.6, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.05;
      node.add(ring);

      sensorNodesGroup.add(node);
    });
    scene.add(sensorNodesGroup);

    // 11. Autonomous UAV Drone Scout (Procedural 8-part Model)
    const droneGroup = new THREE.Group();
    droneGroup.position.set(0, 16, 0);

    // Drone Hull
    const droneHullGeo = new THREE.BoxGeometry(1.4, 0.4, 1.4);
    const droneMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.8 });
    const droneHull = new THREE.Mesh(droneHullGeo, droneMat);
    droneGroup.add(droneHull);

    // 4 Arms
    const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.2, 6);
    armGeo.rotateZ(Math.PI / 2);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9 });
    const arm1 = new THREE.Mesh(armGeo, armMat);
    arm1.rotation.y = Math.PI / 4;
    droneGroup.add(arm1);

    const arm2 = new THREE.Mesh(armGeo, armMat);
    arm2.rotation.y = -Math.PI / 4;
    droneGroup.add(arm2);

    // 4 Propellers
    const propGeo = new THREE.BoxGeometry(1.2, 0.04, 0.15);
    const propMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2 });
    const dronePropellers: THREE.Mesh[] = [];
    [
      [-1, 0.25, -1],
      [1, 0.25, -1],
      [-1, 0.25, 1],
      [1, 0.25, 1],
    ].forEach(([px, py, pz]) => {
      const prop = new THREE.Mesh(propGeo, propMat);
      prop.position.set(px, py, pz);
      droneGroup.add(prop);
      dronePropellers.push(prop);
    });

    // Scanner beam cone projection
    const beamGeo = new THREE.ConeGeometry(5, 12, 16, 1, true);
    beamGeo.rotateX(Math.PI);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const scanBeam = new THREE.Mesh(beamGeo, beamMat);
    scanBeam.position.y = -6;
    droneGroup.add(scanBeam);

    scene.add(droneGroup);

    // 12. Mouse & Touch Interaction (Orbit & Zone Raycast Click)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onPointerDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;

        // Manual orbit angles
        const theta = deltaX * 0.008;
        const phi = deltaY * 0.008;

        targetCamPos.x = targetCamPos.x * Math.cos(theta) - targetCamPos.z * Math.sin(theta);
        targetCamPos.z = targetCamPos.x * Math.sin(theta) + targetCamPos.z * Math.cos(theta);
        targetCamPos.y = Math.max(10, Math.min(75, targetCamPos.y + phi * 18));
      }
    };

    const onPointerUp = (e: MouseEvent) => {
      if (Math.abs(e.clientX - prevMouseX) < 4 && Math.abs(e.clientY - prevMouseY) < 4) {
        // Raycast click on parcel
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(Array.from(zonesMeshes.values()));
        if (intersects.length > 0) {
          const hit = intersects[0].object as THREE.Mesh;
          const zoneId = hit.userData.zoneId;
          if (zoneId) {
            onSelectZone(zoneId);
            setCameraPreset(zoneId as any);
          }
        }
      }
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = 1 + e.deltaY * 0.0012;
      targetCamPos.multiplyScalar(Math.min(1.4, Math.max(0.6, zoomFactor)));
      targetCamPos.y = Math.max(12, Math.min(85, targetCamPos.y));
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    domEl.addEventListener('wheel', onWheel, { passive: false });

    // Store in sceneRef
    const clock = new THREE.Clock();
    sceneRef.current = {
      renderer,
      scene,
      camera,
      zonesMeshes,
      pivotArm,
      waterParticles,
      droneGroup,
      dronePropellers,
      targetCamPos,
      targetCamLook,
      clock,
      isSoftwareGl,
      raycaster,
      mouse,
    };

    // 13. Smooth Render Loop (Spring / Damped Kinematics)
    let angleDrone = 0;
    let pivotAngle = 0;

    const tick = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth camera interpolation
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamPos.x, 3.5, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamPos.y, 3.5, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamPos.z, 3.5, delta);

      currentCamLook.x = THREE.MathUtils.damp(currentCamLook.x, targetCamLook.x, 4.0, delta);
      currentCamLook.y = THREE.MathUtils.damp(currentCamLook.y, targetCamLook.y, 4.0, delta);
      currentCamLook.z = THREE.MathUtils.damp(currentCamLook.z, targetCamLook.z, 4.0, delta);
      camera.lookAt(currentCamLook);

      // Rotate drone propellers & fly waypoints
      if (droneEnabled && droneGroup) {
        angleDrone += delta * 0.45;
        const droneRadius = 24;
        droneGroup.position.x = Math.sin(angleDrone) * droneRadius;
        droneGroup.position.z = Math.cos(angleDrone) * (droneRadius * 0.7);
        droneGroup.position.y = 15 + Math.sin(time * 2) * 0.6;
        droneGroup.rotation.y = -angleDrone + Math.PI / 2;

        dronePropellers.forEach((p, idx) => {
          p.rotation.y += delta * (idx % 2 === 0 ? 35 : -35);
        });
      }

      // Rotate Pivot Irrigation Truss Arm
      if (pivotArm) {
        if (isIrrigating) {
          pivotAngle += delta * 0.25;
          trussArm.rotation.y = pivotAngle;

          // Animate water spray particles
          if (waterParticles && waterParticles.geometry) {
            const positions = waterParticles.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < particleCount; i++) {
              positions[i * 3 + 1] -= delta * 5.0; // fall down
              if (positions[i * 3 + 1] < 0.1) {
                positions[i * 3 + 1] = 2.8; // reset to spray nozzle
                const armDist = 2 + Math.random() * 10;
                const armAngle = pivotAngle;
                positions[i * 3] = 18 + Math.cos(armAngle) * armDist;
                positions[i * 3 + 2] = -18 + Math.sin(armAngle) * armDist;
              }
            }
            waterParticles.geometry.attributes.position.needsUpdate = true;
          }
        }
      }

      renderer.render(scene, camera);
      sceneRef.current.animFrameId = requestAnimationFrame(tick);
    };

    tick();

    // Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 480;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      domEl.removeEventListener('wheel', onWheel);

      if (sceneRef.current.animFrameId) {
        cancelAnimationFrame(sceneRef.current.animFrameId);
      }
      renderer.dispose();
    };
  }, []);

  // Update selected zone visually in 3D
  useEffect(() => {
    const s = sceneRef.current;
    if (!s.zonesMeshes) return;

    s.zonesMeshes.forEach((mesh, id) => {
      const isSelected = id === selectedZoneId;
      const mat = mesh.material as THREE.MeshStandardMaterial;

      if (ndviMode) {
        mat.color.setHex(mesh.userData.ndviColor);
      } else {
        mat.color.setHex(isSelected ? 0x6ee7b7 : mesh.userData.baseColor);
      }

      // Elevate selected zone subtly
      mesh.position.y = isSelected ? 0.2 : 0.02;
    });
  }, [selectedZoneId, ndviMode]);

  // Update water spray visibility
  useEffect(() => {
    if (sceneRef.current.waterParticles) {
      sceneRef.current.waterParticles.visible = isIrrigating;
    }
  }, [isIrrigating]);

  return (
    <div className={`relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mb-8 transition-all ${
      isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : ''
    }`}>
      {/* Top Header Overlay Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-200/90 shadow-sm pointer-events-auto">
          <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold mb-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Interactive 3D Digital Twin</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="font-mono text-slate-500">Three.js WebGL</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            340-Acre Precision Farm Parcel Simulation
          </h3>
          <div className="text-[11px] text-slate-500">
            Click any parcel to inspect localized sensors · Drag to orbit · Scroll to zoom
          </div>
        </div>

        {/* Quick View Controls */}
        <div className="flex items-center gap-2 pointer-events-auto self-end sm:self-auto">
          <button
            onClick={() => setNdviMode(!ndviMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer shadow-sm ${
              ndviMode
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white/95 border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>{ndviMode ? 'NDVI Heatmap ON' : 'True Color'}</span>
          </button>

          <button
            onClick={() => onToggleIrrigation(selectedZoneId)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer shadow-sm ${
              isIrrigating
                ? 'bg-sky-50 border-sky-300 text-sky-800'
                : 'bg-white/95 border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-sky-500" />
            <span>{isIrrigating ? 'Sprinkler Spraying' : 'Activate Sprinkler'}</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-white/95 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl shadow-sm cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand 3D View'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        className={`w-full cursor-grab active:cursor-grabbing bg-slate-50 ${
          isFullscreen ? 'h-full' : 'h-[460px] sm:h-[520px]'
        }`}
      />

      {/* Unified Bottom Control Dock (Following Three.js Skill Directives) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-auto max-w-[95%] pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-200 shadow-md flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-2 shrink-0">
            Camera:
          </span>

          <button
            onClick={() => setCameraPreset('overview')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeCameraView === 'overview'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => setCameraPreset('zone-a')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeCameraView === 'zone-a'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Zone A (Orchard)
          </button>

          <button
            onClick={() => setCameraPreset('zone-b')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeCameraView === 'zone-b'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Zone B (Pivot Corn)
          </button>

          <button
            onClick={() => setCameraPreset('zone-c')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeCameraView === 'zone-c'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Zone C (Greenhouse)
          </button>

          <button
            onClick={() => setCameraPreset('zone-d')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeCameraView === 'zone-d'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Zone D (Vineyard)
          </button>

          <button
            onClick={() => setDroneEnabled(!droneEnabled)}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer border ${
              droneEnabled
                ? 'bg-cyan-50 border-cyan-200 text-cyan-800'
                : 'border-transparent text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Navigation className="w-3.5 h-3.5 text-cyan-600" />
            <span>Drone Scout</span>
          </button>
        </div>
      </div>
    </div>
  );
};
