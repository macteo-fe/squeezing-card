import { _decorator, Component, sp } from "cc";

const { ccclass, property } = _decorator;

@ccclass("RevealArrowSpineAnimation")
export default class RevealArrowSpineAnimation extends Component {
    @property(sp.Skeleton)
    private spine: sp.Skeleton = null;

    onLoad() {
        if (!this.spine) {
            this.spine = this.getComponent(sp.Skeleton);
        }
    }

    play(loop = true) {
        this.spine?.setAnimation(0, this.getAnimationName(), loop);
    }

    stop() {
        this.spine?.clearTracks();
    }

    protected getAnimationName(): string {
        return "anim-arrow";
    }
}
