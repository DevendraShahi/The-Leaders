export interface StoryBackgroundPreset {
    id: string;
    label: string;
    type: 'gradient' | 'color';
    value: string;
    textInvert?: boolean;
}

export const storyGradients: StoryBackgroundPreset[] = [
    {
        id: 'insta-sunset',
        label: 'Instagram Sunset',
        type: 'gradient',
        value: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)',
    },
    {
        id: 'midnight-navy',
        label: 'Midnight Navy',
        type: 'gradient',
        value: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    },
    {
        id: 'crimson-noir',
        label: 'Leaders Crimson',
        type: 'gradient',
        value: 'linear-gradient(135deg, #4a0000 0%, #8B0000 50%, #1a0000 100%)',
    },
    {
        id: 'royal-purple',
        label: 'Royal Violet',
        type: 'gradient',
        value: 'linear-gradient(135deg, #2e0854 0%, #6b21a8 50%, #c026d3 100%)',
    },
    {
        id: 'emerald-aurora',
        label: 'Emerald Aurora',
        type: 'gradient',
        value: 'linear-gradient(135deg, #062b1a 0%, #0d5c3a 50%, #10b981 100%)',
    },
    {
        id: 'twilight-horizon',
        label: 'Twilight Horizon',
        type: 'gradient',
        value: 'linear-gradient(135deg, #141e30 0%, #243b55 100%)',
    },
    {
        id: 'warm-terracotta',
        label: 'Warm Terracotta',
        type: 'gradient',
        value: 'linear-gradient(135deg, #3d1c1c 0%, #b45309 50%, #ea580c 100%)',
    },
    {
        id: 'cyber-cyan',
        label: 'Cyber Cyan',
        type: 'gradient',
        value: 'linear-gradient(135deg, #042f2e 0%, #0d9488 50%, #06b6d4 100%)',
    },
    {
        id: 'dark-slate',
        label: 'Dark Slate',
        type: 'gradient',
        value: 'linear-gradient(135deg, #18181b 0%, #27272a 50%, #09090b 100%)',
    },
    {
        id: 'rose-gold',
        label: 'Editorial Rose',
        type: 'gradient',
        value: 'linear-gradient(135deg, #4c1d24 0%, #9f1239 50%, #fb7185 100%)',
    },
    {
        id: 'cosmic-fusion',
        label: 'Cosmic Fusion',
        type: 'gradient',
        value: 'linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)',
    },
    {
        id: 'velvet-dusk',
        label: 'Velvet Dusk',
        type: 'gradient',
        value: 'linear-gradient(135deg, #23074d 0%, #cc5333 100%)',
    },
];

export const storyColors: StoryBackgroundPreset[] = [
    { id: 'color-pitch', label: 'Pitch Noir', type: 'color', value: '#09090b' },
    { id: 'color-charcoal', label: 'Charcoal', type: 'color', value: '#18181b' },
    { id: 'color-crimson', label: 'Leaders Red', type: 'color', value: '#8B0000' },
    { id: 'color-navy', label: 'Deep Navy', type: 'color', value: '#0f172a' },
    { id: 'color-emerald', label: 'Republic Emerald', type: 'color', value: '#064e3b' },
    { id: 'color-plum', label: 'Rich Plum', type: 'color', value: '#4a044e' },
    { id: 'color-ochre', label: 'Warm Ochre', type: 'color', value: '#451a03' },
    { id: 'color-sapphire', label: 'Deep Sapphire', type: 'color', value: '#1e3a8a' },
    { id: 'color-pure-white', label: 'Pure White', type: 'color', value: '#ffffff', textInvert: true },
];
