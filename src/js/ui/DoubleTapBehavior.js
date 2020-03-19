const Timer = require('../Timer');

function DoubleTapBehavior(component, singleTapCallback, doubleTapCallback, onDragStart) {
    component.inputEnabled = true;
    this.reset(component, singleTapCallback, doubleTapCallback, onDragStart);
}

DoubleTapBehavior.prototype = {
    __startDragging(pointer, onDragStart) {
        if (!pointer.isDown) {
            // No dragging, just clicking
            this.cursor.status = CURSOR_STATUS.IDLE;
            return;
        }
        onDragStart();
    },
    reset(component, singleTapCallback, doubleTapCallback, onDragStart) {
        let clickCount = 0;
        let leftButton, rightButton;
        if (this.singleClickTimer) {
            clearTimeout(this.singleClickTimer);
        }
        component.events.onInputUp.removeAll();
        if (onDragStart) {
            component.events.onInputDown.removeAll();
            component.events.onInputDown.add((sprite, pointer, isOver) => {
                Timer.delay(100).then(() => {
                    this.__startDragging(pointer, onDragStart);
                });
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