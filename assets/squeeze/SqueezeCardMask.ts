import { _decorator, Graphics, Mask, UITransform } from "cc";
import { calculateIsDragging } from "./calculateIsDragging";
import { DragHandler } from "./DragHandler";
import { calculateCosine, Vec2 } from "./vec-2";

const { ccclass } = _decorator;

interface EdgeCutPositions {
    left: Vec2 | null;
    top: Vec2 | null;
    right: Vec2 | null;
    bottom: Vec2 | null;
}

interface CornerPositions {
    leftTop: Vec2;
    rightTop: Vec2;
    leftBottom: Vec2;
    rightBottom: Vec2;
}

@ccclass("SqueezeCardMask")
export class SqueezeCardMask extends Mask implements DragHandler {
    private startDragPos: Vec2 = { x: 0, y: 0 };
    private dragVector: Vec2 = { x: 0, y: 0 };

    onLoad() {
        this.type = Mask.Type.GRAPHICS_STENCIL;
    }

    handleDrag(start: Vec2, dragVector: Vec2): void {
        this.startDragPos = start;
        this.dragVector = dragVector;

        this._updateGraphics();
    }

    protected _updateGraphics() {
        const path = this.calculateGraphicsPath();

        if (path.length >= 3) {
            const graphics = this.getGraphics();
            if (!graphics) {
                return;
            }
            graphics.clear();
            graphics.moveTo(path[0].x, path[0].y);
            for (let i = 1; i < path.length; i++) {
                graphics.lineTo(path[i].x, path[i].y);
            }
            graphics.close();
            graphics.fill();
        }
    }

    private calculateGraphicsPath(): Vec2[] {
        const cornerPositions: CornerPositions = this.getCornerPositions();

        const isDragging = calculateIsDragging(this.dragVector);
        if (!isDragging) {
            return [cornerPositions.leftTop, cornerPositions.rightTop, cornerPositions.rightBottom, cornerPositions.leftBottom];
        }

        const cutVector = { x: this.dragVector.y, y: -this.dragVector.x };
        const cutLinePoint = {
            x: this.startDragPos.x + this.dragVector.x / 2,
            y: this.startDragPos.y + this.dragVector.y / 2,
        };

        let minAcceptedCosine = 0;
        const edgeCutPosition = this.calculateEdgeCutPositions(cutLinePoint, cutVector);

        for (const edge in edgeCutPosition){
            const cutPos = edgeCutPosition[edge];
            if (cutPos != null) {
                const cosine = this.calculateDragAndToPointCosine(cutPos, cutLinePoint);
                minAcceptedCosine = Math.min(minAcceptedCosine, cosine);
            }
        }

        const mergedPos: Vec2[] = this.mergePositions(edgeCutPosition, cornerPositions);

        return mergedPos.filter((pos) => {
            const cosine = this.calculateDragAndToPointCosine(pos, cutLinePoint);
            return cosine >= minAcceptedCosine;
        });
    }

    private mergePositions(edgeCutPositions: EdgeCutPositions, cornerPositions: CornerPositions): Vec2[] {
        const positions: Vec2[] = [];

        if (edgeCutPositions.left !== null) {
            positions.push(edgeCutPositions.left);
        }
        positions.push(cornerPositions.leftTop);
        if (edgeCutPositions.top !== null) {
            positions.push(edgeCutPositions.top);
        }
        positions.push(cornerPositions.rightTop);
        if (edgeCutPositions.right !== null) {
            positions.push(edgeCutPositions.right);
        }
        positions.push(cornerPositions.rightBottom);
        if (edgeCutPositions.bottom !== null) {
            positions.push(edgeCutPositions.bottom);
        }
        positions.push(cornerPositions.leftBottom);

        return positions;
    }

    private calculateEdgeCutPositions(pointInCutLine: Vec2, cutVector: Vec2): EdgeCutPositions {
        const top = this.getTop();
        const right = this.getRight();

        const result: EdgeCutPositions = {
            left: null,
            top: null,
            right: null,
            bottom: null,
        };

        result.left = this.calculateCutVerticalEdgePos(pointInCutLine, cutVector, -right);
        result.top = this.calculateCutHorizontalEdgePos(pointInCutLine, cutVector, top);
        result.right = this.calculateCutVerticalEdgePos(pointInCutLine, cutVector, right);
        result.bottom = this.calculateCutHorizontalEdgePos(pointInCutLine, cutVector, -top);

        return result;
    }

    private getCornerPositions(): CornerPositions {
        const top = this.getTop();
        const right = this.getRight();

        return {
            leftTop: { x: -right, y: top },
            rightTop: { x: right, y: top },
            leftBottom: { x: -right, y: -top },
            rightBottom: { x: right, y: -top },
        };
    }

    private calculateCutVerticalEdgePos(point: Vec2, cutVector: Vec2, verticalLineX: number): Vec2 | null {
        if (cutVector.x === 0) {
            return null;
        }

        const m = (verticalLineX - point.x) / cutVector.x;
        const cutPoint = {
            x: verticalLineX,
            y: point.y + cutVector.y * m,
        };

        return this.isInsideRectangle(cutPoint) ? cutPoint : null;
    }

    private calculateCutHorizontalEdgePos(point: Vec2, cutVector: Vec2, horizontalLineY: number): Vec2 | null {
        if (cutVector.y === 0) {
            return null;
        }

        const m = (horizontalLineY - point.y) / cutVector.y;
        const cutPoint = {
            x: point.x + cutVector.x * m,
            y: horizontalLineY,
        };

        return this.isInsideRectangle(cutPoint) ? cutPoint : null;
    }

    private isInsideRectangle(point: Vec2): boolean {
        const top = this.getTop();
        const right = this.getRight();

        return point.x >= -right && point.x <= right && point.y >= -top && point.y <= top;
    }

    private calculateDragAndToPointCosine(point: Vec2, centerPoint: Vec2): number {
        const toPointVector: Vec2 = {
            x: point.x - centerPoint.x,
            y: point.y - centerPoint.y,
        };

        return calculateCosine(toPointVector, this.dragVector);
    }

    private getTop(): number {
        const uiTransform = this.node.getComponent(UITransform);
        return (uiTransform?.height ?? 0) * (uiTransform?.anchorY ?? 0.5);
    }

    private getRight(): number {
        const uiTransform = this.node.getComponent(UITransform);
        return (uiTransform?.width ?? 0) * (uiTransform?.anchorX ?? 0.5);
    }

    private getGraphics(): Graphics | null {
        return (this as unknown as { _graphics: Graphics | null })._graphics;
    }
}
