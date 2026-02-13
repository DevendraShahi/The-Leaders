"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;
void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
uniform float uTime;
uniform float uTheme;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform vec2 uVelocity;

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / uResolution.y;
  vec2 aspectUv = uv * vec2(aspect, 1.0);
  vec2 aspectMouse = uMouse * vec2(aspect, 1.0);
  
  float dist = distance(aspectUv, aspectMouse);
  
  // Lens Shape (Reduced radius from 0.35 to 0.18)
  float lens = smoothstep(0.18, 0.0, dist);
  
  // Velocity interaction (lens grows/brightens with movement)
  float speed = length(uVelocity);
  float intensity = 0.08 + speed * 1.5; // Reduced base intensity
  
  // Light / Dark mode colors
  // Light mode: localized brightness/warmth
  // Dark mode: localized light
  
  vec3 lensColor = vec3(1.0, 1.0, 1.0); // Pure light
  
  float alpha = lens * intensity;
  
  // Add a very subtle ring (reduced from 0.35 to 0.18)
  float ring = smoothstep(0.18, 0.17, dist) - smoothstep(0.17, 0.16, dist);
  alpha += ring * 0.05; // Reduced ring intensity

  gl_FragColor = vec4(lensColor, alpha * 0.4);
}
`;

export default function FocusField() {
    const meshRef = useRef<THREE.Mesh>(null);
    const { size, viewport } = useThree();
    const { theme } = useTheme();

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uTheme: { value: 0 },
            uMouse: { value: new THREE.Vector2(0.5, 0.5) },
            uResolution: { value: new THREE.Vector2(size.width, size.height) },
            uVelocity: { value: new THREE.Vector2(0, 0) },
        }),
        [size.height, size.width]
    );

    const prevMouse = useRef(new THREE.Vector2(0.5, 0.5));

    useFrame((state) => {
        if (!meshRef.current) return;

        meshRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime();

        // Mouse Mapping
        const currentMouse = new THREE.Vector2(
            (state.pointer.x + 1) / 2,
            (state.pointer.y + 1) / 2
        );

        // Lerp mouse for smoothness
        meshRef.current.material.uniforms.uMouse.value.lerp(currentMouse, 0.2);

        // Velocity calculation
        const velocity = new THREE.Vector2()
            .subVectors(currentMouse, prevMouse.current)
            .multiplyScalar(10.0); // Scale up

        meshRef.current.material.uniforms.uVelocity.value.lerp(velocity, 0.1);

        prevMouse.current.copy(currentMouse);

        meshRef.current.material.uniforms.uResolution.value.set(size.width, size.height);

        const targetTheme = theme === 'dark' ? 1.0 : 0.0;
        meshRef.current.material.uniforms.uTheme.value = THREE.MathUtils.lerp(
            meshRef.current.material.uniforms.uTheme.value,
            targetTheme,
            0.05
        );
    });

    // Render on top, Additive
    return (
        <mesh ref={meshRef} position={[0, 0, 0.5]} scale={[viewport.width, viewport.height, 1]}>
            <planeGeometry args={[1, 1]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
}
