import React, { useMemo, useState, useRef, useEffect } from "react";
import { motion, LayoutGroup } from "framer-motion";

type Project = {
  id: string;
  title: string;
  description: string;
  image: string;
  category?: string[];
  links?: { label: string; href: string }[];
};

type Props = {
  projects: Project[];
  activeFilter?: string;
};

function startIndexOfRow(index: number, cols = 3) {
  return Math.floor(index / cols) * cols;
}

/** Moves the selected item so it sits at the start of its row */
function moveSelectedToRowStart(list: Project[], selectedId: string | null, cols = 3) {
  if (!selectedId) return list;
  const i = list.findIndex(p => p.id === selectedId);
  if (i < 0) return list;
  const rowStart = startIndexOfRow(i, cols);
  if (i === rowStart) return list;

  const copy = list.slice();
  const [selected] = copy.splice(i, 1);
  copy.splice(rowStart, 0, selected);
  return copy;
}

const ProjectGrid: React.FC<Props> = ({ projects, activeFilter = 'all' }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const cardRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  
  // Filter projects based on activeFilter
  const filteredProjects = useMemo(() => {
    if (activeFilter === 'all') {
      return projects.filter(p => 
        !p.category || (
          Array.isArray(p.category) 
            ? !p.category.includes('Other')
            : p.category !== 'Other'
        )
      );
    }
    return projects.filter(p => 
      p.category && (
        Array.isArray(p.category) 
          ? p.category.includes(activeFilter)
          : p.category === activeFilter
      )
    );
  }, [projects, activeFilter]);

  const ordered = useMemo(() => {
    // Don't reorder on mobile - keep projects in original positions
    if (isMobile) return filteredProjects;
    return moveSelectedToRowStart(filteredProjects, expandedId, 3);
  }, [filteredProjects, expandedId, isMobile]);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const onCardClick = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  // Scroll to expanded card (both desktop and mobile)
  useEffect(() => {
    if (expandedId && cardRefs.current[expandedId]) {
      setTimeout(() => {
        cardRefs.current[expandedId]?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, isMobile ? 300 : 600);
    }
  }, [expandedId, isMobile]);

  const styles: { [key: string]: React.CSSProperties } = {
    grid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
      gap: '0',
      width: '100%',
      backgroundColor: '#000000',
    },
    card: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      background: '#000000',
      borderRadius: '0',
      overflow: 'hidden',
      cursor: 'pointer',
      position: 'relative',
      aspectRatio: '1 / 1',
      scrollMarginTop: '100px',
    },
    cardExpanded: {
      gridColumn: isMobile ? 'span 1' : 'span 3',
      display: isMobile ? 'block' : 'flex',
      minHeight: isMobile ? 'auto' : '500px',
      aspectRatio: 'auto',
    },
    thumb: {
      aspectRatio: '1 / 1',
      overflow: 'hidden',
      width: '100%',
      height: '100%',
      borderRadius: '0',
    },
    thumbExpanded: {
      aspectRatio: '1 / 1',
      width: isMobile ? '100%' : '33.333%',
      height: 'auto',
      minHeight: isMobile ? 'auto' : '500px',
      flexShrink: 0,
      borderRadius: '0',
    },
    img: {
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
      display: 'block',
      borderRadius: '0',
    },
    details: {
      padding: isMobile ? '20px' : '60px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: isMobile ? '20px' : '30px',
      background: '#000000',
      justifyContent: 'center',
      flex: 1,
      position: 'relative' as const,
    },
    h3: {
      margin: 0,
      fontSize: '36px',
      lineHeight: 1.2,
      color: '#FFFFFF',
      fontFamily: 'Arial, Helvetica, sans-serif',
    },
    p: {
      margin: 0,
      color: '#FFFFFF',
      fontSize: '18px',
      lineHeight: 1.6,
      fontFamily: 'Arial, Helvetica, sans-serif',
    },
    links: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '40px',
      marginTop: '20px',
    },
    link: {
      textDecoration: 'none',
      color: isMobile ? '#FF0000' : '#FFFFFF',
      fontSize: '18px',
      fontFamily: 'Arial, Helvetica, sans-serif',
      cursor: 'pointer',
    },
    hoverTitle: {
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '24px',
      color: '#FFFFFF',
      textAlign: 'center' as const,
      padding: '20px',
      width: '80%',
      pointerEvents: 'none' as const,
      zIndex: 5,
    },
    thumbDarkened: {
      filter: 'brightness(0.3)',
    },
  };

  return (
    <LayoutGroup>
      <div style={styles.grid}>
        {ordered.map((p) => {
          const isExpanded = p.id === expandedId;
          const isHovered = p.id === hoveredId;
          return (
            <motion.article
              key={p.id}
              ref={(el) => {
                if (el) cardRefs.current[p.id] = el;
              }}
              layout={!isMobile}
              onClick={() => onCardClick(p.id)}
              onMouseEnter={() => !isExpanded && setHoveredId(p.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                ...styles.card,
                ...(isExpanded ? styles.cardExpanded : {}),
              }}
              transition={isMobile ? { duration: 0 } : { 
                layout: { duration: 1, ease: [0.4, 0, 0.2, 1] }
              }}
            >
              <motion.div 
                style={{
                  ...styles.thumb,
                  ...(isExpanded ? styles.thumbExpanded : {}),
                }}
                layoutId={`img-${p.id}`} 
                layout
              >
                <img 
                  src={p.image} 
                  alt={p.title} 
                  style={{
                    ...styles.img,
                    ...(isHovered && !isExpanded ? styles.thumbDarkened : {}),
                  }} 
                />
                {isHovered && !isExpanded && (
                  <motion.div
                    style={styles.hoverTitle}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {p.title}
                  </motion.div>
                )}
              </motion.div>

              {isExpanded && (
                <motion.div
                  style={styles.details}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 style={styles.h3}>{p.title}</h3>
                  <p style={styles.p}>{p.description}</p>
                  {p.links?.length ? (
                    <div style={styles.links}>
                      {p.links.map((l) => (
                        <a 
                          key={l.href} 
                          href={l.href} 
                          target="_blank" 
                          rel="noreferrer" 
                          style={styles.link}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#FF0000')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                        >
                          {l.label}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </motion.div>
              )}
            </motion.article>
          );
        })}
      </div>
    </LayoutGroup>
  );
};

export default ProjectGrid;
