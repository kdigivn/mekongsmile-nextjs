"use client";

import { useEffect, useState } from "react";

const useFetchSSE = <T>(
  url: string | URL,
  enabled: boolean = true,
  onMessage: (data: T) => void,
  onFinishStreaming?: (data: T | undefined) => void
) => {
  const [streamingStatus, setStreamingStatus] = useState<StreamingStatus>(
    StreamingStatus.NOT_STARTED
  );

  useEffect(() => {
    let streamData: T | undefined = undefined;

    if (!enabled) return;

    const eventSource = new EventSource(url);
    setStreamingStatus(StreamingStatus.IN_PROGRESS);

    eventSource.onmessage = (event) => {
      const data: T = JSON.parse(event.data);
      onMessage(data);
      streamData = data;
    };

    eventSource.onerror = () => {
      eventSource.close();
      setStreamingStatus(StreamingStatus.FINISH);
      if (onFinishStreaming) onFinishStreaming(streamData);

      // reset status after 200ms
      setTimeout(() => {
        setStreamingStatus(StreamingStatus.NOT_STARTED);
      }, 200);
    };

    return () => {
      eventSource.close();
      setStreamingStatus(StreamingStatus.FINISH);
      if (onFinishStreaming) onFinishStreaming(streamData);

      // reset status after 200ms
      setTimeout(() => {
        setStreamingStatus(StreamingStatus.NOT_STARTED);
      }, 200);
    };
  }, [url, onMessage, enabled, onFinishStreaming]);

  return { streamingStatus };
};

export default useFetchSSE;

export enum StreamingStatus {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  FINISH = "finish",
}
