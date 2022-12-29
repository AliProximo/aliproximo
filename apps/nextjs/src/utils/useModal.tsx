import { useState } from "react";

type Props = { onClose: () => void };

export function useModal({ onClose }: Props = {} as Props) {
  const [openModal, setModalState] = useState(false);

  const Modal: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <>
      <input
        type="checkbox"
        id="my-modal-4"
        checked={openModal}
        className="modal-toggle"
        onChange={() => {
          setModalState(false);
          onClose();
        }}
      />
      <label
        htmlFor="my-modal-4"
        className={`modal cursor-pointer ${openModal ? "modal-open" : ""}`}
      >
        <label className="modal-box relative" htmlFor="">
          <label
            htmlFor="my-modal-4"
            className="btn btn-sm btn-circle absolute right-2 top-2"
          >
            ✕
          </label>
          {children}
          <div className="modal-action">
            <label htmlFor="my-modal-4" className="btn">
              Fechar
            </label>
          </div>
        </label>
      </label>
    </>
  );

  return {
    Modal,
    open: () => setModalState(true),
    close: () => setModalState(false),
  };
}
