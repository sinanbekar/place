import React from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { setColorHex } from "../features/colorSlice";
import { getSocket, PixelEvent, useSendByteMutation } from "../services/socket";
import { CanvasService } from "../services/webgl";
import {
  fromHexString,
  getUint32,
  putUint32,
  toHexString,
} from "../utility/helpers";

interface Pos {
  x: number;
  y: number;
}

export const useCanvas = () => {
  const useStateRef = <T extends unknown>(initialState: T) => {
    // TODO: typing
    const ref = React.useRef(initialState);
    const setter = React.useRef((v?: any) => (ref.current = v)).current;
    const getter = React.useRef(() => ref.current).current;
    return [getter, setter];
  };

  const cvs = React.useRef<HTMLCanvasElement>(null);

  const [getCanvasService, setCanvasService] = useStateRef(null);

  const [dragdown, setDragdown] = useStateRef(false);
  const [lastMovePos, setLastMovePost] = useStateRef({ x: 0, y: 0 });
  const [getTouchstartTime, setTouchStartTime] = useStateRef(null);

  const dispatch = useAppDispatch();
  const [sendByte] = useSendByteMutation();

  const colorHexState = useAppSelector((state) => state.color.hex);
  const color = React.useRef(new Uint8Array([0, 0, 0]));
  React.useEffect(() => {
    color.current = fromHexString(colorHexState.replace("#", ""));
  }, [colorHexState]);

  const [isMapLoading, setIsMapLoading] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    if (!cvs.current) return;

    setCanvasService(new CanvasService(cvs.current));
    const canvasService: CanvasService = getCanvasService();

    setIsMapLoading(true);

    // TODO: Error handling
    fetch(process.env.REACT_APP_PLACE_CANVAS_URL as string)
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        setImage(buffer);
        setIsMapLoading(false);
      });

    const setImage = async (buffer: ArrayBuffer) => {
      const img = new Image();
      const blob = new Blob([buffer], { type: "image/png" });
      const blobUrl = URL.createObjectURL(blob);
      img.src = blobUrl;
      const promise = new Promise<void>((resolve, reject) => {
        img.onload = () => {
          canvasService.setTexture(img);
          canvasService.draw();
          resolve();
        };
        img.onerror = reject;
      });
      await promise;
    };
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  React.useEffect(() => {
    const canvasService: CanvasService = getCanvasService();
    if (!canvasService) return;
    const socket = getSocket();
    if (!socket) return;

    socket.on(PixelEvent.RECEIVE_PIXEL, (b: ArrayBuffer) => {
      const x = getUint32(b, 0);
      const y = getUint32(b, 4);
      const color = new Uint8Array(b.slice(8));
      canvasService.setPixelColor(x, y, color);
      canvasService.draw();
    });
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  const zoomIn = () => {
    const canvasService: CanvasService = getCanvasService();
    if (!canvasService) return;
    canvasService.setZoom((canvasService.getZoom() ?? 1) * 1.2);
    canvasService.draw();
  };

  const zoomOut = () => {
    const canvasService: CanvasService = getCanvasService();
    if (!canvasService) return;
    canvasService.setZoom((canvasService.getZoom() ?? 1) / 1.2);
    canvasService.draw();
  };

  React.useEffect(() => {
    const canvasService: CanvasService = getCanvasService();
    if (!canvasService) return;

    const cvs = canvasService.getCanvas();

    const handleKeydown = (e: KeyboardEvent) => {
      switch (e.keyCode) {
        case 189:
        case 173:
          e.preventDefault();
          zoomOut();
          break;
        case 187:
        case 61:
          e.preventDefault();
          zoomIn();
          break;
      }
    };

    document.addEventListener("keydown", handleKeydown);

    const handleWheel = (e: WheelEvent) => {
      let zoom = canvasService.getZoom() ?? 1;
      if (e.deltaY > 0) {
        zoom /= 1.05;
      } else {
        zoom *= 1.05;
      }
      canvasService.setZoom(zoom);
      canvasService.draw();
    };

    window.addEventListener("wheel", handleWheel);

    const handleResize = () => {
      canvasService.updateViewScale();
      canvasService.draw();
    };

    window.addEventListener("resize", handleResize);

    cvs.oncontextmenu = function () {
      return false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      cvs.addEventListener("mousemove", handleMouseMove);
      cvs.addEventListener("mouseup", handleMouseUp);

      switch (e.button) {
        case 0:
          setDragdown(true);
          setLastMovePost({ x: e.clientX, y: e.clientY });
          break;
        case 1:
          pickColor({ x: e.clientX, y: e.clientY });
          break;
        case 2:
          if (e.ctrlKey) {
            pickColor({ x: e.clientX, y: e.clientY });
          } else {
            drawPixel({ x: e.clientX, y: e.clientY });
          }
      }
    };

    cvs.addEventListener("mousedown", handleMouseDown);

    const handleMouseMove = (e: MouseEvent) => {
      const movePos = { x: e.clientX, y: e.clientY };
      if (dragdown()) {
        const lastMovePosXY = lastMovePos();
        canvasService.move(
          movePos.x - lastMovePosXY.x,
          movePos.y - lastMovePosXY.y
        );
        canvasService.draw();
        document.body.style.cursor = "grab";
      }

      setLastMovePost(movePos);
    };

    const handleMouseUp = () => {
      cvs.removeEventListener("mousemove", handleMouseMove);
      cvs.removeEventListener("mouseup", handleMouseUp);

      setDragdown(false);
      document.body.style.cursor = "auto";
    };

    const handleTouchStart = (e: TouchEvent) => {
      setTouchStartTime(new Date().getTime());
      setLastMovePost({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    };

    cvs.addEventListener("touchstart", handleTouchStart);

    const handleTouchEnd = () => {
      const elapsed = new Date().getTime() - getTouchstartTime();
      if (elapsed < 200) {
        drawPixel(lastMovePos());
      }
    };

    cvs.addEventListener("touchend", handleTouchEnd);

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const movePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      const lastMovePosXY = lastMovePos();
      canvasService.move(
        movePos.x - lastMovePosXY.x,
        movePos.y - lastMovePosXY.y
      );
      canvasService.draw();
      setLastMovePost(movePos);
    };

    cvs.addEventListener("touchmove", handleTouchMove);

    const pickColor = (pos: Pos) => {
      const color = canvasService.getColor(canvasService.click(pos));
      dispatch(setColorHex(("#" + toHexString(color)).toUpperCase()));
    };

    const setPixel = (x: number, y: number, color: Uint8Array) => {
      let b = new Uint8Array(11);
      putUint32(b.buffer, 0, x);
      putUint32(b.buffer, 4, y);
      for (let i = 0; i < 3; i++) {
        b[8 + i] = color[i];
      }

      sendByte(b);

      canvasService.setPixelColor(x, y, color);
      canvasService.draw();
    };

    const drawPixel = (pos: Pos) => {
      pos = canvasService.click(pos);
      if (pos) {
        const oldColor = canvasService.getColor(pos);

        if (oldColor) {
          for (let i = 0; i < oldColor.length; i++) {
            if (oldColor[i] !== color.current[i]) {
              setPixel(pos.x, pos.y, color.current);
              break;
            }
          }
        }
      }
    };

    return function cleanup() {
      cvs.removeEventListener("mousedown", handleMouseDown);
      cvs.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("keydown", handleKeydown);
    };
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  return { cvs, isMapLoading, zoomIn, zoomOut };
};
