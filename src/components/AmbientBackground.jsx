"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as random from "three/src/math/MathUtils";

function Starfield(props) {
  const ref = useRef();
  
  // Generate random positions for particles
  const sphere = useMemo(() => {
    const count = 3000;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2 * Math.cbrt(random.randFloat(0, 1));
      const theta = random.randFloat(0, 1) * 2 * Math.PI;
      const phi = Math.acos(2 * random.randFloat(0, 1) - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
  }, []);

  useFrame((state, delta) => {
    ref.current.rotation.x -= delta / 15;
    ref.current.rotation.y -= delta / 20;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#cfaa70"
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.4}
        />
      </Points>
    </group>
  );
}

export default function AmbientBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-60 mix-blend-screen" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
      <Canvas camera={{ position: [0, 0, 1] }}>
        <Starfield />
      </Canvas>
      {/* Deep gradient overlay to ensure text readability */}
      <div 
        className="absolute inset-0" 
        style={{ 
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          background: 'radial-gradient(circle at 50% 0%, rgba(207, 170, 112, 0.05) 0%, rgba(5,5,5,1) 80%)' 
        }} 
      />
    </div>
  );
}
