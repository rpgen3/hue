const clamp = (num, min, max) => Math.max(min, Math.min(max, num));
export const rgb2hsl = (red, green, blue) => {
    red = clamp(red, 0, 255);
    green = clamp(green, 0, 255);
    blue = clamp(blue, 0, 255);
    const max = Math.max(red, green, blue),
          min = Math.min(red, green, blue);
    let hue = max === min ? 0 :
    max === red ? 60 * ((green - blue) / (max - min)) :
    max === green ? 60 * ((blue - red) / (max - min)) + 360 / 3 :
    60 * ((red - green) / (max - min)) + 360 * 2 / 3;
    if (hue < 0) hue += 360;
    return [
        hue,
        (((max + min) / 2) < 255 / 2 ? (
            max + min <= 0 ? 0 :
            (max - min) / (max + min) * 100
        ) : (max - min) / (255 * 2 - max - min) * 100) || 0,
        (max + min) / 255 / 2 * 100
    ];
};
