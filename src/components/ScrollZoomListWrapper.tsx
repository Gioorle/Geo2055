import React, { useEffect, useState } from 'react';
import ScrollZoomList from './ScrollZoomList';

type MixtapeItem = {
  title: string;
  link: string;
  category?: string;
};

type Props = {
  items: MixtapeItem[];
};

const ScrollZoomListWrapper: React.FC<Props> = ({ items }) => {
  const [activeFilter, setActiveFilter] = useState('Mixdown');

  useEffect(() => {
    // Listen for filter changes from Astro page
    const handleFilterChange = (e: CustomEvent) => {
      setActiveFilter(e.detail.filter);
    };

    window.addEventListener('filterChange' as any, handleFilterChange);
    
    return () => {
      window.removeEventListener('filterChange' as any, handleFilterChange);
    };
  }, []);

  return (
    <ScrollZoomList 
      items={items} 
      peakScale={1.15}
      fontSize="30px"
      fontFamily="Arial, Helvetica, sans-serif"
      activeFilter={activeFilter}
    />
  );
};

export default ScrollZoomListWrapper;

