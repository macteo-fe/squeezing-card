import { _decorator, Component, EventHandler, Node, UITransform } from "cc";
import { calculateIsDragging } from "./calculate-is-dragging";
import CardSqueezeFrontCardTransform from "./card-squeeze-front-card-transform";
import { CardSqueezeMask } from "./card-squeeze-mask";
import SqueezeCardShadowTransform from "./squeeze-card-shadow-transform";
import { calculateCosine, Vec2 } from "./vec-2";

const { ccclass, property } = _decorator;

const MIN_COSINE = Math.cos((45 * Math.PI) / 180);

@ccclass("HandleSqueezeCardDrag")
export class HandleSqueezeCardDrag extends Component {
    @property(CardSqueezeMask) private squeezeMask: CardSqueezeMask = null;
    @property(CardSqueezeFrontCardTransform) private frontCardMovement: CardSqueezeFrontCardTransform = null;
    @property(SqueezeCardShadowTransform) private shadowMovement: SqueezeCardShadowTransform = null;
    @property(Node) private backCardNode: Node = null;
    @property({ type: EventHandler }) private onHitDeadzone: EventHandler = null;

    updateDrag(start: Vec2, end: Vec2) {
        const dragVector = this.calculateDragVector(start, end);
        const adjustedDragVector = this.adjustDragVector(start, dragVector);
        const translatedDraggingStartPos = this.translateStartDraggingPosToCardEdge(start, adjustedDragVector);

        this.squeezeMask.updateMask(translatedDraggingStartPos, adjustedDragVector);
        this.frontCardMovement.updateTransform(translatedDraggingStartPos, adjustedDragVector);
        this.shadowMovement?.updateTransform(translatedDraggingStartPos, adjustedDragVector);

        const isHitDeadzone = this.isHitDeadzone(dragVector);
        if (isHitDeadzone) {
            this.handHitDeadzone();
        }
    }

    private isHitDeadzone(dragVector: Vec2): boolean {
        const backTransform = this.backCardNode.getComponent(UITransform);
        const width = backTransform?.width ?? 0;
        const height = backTransform?.height ?? 0;
        const cardDiagonalLength = Math.hypot(width, height);
        const maxDragVectorLength = cardDiagonalLength * 0.7;
        const dragVectorLength = Math.hypot(dragVector.x, dragVector.y);

        return dragVectorLength >= maxDragVectorLength;
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

    private handHitDeadzone() {
        if (this.onHitDeadzone) {
            this.onHitDeadzone.emit([]);
        }
    }
}
