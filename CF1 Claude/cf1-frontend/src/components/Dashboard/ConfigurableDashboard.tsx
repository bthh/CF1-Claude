import React, { useState } from 'react';
import { Settings, Plus, Eye, EyeOff, RotateCcw, Grid3X3, Maximize2, Minimize2, ArrowUpDown, Activity, Zap, Bell, User, GripVertical, Star } from 'lucide-react';
import { useDashboardStore, WidgetType, WidgetSize } from '../../store/dashboardStore';
import MarketplaceWidget from './MarketplaceWidget';
import LaunchpadWidget from './LaunchpadWidget';
import GovernanceWidget from './GovernanceWidget';
import PortfolioWidget from './PortfolioWidget';
import AnalyticsWidget from './AnalyticsWidget';
import ActivityWidget from './ActivityWidget';
import QuickActionsWidget from './QuickActionsWidget';
import NotificationsWidget from './NotificationsWidget';
import ProfileWidget from './ProfileWidget';
import SpotlightWidget from './SpotlightWidget';

const ConfigurableDashboard: React.FC = () => {
  const {
    widgets,
    isEditMode,
    toggleEditMode,
    addWidget,
    removeWidget,
    toggleWidgetVisibility,
    resizeWidget,
    reorderWidgets,
    resetToDefault
  } = useDashboardStore();

  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const visibleWidgets = widgets.filter(widget => widget.isVisible);

  const renderWidget = (widget: any) => {
    // Force all widgets to render as medium size for consistency
    // Pass isEditMode to widgets so they can hide "View All" buttons
    const commonProps = { 
      size: 'medium' as const,
      isEditMode 
    };
    
    switch (widget.type) {
      case 'marketplace':
        return <MarketplaceWidget {...commonProps} />;
      case 'launchpad':
        return <LaunchpadWidget {...commonProps} />;
      case 'governance':
        return <GovernanceWidget {...commonProps} />;
      case 'portfolio':
        return <PortfolioWidget {...commonProps} />;
      case 'analytics':
        return <AnalyticsWidget {...commonProps} />;
      case 'activity':
        return <ActivityWidget {...commonProps} />;
      case 'quickActions':
        return <QuickActionsWidget {...commonProps} />;
      case 'notifications':
        return <NotificationsWidget {...commonProps} />;
      case 'profile':
        return <ProfileWidget {...commonProps} />;
      case 'spotlight':
        return <SpotlightWidget {...commonProps} />;
      default:
        return null;
    }
  };

  const getWidgetClasses = (size: WidgetSize) => {
    // Make all widgets the same size regardless of their 'size' property
    return 'col-span-1 h-72';
  };

  const getNextSize = (currentSize: WidgetSize): WidgetSize => {
    const sizes: WidgetSize[] = ['small', 'medium', 'large', 'full'];
    const currentIndex = sizes.indexOf(currentSize);
    return sizes[(currentIndex + 1) % sizes.length];
  };

  const availableWidgetTypes: { type: WidgetType; label: string; icon: React.ReactNode }[] = [
    { type: 'marketplace', label: 'Marketplace', icon: <Grid3X3 className="w-4 h-4" /> },
    { type: 'launchpad', label: 'Launchpad', icon: <Plus className="w-4 h-4" /> },
    { type: 'governance', label: 'Governance', icon: <Settings className="w-4 h-4" /> },
    { type: 'portfolio', label: 'Portfolio', icon: <Eye className="w-4 h-4" /> },
    { type: 'analytics', label: 'Analytics', icon: <Grid3X3 className="w-4 h-4" /> },
    { type: 'activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> },
    { type: 'quickActions', label: 'Quick Actions', icon: <Zap className="w-4 h-4" /> },
    { type: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { type: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { type: 'spotlight', label: 'Spotlight', icon: <Star className="w-4 h-4" /> }
  ];

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
    // Add dragging class to the element
    const element = e.currentTarget as HTMLElement;
    element.classList.add('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const element = e.currentTarget as HTMLElement;
    element.classList.remove('opacity-50');
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedItem !== null && draggedItem !== dropIndex) {
      // Get the actual indices in the full widgets array
      const sortedVisibleWidgets = visibleWidgets.sort((a, b) => a.position - b.position);
      const draggedWidget = sortedVisibleWidgets[draggedItem];
      const targetWidget = sortedVisibleWidgets[dropIndex];
      
      const draggedFullIndex = widgets.findIndex(w => w.id === draggedWidget.id);
      const targetFullIndex = widgets.findIndex(w => w.id === targetWidget.id);
      
      reorderWidgets(draggedFullIndex, targetFullIndex);
    }
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your personalized overview of the CF1 platform
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={resetToDefault}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Reset to default layout"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            
            <button
              onClick={toggleEditMode}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isEditMode
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>{isEditMode ? 'Done' : 'Customize'}</span>
            </button>
          </div>
        </div>

        {/* Edit Mode Controls */}
        {isEditMode && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Add Widget:
              </span>
              <div className="flex items-center space-x-2">
                {availableWidgetTypes.map((widgetType) => (
                  <button
                    key={widgetType.type}
                    onClick={() => addWidget(widgetType.type)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                  >
                    {widgetType.icon}
                    <span>{widgetType.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                <strong>Edit Mode:</strong> Drag widgets to reorder them. 
                Click the X to remove widgets. 
                Add new widgets using the buttons above. 
                Your changes are automatically saved.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {visibleWidgets
          .sort((a, b) => a.position - b.position)
          .map((widget, index) => (
            <div
              key={widget.id}
              className={`relative ${getWidgetClasses(widget.size)} ${
                isEditMode ? 'cursor-move' : ''
              } ${
                dragOverIndex === index ? 'ring-2 ring-red-500 ring-offset-2' : ''
              }`}
              draggable={isEditMode}
              onDragStart={(e) => isEditMode && handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => isEditMode && handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => isEditMode && handleDrop(e, index)}
            >
              {/* Drag Handle in Edit Mode */}
              {isEditMode && (
                <div className="absolute top-2 left-2 z-10 p-1.5 bg-white dark:bg-gray-800 rounded shadow-lg border border-gray-200 dark:border-gray-600">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                </div>
              )}

              {/* Remove Button in Edit Mode */}
              {isEditMode && (
                <button
                  onClick={() => removeWidget(widget.id)}
                  className="absolute top-2 right-2 z-10 p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border border-gray-200 dark:border-gray-600"
                  title="Remove widget"
                >
                  <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400 hover:text-red-600 rotate-45" />
                </button>
              )}
              
              {/* Widget Content */}
              <div className={`h-full ${isEditMode ? 'pointer-events-none select-none' : ''} border-2 border-gray-300 dark:border-gray-600 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden`}>
                {renderWidget(widget)}
              </div>
            </div>
          ))}
      </div>

      {/* Hidden Widgets Panel (Edit Mode Only) */}
      {isEditMode && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Hidden Widgets
          </h3>
          
          {widgets.filter(w => !w.isVisible).length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              All widgets are currently visible
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {widgets
                .filter(w => !w.isVisible)
                .map((widget) => (
                  <div
                    key={widget.id}
                    className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                        {widget.type}
                      </h4>
                      <button
                        onClick={() => toggleWidgetVisibility(widget.id)}
                        className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Show widget"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Size: {widget.size}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {visibleWidgets.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 border border-gray-200 dark:border-gray-700 shadow-lg text-center">
          <Grid3X3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Widgets to Display
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Your dashboard is empty. Add some widgets to get started.
          </p>
          <button
            onClick={toggleEditMode}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Customize Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default ConfigurableDashboard;