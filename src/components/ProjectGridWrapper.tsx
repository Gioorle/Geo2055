import React, { useEffect, useState } from 'react';
import ProjectGrid from './ProjectGrid';

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
};

const ProjectGridWrapper: React.FC<Props> = ({ projects }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [key, setKey] = useState(0);

  useEffect(() => {
    // Listen for filter changes from Astro page
    const handleFilterChange = (e: CustomEvent) => {
      setActiveFilter(e.detail.filter);
      // Reset component to close expanded items when filtering
      setKey(prev => prev + 1);
    };

    window.addEventListener('filterChange' as any, handleFilterChange);
    
    return () => {
      window.removeEventListener('filterChange' as any, handleFilterChange);
    };
  }, []);

  return <ProjectGrid key={key} projects={projects} activeFilter={activeFilter} />;
};

export default ProjectGridWrapper;

