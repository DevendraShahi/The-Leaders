"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
uniform float uTime;
uniform float uTheme; // 0 = light, 1 = dark
uniform vec2 uResolution;

// Simplex 2D noise
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = vUv;
  
  // Base Colors
  vec3 lightBg = vec3(0.98, 0.97, 0.96); // Warm white paper
  vec3 darkBg = vec3(0.07, 0.07, 0.07);  // Deep charcoal
  
  // Interpolate base color based on theme
  vec3 baseColor = mix(lightBg, darkBg, uTheme);
  
  // Grain/Texture
  float noise = snoise(uv * 800.0 + uTime * 10.0);
  float grainStrength = mix(0.03, 0.05, uTheme);
  
  // Subtle gradient / Vignette
  float dist = distance(uv, vec2(0.5));
  float vignette = smoothstep(0.4, 1.2, dist);
  
  // Darken edges slightly more in dark mode
  float darkenFactor = mix(0.05, 0.2, uTheme);
  vec3 finalColor = baseColor - (vignette * darkenFactor);
  
  // Add grain
  finalColor += (noise - 0.5) * grainStrength;
  
  // Slight Warmth/Red tint in corners (very subtle brand alignment)
  vec3 accent = vec3(0.72, 0.11, 0.11); // Brand Red
  finalColor = mix(finalColor, accent, vignette * 0.02);

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export default function ArchivePlane() {
    const meshRef = useRef<THREE.Mesh>(null);
    const { size, viewport } = useThree();
    const { theme } = useTheme();

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uTheme: { value: 0 }, // Will update in loop
            uResolution: { value: new THREE.Vector2(size.width, size.height) },
        }),
        [size.height, size.width]
    );

    useFrame((state) => {
        if (!meshRef.current) return;

        meshRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime();
        meshRef.current.material.uniforms.uResolution.value.set(size.width, size.height);

        // Smooth theme transition
        const targetTheme = theme === 'dark' ? 1.0 : 0.0;
        meshRef.current.material.uniforms.uTheme.value = THREE.MathUtils.lerp(
            meshRef.current.material.uniforms.uTheme.value,
            targetTheme,
            0.05
        );
    });

    return (
        <mesh ref={meshRef} position={[0, 0, -1]} scale={[viewport.width, viewport.height, 1]}>
            <planeGeometry args={[1, 1, 1, 1]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
            />
        </mesh>
    );
}
