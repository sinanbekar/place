import React from "react";
import ReactDOM from "react-dom";

interface Props {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleCloseClick?: (
    e: React.MouseEvent<HTMLElement> | MouseEvent
  ) => void | null;
  title?: string;
  reRenderOnCloseOpen?: boolean;
}

const Modal: React.FC<Props> = ({
  showModal,
  setShowModal,
  handleCloseClick = null,
  children,
  title = "",
  reRenderOnCloseOpen = true,
}) => {
  if (handleCloseClick === null) {
    handleCloseClick = (e) => {
      e.preventDefault();
      setShowModal(false);
    };
  }
  const modalContent = (showModal || !reRenderOnCloseOpen) && (
    <div
      className={`fixed ${
        !showModal && !reRenderOnCloseOpen ? "hidden" : ""
      } top-0 left-0 w-full h-full z-50 flex justify-center items-center`}
    >
      <div className="bg-white border-2 w-[400px] h-[500px] rounded-2xl p-2">
        <div className="h-full px-8 py-2">
          <div className="font-bold text-lg py-2">{title}</div>
          <div className="h-full">{children}</div>
        </div>
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return ReactDOM.createPortal(modalContent, document.body);
  } else {
    return null;
  }
};

export default Modal;
