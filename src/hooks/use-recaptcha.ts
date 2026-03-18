import { useState, useRef, useCallback, useEffect } from "react";
import type ReCAPTCHA from "react-google-recaptcha";

const useReCaptcha = () => {
  const [captcha, setCaptcha] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const reCaptchaRef = useRef<ReCAPTCHA | null>(null);

  const handleReCaptchaChange = useCallback((token: string | null) => {
    if (token) {
      setCaptcha(token);
      setError(null);
    }
  }, []);

  const resetReCaptchaRef = useCallback(() => {
    reCaptchaRef?.current?.reset();
    setCaptcha("");
    setError(null);
  }, []);

  const executeRecaptcha = useCallback(async (): Promise<string | null> => {
    if (!reCaptchaRef.current) {
      setError("reCAPTCHA not initialized");
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      const token = await reCaptchaRef.current.executeAsync();

      if (token) {
        setCaptcha(token);
        return token;
      }

      setError("Failed to get CAPTCHA token");
      return null;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "CAPTCHA verification failed";
      setError(errorMessage);
      // Reset CAPTCHA on error
      reCaptchaRef.current?.reset();
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-refresh CAPTCHA token when it expires (110 seconds)
  useEffect(() => {
    if (!captcha) return undefined;

    const timer = setTimeout(() => {
      if (reCaptchaRef.current) {
        reCaptchaRef.current.reset();
        setCaptcha("");
      }
    }, 110000); // 110 seconds

    return () => clearTimeout(timer);
  }, [captcha]);

  return {
    captcha,
    error,
    isLoading,
    reCaptchaRef,
    handleReCaptchaChange,
    executeRecaptcha,
    resetReCaptchaRef,
  };
};

export default useReCaptcha;
