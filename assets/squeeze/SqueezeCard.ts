import { _decorator, Component, EventTouch, Node, UITransform, Vec3 } from "cc";
import { DragHandler, DragHandlerComponent } from "./DragHandler";
import { SqueezeCardDragCalculator } from "./SqueezeCardDragCalculator";
import SqueezeCardFrontCardTransform from "./SqueezeCardFrontCardTransform";
import { SqueezeCardMask } from "./SqueezeCardMask";
import { Vec2 } from "./vec-2";

const { ccclass, property } = _decorator;

@ccclass("SqueezeCard")
export class SqueezeCard extends Component {
    @property(Node) private backCardNode: Node = null;
    @property(Node) private frontCardNode: Node = null;
    @property({ type: [DragHandlerComponent] }) private dragHandlerComps: DragHandlerComponent[] = [];

    private dragHandlers: DragHandler[] = [];
    private dragCalculator: SqueezeCardDragCalculator;

    private startPos: Vec2 = { x: 0, y: 0 };

    onLoad() {
        this.dragCalculator = new SqueezeCardDragCalculator(this.backCardNode);
        this.registerEvents();
        this.setupDragHandlers();
    }

    private setupDragHandlers() {
        this.dragHandlers.push(...this.dragHandlerComps);
        this.dragHandlers.push(new SqueezeCardFrontCardTransform(this.frontCardNode));

        const mask = this.node.addComponent(SqueezeCardMask);
        this.dragHandlers.push(mask);
    }

    onDestroy() {
        this.unregisterEvents();
    }

    private registerEvents() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    private unregisterEvents() {
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
        const dragData = this.dragCalculator.calculateSqueezeDrag(start, end);
        for (const dragHandler of this.dragHandlers) {
            dragHandler.handleDrag(dragData.start, dragData.dragVector);
        }
    }
}
