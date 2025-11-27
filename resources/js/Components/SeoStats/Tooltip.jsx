class Tooltip {
    constructor() {
        this.el = document.createElement("div");

        this.el.className =
            "fixed px-3 py-2 bg-card-bg text-text-primary border border-border-color text-xs rounded-lg shadow-lg pointer-events-none z-[99999] w-80 max-w-[90vw]";
        this.el.style.transform = "translate(-50%, -100%)";
        this.el.style.display = "none";

        document.body.appendChild(this.el);
    }

    show({ x, y, url }) {
        this.el.textContent = url;
        this.el.style.left = `${x}px`;
        this.el.style.top = `${y - 10}px`;
        this.el.style.display = "block";
    }

    hide() {
        this.el.style.display = "none";
    }
}

export default Tooltip;