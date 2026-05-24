import { useState, useEffect, useRef} from "react";
import type {  ReactNode, RefObject}from "react";

interface RevealState {
  ref: RefObject<HTMLDivElement | null>; 
  visible: boolean;
}

function useReveal(): RevealState {
  const ref = useRef<HTMLDivElement>(null); 
  const [visible, setVisible] = useState<boolean>(false);
  
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.12 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  
  return { ref, visible };
}

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}