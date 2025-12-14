import React, { useState } from 'react';

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

  // Safely find active tab content
  const activeTabContent = tabs && tabs.length > 0 
    ? tabs.find(tab => tab.id === activeTab)?.content 
    : null;

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
      <div className="border-b border-gray-200 dark:border-[#404040]">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'text-primary dark:text-white border-b-2 border-primary dark:border-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-[#3a3a3a]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="py-4 px-2">
        {activeTabContent || <p className="text-gray-500">No content available</p>}
      </div>
    </div>
  );
};

export default TabbedCard;