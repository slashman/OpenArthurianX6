function DoubleTapBehavior(component, singleTapCallback, doubleTapCallback) {
    component.inputEnabled = true;
    this.reset(component, singleTapCallback, doubleTapCallback);
}

DoubleTapBehavior.prototype = {
    reset(component, singleTapCallback, doubleTapCallback) {
        let clickCount = 0;
        let leftButton, rightButton;
        if (this.singleClickTimer) {
            clearTimeout(this.singleClickTimer);
        }
        component.events.onInputUp.removeAll();
        component.events.onInputUp.add((sprite, pointer, isOver) => {
            if (this.singleClickTimer) {
                clearTimeout(this.singleClickTimer);
            }
            if (!isOver) {
                clickCount = 0;
                return;
            }
            leftButton = pointer.leftButton.justReleased();
            rightButton = pointer.rightButton.justReleased();

            clickCount++;
            if (clickCount === 1) {
                this.singleClickTimer = setTimeout(function() {
                    clickCount = 0;
                    singleTapCallback(leftButton, rightButton);
                }, 200);
            } else if (clickCount === 2) {
                clickCount = 0;
                doubleTapCallback(leftButton, rightButton);
            }
        });
    },
    destroy() {
        if (this.singleClickTimer) {
            clearTimeout(this.singleClickTimer);
        }
    }
}

module.exports = DoubleTapBehavior;