"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import ArchivePlane from "./ArchivePlane";
import DocumentLayer from "./DocumentLayer";
import NetworkGrid from "./NetworkGrid";
import DustMotes from "./DustMotes";
import FocusField from "./FocusField";

function Scene() {
    return (
        <>
            <ArchivePlane />
            <NetworkGrid />
            <DocumentLayer />
            <DustMotes />
            <FocusField />
        </>
    );
}

interface LeadersArchiveBackgroundProps {
    scoped?: boolean;
}

export default function LeadersArchiveBackground({ scoped = false }: LeadersArchiveBackgroundProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const containerClass = scoped
        ? "absolute inset-0 bg-background transition-colors duration-700"
        : "fixed inset-0 -z-10 bg-background transition-colors duration-700";

    return (
        <div className={containerClass}>
            <Canvas
                camera={{ position: [0, 0, 1], fov: 75 }}
                gl={{ antialias: true, alpha: true }}
                dpr={[1, 2]}
                className="touch-none"
            >
                <Suspense fallback={null}>
                    <Scene />
                </Suspense>
            </Canvas>
        </div>
    );
}
