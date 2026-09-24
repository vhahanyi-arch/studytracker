"use client";
import { useEffect, useRef } from "react";
import { beginStroke } from "./inkStroke";

export function DrawingPad({
  onChange,
  background,
}: {
  onChange: (image: string) => void;
  background?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stroke = useRef<ReturnType<typeof beginStroke> | null>(null);
  const restoreBackground = () => {
    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d")!;
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (!background) return;
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(
        canvas.width / image.width,
        canvas.height / image.height,
      );
      const width = image.width * scale;
      const height = image.height * scale;
      context.drawImage(
        image,
        (canvas.width - width) / 2,
        (canvas.height - height) / 2,
        width,
        height,
      );
    };
    image.src = background;
  };
  useEffect(restoreBackground, [background]);
  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    canvas.setPointerCapture(e.pointerId);
    stroke.current = beginStroke(canvas, e.nativeEvent, (ctx) => {
      ctx.strokeStyle = "#29263c";
      ctx.lineWidth = 3;
    });
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    stroke.current?.add(e.nativeEvent);
  };
  const stop = () => {
    if (!stroke.current) return;
    stroke.current.end();
    stroke.current = null;
    onChange(canvasRef.current!.toDataURL("image/png"));
  };
  const clear = () => {
    restoreBackground();
    onChange(background || "");
  };
  return (
    <div className="drawing-pad">
      <div>
        <b>
          {background ? "Draw your answer on the question" : "Freehand drawing"}
        </b>
        <small>Mouse, touchscreen or stylus</small>
        <button type="button" onClick={clear}>
          Clear
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={900}
        height={360}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={stop}
        onPointerCancel={stop}
      />
    </div>
  );
}
