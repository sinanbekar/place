import React from "react";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { setColorHex } from "../features/colorSlice";
import { debounce } from "lodash";

const ColorPicker = () => {
  const dispatch = useAppDispatch();
  const [inputValue, setInputValue] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const { hex: colorHex } = useAppSelector((state) => state.color);

  React.useEffect(() => {
    if (isTyping) return;

    if (inputValue !== colorHex) {
      setInputValue(colorHex);
    }
  }, [isTyping, inputValue, colorHex]);

  const colorChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    let hex = e.target.value.replace(/[^A-Fa-f0-9]/g, "").toUpperCase();
    hex = hex.substring(0, 6);
    while (hex.length < 6) {
      hex += "0";
    }
    // TODO CSS like when processing
    hex = "#" + hex;
    dispatch(setColorHex(hex));
    setIsTyping(false);
    setInputValue(hex);
  };

  const debouncedColorEventHandler = React.useMemo(
    () => debounce(colorChangeHandler, 1000),
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsTyping(true);
    setInputValue(e.target.value);
    debouncedColorEventHandler(e);
  };

  React.useEffect(() => {
    return () => {
      debouncedColorEventHandler.cancel();
    };
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  return (
    <>
      <div style={{ backgroundColor: inputValue }} className="w-5 h-5"></div>
      <input
        onChange={handleChange}
        className="h-5 p-0.5 border-none outline-none"
        type="text"
        placeholder="#000000"
        value={inputValue}
      />
    </>
  );
};

export default ColorPicker;
