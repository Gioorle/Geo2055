import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

type MixtapeItem = {
  title: string;
  link: string;
  category?: string;
};

type Props = {
  items: MixtapeItem[];
  /** Peak scale when the line is near the center of the viewport */
  peakScale?: number; // e.g. 1.2 ~ 1.35 looks nice
  /** Optional line height in px/rem/etc. */
  lineHeight?: string;
  fontSize?: string;
  fontFamily?: string;
  activeFilter?: string;
};

const ZoomLine: React.FC<{
  item: MixtapeItem;
  peakScale: number;
  lineHeight?: string;
  fontSize?: string;
  fontFamily?: string;
  isInactive?: boolean;
}> = ({ item, peakScale, lineHeight, fontSize = '18px', fontFamily = 'Arial, Helvetica, sans-serif', isInactive }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Measure this line versus the viewport
  const { scrollYProgress } = useScroll({
    target: ref,
    // When the top of the line hits 80% viewport height -> 0,
    // and when the bottom hits 20% -> 1. This gives a nice "in/out" arc.
    offset: ["start 80%", "end 20%"],
  });

  // Create a bell-curve scale: small -> big -> small
  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    shouldReduce ? [1, 1, 1] : [1, peakScale, 1]
  );

  // (Optional) slight opacity lift in the middle
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.65, 1, 0.65]);

  return (
    <motion.div
      ref={ref}
      style={{
        lineHeight,
        transformOrigin: "left center",
        scale,
        opacity,
        willChange: "transform, opacity",
        height: '26px'
      }}
      role="listitem"
    >
      <a 
        href={item.link} 
        target="_blank"
        rel="noreferrer"
        style={{
          fontFamily,
          fontSize,
          color: isInactive ? '#666666' : '#FFFFFF',
          textDecoration: 'none',
          transition: 'color 0.3s ease',
          cursor: 'pointer',
        }}
      onMouseEnter={(e) => {
        if (!isMobile) {
          if (!isInactive) {
            e.currentTarget.style.color = '#FF0000';
          } else {
            e.currentTarget.style.color = '#999999';
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!isMobile) {
          e.currentTarget.style.color = isInactive ? '#666666' : '#FFFFFF';
        }
      }}
      >
        {item.title}
      </a>
    </motion.div>
  );
};

const ScrollZoomList: React.FC<Props> = ({ 
  items, 
  peakScale = 1.33, 
  lineHeight,
  fontSize = '18px',
  fontFamily = 'Arial, Helvetica, sans-serif',
  activeFilter = 'Mixdown'
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const wrapStyle: React.CSSProperties = {
    padding: isMobile ? '60px 20px 60px 20px' : '0px 40px',
    maxWidth: isMobile ? '300px' : '1200px',
    width: isMobile ? '300px' : 'auto',
    boxSizing: 'border-box',
  };

  const listStyle: React.CSSProperties = {
    display: 'grid',
    gap: '5px',
  };

  return (
    <section style={wrapStyle} aria-label="Animated list">
      <div style={listStyle} role="list">
        {items.map((item, i) => {
          const isInactive = item.category !== activeFilter;
          return (
            <ZoomLine 
              key={i} 
              item={item} 
              peakScale={peakScale} 
              lineHeight={lineHeight}
              fontSize={isMobile ? '20px' : '18px'}
              fontFamily={fontFamily}
              isInactive={isInactive}
            />
          );
        })}
      </div>
    </section>
  );
};

export default ScrollZoomList;
