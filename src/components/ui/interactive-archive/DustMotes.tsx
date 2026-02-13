"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";

export default function DustMotes() {
    const pointsRef = useRef<THREE.Points>(null);
    const { viewport } = useThree();
    const { theme } = useTheme();
    const count = 500;
    const seededRandom = (seed: number) => {
        const x = Math.sin(seed * 12.9898) * 43758.5453123;
        return x - Math.floor(x);
    };

    const { positions, velocities, colors } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);
        // Colors will be dynamically updated in shader or useFrame, but let's set base here
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const rand = (channel: number) => seededRandom(i * 17 + channel);
            positions[i3] = (rand(1) - 0.5) * 20.0; // Wide spread
            positions[i3 + 1] = (rand(2) - 0.5) * 20.0;
            positions[i3 + 2] = (rand(3) - 0.5) * 5.0; // Depth

            velocities[i3] = (rand(4) - 0.5) * 0.005;
            velocities[i3 + 1] = (rand(5) - 0.5) * 0.005;
            velocities[i3 + 2] = 0;

            colors[i3] = 1.0;
            colors[i3 + 1] = 1.0;
            colors[i3 + 2] = 1.0;
        }

        return { positions, velocities, colors };
    }, [count]);

    useFrame(() => {
        if (!pointsRef.current) return;

        const positionsAttribute = pointsRef.current.geometry.attributes.position;

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            // Simple drift
            let x = positionsAttribute.getX(i);
            let y = positionsAttribute.getY(i);

            x += velocities[i3];
            y += velocities[i3 + 1];

            // Wrap
            if (x > 10.0) x = -10.0;
            if (x < -10.0) x = 10.0;
            if (y > 10.0) y = -10.0;
            if (y < -10.0) y = 10.0;

            positionsAttribute.setXY(i, x, y);
        }

        positionsAttribute.needsUpdate = true;

        // Theme Update
        const isDark = theme === 'dark';
        const material = pointsRef.current.material as THREE.PointsMaterial;
        // Dark mode -> brighter dust (0.6), Light mode -> darker dust (0.3)
        const targetColor = isDark ? 0.6 : 0.3;
        const currentColor = material.color.r;
        const newColor = THREE.MathUtils.lerp(currentColor, targetColor, 0.05);
        material.color.setRGB(newColor, newColor, newColor);
        material.opacity = isDark ? 0.35 : 0.2;

    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={count}
                    array={colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.03}
                vertexColors={false} // Using material color for simplicity of theme switch
                color="#888888"
                transparent
                opacity={0.3}
                blending={THREE.AdditiveBlending}
                sizeAttenuation={true}
                depthWrite={false}
            />
        </points>
    );
}
