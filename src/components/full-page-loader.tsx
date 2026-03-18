import { ModalBody, ModalContent, Modal, Spinner } from "@heroui/react";
import { memo, useMemo } from "react";

type FullPageLoaderType = {
  isLoading: boolean;
};

function FullPageLoader({ isLoading }: FullPageLoaderType) {
  const classNames = useMemo(
    () => ({
      base: "",
    }),
    []
  );

  return (
    <Modal
      isOpen={isLoading}
      backdrop="blur"
      classNames={classNames}
      hideCloseButton
      isDismissable={false}
      isKeyboardDismissDisabled
    >
      <ModalContent className="h-20 w-20">
        {() => (
          <>
            <ModalBody className="flex content-center justify-center">
              <Spinner />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default memo(FullPageLoader);
