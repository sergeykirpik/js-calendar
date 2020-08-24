function makeGradient(color) {
    return `linear-gradient(#fff, ${color}, ${color}, ${color}, #fff)`;
}

function colorBrightness(hexColor) {
    //http://www.w3.org/TR/AERT#color-contrast

    let r = parseInt(hexColor.slice(1, 3), 16);
    let g = parseInt(hexColor.slice(3, 5), 16);
    let b = parseInt(hexColor.slice(5, 7), 16);

    return Math.round((299 * r + 587 * g + 114 * b) / 1000);
}


export { makeGradient, colorBrightness };
