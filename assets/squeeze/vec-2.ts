export interface Vec2 {
    x: number;
    y: number;
}

export function calculateCosine(a: Vec2, b: Vec2): number {
    const aLength = Math.hypot(a.x, a.y);
    const bLength = Math.hypot(b.x, b.y);
    if (aLength === 0 || bLength === 0) {
        return 0;
    }
    return (a.x * b.x + a.y * b.y) / (aLength * bLength);
}
