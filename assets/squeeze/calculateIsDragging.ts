import { Vec2 } from "./vec-2";

export function calculateIsDragging(dragVector: Vec2): boolean {
    const isDraggingHorizontally = Math.abs(dragVector.x) > 0;
    const isDraggingVertically = Math.abs(dragVector.y) > 0;

    return isDraggingHorizontally || isDraggingVertically;
}
