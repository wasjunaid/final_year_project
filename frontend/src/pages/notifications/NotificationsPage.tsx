import React, { useState } from 'react';
import { useNavbar } from '../../hooks/useNavbar';

interface Notification {
  id: string;
  type: 'appointment' | 'lab' | 'reminder' | 'system';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

const NotificationsPage: React.FC = () => {
  useNavbar({
    title: 'Notifications',
    showSearch: true,
    searchPlaceholder: 'Search notifications...',
  });

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  // Mock notifications data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'appointment',
      title: 'New Appointment Request',
      message: 'Fatima Ahmed has requested an appointment for Oct 13, 2025 at 2:00 PM',
      time: '2 hours ago',
      isRead: false,
    },
    {
      id: '2',
      type: 'lab',
      title: 'Lab Results Available',
      message: 'Complete Blood Count results for John Doe are now available',
      time: '5 hours ago',
      isRead: false,
    },
    {
      id: '3',
      type: 'reminder',
      title: 'Upcoming Appointment',
      message: 'Reminder: Maria Silva - General Checkup tomorrow at 9:00 AM',
      time: '1 day ago',
      isRead: true,
    },
    {
      id: '4',
      type: 'system',
      title: 'System Update',
      message: 'The system will undergo maintenance on Nov 30, 2025 from 2:00 AM - 4:00 AM',
      time: '2 days ago',
      isRead: true,
    },
    {
      id: '5',
      type: 'appointment',
      title: 'Appointment Confirmed',
      message: 'Ali Khan confirmed the appointment for teeth cleaning on Oct 12, 2025',
      time: '3 days ago',
      isRead: true,
    },
  ]);

  const getTypeIcon = (type: string) => {
    const icons = {
      appointment: '📅',
      lab: '🧪',
      reminder: '⏰',
      system: '⚙️',
    };
    return icons[type as keyof typeof icons] || '📋';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      appointment: 'bg-blue-100 text-blue-700',
      lab: 'bg-green-100 text-green-700',
      reminder: 'bg-yellow-100 text-yellow-700',
      system: 'bg-purple-100 text-purple-700',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'unread' && notif.isRead) return false;
    if (filter === 'read' && !notif.isRead) return false;
    if (typeFilter !== 'all' && notif.type !== typeFilter) return false;
    return true;
  });

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  return (
    <>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 md:p-6 flex-1 flex flex-col">
        {/* Header with filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 md:px-4 py-2 rounded-lg transition-colors text-xs md:text-sm ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 md:px-4 py-2 rounded-lg transition-colors text-xs md:text-sm ${
                filter === 'unread'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-3 md:px-4 py-2 rounded-lg transition-colors text-xs md:text-sm ${
                filter === 'read'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Read
            </button>

            {/* Type Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                className="px-3 md:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-xs md:text-sm flex items-center gap-2"
              >
                Type: <span className="capitalize">{typeFilter === 'all' ? 'All' : typeFilter}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>
              {showTypeDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[150px] z-10">
                  <button
                    onClick={() => {
                      setTypeFilter('all');
                      setShowTypeDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 rounded-t-lg"
                  >
                    All Types
                  </button>
                  <button
                    onClick={() => {
                      setTypeFilter('appointment');
                      setShowTypeDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                  >
                    📅 Appointment
                  </button>
                  <button
                    onClick={() => {
                      setTypeFilter('lab');
                      setShowTypeDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                  >
                    🧪 Lab
                  </button>
                  <button
                    onClick={() => {
                      setTypeFilter('reminder');
                      setShowTypeDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                  >
                    ⏰ Reminder
                  </button>
                  <button
                    onClick={() => {
                      setTypeFilter('system');
                      setShowTypeDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 rounded-b-lg"
                  >
                    ⚙️ System
                  </button>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={markAllAsRead}
            className="px-3 md:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-xs md:text-sm whitespace-nowrap"
          >
            Mark All as Read
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  ></path>
                </svg>
                <p className="text-lg font-semibold">No notifications found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => toggleRead(notification.id)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    notification.isRead
                      ? 'bg-white border-gray-200'
                      : 'bg-blue-50 border-blue-200'
                  } hover:shadow-md`}
                >
                  <div className="flex gap-3">
                    <div
                      className={`${getTypeColor(
                        notification.type
                      )} rounded-lg w-10 h-10 flex items-center justify-center text-xl flex-shrink-0`}
                    >
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-gray-800 text-sm md:text-base">
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-500">{notification.time}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getTypeColor(
                            notification.type
                          )}`}
                        >
                          {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="border-t border-gray-200 pt-3 md:pt-4 mt-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs md:text-sm text-gray-700">
              Showing <span className="font-semibold">1</span> to{' '}
              <span className="font-semibold">{filteredNotifications.length}</span> of{' '}
              <span className="font-semibold">{filteredNotifications.length}</span> results
            </div>
            <div className="flex gap-1 md:gap-2">
              <button className="px-3 py-1 bg-primary text-white rounded-lg text-sm">1</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;
