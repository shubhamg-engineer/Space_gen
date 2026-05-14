import React, { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';

interface SatellitePoint {
  name: string;
  lat: number;
  lng: number;
  alt: number;
  color: string;
}

const Earth3D: React.FC = () => {
  const globeRef = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [satellites, setSatellites] = useState<SatellitePoint[]>([]);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  useEffect(() => {
    // Generate mock satellite data colored by orbit shell
    const mockSats = Array.from({ length: 350 }).map((_, i) => {
      const altFraction = Math.random();
      let color = '#38bdf8'; // LEO — cyan
      if (altFraction > 0.7) color = '#a78bfa'; // GEO — violet
      else if (altFraction > 0.45) color = '#34d399'; // MEO — emerald

      return {
        name: `SAT-${i}`,
        lat: (Math.random() - 0.5) * 160,
        lng: (Math.random() - 0.5) * 360,
        alt: altFraction * 0.7 + 0.05,
        color,
      };
    });
    setSatellites(mockSats);
  }, []);

  useEffect(() => {
    // Set responsive width from container
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: 500,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    // Enable auto-rotate once the globe mounts
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.4;
    }
  }, [dimensions]);

  return (
    <div ref={containerRef} className="w-full h-[500px] rounded-2xl overflow-hidden border border-slate-700/50 bg-slate-950 relative shadow-2xl">
      {/* Overlay badge */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-700/50 shadow-lg">
        <h3 className="text-slate-100 font-semibold text-sm tracking-tight">🌍 Real-time Orbit View</h3>
        <p className="text-slate-400 text-xs mt-0.5">Tracking {satellites.length} orbital objects</p>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-10 bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/50 space-y-1">
        {[
          { color: '#38bdf8', label: 'LEO' },
          { color: '#34d399', label: 'MEO' },
          { color: '#a78bfa', label: 'GEO' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-slate-400">{label}</span>
          </div>
        ))}
      </div>

      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        objectsData={satellites}
        objectLat="lat"
        objectLng="lng"
        objectAltitude="alt"
        objectFacesSurface={false}
        objectLabel="name"
        objectThreeObject={(d: any) => {
          const geometry = new THREE.SphereGeometry(0.5, 6, 6);
          const material = new THREE.MeshBasicMaterial({ color: d.color });
          return new THREE.Mesh(geometry, material);
        }}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        atmosphereColor="#3b82f6"
        atmosphereAltitude={0.12}
      />
    </div>
  );
};

export default Earth3D;
