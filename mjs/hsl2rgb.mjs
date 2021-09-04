const clamp = (num, min, max) => Math.max(min, Math.min(max, num));
export const hsl2rgb = (hue, saturation, luminance) => {
    let max = 0, min = 0,
        r = 0, g = 0, b = 0;
    const h = clamp(hue, 0, 360) % 360,
          s = clamp(saturation, 0, 100) / 100,
          l = clamp(luminance, 0, 100) / 100,
          q = h / 60;
    if (l < 0.5) {
        max = l + l * s;
        min = l - l * s;
    } else {
        max = l + (1 - l) * s;
        min = l - (1 - l) * s;
    }
    if (q <= 1) {
        r = max;
        g = (h / 60) * (max - min) + min;
        b = min;
    } else if (q <= 2) {
        r = ((60 * 2 - h) / 60) * (max - min) + min;
        g = max;
        b = min;
    } else if (q <= 3) {
        r = min;
        g = max;
        b = ((h - 60 * 2) / 60) * (max - min) + min;
    } else if (q <= 4) {
        r = min;
        g = ((60 * 4 - h) / 60) * (max - min) + min;
        b = max;
    } else if (q <= 5) {
        r = ((h - 60 * 4) / 60) * (max - min) + min;
        g = min;
        b = max;
    } else {
        r = max;
        g = min;
        b = ((360 - h) / 60) * (max - min) + min;
    }
    return [r * 255, g * 255, b * 255];
};
