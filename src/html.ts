import { registerEvent, registerKeyEvent } from "./utils";


/** Get the offset to the window of an element */
function offset(el: HTMLElement | null, prop: "offsetLeft" | "offsetTop") {
    var offset = -(prop === "offsetTop" ? window.pageYOffset : window.pageXOffset);
    while (el && el instanceof HTMLElement) {
        offset += el[prop];
        el = <HTMLElement>el.offsetParent;
    }

    return offset;
}

/** Remove the child of an element if the element contains this child */
function removeChildSafe(parent: HTMLElement, child: HTMLElement) {
    if (child.parentElement === parent) parent.removeChild(child);
}

/** Track the number of modals on screen, and the initial overflow of the body element */
var modalInstance: {overflowX: string | null, overflowY: string | null, instance: number} | null = null;

/** Render the given element as a modal, and return a function to close the modal */
function createModal(content: HTMLElement) {
    var modal = document.createElement("div");
    modal.className = "mtl-modal";

    modal.appendChild(content);
    document.body.appendChild(modal);

    // cache the body overflow
    if (!modalInstance) {
        modalInstance = {
            overflowX: document.body.style.overflowX,
            overflowY: document.body.style.overflowY,
            instance: 1
        };

        document.body.style.overflowX = "hidden";
        document.body.style.overflowY = "hidden";
    } else {
        modalInstance.instance ++;
    }
    
    // register close events
    var onClickOrEsc: (() => void)[] = [];
    var disposeOnClick = registerEvent(modal, "click", (e) => {
        if (e.target !== modal) return;
        onClickOrEsc.slice(0).forEach(f => f());
    });
    
    var disposeOnEsc = registerKeyEvent(document, "keydown", (e) => {
        if (e.key !== "Escape") return;
        onClickOrEsc.slice(0).forEach(f => f());
    });

    var done = false;
    return {
        /** Add an event lisener to the mask being clicked or the escape key being pressed */
        onClickOrEsc: (f: () => void) => onClickOrEsc.push(f),
        /** Remove the modal from the screen */
        dispose: () => {
            if (done) return;
            done = true;

            disposeOnClick();
            disposeOnEsc();
            onClickOrEsc.length = 0;

            removeChildSafe(modal, content);
            removeChildSafe(document.body, modal);

            // reset the body overflow if this is the last modal
            if (modalInstance) {
                if (modalInstance.instance > 1) {
                    modalInstance.instance--;
                } else {
                    document.body.style.overflowX = modalInstance.overflowX;
                    document.body.style.overflowY = modalInstance.overflowY;
                    modalInstance = null;
                }
            }
        }
    };
}

export {
    createModal,
    offset,
    removeChildSafe
}