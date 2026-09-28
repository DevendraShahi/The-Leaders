const hexToHsl = (hex) => {
  let r = 0, g = 0, b = 0;
  if (hex.length == 4) {
    r = "0x" + hex[1] + hex[1];
    g = "0x" + hex[2] + hex[2];
    b = "0x" + hex[3] + hex[3];
  } else if (hex.length == 7) {
    r = "0x" + hex[1] + hex[2];
    g = "0x" + hex[3] + hex[4];
    b = "0x" + hex[5] + hex[6];
  }
  r /= 255; g /= 255; b /= 255;
  let cmin = Math.min(r,g,b),
      cmax = Math.max(r,g,b),
      delta = cmax - cmin,
      h = 0, s = 0, l = 0;
  if (delta == 0) h = 0;
  else if (cmax == r) h = ((g - b) / delta) % 6;
  else if (cmax == g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  l = (cmax + cmin) / 2;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);
  return `${h} ${s}% ${l}%`;
};

const tokens = {
  light: {
    background: "#FFFFFF",
    surface: "#FFFFFF",
    surfaceSecondary: "#F7F7F8",
    foreground: "#0A0A0B",
    textSecondary: "#525252",
    mutedForeground: "#A3A3A3",
    border: "#E5E5E5",
    brandRed: "#D92B2B",
    success: "#16A34A",
    destructive: "#DC2626",
    primary: "#0A0A0B",
    primaryForeground: "#FFFFFF",
    secondary: "#F7F7F8",
    secondaryForeground: "#0A0A0B",
    popover: "#FFFFFF",
    popoverForeground: "#0A0A0B"
  },
  dark: {
    background: "#0C0C0E",
    surface: "#141416",
    surfaceSecondary: "#1C1C1F",
    foreground: "#F5F5F5",
    textSecondary: "#A3A3A3",
    mutedForeground: "#6B6B6B",
    border: "#252528",
    brandRed: "#FF4545",
    success: "#34D399",
    destructive: "#F87171",
    primary: "#F5F5F5",
    primaryForeground: "#0C0C0E",
    secondary: "#1C1C1F",
    secondaryForeground: "#F5F5F5",
    popover: "#141416",
    popoverForeground: "#F5F5F5"
  }
};

for (const mode of ['light', 'dark']) {
  console.log(`\n/* ${mode.toUpperCase()} */`);
  for (const [k, v] of Object.entries(tokens[mode])) {
    console.log(`--${k.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}: ${hexToHsl(v)}; /* ${v} */`);
  }
}
