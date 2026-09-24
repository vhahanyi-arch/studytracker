// One pen stroke on a canvas, shared by DrawingPad and PdfAnnotator.
//
// Both used to call stroke() on the whole growing path at every pointermove.
// That is invisible with an opaque pen but not with the translucent
// highlighter: every earlier segment was painted again on each move, so a
// stroke meant to be 35% yellow reached 254/255 alpha within a few centimetres
// and hid the printed question under it. Now the canvas is put back to how it
// was before the stroke and the path is drawn once, at most once a frame.
//
// It also reads every pointer sample the browser coalesced into a move (a
// stylus reports far more often than the screen refreshes, and without them
// a quick curve becomes a polygon), and puts a dot down on the press itself,
// so a decimal point or a tap answers straight away.

export function beginStroke(
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  style: (context: CanvasRenderingContext2D) => void,
) {
  const context = canvas.getContext("2d")!;
  const before = document.createElement("canvas");
  before.width = canvas.width;
  before.height = canvas.height;
  before.getContext("2d")!.drawImage(canvas, 0, 0);
  const points: Array<[number, number]> = [];
  let frame = 0;

  const toCanvas = (sample: { clientX: number; clientY: number }): [number, number] => {
    const rect = canvas.getBoundingClientRect();
    return [
      ((sample.clientX - rect.left) * canvas.width) / rect.width,
      ((sample.clientY - rect.top) * canvas.height) / rect.height,
    ];
  };
  const draw = () => {
    frame = 0;
    context.save();
    context.globalCompositeOperation = "copy";
    context.drawImage(before, 0, 0);
    context.restore();
    context.save();
    context.lineCap = "round";
    context.lineJoin = "round";
    style(context);
    context.beginPath();
    context.moveTo(...points[0]);
    // Starts with a zero-length segment, which a round cap draws as a dot.
    for (const point of points) context.lineTo(...point);
    context.stroke();
    context.restore();
  };
  const add = (next: PointerEvent) => {
    const samples = next.getCoalescedEvents?.() ?? [];
    for (const sample of samples.length ? samples : [next]) points.push(toCanvas(sample));
    if (!frame) frame = requestAnimationFrame(draw);
  };

  add(event);
  cancelAnimationFrame(frame);
  draw();

  return {
    add,
    end() {
      if (!frame) return;
      cancelAnimationFrame(frame);
      draw();
    },
  };
}
