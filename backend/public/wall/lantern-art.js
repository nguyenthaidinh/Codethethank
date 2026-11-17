// Cached, procedural paper lanterns. No external image assets or per-frame gradients.
export function createLanternArt() {
    const canvas = document.createElement("canvas");
    canvas.width = 384;
    canvas.height = 448;
    const c = canvas.getContext("2d");
    if (!c) return null;
    c.translate(192, 184);
    const halo = c.createRadialGradient(0, 25, 8, 0, 20, 176);
    halo.addColorStop(0, "#ffd39450");
    halo.addColorStop(0.35, "#ecb06524");
    halo.addColorStop(1, "#e7a55700");
    c.fillStyle = halo;
    c.fillRect(-192, -184, 384, 448);
    const shell = new Path2D();
    shell.moveTo(-36, -88);
    shell.bezierCurveTo(-100, -72, -102, 52, -35, 86);
    shell.quadraticCurveTo(0, 99, 35, 86);
    shell.bezierCurveTo(102, 52, 100, -72, 36, -88);
    shell.quadraticCurveTo(0, -98, -36, -88);
    c.save();
    c.clip(shell);
    const paper = c.createLinearGradient(-86, -10, 88, 25);
    paper.addColorStop(0, "#824a35");
    paper.addColorStop(0.13, "#bb7445");
    paper.addColorStop(0.35, "#e4ac69");
    paper.addColorStop(0.55, "#f8d69a");
    paper.addColorStop(0.77, "#cf8d50");
    paper.addColorStop(1, "#754431");
    c.fillStyle = paper;
    c.fillRect(-110, -110, 220, 220);
    const core = c.createRadialGradient(9, 36, 0, 0, 24, 112);
    core.addColorStop(0, "#fff0bfdf");
    core.addColorStop(0.4, "#ffdc8555");
    core.addColorStop(1, "#8e4c2000");
    c.fillStyle = core;
    c.fillRect(-110, -110, 220, 220);
    // Fine horizontal paper fibres are deterministic, rendered once at startup.
    for (let i = 0; i < 125; i++) {
        const y = -100 + i * 1.65;
        c.strokeStyle = i % 3 ? "#fff3c009" : "#603b2212";
        c.lineWidth = 0.6;
        c.beginPath();
        c.moveTo(-90, y);
        c.quadraticCurveTo(0, y + ((i * 7) % 5) - 2, 90, y);
        c.stroke();
    }
    for (let i = -3; i <= 3; i++) {
        const k = i / 3;
        c.beginPath();
        c.moveTo(k * 30, -91);
        c.bezierCurveTo(k * 105, -47, k * 104, 42, k * 30, 91);
        c.strokeStyle = "#8c502b68";
        c.lineWidth = 2.2;
        c.stroke();
        c.strokeStyle = "#ffe6b380";
        c.lineWidth = 0.7;
        c.stroke();
    }
    // Delicate bands follow the curved volume rather than flat rectangular stripes.
    for (const y of [-65, 65]) {
        c.beginPath();
        c.ellipse(0, y, 78, 12, 0, 0, Math.PI * 2);
        c.strokeStyle = "#dca86988";
        c.lineWidth = 2;
        c.stroke();
    }
    c.restore();
    c.strokeStyle = "#f6d69c60";
    c.lineWidth = 1;
    c.stroke(shell);
    for (const y of [-91, 91]) {
        const rim = c.createLinearGradient(-34, y, 34, y);
        rim.addColorStop(0, "#5e4131");
        rim.addColorStop(0.5, "#d1a96b");
        rim.addColorStop(1, "#775037");
        c.fillStyle = rim;
        c.beginPath();
        c.ellipse(0, y, 35, 7, 0, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = "#ffdf9f99";
        c.lineWidth = 1;
        c.stroke();
    }
    c.strokeStyle = "#c39b60";
    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(-17, -96);
    c.quadraticCurveTo(0, -122, 17, -96);
    c.stroke();
    c.strokeStyle = "#d9af72";
    c.beginPath();
    c.moveTo(0, 96);
    c.lineTo(0, 120);
    c.stroke();
    c.fillStyle = "#e9c187";
    c.beginPath();
    c.arc(0, 123, 3, 0, Math.PI * 2);
    c.fill();
    for (let i = -3; i <= 3; i++) {
        c.strokeStyle = i % 2 ? "#c7915c" : "#e1b37b";
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(i * 0.7, 126);
        c.quadraticCurveTo(i * 2, 139, i * 2 + 2, 153 - Math.abs(i));
        c.stroke();
    }
    return canvas;
}
