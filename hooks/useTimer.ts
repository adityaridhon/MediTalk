import { useState, useEffect } from 'react';

export const useTimer = (isActive: boolean) => {
  const [timer, setTimer] = useState("00:00");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      let seconds = 0;
      interval = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        setTimer(
          `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`
        );
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  return timer;
};