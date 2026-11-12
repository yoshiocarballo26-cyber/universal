import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { WorkstationFile } from '../types';
import { Box, RotateCw, Eye, Layers, Compass, Sun } from 'lucide-react';

interface ThreeViewerProps {
  file: WorkstationFile;
}

export const ThreeViewer: React.FC<ThreeViewerProps> = ({ file }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [geometryType, setGeometryType] = useState<'torus' | 'icosahedron' | 'cylinder'>('torus');
  const [vertexCount, setVertexCount] = useState<number>(1420);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Create Scene, Camera, Renderer
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060709);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting (Cinematic Gold & Obsidian ambiance)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xd4af37, 2.5, 50);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const blueBackLight = new THREE.PointLight(0x38bdf8, 1.5, 50);
    blueBackLight.position.set(-5, -5, -3);
    scene.add(blueBackLight);

    // Initial Geometry creation
    let geom: THREE.BufferGeometry;
    if (geometryType === 'icosahedron') {
      geom = new THREE.IcosahedronGeometry(2.2, 1);
    } else if (geometryType === 'cylinder') {
      geom = new THREE.CylinderGeometry(1.5, 1.5, 3, 32);
    } else {
      geom = new THREE.TorusKnotGeometry(1.4, 0.45, 128, 32);
    }

    const material = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.85,
      roughness: 0.25,
      wireframe: wireframe
    });

    const mesh = new THREE.Mesh(geom, material);
    scene.add(mesh);
    meshRef.current = mesh;
    setVertexCount(geom.attributes.position.count);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (meshRef.current && autoRotate) {
        meshRef.current.rotation.x += 0.008;
        meshRef.current.rotation.y += 0.012;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Mouse drag interaction
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !meshRef.current) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;
      meshRef.current.rotation.y += deltaX * 0.01;
      meshRef.current.rotation.x += deltaY * 0.01;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && dom) {
        mountRef.current.removeChild(dom);
      }
      geom.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [geometryType, wireframe, autoRotate]);

  return (
    <div className="flex flex-col h-full bg-obsidian-950 text-slate-100 overflow-hidden relative">
      {/* Top Header */}
      <div className="flex items-center justify-between p-3.5 bg-obsidian-900 border-b border-obsidian-800 z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gold-500/10 border border-gold-500/30 rounded-lg text-gold-400">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {file.name}
              <span className="text-[10px] px-2 py-0.5 rounded bg-gold-500/20 text-gold-300 font-mono uppercase">
                {file.extension}
              </span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Motor: Three.js WebGL Pipeline • Vértices: {vertexCount} • Sombrado PBR
            </span>
          </div>
        </div>

        {/* 3D Action Toolbar */}
        <div className="flex items-center space-x-2">
          {/* Geometry Selector */}
          <div className="flex items-center bg-obsidian-850 p-1 rounded-lg border border-obsidian-750 text-xs">
            <button
              onClick={() => setGeometryType('torus')}
              className={`px-2.5 py-1 rounded transition ${
                geometryType === 'torus' ? 'bg-gold-500 text-obsidian-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Toroide
            </button>
            <button
              onClick={() => setGeometryType('icosahedron')}
              className={`px-2.5 py-1 rounded transition ${
                geometryType === 'icosahedron' ? 'bg-gold-500 text-obsidian-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Icosaedro STL
            </button>
            <button
              onClick={() => setGeometryType('cylinder')}
              className={`px-2.5 py-1 rounded transition ${
                geometryType === 'cylinder' ? 'bg-gold-500 text-obsidian-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cilindro CAD
            </button>
          </div>

          <button
            onClick={() => setWireframe(!wireframe)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition ${
              wireframe ? 'bg-gold-500/20 text-gold-300 border-gold-500/50' : 'bg-obsidian-850 text-slate-400 border-obsidian-750 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" /> Alambre
          </button>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition ${
              autoRotate ? 'bg-gold-500 text-obsidian-950 border-gold-400 font-bold' : 'bg-obsidian-850 text-slate-400 border-obsidian-750 hover:text-white'
            }`}
          >
            <RotateCw className="w-4 h-4" /> {autoRotate ? 'Girando' : 'Pausado'}
          </button>
        </div>
      </div>

      {/* 3D Canvas Mount */}
      <div className="flex-1 w-full h-full cursor-grab active:cursor-grabbing relative" ref={mountRef}>
        {/* On-screen 3D HUD Information */}
        <div className="absolute bottom-4 left-4 pointer-events-none bg-obsidian-900/80 backdrop-blur-md border border-gold-500/20 rounded-xl p-3 text-xs font-mono space-y-1">
          <div className="text-gold-400 font-bold uppercase tracking-wider">HUD Tridimensional YC</div>
          <div className="text-slate-300">Rotación: Activa (Arrastre con mouse)</div>
          <div className="text-slate-400">Iluminación: PBR Dual Spot + Ambiance</div>
          <div className="text-emerald-400">Render: 60 FPS Estable</div>
        </div>
      </div>
    </div>
  );
};