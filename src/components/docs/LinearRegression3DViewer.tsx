'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';

// Synthetic default dataset
const INITIAL_DATA_POINTS = [
  { x: -2.5, y: -3.8 },
  { x: -2.0, y: -2.2 },
  { x: -1.5, y: -2.8 },
  { x: -1.0, y: -0.9 },
  { x: -0.5, y: -0.4 },
  { x: 0.0, y: 0.6 },
  { x: 0.5, y: 1.1 },
  { x: 1.0, y: 2.3 },
  { x: 1.5, y: 2.1 },
  { x: 2.0, y: 3.7 },
  { x: 2.5, y: 4.4 },
  { x: 3.0, y: 5.2 },
];

export interface LinearRegression3DViewerProps {
  themeMode?: 'cream-black' | 'all-black' | 'cream-white';
}

export default function LinearRegression3DViewer({ themeMode = 'cream-black' }: LinearRegression3DViewerProps) {
  const [dataPoints, setDataPoints] = useState(INITIAL_DATA_POINTS);

  // Compute OLS Optimal (Closed-Form Analytical Solution)
  const olsSolution = useMemo(() => {
    const n = dataPoints.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;
    let sumY2 = 0;

    for (const p of dataPoints) {
      sumX += p.x;
      sumY += p.y;
      sumXY += p.x * p.y;
      sumX2 += p.x * p.x;
      sumY2 += p.y * p.y;
    }

    const meanX = sumX / n;
    const meanY = sumY / n;
    const num = sumXY - n * meanX * meanY;
    const den = sumX2 - n * meanX * meanX;

    const wOpt = den !== 0 ? num / den : 1;
    const bOpt = meanY - wOpt * meanX;

    // Minimum loss
    let minLoss = 0;
    let ssTot = 0;
    for (const p of dataPoints) {
      const pred = wOpt * p.x + bOpt;
      minLoss += Math.pow(p.y - pred, 2);
      ssTot += Math.pow(p.y - meanY, 2);
    }
    minLoss = minLoss / (2 * n);

    return {
      wOpt: parseFloat(wOpt.toFixed(3)),
      bOpt: parseFloat(bOpt.toFixed(3)),
      meanX: parseFloat(meanX.toFixed(3)),
      meanY: parseFloat(meanY.toFixed(3)),
      minLoss: parseFloat(minLoss.toFixed(4)),
      ssTot,
    };
  }, [dataPoints]);

  // Current Parameters (Slope w and Intercept b)
  const [w, setW] = useState<number>(0.2); // Start suboptimal to see descent
  const [b, setB] = useState<number>(-1.5);
  const [learningRate, setLearningRate] = useState<number>(0.08);
  const [isRunningGD, setIsRunningGD] = useState<boolean>(false);
  const [iteration, setIteration] = useState<number>(0);
  const [trajectory, setTrajectory] = useState<Array<{ w: number; b: number; loss: number }>>([]);
  const [activeTab, setActiveTab] = useState<'both' | '3d' | '2d'>('both');

  // Three.js Canvas Ref & 2D Canvas Ref
  const mount3DRef = useRef<HTMLDivElement>(null);
  const canvas2DRef = useRef<HTMLCanvasElement>(null);
  const threeStateRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    ballMesh: THREE.Mesh;
    trailMesh: THREE.Line;
    surfaceMesh: THREE.Mesh;
    isDragging: boolean;
    prevMousePos: { x: number; y: number };
    rotX: number;
    rotY: number;
    distance: number;
    reqId: number | null;
  } | null>(null);

  // Compute Loss and Gradients at current (w, b)
  const metrics = useMemo(() => {
    const n = dataPoints.length;
    let loss = 0;
    let gradW = 0;
    let gradB = 0;
    let ssRes = 0;

    for (const p of dataPoints) {
      const pred = w * p.x + b;
      const err = p.y - pred;
      loss += err * err;
      ssRes += err * err;
      gradW += -err * p.x;
      gradB += -err;
    }

    loss = loss / (2 * n);
    gradW = gradW / n;
    gradB = gradB / n;

    // R^2 Score
    const r2 = olsSolution.ssTot > 0 ? 1 - ssRes / olsSolution.ssTot : 0;

    return {
      loss: parseFloat(loss.toFixed(4)),
      gradW: parseFloat(gradW.toFixed(4)),
      gradB: parseFloat(gradB.toFixed(4)),
      gradNorm: parseFloat(Math.sqrt(gradW * gradW + gradB * gradB).toFixed(4)),
      r2: parseFloat(r2.toFixed(3)),
    };
  }, [w, b, dataPoints, olsSolution]);

  // Single Gradient Descent Step
  const stepGradientDescent = useCallback(() => {
    const nextW = w - learningRate * metrics.gradW;
    const nextB = b - learningRate * metrics.gradB;

    setW(parseFloat(nextW.toFixed(4)));
    setB(parseFloat(nextB.toFixed(4)));
    setIteration((prev) => prev + 1);

    setTrajectory((prev) => {
      const nextTraj = [...prev, { w: nextW, b: nextB, loss: metrics.loss }];
      return nextTraj.slice(-100); // keep last 100
    });
  }, [w, b, learningRate, metrics]);

  // Reset to initial suboptimal point
  const handleReset = useCallback(() => {
    setIsRunningGD(false);
    setW(0.2);
    setB(-1.5);
    setIteration(0);
    setTrajectory([]);
  }, []);

  // Jump to exact OLS optimum
  const handleJumpToOptimum = useCallback(() => {
    setIsRunningGD(false);
    setW(olsSolution.wOpt);
    setB(olsSolution.bOpt);
    setIteration(0);
    setTrajectory((prev) => [...prev, { w: olsSolution.wOpt, b: olsSolution.bOpt, loss: olsSolution.minLoss }]);
  }, [olsSolution]);

  // Randomize data points
  const handleRandomizeData = useCallback(() => {
    setIsRunningGD(false);
    const newPoints = [];
    const slope = 0.8 + Math.random() * 1.6;
    const intercept = -1 + Math.random() * 2;
    for (let x = -2.5; x <= 3.0; x += 0.5) {
      const noise = (Math.random() - 0.5) * 1.5;
      newPoints.push({
        x: parseFloat(x.toFixed(1)),
        y: parseFloat((slope * x + intercept + noise).toFixed(2)),
      });
    }
    setDataPoints(newPoints);
    setW(0.2);
    setB(-1.5);
    setIteration(0);
    setTrajectory([]);
  }, []);

  // Timer loop for Gradient Descent
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunningGD) {
      timer = setInterval(() => {
        // Stop if gradient is tiny (converged)
        if (metrics.gradNorm < 0.005) {
          setIsRunningGD(false);
        } else {
          stepGradientDescent();
        }
      }, 50);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunningGD, metrics.gradNorm, stepGradientDescent]);

  // =========================================================================
  // 1. THREE.JS 3D SCENE SETUP & PARABOLIC BOWL RENDER
  // =========================================================================
  useEffect(() => {
    if (!mount3DRef.current) return;
    const container = mount3DRef.current;
    const width = container.clientWidth || 480;
    const height = 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(themeMode === 'all-black' ? 0x09090b : 0xf9f7f2);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Coordinate ranges around OLS minimum
    const wCenter = olsSolution.wOpt;
    const bCenter = olsSolution.bOpt;
    const spanW = 3.5;
    const spanB = 4.0;
    const gridRes = 36;

    // Create 3D Parabolic Loss Surface Geometry J(w, b)
    const surfaceGeo = new THREE.PlaneGeometry(spanW * 2, spanB * 2, gridRes, gridRes);
    const posAttr = surfaceGeo.attributes.position;
    const colorAttr = new Float32Array(posAttr.count * 3);

    // Compute Loss Height & Color for each vertex
    const n = dataPoints.length;
    let maxVisualHeight = 0;

    for (let i = 0; i < posAttr.count; i++) {
      const u = posAttr.getX(i); // relative to wCenter
      const v = posAttr.getY(i); // relative to bCenter

      const vertexW = wCenter + u;
      const vertexB = bCenter + v;

      // Compute loss J(vertexW, vertexB)
      let vLoss = 0;
      for (const p of dataPoints) {
        const err = p.y - (vertexW * p.x + vertexB);
        vLoss += err * err;
      }
      vLoss = vLoss / (2 * n);

      // Height representation
      const excessLoss = Math.max(0, vLoss - olsSolution.minLoss);
      const heightVal = excessLoss * 0.45;
      posAttr.setZ(i, heightVal); // Z becomes vertical when rotated
      if (heightVal > maxVisualHeight) maxVisualHeight = heightVal;

      // Color mapping: Purple/cyan at base -> amber/red at peaks
      const t = Math.min(1, heightVal / 8);
      let r = 0.2 + t * 0.8;
      let g = 0.5 - t * 0.3;
      let bCol = 0.9 - t * 0.7;

      if (themeMode === 'all-black') {
        r = 0.3 + t * 0.7;
        g = 0.2 + (1 - t) * 0.6;
        bCol = 0.9 - t * 0.5;
      }

      colorAttr[i * 3] = r;
      colorAttr[i * 3 + 1] = g;
      colorAttr[i * 3 + 2] = bCol;
    }

    surfaceGeo.setAttribute('color', new THREE.BufferAttribute(colorAttr, 3));
    surfaceGeo.computeVertexNormals();

    // Wireframe overlay + translucent surface
    const surfaceMat = new THREE.MeshPhongMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      wireframe: false,
      shininess: 40,
      transparent: true,
      opacity: 0.92,
    });

    const surfaceMesh = new THREE.Mesh(surfaceGeo, surfaceMat);
    surfaceMesh.rotation.x = -Math.PI / 2; // Flat on X-Z plane, height on Y
    scene.add(surfaceMesh);

    // Wireframe grid lines on top of bowl
    const wireMat = new THREE.MeshBasicMaterial({
      color: themeMode === 'all-black' ? 0xffffff : 0x18181b,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const wireMesh = new THREE.Mesh(surfaceGeo, wireMat);
    wireMesh.rotation.x = -Math.PI / 2;
    scene.add(wireMesh);

    // Base Reference Plane & Axes
    const gridHelper = new THREE.GridHelper(8, 16, 0x10b981, themeMode === 'all-black' ? 0x27272f : 0xd1cbbe);
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);

    // Current Parameter Marker: 3D Glowing Ball
    const ballGeo = new THREE.SphereGeometry(0.24, 24, 24);
    const ballMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8,
    });
    const ballMesh = new THREE.Mesh(ballGeo, ballMat);
    scene.add(ballMesh);

    // Trajectory Line
    const maxTrailPoints = 120;
    const trailPositions = new Float32Array(maxTrailPoints * 3);
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    const trailMat = new THREE.LineBasicMaterial({
      color: 0xf59e0b,
      linewidth: 3,
      transparent: true,
      opacity: 0.85,
    });
    const trailMesh = new THREE.Line(trailGeo, trailMat);
    scene.add(trailMesh);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 12, 7);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 2, 20);
    pointLight.position.set(0, 4, 0);
    scene.add(pointLight);

    // Camera initial position & Orbit state
    let rotX = 0.55;
    let rotY = 0.75;
    let distance = 12;

    const updateCamera = () => {
      camera.position.x = distance * Math.sin(rotY) * Math.cos(rotX);
      camera.position.y = distance * Math.sin(rotX);
      camera.position.z = distance * Math.cos(rotY) * Math.cos(rotX);
      camera.lookAt(0, 1.2, 0);
    };
    updateCamera();

    // Mouse / Touch Orbit Interaction
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMousePos.x;
      const dy = e.clientY - prevMousePos.y;
      prevMousePos = { x: e.clientX, y: e.clientY };

      rotY += dx * 0.008;
      rotX += dy * 0.008;
      rotX = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, rotX));
      updateCamera();
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      distance += e.deltaY * 0.008;
      distance = Math.max(5, Math.min(22, distance));
      updateCamera();
    };

    // Touch support
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - prevMousePos.x;
      const dy = e.touches[0].clientY - prevMousePos.y;
      prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      rotY += dx * 0.01;
      rotX += dy * 0.01;
      rotX = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, rotX));
      updateCamera();
    };

    const handleTouchEnd = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    domElement.addEventListener('wheel', handleWheel, { passive: false });
    domElement.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    // Animation loop
    const animate = () => {
      const reqId = requestAnimationFrame(animate);
      if (threeStateRef.current) threeStateRef.current.reqId = reqId;
      renderer.render(scene, camera);
    };
    const reqId = requestAnimationFrame(animate);

    threeStateRef.current = {
      scene,
      camera,
      renderer,
      ballMesh,
      trailMesh,
      surfaceMesh,
      isDragging,
      prevMousePos,
      rotX,
      rotY,
      distance,
      reqId,
    };

    return () => {
      cancelAnimationFrame(reqId);
      domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      domElement.removeEventListener('wheel', handleWheel);
      domElement.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      surfaceGeo.dispose();
      surfaceMat.dispose();
      ballGeo.dispose();
      ballMat.dispose();
      renderer.dispose();
    };
  }, [dataPoints, olsSolution, themeMode]);

  // Update 3D Ball & Trajectory when (w, b) change
  useEffect(() => {
    if (!threeStateRef.current) return;
    const { ballMesh, trailMesh } = threeStateRef.current;

    const u = w - olsSolution.wOpt;
    const v = b - olsSolution.bOpt;
    const excessLoss = Math.max(0, metrics.loss - olsSolution.minLoss);
    const heightY = excessLoss * 0.45;

    // Position ball on top of bowl surface
    ballMesh.position.set(u, heightY + 0.15, v);

    // Update trajectory points in 3D
    if (trajectory.length > 1) {
      const posAttr = trailMesh.geometry.attributes.position;
      const count = Math.min(trajectory.length, 120);
      for (let i = 0; i < count; i++) {
        const pt = trajectory[i];
        const ptU = pt.w - olsSolution.wOpt;
        const ptV = pt.b - olsSolution.bOpt;
        const ptH = Math.max(0, pt.loss - olsSolution.minLoss) * 0.45;
        posAttr.setXYZ(i, ptU, ptH + 0.08, ptV);
      }
      trailMesh.geometry.setDrawRange(0, count);
      posAttr.needsUpdate = true;
    }
  }, [w, b, metrics.loss, olsSolution, trajectory]);

  // =========================================================================
  // 2. 2D DATA SPACE CANVAS RENDER (Scatter + Regression Line + Residuals)
  // =========================================================================
  useEffect(() => {
    if (!canvas2DRef.current) return;
    const canvas = canvas2DRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background
    ctx.fillStyle = themeMode === 'all-black' ? '#09090b' : '#faf7f2';
    ctx.fillRect(0, 0, width, height);

    // Coordinate bounds
    const minX = -3.5;
    const maxX = 4.0;
    const minY = -5.0;
    const maxY = 6.5;

    const toScreenX = (xVal: number) => ((xVal - minX) / (maxX - minX)) * (width - 60) + 40;
    const toScreenY = (yVal: number) => height - 30 - ((yVal - minY) / (maxY - minY)) * (height - 60);

    // Subtle Grid
    ctx.strokeStyle = themeMode === 'all-black' ? '#27272f' : '#e5dfd3';
    ctx.lineWidth = 1;
    for (let gx = -3; gx <= 3; gx++) {
      ctx.beginPath();
      ctx.moveTo(toScreenX(gx), 10);
      ctx.lineTo(toScreenX(gx), height - 20);
      ctx.stroke();
    }
    for (let gy = -4; gy <= 6; gy += 2) {
      ctx.beginPath();
      ctx.moveTo(30, toScreenY(gy));
      ctx.lineTo(width - 20, toScreenY(gy));
      ctx.stroke();
    }

    // Axes lines
    ctx.strokeStyle = themeMode === 'all-black' ? '#52525b' : '#a1a1aa';
    ctx.lineWidth = 1.5;
    // X-axis (y = 0)
    ctx.beginPath();
    ctx.moveTo(30, toScreenY(0));
    ctx.lineTo(width - 20, toScreenY(0));
    ctx.stroke();
    // Y-axis (x = 0)
    ctx.beginPath();
    ctx.moveTo(toScreenX(0), 10);
    ctx.lineTo(toScreenX(0), height - 20);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = themeMode === 'all-black' ? '#e4e4e7' : '#71717a';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText('x', width - 20, toScreenY(0) - 6);
    ctx.fillText('y', toScreenX(0) + 6, 20);

    // Optimal OLS Line (Dashed subtle reference)
    ctx.strokeStyle = themeMode === 'all-black' ? '#3f3f46' : '#d4cebe';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(toScreenX(minX), toScreenY(olsSolution.wOpt * minX + olsSolution.bOpt));
    ctx.lineTo(toScreenX(maxX), toScreenY(olsSolution.wOpt * maxX + olsSolution.bOpt));
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Residual Error Lines (e_i = y_i - y_hat)
    ctx.strokeStyle = themeMode === 'all-black' ? '#f43f5e' : '#e11d48';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([2, 3]);
    for (const p of dataPoints) {
      const predY = w * p.x + b;
      ctx.beginPath();
      ctx.moveTo(toScreenX(p.x), toScreenY(p.y));
      ctx.lineTo(toScreenX(p.x), toScreenY(predY));
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw Current Fitted Regression Line: y_hat = w*x + b
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(toScreenX(minX), toScreenY(w * minX + b));
    ctx.lineTo(toScreenX(maxX), toScreenY(w * maxX + b));
    ctx.stroke();

    // Centroid Point (x_bar, y_bar)
    const cx = toScreenX(olsSolution.meanX);
    const cy = toScreenY(olsSolution.meanY);
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = themeMode === 'all-black' ? '#ffffff' : '#18181b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw Data Points (x_i, y_i)
    for (const p of dataPoints) {
      const px = toScreenX(p.x);
      const py = toScreenY(p.y);

      ctx.fillStyle = themeMode === 'all-black' ? '#ffffff' : '#18181b';
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }, [dataPoints, w, b, olsSolution, themeMode]);

  return (
    <div className="simulation-card-wrap">
      {/* Simulation Header */}
      <div className="sim-header-row">
        <div className="sim-title-group">
          <div className="sim-badge-row">
            <span className="sim-live-indicator">
              <span className="sim-dot-pulse"></span>
              3D Interactive Simulation
            </span>
            <span className="sim-math-badge">Ordinary Least Squares & Gradient Descent</span>
          </div>
          <h2 className="sim-main-title">
            Simple Linear Regression: 3D Convex Loss Surface &amp; Data Space
          </h2>
          <p className="sim-sub-desc">
            Rotate the <strong>3D Parabolic Loss Bowl</strong> with your mouse/touch. Watch how adjusting slope{' '}
            <code>w</code> and intercept <code>b</code> shifts your parameter position on the 3D surface while tilting
            the regression line and changing the residual errors in real time.
          </p>
        </div>

        {/* View Toggle */}
        <div className="sim-tab-toggle" role="tablist">
          <button
            type="button"
            className={`sim-view-btn ${activeTab === 'both' ? 'active' : ''}`}
            onClick={() => setActiveTab('both')}
          >
            Dual View (3D + 2D)
          </button>
          <button
            type="button"
            className={`sim-view-btn ${activeTab === '3d' ? 'active' : ''}`}
            onClick={() => setActiveTab('3d')}
          >
            3D Loss Bowl
          </button>
          <button
            type="button"
            className={`sim-view-btn ${activeTab === '2d' ? 'active' : ''}`}
            onClick={() => setActiveTab('2d')}
          >
            2D Fit Space
          </button>
        </div>
      </div>

      {/* Interactive Canvases Grid */}
      <div className={`sim-canvases-grid view-${activeTab}`}>
        {/* 3D LOSS SURFACE VIEW */}
        {(activeTab === 'both' || activeTab === '3d') && (
          <div className="sim-viewport-card">
            <div className="sim-canvas-header">
              <div className="canvas-header-left">
                <span className="canvas-header-tag">3D LOSS LANDSCAPE</span>
                <h4>J(w, b) = Mean Squared Error Surface</h4>
              </div>
              <div className="canvas-header-hint">🖱️ Click &amp; Drag to Rotate 3D • Scroll to Zoom</div>
            </div>

            <div className="threejs-canvas-container" ref={mount3DRef}>
              {/* Three.js canvas gets injected here */}
            </div>

            <div className="sim-3d-legend">
              <span className="legend-chip">
                <span className="chip-dot dot-green"></span>
                Current State (w, b)
              </span>
              <span className="legend-chip">
                <span className="chip-dot dot-orange"></span>
                Descent Trajectory
              </span>
              <span className="legend-chip">
                <span className="chip-dot dot-bowl"></span>
                Convex Parabolic Bowl
              </span>
            </div>
          </div>
        )}

        {/* 2D DATA SPACE VIEW */}
        {(activeTab === 'both' || activeTab === '2d') && (
          <div className="sim-viewport-card">
            <div className="sim-canvas-header">
              <div className="canvas-header-left">
                <span className="canvas-header-tag">2D DATA &amp; RESIDUALS</span>
                <h4>Data Space: y&#770; = {w.toFixed(2)}x + {b >= 0 ? `+${b.toFixed(2)}` : b.toFixed(2)}</h4>
              </div>
              <div className="canvas-header-stats">
                R&sup2; Score: <strong>{metrics.r2}</strong>
              </div>
            </div>

            <div className="canvas2d-wrap">
              <canvas
                ref={canvas2DRef}
                width={480}
                height={360}
                className="canvas-2d-element"
              />
            </div>

            <div className="sim-2d-legend">
              <span className="legend-chip">
                <span className="chip-dot dot-line"></span>
                Fitted Line (y&#770;)
              </span>
              <span className="legend-chip">
                <span className="chip-dot dot-res"></span>
                Residuals e<sub>i</sub> = y - y&#770;
              </span>
              <span className="legend-chip">
                <span className="chip-dot dot-mean"></span>
                Centroid (x&#772;, y&#772;)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* METRICS & TELEMETRY DASHBOARD */}
      <div className="sim-metrics-bar">
        <div className="metric-box">
          <span className="metric-label">CURRENT LOSS J(w, b)</span>
          <span className="metric-val loss-current">{metrics.loss.toFixed(4)}</span>
          <span className="metric-sub">Target OLS Min: {olsSolution.minLoss.toFixed(4)}</span>
        </div>

        <div className="metric-box">
          <span className="metric-label">SLOPE w (&beta;&#8321;)</span>
          <span className="metric-val">{w.toFixed(3)}</span>
          <span className="metric-sub">&part;J/&part;w = {metrics.gradW.toFixed(3)}</span>
        </div>

        <div className="metric-box">
          <span className="metric-label">INTERCEPT b (&beta;&#8320;)</span>
          <span className="metric-val">{b.toFixed(3)}</span>
          <span className="metric-sub">&part;J/&part;b = {metrics.gradB.toFixed(3)}</span>
        </div>

        <div className="metric-box">
          <span className="metric-label">GRADIENT NORM ||&nabla;J||</span>
          <span className={`metric-val ${metrics.gradNorm < 0.05 ? 'converged' : ''}`}>
            {metrics.gradNorm.toFixed(3)}
          </span>
          <span className="metric-sub">{metrics.gradNorm < 0.05 ? '✨ Near Global Minimum' : 'Descending downhill'}</span>
        </div>

        <div className="metric-box">
          <span className="metric-label">GD ITERATIONS</span>
          <span className="metric-val">{iteration}</span>
          <span className="metric-sub">&alpha; = {learningRate}</span>
        </div>
      </div>

      {/* INTERACTIVE CONTROLS CONSOLE */}
      <div className="sim-controls-panel">
        <div className="sim-controls-left">
          {/* Play/Pause Gradient Descent */}
          <button
            type="button"
            className={`sim-action-btn btn-gd-play ${isRunningGD ? 'is-running' : ''}`}
            onClick={() => setIsRunningGD(!isRunningGD)}
          >
            {isRunningGD ? '⏸ Pause Descent' : '▶ Start Gradient Descent'}
          </button>

          {/* Single Step */}
          <button
            type="button"
            className="sim-action-btn btn-secondary"
            onClick={stepGradientDescent}
            disabled={isRunningGD}
            title="Take 1 step: w := w - &alpha; &part;J/&part;w"
          >
            Step 1&times; ⏭️
          </button>

          {/* Jump to OLS Analytical Minimum */}
          <button
            type="button"
            className="sim-action-btn btn-secondary"
            onClick={handleJumpToOptimum}
            title="Jump to closed-form OLS solution"
          >
            ⭐ Snap to OLS Optimum
          </button>

          {/* Reset Parameters */}
          <button
            type="button"
            className="sim-action-btn btn-outline"
            onClick={handleReset}
            title="Reset parameters to initial suboptimal position"
          >
            ↺ Reset
          </button>

          {/* Randomize Data Points */}
          <button
            type="button"
            className="sim-action-btn btn-outline"
            onClick={handleRandomizeData}
            title="Generate new random scatter dataset"
          >
            🎲 New Data
          </button>
        </div>

        {/* Sliders for manual exploration */}
        <div className="sim-sliders-group">
          <div className="slider-item">
            <div className="slider-label-row">
              <span>Slope w (&beta;&#8321;)</span>
              <code>{w.toFixed(2)}</code>
            </div>
            <input
              type="range"
              min={olsSolution.wOpt - 2.5}
              max={olsSolution.wOpt + 2.5}
              step="0.05"
              value={w}
              onChange={(e) => {
                setIsRunningGD(false);
                setW(parseFloat(e.target.value));
              }}
              className="sim-slider-input"
            />
          </div>

          <div className="slider-item">
            <div className="slider-label-row">
              <span>Intercept b (&beta;&#8320;)</span>
              <code>{b.toFixed(2)}</code>
            </div>
            <input
              type="range"
              min={olsSolution.bOpt - 3.0}
              max={olsSolution.bOpt + 3.0}
              step="0.05"
              value={b}
              onChange={(e) => {
                setIsRunningGD(false);
                setB(parseFloat(e.target.value));
              }}
              className="sim-slider-input"
            />
          </div>

          <div className="slider-item">
            <div className="slider-label-row">
              <span>Learning Rate (&alpha;)</span>
              <code>{learningRate.toFixed(2)}</code>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.30"
              step="0.01"
              value={learningRate}
              onChange={(e) => setLearningRate(parseFloat(e.target.value))}
              className="sim-slider-input"
            />
          </div>
        </div>
      </div>

      {/* Key Intuition Callout */}
      <div className="sim-insight-callout">
        <div className="insight-icon">💡</div>
        <div className="insight-text">
          <strong>GATE DA Core Mathematical Insight:</strong> Simple linear regression loss{' '}
          <code>J(w, b) = (1/2n) &sum; (y_i - (wx_i + b))&sup2;</code> is mathematically proven to be a strictly
          convex quadratic bowl. Because the Hessian matrix is positive-definite, it has exactly{' '}
          <strong>one unique global minimum</strong> (the OLS solution), and zero local minima! Gradient descent is
          guaranteed to converge to this unique minimum for any valid learning rate &alpha; &lt; 2 / &lambda;
          <sub>max</sub>(X<sup>T</sup>X).
        </div>
      </div>
    </div>
  );
}
