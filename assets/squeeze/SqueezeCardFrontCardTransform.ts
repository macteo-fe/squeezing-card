import { Node, UIOpacity } from "cc";
import { DragHandler } from "./DragHandler";
import { calculateIsDragging } from "./calculateIsDragging";
import { Vec2 } from "./vec-2";

export default class SqueezeCardFrontCardTransform implements DragHandler {
    private startDraggingPos: Vec2 = { x: 0, y: 0 };
    private dragVector: Vec2 = { x: 0, y: 0 };

    constructor(private frontCardNode: Node) {}

    handleDrag(start: Vec2, dragVector: Vec2): void {
        this.startDraggingPos = start;
        this.dragVector = dragVector;

        this.updateAngle();
        this.updatePosition();
        this.updateOpacity();
    }

    private updateOpacity() {
        const isDragging = calculateIsDragging(this.dragVector);
        let uiOpacity = this.frontCardNode.getComponent(UIOpacity);
        if (!uiOpacity) {
            uiOpacity = this.frontCardNode.addComponent(UIOpacity);
        }
        uiOpacity.opacity = isDragging ? 255 : 0;
    }

    private updateAngle() {
        const angle = this.calculateAngle();
        this.frontCardNode.angle = angle;
    }

    private updatePosition() {
        const position = this.calculatePosition();
        this.frontCardNode.setPosition(position.x, position.y);
    }

    private calculatePosition(): Vec2 {
        const isDragging = calculateIsDragging(this.dragVector);

        if (!isDragging) {
            return { x: 0, y: 0 };
        }

        const centerPoint = {
            x: this.startDraggingPos.x + this.dragVector.x / 2,
            y: this.startDraggingPos.y + this.dragVector.y / 2,
        };

        const normalDragVector: Vec2 = {
            x: this.dragVector.y,
            y: -this.dragVector.x,
        };

        const m =
            -(normalDragVector.x * centerPoint.x + normalDragVector.y * centerPoint.y) /
            (Math.pow(normalDragVector.x, 2) + Math.pow(normalDragVector.y, 2));

        const mirrorPoint: Vec2 = {
            x: centerPoint.x + normalDragVector.x * m,
            y: centerPoint.y + normalDragVector.y * m,
        };

        return {
            x: mirrorPoint.x * 2,
            y: mirrorPoint.y * 2,
        };
    }

    private calculateAngle(): number {
        const isDragging = calculateIsDragging(this.dragVector);

        if (!isDragging) {
            return 0;
        }

        const dragAngle = Math.atan2(this.dragVector.y, this.dragVector.x) * (180 / Math.PI);
        return 2 * dragAngle - 180;
    }
}
