import { _decorator, Component } from "cc";
import { Vec2 } from "./vec-2";

export interface DragHandler {
    handleDrag(start: Vec2, dragVector: Vec2): void;
}

const { ccclass } = _decorator;

@ccclass("DragHandlerComponent")
export abstract class DragHandlerComponent extends Component implements DragHandler {
    abstract handleDrag(start: Vec2, dragVector: Vec2): void;
}