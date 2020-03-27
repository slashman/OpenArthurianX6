const Timer = require('../Timer');

function DoubleTapBehavior(component, singleTapCallback, doubleTapCallback, canDragFunction, onDragStart) {
    component.inputEnabled = true;
    this.reset(component, singleTapCallback, doubleTapCallback, canDragFunction, onDragStart);
}

DoubleTapBehavior.prototype = {
    __startDragging(pointer, onDragStart) {
        if (!pointer.isDown) {
            // No dragging, just clicking
            OAX6.UI.dragStatus = 'idle';
            return;
        }
        OAX6.UI.dragStatus = 'dragging';
        onDragStart();
    },
    reset(component, singleTapCallback, doubleTapCallback, canDragFunction, onDragStart) {
        let clickCount = 0;
        let leftButton, rightButton;
        if (this.singleClickTimer) {
            clearTimeout(this.singleClickTimer);
        }
        component.events.onInputUp.removeAll();
        if (canDragFunction) {
            component.events.onInputDown.removeAll();
            component.events.onInputDown.add((sprite, pointer, isOver) => {
                if (canDragFunction()) {
                    OAX6.UI.dragStatus = 'delay';
                    Timer.delay(200).then(() => {
                        this.__startDragging(pointer, onDragStart);
                    });
                }
            });
        }
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
                }, 300);
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