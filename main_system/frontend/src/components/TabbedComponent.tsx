import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabbedCardProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

const TabbedCard: React.FC<TabbedCardProps> = ({ tabs, defaultTab, className = '' }) => {
  // Safely get the first tab or empty string if tabs array is empty
  const initialTab = defaultTab || (tabs && tabs.length > 0 ? tabs[0].id : '');
  const [activeTab, setActiveTab] = useState(initialTab);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Safely find active tab content
  const activeTabContent = tabs && tabs.length > 0 
    ? tabs.find(tab => tab.id === activeTab)?.content 
    : null;

  // Sync activeTab when defaultTab changes from parent
  useEffect(() => {
    if (defaultTab) setActiveTab(defaultTab);
  }, [defaultTab]);

  // Update scroll button state
  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollWidth > el.clientWidth + el.scrollLeft + 1);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => updateScrollState();
    window.addEventListener('resize', updateScrollState);
    el.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('resize', updateScrollState);
      el.removeEventListener('scroll', onScroll);
    };
  }, [tabs]);

  const scrollBy = (distance: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: distance, behavior: 'smooth' });
  };

  // If no tabs provided, render nothing or a message
  if (!tabs || tabs.length === 0) {
    return (
      <div className={`bg-white dark:bg-[#2b2b2b] rounded-lg shadow p-6 ${className}`}>
        <p className="text-gray-500 text-center">No tabs available</p>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-[#2b2b2b] p-4 rounded-lg shadow ${className}`}>
      {/* Tab Headers */}
      <div className="border-b border-gray-200 dark:border-dark-border relative">
        {/* Left scroll button */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollBy(-200)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-white dark:bg-[#2b2b2b] shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-dark-border"
            style={{ marginLeft: 4 }}
          >
            <ChevronLeft size={18} />
          </button>
        )}

        <div 
          ref={scrollRef}
          className="overflow-x-auto overflow-y-hidden px-10 hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex gap-0 min-w-min">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                  activeTab === tab.id
                    ? 'text-primary dark:text-white border-b-2 border-primary dark:border-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-dark-bg-tertiary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right scroll button */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollBy(200)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-white dark:bg-[#2b2b2b] shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-dark-border"
            style={{ marginRight: 4 }}
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="py-4 px-2">
        {activeTabContent || <p className="text-gray-500">No content available</p>}
      </div>
    </div>
  );
};

export default TabbedCard;