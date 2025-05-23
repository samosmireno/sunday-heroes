import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { ReactNode } from "react";

interface ModalProps {
  children: ReactNode;
}

const Modal = ({ children }: ModalProps) => {
  const elRef = useRef<HTMLDivElement | null>(null);
  if (!elRef.current) {
    elRef.current = document.createElement("div");
  }

  useEffect(() => {
    const modalRoot = document.getElementById("modal");
    if (modalRoot && elRef.current) {
      modalRoot.appendChild(elRef.current);
      return () => {
        if (modalRoot && elRef.current) {
          modalRoot.removeChild(elRef.current);
        }
      };
    }
  }, []);

  return createPortal(<div>{children}</div>, elRef.current);
};

export default Modal;
