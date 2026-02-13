"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";

const vertexShader = `
uniform float uTime;
uniform float uTheme;
uniform vec2 uMouse;
uniform vec2 uResolution;

attribute vec3 aOffset; // x, y, z (depth in tunnel)
attribute vec2 aDimensions; // width, height
attribute float aRotation;
attribute vec3 aColor; // base random color tint

varying vec2 vUv;
varying vec3 vColor;
varying float vDepth;

void main() {
  vUv = uv;
  
  // Base Position
  float theta = aOffset.x; // Angle around the tunnel
  float radius = 3.0 + aOffset.y * 1.5; // Radius of tunnel
  float depth = mod(aOffset.z + uTime * 0.5, 20.0) - 10.0; // Moving tunnel effect
  
  vDepth = depth;
  
  // Parallax Rotation based on Mouse
  float mouseRotateX = (uMouse.x - 0.5) * 1.0;
  float mouseRotateY = (uMouse.y - 0.5) * 0.5;
  
  // Apply Rotation to the tunnel
  float x = radius * cos(theta + depth * 0.1 + mouseRotateX);
  float y = radius * sin(theta + depth * 0.1 + mouseRotateY);
  float z = depth;
  
  // Individual Instance Rotation
  float c = cos(aRotation);
  float s = sin(aRotation);
  mat2 rot = mat2(c, -s, s, c);
  vec2 pos = rot * (position.xy * aDimensions);
  
  // Combine World Position
  vec3 finalPos = vec3(x, y, z);
  
  // Look At Center adaptation (Card facing inwards/outwards)
  vec3 normal = normalize(vec3(x, y, 0.0));
  vec3 tangent = cross(normal, vec3(0.0, 0.0, 1.0));
  
  finalPos += tangent * pos.x + vec3(0.0, 0.0, 1.0) * pos.y;

  // Magnetism: Shift slightly towards mouse ray if close
  // Simplified for performance in vertex shader
  // (In a real raymarch we'd do more, here we just bob)
  
  vColor = aColor;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
varying vec3 vColor;
varying float vDepth;
uniform float uTheme;

void main() {
  // Card Shape (Rounded Rect)
  vec2 uv = vUv * 2.0 - 1.0;
  vec2 d = abs(uv) - vec2(0.8, 0.8); // Aspect handled in vertex
  float dist = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
  float alpha = 1.0 - smoothstep(0.0, 0.02, dist - 0.1); // Roundness
  
  if (alpha < 0.01) discard;

  // Colors
  vec3 lightCard = vec3(0.95, 0.95, 0.95);
  vec3 darkCard = vec3(0.15, 0.15, 0.15);
  vec3 cardColor = mix(lightCard, darkCard, uTheme);
  
  // Tint slightly with instance data
  cardColor *= vColor;
  
  // Border/Stroke
  float border = smoothstep(0.08, 0.1, abs(dist));
  vec3 borderColor = mix(vec3(0.8), vec3(0.3), uTheme);
  cardColor = mix(borderColor, cardColor, border);
  
  // Depth Fog
  float fog = smoothstep(10.0, -5.0, vDepth);
  
  gl_FragColor = vec4(cardColor, alpha * fog * 0.8);
}
`;

export default function DocumentLayer() {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const count = 400; // Hundreds of documents
    const { theme } = useTheme();
    const seededRandom = (seed: number) => {
        const x = Math.sin(seed * 12.9898) * 43758.5453123;
        return x - Math.floor(x);
    };

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uTheme: { value: 0 },
            uMouse: { value: new THREE.Vector2(0.5, 0.5) },
            uResolution: { value: new THREE.Vector2(100, 100) }, // Updated in loop
        }),
        []
    );

    const { offsets, dimensions, rotations, colors } = useMemo(() => {
        const offsets = new Float32Array(count * 3);
        const dimensions = new Float32Array(count * 2);
        const rotations = new Float32Array(count);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const rand = (channel: number) => seededRandom(i * 11 + channel);
            // Angle in the tunnel (0 to 2PI)
            offsets[i * 3] = rand(1) * Math.PI * 2;
            // Radius variation (layering)
            offsets[i * 3 + 1] = rand(2);
            // Z Depth (spread along the tunnel)
            offsets[i * 3 + 2] = rand(3) * 20.0;

            // Dimensions (Article strips vs photo cards)
            const ratio = rand(4) > 0.5 ? 1.5 : 0.6; // Landscape vs Portrait
            const scale = 0.2 + rand(5) * 0.2;
            dimensions[i * 2] = scale * ratio;     // Width
            dimensions[i * 2 + 1] = scale;         // Height

            // Random tilt
            rotations[i] = (rand(6) - 0.5) * 0.5;

            // Subtle color tint
            const tint = 0.9 + rand(7) * 0.1;
            colors[i * 3] = tint;
            colors[i * 3 + 1] = tint;
            colors[i * 3 + 2] = tint;
        }

        return { offsets, dimensions, rotations, colors };
    }, []);

    useFrame((state) => {
        if (!meshRef.current) return;

        meshRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime();
        meshRef.current.material.uniforms.uMouse.value.lerp(state.pointer.clone().addScalar(1).multiplyScalar(0.5), 0.1);

        const targetTheme = theme === 'dark' ? 1.0 : 0.0;
        meshRef.current.material.uniforms.uTheme.value = THREE.MathUtils.lerp(
            meshRef.current.material.uniforms.uTheme.value,
            targetTheme,
            0.05
        );
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
            <planeGeometry args={[1, 1]}>
                <instancedBufferAttribute attach="attributes-aOffset" args={[offsets, 3]} />
                <instancedBufferAttribute attach="attributes-aDimensions" args={[dimensions, 2]} />
                <instancedBufferAttribute attach="attributes-aRotation" args={[rotations, 1]} />
                <instancedBufferAttribute attach="attributes-aColor" args={[colors, 3]} />
            </planeGeometry>
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
                side={THREE.DoubleSide}
            />
        </instancedMesh>
    );
}
