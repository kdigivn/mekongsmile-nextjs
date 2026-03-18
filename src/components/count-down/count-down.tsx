"use client";

import React, { memo, useEffect, useState } from "react";
interface CountdownProps {
  targetTime: Date;
}

const Countdown = ({ targetTime }: CountdownProps) => {
  const [timeLeft, setTimeLeft] = useState<number>(
    targetTime.getTime() - new Date().getTime()
  );

  useEffect(() => {
    const updateCountdown = () => {
      setTimeLeft(targetTime.getTime() - new Date().getTime());
    };

    updateCountdown(); // Initial call to set the time left
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    if (totalSeconds > 86400) {
      const days = Math.floor(totalSeconds / 86400);
      return `${days} ngày còn lại`;
    } else {
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      return `${hours}h ${minutes}m ${seconds}s còn lại`;
    }
  };

  return (
    <span>{timeLeft > 0 ? formatTime(timeLeft) : "Tàu đã khởi hành"}</span>
  );
};

export default memo(Countdown);
