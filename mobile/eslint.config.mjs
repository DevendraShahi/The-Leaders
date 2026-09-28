import { defineConfig } from "eslint/config";
import expoConfig from "eslint-config-expo/flat.js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default defineConfig([
    expoConfig,
    {
        ignores: ["node_modules/**", ".expo/**", ".css-out", "*.html", "*.png"],
    },
    {
        plugins: {
            react,
            "react-hooks": reactHooks,
        },
        // The React Compiler rules are valuable, but Reanimated shared values
        // and existing animation helpers currently trigger false positives.
        // Keep them visible during migration without making every build fail.
        rules: {
            "react-hooks/immutability": "warn",
            "react-hooks/refs": "warn",
            "react-hooks/set-state-in-effect": "warn",
            "react-hooks/static-components": "warn",
            "react/no-unescaped-entities": "warn",
        },
    },
]);
