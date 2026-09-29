import { _decorator, Component, EventTouch, Node, UITransform, Vec3 } from "cc";
import { HandleSqueezeCardDrag } from "./handle-squeeze-card-drag";
import { Vec2 } from "./vec-2";

const { ccclass, property } = _decorator;

@ccclass("CardSqueezeDragDrop")
export class CardSqueezeDragDrop extends Component {
    @property(HandleSqueezeCardDrag) private handleSqueezeCardDrag: HandleSqueezeCardDrag = null;
    @property(Node) private backCardNode: Node = null;
    private startPos: Vec2 = { x: 0, y: 0 };

    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onDestroy() {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    protected onDisable(): void {
        this.onTouchEnd();
    }

    protected start(): void {
        this.setupSize();
        this.updateDrag({ x: 0, y: 0 }, { x: 0, y: 0 });
    }

    private setupSize() {
        const selfTransform = this.node.getComponent(UITransform);
        const backTransform = this.backCardNode.getComponent(UITransform);
        if (!selfTransform || !backTransform) {
            return;
        }
        selfTransform.setContentSize(backTransform.width, backTransform.height);
    }

    private onTouchStart(event: EventTouch) {
        this.startPos = this.getMouseLocalPosition(event);
    }

    private onTouchMove(event: EventTouch) {
        const endPoint = this.getMouseLocalPosition(event);

        this.updateDrag(
            {
                x: this.startPos.x,
                y: this.startPos.y,
            },
            { x: endPoint.x, y: endPoint.y }
        );
    }

    private onTouchEnd() {
        this.updateDrag({ x: 0, y: 0 }, { x: 0, y: 0 });
    }

    private getMouseLocalPosition(event: EventTouch): Vec2 {
        const mousePosition = event.getUILocation();
        const uiTransform = this.node.getComponent(UITransform);
        const nodeSpacePosition = uiTransform
            ? uiTransform.convertToNodeSpaceAR(new Vec3(mousePosition.x, mousePosition.y, 0))
            : new Vec3();

        return { x: nodeSpacePosition.x, y: nodeSpacePosition.y };
    }

    private updateDrag(start: Vec2, end: Vec2) {
        this.handleSqueezeCardDrag.updateDrag(start, end);
    }
}
