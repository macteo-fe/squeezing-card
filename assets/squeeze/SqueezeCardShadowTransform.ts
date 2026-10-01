import { _decorator, Component, Node, UITransform, Vec3 } from "cc";
import { DragHandler } from "./DragHandler";
import { Vec2 } from "./vec-2";

const { ccclass, property } = _decorator;

@ccclass("SqueezeCardShadowTransform")
export default class SqueezeCardShadowTransform extends Component implements DragHandler {
    @property(Node) private shadowNode: Node = null;
    @property(Node) private backCardNode: Node = null;

    handleDrag(start: Vec2, dragVector: Vec2): void {
        const shadowAngle = Math.atan2(dragVector.x, dragVector.y);
        this.shadowNode.angle = -shadowAngle * (180 / Math.PI) - this.getWorldRotation();

        const foldPoint = {
            x: start.x + dragVector.x / 2,
            y: start.y + dragVector.y / 2,
        };

        const backTransform = this.backCardNode.getComponent(UITransform);
        const parentTransform = this.shadowNode.parent?.getComponent(UITransform);
        if (!backTransform || !parentTransform) {
            return;
        }

        const worldFoldPoint = backTransform.convertToWorldSpaceAR(new Vec3(foldPoint.x, foldPoint.y, 0));
        const localFoldPoint = parentTransform.convertToNodeSpaceAR(worldFoldPoint);
        this.shadowNode.setPosition(localFoldPoint.x, localFoldPoint.y);
    }

    private getWorldRotation(): number {
        const parentTransform = this.shadowNode.parent?.getComponent(UITransform);
        if (!parentTransform) {
            return 0;
        }

        const worldRightPoint = parentTransform.convertToWorldSpaceAR(new Vec3(1, 0, 0));
        const worldCenterPoint = parentTransform.convertToWorldSpaceAR(new Vec3(0, 0, 0));

        const worldToRightVector = {
            x: worldRightPoint.x - worldCenterPoint.x,
            y: worldRightPoint.y - worldCenterPoint.y,
        };

        return (Math.atan2(worldToRightVector.y, worldToRightVector.x) * 180) / Math.PI;
    }
}
