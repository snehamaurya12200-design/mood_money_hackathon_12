import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import * as THREE from "three";
import { useFinance } from "@/src/context/FinanceContext";
import confetti from "canvas-confetti";

export interface MoneyverseSceneProps {
  className?: string;
  onNavigateToSavings?: () => void;
  onNavigateToChallenge?: () => void;
}

type SelectedEntity = "landmark" | "path" | "commitments" | null;

export function MoneyverseScene({
  className = "",
  onNavigateToSavings,
  onNavigateToChallenge,
}: MoneyverseSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    startingBudget,
    currentDay,
    totalDays,
    availableBalance,
    totalSpent,
    todayConsumed,
    dayCap,
    todayLeft,
    essentialCommitments,
    savingsGoals,
    daysRemaining,
    topUpSavingsGoal,
  } = useFinance();

  const activeGoal = savingsGoals[0] || {
    id: "goal-1",
    title: "Emergency Cushion",
    currentAmount: 1200,
    targetAmount: 2000,
  };

  const savingsPct = Math.min(100, Math.round((activeGoal.currentAmount / activeGoal.targetAmount) * 100));
  const isGoalReached = activeGoal.currentAmount >= activeGoal.targetAmount;
  const isSpendingConstrained = availableBalance < essentialCommitments + (totalDays - currentDay) * 150;

  // Selected object state for HTML detail card
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const [isHoveringInteractive, setIsHoveringInteractive] = useState<boolean>(false);

  // References for Three.js internals across renders
  const sceneStateRef = useRef<{
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    renderer: THREE.WebGLRenderer | null;
    dioramaGroup: THREE.Group | null;
    centralSpireGroup: THREE.Group | null;
    coinRingGroup: THREE.Group | null;
    pathNodesGroup: THREE.Group | null;
    spireLight: THREE.PointLight | null;
    warningLight: THREE.PointLight | null;
    dayMarkerMesh: THREE.Mesh | null;
    raycaster: THREE.Raycaster;
    mouse: THREE.Vector2;
    isDragging: boolean;
    previousMousePosition: { x: number; y: number };
    rotationVelocity: number;
    targetRotationY: number;
    currentRotationY: number;
    targetTiltX: number;
    currentTiltX: number;
    targetCameraPos: THREE.Vector3;
    animationFrameId: number;
    interactiveObjects: THREE.Object3D[];
  }>({
    scene: null,
    camera: null,
    renderer: null,
    dioramaGroup: null,
    centralSpireGroup: null,
    coinRingGroup: null,
    pathNodesGroup: null,
    spireLight: null,
    warningLight: null,
    dayMarkerMesh: null,
    raycaster: new THREE.Raycaster(),
    mouse: new THREE.Vector2(-1000, -1000),
    isDragging: false,
    previousMousePosition: { x: 0, y: 0 },
    rotationVelocity: 0,
    targetRotationY: 0.35,
    currentRotationY: 0.35,
    targetTiltX: 0,
    currentTiltX: 0,
    targetCameraPos: new THREE.Vector3(0, 9.5, 13.5),
    animationFrameId: 0,
    interactiveObjects: [],
  });

  // Check WebGL availability
  useEffect(() => {
    try {
      const testCanvas = document.createElement("canvas");
      const gl = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
      if (!gl) setWebglSupported(false);
    } catch {
      setWebglSupported(false);
    }
  }, []);

  // Update dynamic elements when financial state changes
  useEffect(() => {
    const s = sceneStateRef.current;
    if (!s.dioramaGroup) return;

    // 1. Update Spire scale & glow
    if (s.centralSpireGroup) {
      const scaleFactor = 0.85 + (savingsPct / 100) * 0.45;
      s.centralSpireGroup.scale.set(1, scaleFactor, 1);
    }

    if (s.spireLight) {
      s.spireLight.intensity = 0.8 + (savingsPct / 100) * 1.8;
      s.spireLight.color.setHex(isGoalReached ? 0xf6df79 : 0xe94355);
    }

    // 2. Update Warning Beacon
    if (s.warningLight) {
      s.warningLight.intensity = isSpendingConstrained ? 2.5 : 0.0;
    }

    // 3. Update Coin Ring visibility and count
    if (s.coinRingGroup) {
      s.coinRingGroup.visible = savingsPct > 15;
    }
  }, [savingsPct, isGoalReached, isSpendingConstrained]);

  // Main Three.js Scene Setup & Loop
  useEffect(() => {
    if (!webglSupported) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const state = sceneStateRef.current;

    // SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfff9f1); // Warm Cream background
    scene.fog = new THREE.FogExp2(0xfff9f1, 0.024);
    state.scene = scene;

    // CAMERA
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
    camera.position.copy(state.targetCameraPos);
    camera.lookAt(0, 1.2, 0);
    state.camera = camera;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
      alpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    state.renderer = renderer;

    // ========================================================
    // LIGHTING (Studio Miniature Architectural Setup)
    // ========================================================
    const ambientLight = new THREE.AmbientLight(0xfff9f1, 0.7);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xfff9f1, 0x552139, 0.55);
    scene.add(hemiLight);

    // Key Light with soft studio shadows
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.2);
    keyLight.position.set(9, 15, 10);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 35;
    keyLight.shadow.camera.left = -9;
    keyLight.shadow.camera.right = 9;
    keyLight.shadow.camera.top = 9;
    keyLight.shadow.camera.bottom = -9;
    keyLight.shadow.bias = -0.0006;
    scene.add(keyLight);

    // Warm Ballet-Pink Fill Light
    const fillLight = new THREE.DirectionalLight(0xf2c6d5, 0.85);
    fillLight.position.set(-8, 6, -6);
    scene.add(fillLight);

    // Rim Accent Light (Cherry Red)
    const rimLight = new THREE.DirectionalLight(0xe94355, 0.45);
    rimLight.position.set(0, 10, -12);
    scene.add(rimLight);

    // ========================================================
    // MATERIALS (Cherry Cola Palette)
    // ========================================================
    const matPlatform = new THREE.MeshStandardMaterial({
      color: 0xfff9f1,
      roughness: 0.8,
      metalness: 0.05,
    });

    const matBaseRim = new THREE.MeshStandardMaterial({
      color: 0x552139, // Deep Burgundy
      roughness: 0.5,
      metalness: 0.15,
    });

    const matEspresso = new THREE.MeshStandardMaterial({
      color: 0x292225,
      roughness: 0.6,
      metalness: 0.1,
    });

    const matCherryRed = new THREE.MeshStandardMaterial({
      color: 0xe94355, // Cherry Red
      roughness: 0.35,
      metalness: 0.15,
    });

    const matButterYellow = new THREE.MeshStandardMaterial({
      color: 0xf6df79, // Butter Yellow
      roughness: 0.25,
      metalness: 0.5,
    });

    const matBalletPink = new THREE.MeshStandardMaterial({
      color: 0xf2c6d5,
      roughness: 0.7,
      metalness: 0.05,
    });

    const matGoldCoin = new THREE.MeshStandardMaterial({
      color: 0xf6df79,
      roughness: 0.18,
      metalness: 0.85,
    });

    const matGlass = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
      roughness: 0.1,
      transmission: 0.8,
      thickness: 0.5,
    });

    const matRoad = new THREE.MeshStandardMaterial({
      color: 0xe4d7db,
      roughness: 0.9,
    });

    const matFoliageSage = new THREE.MeshStandardMaterial({
      color: 0x6e8e79,
      roughness: 0.8,
    });

    const matFoliagePink = new THREE.MeshStandardMaterial({
      color: 0xf2c6d5,
      roughness: 0.8,
    });

    // ========================================================
    // DIORAMA GEOMETRY ASSEMBLY
    // ========================================================
    const dioramaGroup = new THREE.Group();
    scene.add(dioramaGroup);
    state.dioramaGroup = dioramaGroup;

    state.interactiveObjects = [];

    // 1. Base Floating Sculptural Pedestal (Circular)
    const baseRadius = 5.6;
    const baseHeight = 0.9;
    const baseGeo = new THREE.CylinderGeometry(baseRadius, baseRadius * 0.94, baseHeight, 64);
    const baseMesh = new THREE.Mesh(baseGeo, matBaseRim);
    baseMesh.position.y = -baseHeight / 2;
    baseMesh.receiveShadow = true;
    baseMesh.castShadow = true;
    dioramaGroup.add(baseMesh);

    // Beveled upper ring
    const lipGeo = new THREE.CylinderGeometry(baseRadius + 0.12, baseRadius, 0.18, 64);
    const lipMesh = new THREE.Mesh(lipGeo, matEspresso);
    lipMesh.position.y = 0.04;
    dioramaGroup.add(lipMesh);

    // Top Platform Surface
    const topSurfaceGeo = new THREE.CylinderGeometry(baseRadius - 0.05, baseRadius - 0.05, 0.06, 64);
    const topSurfaceMesh = new THREE.Mesh(topSurfaceGeo, matPlatform);
    topSurfaceMesh.position.y = 0.06;
    topSurfaceMesh.receiveShadow = true;
    dioramaGroup.add(topSurfaceMesh);

    // Concentric Inset Circles on Platform
    const ring1Geo = new THREE.RingGeometry(3.6, 3.75, 48);
    ring1Geo.rotateX(-Math.PI / 2);
    const ring1 = new THREE.Mesh(ring1Geo, matBalletPink);
    ring1.position.y = 0.095;
    ring1.receiveShadow = true;
    dioramaGroup.add(ring1);

    const ring2Geo = new THREE.RingGeometry(1.8, 1.9, 48);
    ring2Geo.rotateX(-Math.PI / 2);
    const ring2 = new THREE.Mesh(ring2Geo, matRoad);
    ring2.position.y = 0.095;
    ring2.receiveShadow = true;
    dioramaGroup.add(ring2);

    // 2. Central Savings Landmark ("The Cushion Citadel")
    const centralSpireGroup = new THREE.Group();
    centralSpireGroup.position.set(0, 0.1, 0);
    centralSpireGroup.name = "landmark";
    dioramaGroup.add(centralSpireGroup);
    state.centralSpireGroup = centralSpireGroup;
    state.interactiveObjects.push(centralSpireGroup);

    // Citadel Base Plinth (Hexagonal Stepped)
    const plinth1Geo = new THREE.CylinderGeometry(1.3, 1.4, 0.35, 6);
    const plinth1 = new THREE.Mesh(plinth1Geo, matEspresso);
    plinth1.position.y = 0.175;
    plinth1.castShadow = true;
    plinth1.receiveShadow = true;
    centralSpireGroup.add(plinth1);

    const plinth2Geo = new THREE.CylinderGeometry(1.05, 1.2, 0.25, 6);
    const plinth2 = new THREE.Mesh(plinth2Geo, matButterYellow);
    plinth2.position.y = 0.45;
    plinth2.castShadow = true;
    centralSpireGroup.add(plinth2);

    // Glass Rotunda Chamber
    const glassRotundaGeo = new THREE.CylinderGeometry(0.85, 0.85, 1.4, 32);
    const glassRotunda = new THREE.Mesh(glassRotundaGeo, matGlass);
    glassRotunda.position.y = 1.25;
    glassRotunda.castShadow = true;
    centralSpireGroup.add(glassRotunda);

    // Glowing Inner Vault Core (Gold/Cherry Gemstone)
    const coreGeo = new THREE.OctahedronGeometry(0.42, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xf6df79,
      emissive: 0xe94355,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.y = 1.25;
    centralSpireGroup.add(coreMesh);

    // Internal Landmark Point Light
    const spireLight = new THREE.PointLight(0xf6df79, 1.5, 6);
    spireLight.position.set(0, 1.3, 0);
    centralSpireGroup.add(spireLight);
    state.spireLight = spireLight;

    // Sculptural Cherry-Red Crown / Spire Roof
    const crownGeo = new THREE.ConeGeometry(0.9, 1.2, 6);
    const crownMesh = new THREE.Mesh(crownGeo, matCherryRed);
    crownMesh.position.y = 2.45;
    crownMesh.castShadow = true;
    centralSpireGroup.add(crownMesh);

    // Spire Finial Needle
    const finialGeo = new THREE.CylinderGeometry(0.04, 0.08, 0.7, 16);
    const finialMesh = new THREE.Mesh(finialGeo, matButterYellow);
    finialMesh.position.y = 3.25;
    centralSpireGroup.add(finialMesh);

    // Surrounding Gold Coin Milestone Ring
    const coinRingGroup = new THREE.Group();
    coinRingGroup.position.set(0, 1.25, 0);
    centralSpireGroup.add(coinRingGroup);
    state.coinRingGroup = coinRingGroup;

    const coinCountRing = 7;
    for (let c = 0; c < coinCountRing; c++) {
      const angle = (c / coinCountRing) * Math.PI * 2;
      const coinRadius = 1.35;
      const cGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.04, 24);
      cGeo.rotateX(Math.PI / 2);
      const cMesh = new THREE.Mesh(cGeo, matGoldCoin);
      cMesh.position.set(Math.cos(angle) * coinRadius, Math.sin(angle * 2) * 0.15, Math.sin(angle) * coinRadius);
      cMesh.rotation.y = angle;
      coinRingGroup.add(cMesh);
    }

    // 3. The 30-Day Path (Spiral Arc of Miniature Milestone Stones)
    const pathNodesGroup = new THREE.Group();
    pathNodesGroup.name = "path";
    dioramaGroup.add(pathNodesGroup);
    state.pathNodesGroup = pathNodesGroup;
    state.interactiveObjects.push(pathNodesGroup);

    const totalMilestones = 30;
    for (let i = 1; i <= totalMilestones; i++) {
      const t = (i - 1) / (totalMilestones - 1);
      // Sweeping arc from inner radius to outer edge
      const arcAngle = t * Math.PI * 1.65 + 0.35;
      const arcDist = 2.1 + t * 2.8;
      const x = Math.cos(arcAngle) * arcDist;
      const z = Math.sin(arcAngle) * arcDist;

      const isCompleted = i < currentDay;
      const isToday = i === currentDay;

      const nodeSize = isToday ? 0.22 : 0.13;
      const nodeGeo = new THREE.BoxGeometry(nodeSize, 0.08, nodeSize);
      let nodeMat = matBalletPink;

      if (isCompleted) {
        nodeMat = matCherryRed;
      } else if (isToday) {
        nodeMat = matButterYellow;
      }

      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(x, 0.11, z);
      nodeMesh.castShadow = true;
      nodeMesh.receiveShadow = true;
      pathNodesGroup.add(nodeMesh);

      // Current Day Marker Beacon
      if (isToday) {
        const beaconGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.45, 12);
        const beaconMesh = new THREE.Mesh(beaconGeo, matCherryRed);
        beaconMesh.position.set(x, 0.35, z);
        pathNodesGroup.add(beaconMesh);

        const flagGeo = new THREE.BoxGeometry(0.25, 0.15, 0.03);
        const flagMesh = new THREE.Mesh(flagGeo, matButterYellow);
        flagMesh.position.set(x + 0.12, 0.52, z);
        pathNodesGroup.add(flagMesh);
        state.dayMarkerMesh = flagMesh;
      }
    }

    // 4. Miniature Architectural Districts
    // DISTRICT 1: Essential Quarters (Commitments & Pre-allocated Bills)
    const district1 = new THREE.Group();
    district1.position.set(-2.6, 0.08, -2.4);
    dioramaGroup.add(district1);

    const b1Geo = new THREE.BoxGeometry(0.9, 1.4, 0.75);
    const b1 = new THREE.Mesh(b1Geo, matPlatform);
    b1.position.y = 0.7;
    b1.castShadow = true;
    district1.add(b1);

    const b1RoofGeo = new THREE.BoxGeometry(0.95, 0.15, 0.8);
    const b1Roof = new THREE.Mesh(b1RoofGeo, matCherryRed);
    b1Roof.position.y = 1.45;
    b1Roof.castShadow = true;
    district1.add(b1Roof);

    // Companion tower
    const b2Geo = new THREE.BoxGeometry(0.65, 0.95, 0.65);
    const b2 = new THREE.Mesh(b2Geo, matBalletPink);
    b2.position.set(0.85, 0.475, 0.2);
    b2.castShadow = true;
    district1.add(b2);

    const b2RoofGeo = new THREE.ConeGeometry(0.5, 0.6, 4);
    b2RoofGeo.rotateY(Math.PI / 4);
    const b2Roof = new THREE.Mesh(b2RoofGeo, matEspresso);
    b2Roof.position.set(0.85, 1.25, 0.2);
    district1.add(b2Roof);

    // DISTRICT 2: Discretionary Boulevard (Daily Safe Allowance)
    const district2 = new THREE.Group();
    district2.position.set(2.8, 0.08, -1.8);
    dioramaGroup.add(district2);

    const d1Geo = new THREE.CylinderGeometry(0.55, 0.65, 1.1, 16);
    const d1 = new THREE.Mesh(d1Geo, matPlatform);
    d1.position.y = 0.55;
    d1.castShadow = true;
    district2.add(d1);

    const d1CanopyGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.1, 16);
    const d1Canopy = new THREE.Mesh(d1CanopyGeo, matButterYellow);
    d1Canopy.position.y = 1.15;
    district2.add(d1Canopy);

    // Modern townhouse blocks
    const d2Geo = new THREE.BoxGeometry(0.65, 0.8, 1.1);
    const d2 = new THREE.Mesh(d2Geo, matBalletPink);
    d2.position.set(-0.8, 0.4, 0.2);
    d2.castShadow = true;
    district2.add(d2);

    const d2Roof = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 1.15), matCherryRed);
    d2Roof.position.set(-0.8, 0.86, 0.2);
    district2.add(d2Roof);

    // DISTRICT 3: Safe Harbor & Fortress Wall (South side)
    const district3 = new THREE.Group();
    district3.position.set(-1.4, 0.08, 3.2);
    dioramaGroup.add(district3);

    const wallArcGeo = new THREE.BoxGeometry(2.2, 0.45, 0.35);
    wallArcGeo.rotateY(0.4);
    const wallArc = new THREE.Mesh(wallArcGeo, matBaseRim);
    wallArc.position.y = 0.225;
    wallArc.castShadow = true;
    district3.add(wallArc);

    const towerGeo = new THREE.CylinderGeometry(0.4, 0.45, 0.9, 16);
    const tower = new THREE.Mesh(towerGeo, matPlatform);
    tower.position.set(-1.1, 0.45, -0.2);
    tower.castShadow = true;
    district3.add(tower);

    const towerCap = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.45, 16), matButterYellow);
    towerCap.position.set(-1.1, 1.05, -0.2);
    district3.add(towerCap);

    // Warning Beacon Light (Pulses if spending pressure is high)
    const warningLight = new THREE.PointLight(0xe94355, 0.0, 5);
    warningLight.position.set(-1.4, 1.2, 3.2);
    scene.add(warningLight);
    state.warningLight = warningLight;

    // 5. Stylized Trees and Foliage Accents
    const treePositions = [
      [-3.4, 0.08, -0.5, "sage"],
      [-2.0, 0.08, -3.8, "pink"],
      [-0.8, 0.08, -3.2, "sage"],
      [1.5, 0.08, -3.5, "pink"],
      [3.8, 0.08, 0.2, "sage"],
      [3.2, 0.08, 2.2, "sage"],
      [1.8, 0.08, 3.6, "pink"],
      [-3.2, 0.08, 2.0, "pink"],
    ];

    treePositions.forEach(([tx, ty, tz, type]) => {
      const tree = new THREE.Group();
      tree.position.set(tx as number, ty as number, tz as number);
      dioramaGroup.add(tree);

      const trunkGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.35, 8);
      const trunk = new THREE.Mesh(trunkGeo, matEspresso);
      trunk.position.y = 0.175;
      tree.add(trunk);

      const crownMat = type === "pink" ? matFoliagePink : matFoliageSage;
      const crownType = Math.random() > 0.5 ? "cone" : "sphere";

      if (crownType === "cone") {
        const cGeo = new THREE.ConeGeometry(0.24, 0.55, 7);
        const cM = new THREE.Mesh(cGeo, crownMat);
        cM.position.y = 0.55;
        cM.castShadow = true;
        tree.add(cM);
      } else {
        const sGeo = new THREE.SphereGeometry(0.22, 10, 10);
        const sM = new THREE.Mesh(sGeo, crownMat);
        sM.position.y = 0.48;
        sM.castShadow = true;
        tree.add(sM);
      }
    });

    // ========================================================
    // INTERACTION LISTENERS (Drag, Parallax, Raycast Picking)
    // ========================================================
    const handlePointerDown = (e: PointerEvent) => {
      state.isDragging = true;
      state.previousMousePosition = { x: e.clientX, y: e.clientY };
      state.rotationVelocity = 0;
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX;
      const clientY = e.clientY;

      // Update Normalized Device Coordinates for Raycaster
      state.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      state.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      // Subtle parallax tilt when not dragging
      if (!state.isDragging) {
        state.targetTiltX = (state.mouse.y * 0.08);
      }

      // Drag rotation
      if (state.isDragging) {
        const deltaX = clientX - state.previousMousePosition.x;
        state.rotationVelocity = deltaX * 0.007;
        state.targetRotationY += state.rotationVelocity;
        state.previousMousePosition = { x: clientX, y: clientY };
      }

      // Raycast hover test
      state.raycaster.setFromCamera(state.mouse, camera);
      const intersects = state.raycaster.intersectObjects(state.interactiveObjects, true);
      setIsHoveringInteractive(intersects.length > 0);
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!state.isDragging) return;
      state.isDragging = false;

      // Click detection if movement was tiny (< 4px)
      const moveDistance = Math.hypot(
        e.clientX - state.previousMousePosition.x,
        e.clientY - state.previousMousePosition.y
      );

      if (moveDistance < 5) {
        state.raycaster.setFromCamera(state.mouse, camera);
        const intersects = state.raycaster.intersectObjects(state.interactiveObjects, true);
        if (intersects.length > 0) {
          let topObj: THREE.Object3D | null = intersects[0].object;
          while (topObj && topObj.parent && topObj.parent !== dioramaGroup) {
            topObj = topObj.parent;
          }
          if (topObj && topObj.name === "landmark") {
            setSelectedEntity("landmark");
          } else if (topObj && topObj.name === "path") {
            setSelectedEntity("path");
          }
        }
      }
    };

    const handlePointerLeave = () => {
      state.isDragging = false;
      state.targetTiltX = 0;
      state.mouse.set(-1000, -1000);
      setIsHoveringInteractive(false);
    };

    container.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    container.addEventListener("pointerleave", handlePointerLeave);

    // RESIZE OBSERVER
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    // ========================================================
    // RENDER ANIMATION LOOP (Using supported THREE.Timer API)
    // ========================================================
    const timer = new THREE.Timer();
    timer.connect(document);

    const animate = (timestamp: number) => {
      state.animationFrameId = requestAnimationFrame(animate);

      timer.update(timestamp);
      const elapsedTime = timer.getElapsed();

      // Smooth horizontal rotation interpolation
      if (autoRotate && !state.isDragging) {
        state.targetRotationY += 0.0022;
      }

      state.currentRotationY += (state.targetRotationY - state.currentRotationY) * 0.08;
      state.currentTiltX += (state.targetTiltX - state.currentTiltX) * 0.05;

      dioramaGroup.rotation.y = state.currentRotationY;
      dioramaGroup.rotation.x = state.currentTiltX;

      // Gentle floating animation for gold coin ring
      if (state.coinRingGroup) {
        state.coinRingGroup.rotation.y = elapsedTime * 0.45;
        state.coinRingGroup.position.y = 1.25 + Math.sin(elapsedTime * 2.0) * 0.06;
      }

      // Gentle pulsation for current day marker
      if (state.dayMarkerMesh) {
        state.dayMarkerMesh.position.y = 0.52 + Math.sin(elapsedTime * 4.0) * 0.04;
      }

      // Warning beacon pulsing
      if (state.warningLight && isSpendingConstrained) {
        state.warningLight.intensity = 1.0 + Math.sin(elapsedTime * 6.0) * 1.0;
      }

      // Camera lerp
      camera.position.lerp(state.targetCameraPos, 0.05);
      camera.lookAt(0, 1.2, 0);

      renderer.render(scene, camera);
    };

    state.animationFrameId = requestAnimationFrame(animate);

    // CLEANUP
    return () => {
      timer.disconnect();
      cancelAnimationFrame(state.animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      container.removeEventListener("pointerleave", handlePointerLeave);

      // Recursive disposal of Three.js objects
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else if (mesh.material) {
            mesh.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, [webglSupported, autoRotate, isSpendingConstrained, currentDay]);

  // Reset Camera View to Default Beauty Angle
  const handleResetCamera = useCallback(() => {
    const s = sceneStateRef.current;
    s.targetRotationY = 0.35;
    s.targetTiltX = 0;
    s.targetCameraPos.set(0, 9.5, 13.5);
    setAutoRotate(true);
  }, []);

  // Quick Deposit Confetti
  const handleDepositToVault = (amount: number) => {
    topUpSavingsGoal(activeGoal.id, amount);
    confetti({
      particleCount: 45,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#E94355", "#F6DF79", "#552139", "#FFFFFF"],
    });
  };

  return (
    <div className={`relative w-full rounded-2xl border-[2px] border-[#292225] border-b-[6px] border-b-[#552139] shadow-[0_8px_0px_#292225,0_16px_32px_rgba(41,34,37,0.16)] bg-[#FFF9F1] overflow-hidden select-none ${className}`}>
      {/* ======================================================== */}
      {/* 1. TOP EDITORIAL BANNER & CONTROLS STRIP */}
      {/* ======================================================== */}
      <div className="p-4 sm:p-6 border-b-[2px] border-[#292225] bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 bg-[#E94355] rotate-45 border-[1px] border-[#292225] shadow-[1px_1px_0px_#292225]" />
            <span className="font-label-caps text-xs text-[#552139] uppercase font-bold tracking-widest">
              YOUR FINANCIAL WORLD • 3D DIORAMA
            </span>
            <span className="hidden sm:inline-block text-[#552139]/40">•</span>
            <span className="font-label-caps text-[10px] bg-[#F6DF79] text-[#292225] px-2 py-0.5 rounded border border-[#292225] font-extrabold uppercase">
              The Moneyverse
            </span>
          </div>

          <h2 className="font-display-hero text-2xl sm:text-3xl lg:text-4xl text-[#292225] font-extrabold tracking-tight">
            Small choices. A whole new world.
          </h2>
          <p className="font-body-md text-sm text-[#5a4040] max-w-xl mt-0.5">
            Every decision shapes your 30-day journey. Rotate the diorama, click the central savings citadel, and watch your world flourish.
          </p>
        </div>

        {/* Viewport Control Action Bar */}
        <div className="flex items-center gap-2 self-start md:self-center flex-wrap">
          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1.5 rounded-lg border-[1.5px] border-[#292225] shadow-[1.5px_1.5px_0px_#292225] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              autoRotate ? "bg-[#F6DF79] text-[#292225]" : "bg-white text-[#552139]"
            }`}
            title="Toggle continuous gentle rotation"
          >
            <span className="material-symbols-outlined text-sm">
              {autoRotate ? "sync" : "pause"}
            </span>
            <span>{autoRotate ? "Auto-Orbit: ON" : "Paused"}</span>
          </button>

          <button
            type="button"
            onClick={handleResetCamera}
            className="btn-3d btn-3d-white px-3 py-1.5 text-xs font-bold flex items-center gap-1.5"
            title="Reset diorama angle to standard view"
          >
            <span className="material-symbols-outlined text-sm">restart_alt</span>
            <span>Reset View</span>
          </button>

          {onNavigateToSavings && (
            <button
              type="button"
              onClick={onNavigateToSavings}
              className="btn-3d btn-3d-cherry px-3 py-1.5 text-xs font-bold text-white flex items-center gap-1"
            >
              <span>Savings Lab</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. THE 3D THREE.JS CANVAS STAGE */}
      {/* ======================================================== */}
      <div
        ref={containerRef}
        className={`relative w-full h-[380px] sm:h-[460px] lg:h-[520px] bg-[#FFF9F1] overflow-hidden ${
          isHoveringInteractive ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"
        }`}
        style={{ touchAction: "pan-y" }}
      >
        {webglSupported ? (
          <canvas ref={canvasRef} className="w-full h-full block select-none" />
        ) : (
          /* Graceful WebGL Fallback */
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[#FFF9F1]">
            <div className="w-16 h-16 rounded-2xl bg-[#E94355] border-[2px] border-[#292225] shadow-[4px_4px_0px_#292225] flex items-center justify-center text-white mb-4">
              <span className="material-symbols-outlined text-3xl">public</span>
            </div>
            <h3 className="font-headline-sm text-lg font-bold text-[#292225]">
              The Moneyverse Canvas
            </h3>
            <p className="text-xs text-[#5a4040] max-w-sm mt-1">
              Your device does not support WebGL hardware acceleration. Your challenge metrics and savings vaults remain 100% active.
            </p>
          </div>
        )}

        {/* Ambient Overlay Hint Badge */}
        <div className="absolute top-3 left-3 pointer-events-none z-10 flex items-center gap-2">
          <div className="bg-white/90 backdrop-blur-sm border-[1.5px] border-[#292225] shadow-[2px_2px_0px_#292225] px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold text-[#292225]">
            <span className="w-2 h-2 rounded-full bg-[#E94355] animate-ping" />
            <span className="font-label-caps text-[10px] uppercase">
              Drag to Orbit • Tap Citadel to Inspect
            </span>
          </div>

          {isSpendingConstrained && (
            <div className="bg-[#E94355] text-white border-[1.5px] border-[#292225] shadow-[2px_2px_0px_#292225] px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold animate-pulse">
              <span className="material-symbols-outlined text-[15px]">warning</span>
              <span className="font-label-caps text-[10px] uppercase">Tight Spend Pressure</span>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 3. INTERACTIVE HTML INSPECTION CARDS */}
        {/* ======================================================== */}
        {/* LANDMARK INSPECTION MODAL */}
        {selectedEntity === "landmark" && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-84 z-20 bg-white border-[2px] border-[#292225] border-b-[5px] border-b-[#552139] rounded-xl shadow-[0_6px_0px_#292225,0_12px_24px_rgba(41,34,37,0.18)] p-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#292225]/15 mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#E94355] text-lg">shield</span>
                <span className="font-headline-sm text-sm font-bold text-[#292225]">
                  Central Savings Citadel
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEntity(null)}
                className="w-6 h-6 rounded-full bg-[#FFF9F1] border border-[#292225] flex items-center justify-center text-xs font-bold hover:bg-[#E94355] hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#5a4040] mb-3">
              Your protected capital fortress. As savings accumulate, the spire grows taller and orbits gold coins.
            </p>

            <div className="bg-[#FFF9F1] p-2.5 rounded-lg border border-[#292225] mb-3">
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-label-caps text-[10px] text-[#552139] uppercase font-bold">
                  {activeGoal.title}
                </span>
                <span className="font-label-caps text-[11px] font-extrabold text-[#E94355]">
                  {savingsPct}% Funded
                </span>
              </div>
              <p className="font-headline-sm text-base font-extrabold text-[#292225]">
                ₹{activeGoal.currentAmount.toLocaleString()}
                <span className="text-xs text-[#552139]/60 font-semibold ml-1">
                  / ₹{activeGoal.targetAmount.toLocaleString()}
                </span>
              </p>
              <div className="w-full h-2 bg-white rounded-full border border-[#292225] mt-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#E94355] to-[#F6DF79] transition-all duration-500"
                  style={{ width: `${savingsPct}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDepositToVault(100)}
                className="btn-3d btn-3d-yellow flex-1 py-1.5 text-xs font-bold"
              >
                + ₹100 Vault
              </button>
              {onNavigateToSavings && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEntity(null);
                    onNavigateToSavings();
                  }}
                  className="btn-3d btn-3d-cherry px-3 py-1.5 text-xs font-bold text-white"
                >
                  Lab →
                </button>
              )}
            </div>
          </div>
        )}

        {/* 30-DAY PATH INSPECTION MODAL */}
        {selectedEntity === "path" && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-84 z-20 bg-white border-[2px] border-[#292225] border-b-[5px] border-b-[#552139] rounded-xl shadow-[0_6px_0px_#292225,0_12px_24px_rgba(41,34,37,0.18)] p-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#292225]/15 mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#F6DF79] text-lg">flag</span>
                <span className="font-headline-sm text-sm font-bold text-[#292225]">
                  30-Day Survival Path
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEntity(null)}
                className="w-6 h-6 rounded-full bg-[#FFF9F1] border border-[#292225] flex items-center justify-center text-xs font-bold hover:bg-[#E94355] hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#5a4040]">Current Position:</span>
                <span className="font-bold text-[#292225]">Day {currentDay} of {totalDays}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#5a4040]">Days Remaining:</span>
                <span className="font-bold text-[#E94355]">{daysRemaining} days</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#5a4040]">Daily Safe-to-Spend:</span>
                <span className="font-bold text-[#292225]">₹{Math.max(0, Math.round((availableBalance - essentialCommitments) / Math.max(1, daysRemaining)))} / day</span>
              </div>
            </div>

            {onNavigateToChallenge && (
              <button
                type="button"
                onClick={() => {
                  setSelectedEntity(null);
                  onNavigateToChallenge();
                }}
                className="btn-3d btn-3d-yellow w-full py-2 text-xs font-bold"
              >
                Open Challenge HQ Matrix →
              </button>
            )}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 4. COMPACT HTML FINANCIAL SUMMARY STRIP (Beneath 3D Canvas) */}
      {/* ======================================================== */}
      <div className="p-4 sm:p-6 bg-white border-t-[2px] border-[#292225] grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Available Balance */}
        <div className="p-3.5 bg-[#FFF9F1] border-[1.5px] border-[#292225] rounded-xl shadow-[2px_2px_0px_#292225]">
          <div className="flex items-center justify-between mb-1">
            <span className="font-label-caps text-[10px] text-[#552139] uppercase font-bold">
              Available Runway
            </span>
            <span className="text-[10px] font-bold text-[#E94355]">
              ₹{totalSpent.toLocaleString()} Spent
            </span>
          </div>
          <p className="font-headline-lg text-xl sm:text-2xl font-extrabold text-[#292225]">
            ₹{availableBalance.toLocaleString()}
          </p>
          <p className="text-[11px] text-[#5a4040] mt-0.5">
            Of initial ₹{startingBudget.toLocaleString()} challenge capital
          </p>
        </div>

        {/* Metric 2: Days Remaining & Pace */}
        <div className="p-3.5 bg-[#F6DF79]/35 border-[1.5px] border-[#292225] rounded-xl shadow-[2px_2px_0px_#292225]">
          <div className="flex items-center justify-between mb-1">
            <span className="font-label-caps text-[10px] text-[#552139] uppercase font-bold">
              Challenge Cadence
            </span>
            <span className="text-[10px] font-bold text-[#292225]">
              Day {currentDay} of {totalDays}
            </span>
          </div>
          <p className="font-headline-lg text-xl sm:text-2xl font-extrabold text-[#292225]">
            {daysRemaining} Days Left
          </p>
          <p className="text-[11px] text-[#5a4040] mt-0.5">
            ₹{todayLeft} allowance remaining tonight
          </p>
        </div>

        {/* Metric 3: Protected Savings Citadel */}
        <div className="p-3.5 bg-[#F2C6D5]/40 border-[1.5px] border-[#292225] rounded-xl shadow-[2px_2px_0px_#292225]">
          <div className="flex items-center justify-between mb-1">
            <span className="font-label-caps text-[10px] text-[#552139] uppercase font-bold">
              Protected Citadel
            </span>
            <span className="text-[10px] font-bold text-[#552139]">
              {savingsPct}% Vaulted
            </span>
          </div>
          <p className="font-headline-lg text-xl sm:text-2xl font-extrabold text-[#292225]">
            ₹{activeGoal.currentAmount.toLocaleString()}
          </p>
          <p className="text-[11px] text-[#5a4040] mt-0.5">
            Target: ₹{activeGoal.targetAmount.toLocaleString()} firewall
          </p>
        </div>
      </div>
    </div>
  );
}

export default MoneyverseScene;
