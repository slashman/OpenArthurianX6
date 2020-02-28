function DoubleTapBehavior(component, singleTapCallback, doubleTapCallback) {
    component.inputEnabled = true;
    let clickCount = 0;
    let singleClickTimer, leftButton, rightButton;
    component.events.onInputUp.add((sprite, pointer, isOver) => {
        if (singleClickTimer) {
            clearTimeout(singleClickTimer);
        }
        if (!isOver) {
            clickCount = 0;
            return;
        }
        leftButton = pointer.leftButton.justReleased();
        rightButton = pointer.rightButton.justReleased();

        clickCount++;
        if (clickCount === 1) {
            singleClickTimer = setTimeout(function() {
                clickCount = 0;
                singleTapCallback(leftButton, rightButton);
            }, 200);
        } else if (clickCount === 2) {
            clickCount = 0;
            doubleTapCallback(leftButton, rightButton);
        }
	});
}

module.exports = DoubleTapBehavior;