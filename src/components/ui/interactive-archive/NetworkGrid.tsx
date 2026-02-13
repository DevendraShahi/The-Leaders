"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";

const vertexShader = `
uniform float uTime;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
uniform float uTime;
uniform float uTheme;
uniform vec2 uMouse;
uniform vec2 uResolution;

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / uResolution.y;
  vec2 aspectUv = uv * vec2(aspect, 1.0);
  
  // Grid Lines
  float gridSize = 10.0;
  vec2 gridUV = fract(aspectUv * gridSize + vec2(0.0, uTime * 0.05)); // Moving grid
  
  float lineThickness = 0.02;
  float gridLine = step(1.0 - lineThickness, gridUV.x) + step(1.0 - lineThickness, gridUV.y);
  
  // Radial Lines towards "Center of Power" (top center usually, or mouse)
  vec2 center = vec2(aspect * 0.5, 0.8);
  vec2 dir = aspectUv - center;
  float angle = atan(dir.y, dir.x);
  float radial = step(0.98, fract(angle * 5.0 / 3.14159));
  
  // Combine
  float lines = max(gridLine, radial * 0.5);
  
  // Interaction: Highlight near mouse
  float dist = distance(aspectUv, uMouse * vec2(aspect, 1.0));
  float glow = smoothstep(0.4, 0.0, dist);
  
  // Colors
  vec3 lightLine = vec3(0.0, 0.0, 0.0);
  vec3 darkLine = vec3(1.0, 1.0, 1.0);
  vec3 baseColor = mix(lightLine, darkLine, uTheme);
  
  // Pulse
  float pulse = sin(uTime + uv.y * 10.0) * 0.5 + 0.5;
  
  float alpha = lines * (0.05 + glow * 0.15 + pulse * 0.02);
  
  // Fade out edges
  float vignette = 1.0 - smoothstep(0.2, 0.8, length(uv - 0.5));
  alpha *= vignette;

  gl_FragColor = vec4(baseColor, alpha);
}
`;

export default function NetworkGrid() {
    const meshRef = useRef<THREE.Mesh>(null);
    const { size, viewport } = useThree();
    const { theme } = useTheme();

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uTheme: { value: 0 },
            uMouse: { value: new THREE.Vector2(0.5, 0.5) },
            uResolution: { value: new THREE.Vector2(size.width, size.height) },
        }),
        [size.height, size.width]
    );

    useFrame((state) => {
        if (!meshRef.current) return;
        meshRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime();
        meshRef.current.material.uniforms.uMouse.value.set(
            (state.pointer.x * viewport.width) / 2 + size.width / 2 / size.height * viewport.height, // Approximate mapping
            (state.pointer.y * viewport.height) / 2 + viewport.height / 2
        );
        // Better mouse mapping for shader: 0..1
        meshRef.current.material.uniforms.uMouse.value.set(
            (state.pointer.x + 1) / 2,
            (state.pointer.y + 1) / 2
        );

        meshRef.current.material.uniforms.uResolution.value.set(size.width, size.height);

        const targetTheme = theme === 'dark' ? 1.0 : 0.0;
        meshRef.current.material.uniforms.uTheme.value = THREE.MathUtils.lerp(
            meshRef.current.material.uniforms.uTheme.value,
            targetTheme,
            0.05
        );
    });

    return (
        <mesh ref={meshRef} position={[0, 0, -0.5]} scale={[viewport.width, viewport.height, 1]}>
            <planeGeometry args={[1, 1]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
                depthWrite={false}
            />
        </mesh>
    );
}
