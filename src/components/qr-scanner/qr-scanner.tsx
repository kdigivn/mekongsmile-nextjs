import {
  Html5QrcodeScanner,
  QrcodeErrorCallback,
  QrcodeSuccessCallback,
} from "html5-qrcode";
import { Html5QrcodeScannerConfig } from "html5-qrcode/esm/html5-qrcode-scanner";
import { memo, useEffect } from "react";

const qrcodeRegionId = "html5qr-code-full-region";

// Creates the configuration object for Html5QrcodeScanner.
const createConfig = (props: Html5QrcodeScannerConfig) => {
  const config: Html5QrcodeScannerConfig = { fps: 30 };
  if (props.fps) {
    config.fps = props.fps;
  }
  if (props.qrbox) {
    config.qrbox = props.qrbox;
  }
  if (props.aspectRatio) {
    config.aspectRatio = props.aspectRatio;
  }
  if (props.disableFlip !== undefined) {
    config.disableFlip = props.disableFlip;
  }

  if (props.defaultZoomValueIfSupported) {
    config.defaultZoomValueIfSupported = props.defaultZoomValueIfSupported;
  }

  if (props.showZoomSliderIfSupported) {
    config.showZoomSliderIfSupported = props.showZoomSliderIfSupported;
  }
  return config;
};

type Props = {
  configs: Html5QrcodeScannerConfig;
  verboseConfig?: boolean;
  onCodeSuccess: QrcodeSuccessCallback;
  onCodeError?: QrcodeErrorCallback;
};

const Html5QrcodePlugin = ({
  configs,
  verboseConfig = false,
  onCodeError,
  onCodeSuccess,
}: Props) => {
  useEffect(() => {
    // when component mounts
    const config = createConfig(configs);
    const verbose = verboseConfig === true;
    // Suceess callback is required.
    if (!onCodeSuccess) {
      throw "qrCodeSuccessCallback is required callback.";
    }
    const html5QrcodeScanner = new Html5QrcodeScanner(
      qrcodeRegionId,
      config,
      verbose
    );
    html5QrcodeScanner.render(onCodeSuccess, onCodeError);

    // cleanup function when component will unmount
    return () => {
      html5QrcodeScanner.clear().catch((error) => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, [configs, onCodeError, onCodeSuccess, verboseConfig]);

  return <div id={qrcodeRegionId} />;
};

export default memo(Html5QrcodePlugin);
