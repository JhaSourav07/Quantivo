import { useState, useEffect, useRef } from 'react';

export function useCountUp(target, duration = 1200, started = true) {
  const [value, setValue] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (!started || target === 0) { setValue(target); return; }
    const start = performance.now();
    const tick  = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setValue(target * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
      else setValue(target);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, started]);

  return value;
}