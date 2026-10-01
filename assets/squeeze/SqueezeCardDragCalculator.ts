import { Node, UITransform } from "cc";
import { calculateIsDragging } from "./calculateIsDragging";
import { Vec2, calculateCosine } from "./vec-2";

const MIN_COSINE = Math.cos((45 * Math.PI) / 180);

export class SqueezeCardDragCalculator {
    constructor(private backCardNode: Node) { }

    calculateSqueezeDrag(start: Vec2, end: Vec2): { start: Vec2; dragVector: Vec2; } {
        const dragVector = this.calculateDragVector(start, end);
        const adjustedDragVector = this.adjustDragVector(start, dragVector);
        const translatedDraggingStartPos = this.translateStartDraggingPosToCardEdge(start, adjustedDragVector);

        return { start: translatedDraggingStartPos, dragVector: adjustedDragVector }
    }

    private adjustDragVector(startDragPosition: Vec2, dragVector: Vec2): Vec2 {
        const startToCenterVector: Vec2 = {
            x: -startDragPosition.x,
            y: -startDragPosition.y,
        };

        const cosine = calculateCosine(startToCenterVector, dragVector);
        const multiplier = Math.max(0, (cosine - MIN_COSINE) / (1 - MIN_COSINE)) > 0 ? 1 : 0;

        return {
            x: dragVector.x * multiplier,
            y: dragVector.y * multiplier,
        };
    }

    private translateStartDraggingPosToCardEdge(startDraggingPos: Vec2, dragVector: Vec2): Vec2 {
        const isDragging = calculateIsDragging(dragVector);
        if (!isDragging) {
            return { ...startDraggingPos };
        }

        const translateDirection: Vec2 = {
            x: -dragVector.x,
            y: -dragVector.y,
        };

        const backTransform = this.backCardNode.getComponent(UITransform);
        const top = (backTransform?.height ?? 0) / 2;
        const right = (backTransform?.width ?? 0) / 2;

        const cutHorizonLineM = ((translateDirection.y > 0 ? top : -top) - startDraggingPos.y) / translateDirection.y;
        const cutVerticalLineM = ((translateDirection.x > 0 ? right : -right) - startDraggingPos.x) / translateDirection.x;

        if (cutHorizonLineM < 0 || cutVerticalLineM < 0) {
            throw new Error("Invalid touch coordinates for squeeze mask.");
        }

        const m = Math.min(cutHorizonLineM, cutVerticalLineM) / 2;

        return {
            x: startDraggingPos.x + translateDirection.x * m,
            y: startDraggingPos.y + translateDirection.y * m,
        };
    }

    private calculateDragVector(startPos: Vec2, endPos: Vec2): Vec2 {
        return {
            x: endPos.x - startPos.x,
            y: endPos.y - startPos.y,
        };
    }
}
