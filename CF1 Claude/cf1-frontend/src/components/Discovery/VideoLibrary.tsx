import React, { useEffect, useState } from 'react';
import { 
  Play, 
  Clock, 
  Bookmark, 
  BookmarkCheck, 
  Filter, 
  Grid, 
  List,
  Star,
  CheckCircle,
  Search
} from 'lucide-react';
import { useDiscoveryStore } from '../../store/discoveryStore';
import Card from '../UI/Card';
import Button from '../UI/Button';
import LoadingSpinner from '../UI/LoadingSpinner';

const VideoLibrary: React.FC = () => {
  const {
    videos,
    watchedVideos,
    bookmarkedVideos,
    loading,
    loadVideos,
    toggleVideoBookmark,
    markVideoWatched
  } = useDiscoveryStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (videos.length === 0) {
      loadVideos();
    }
  }, [videos.length, loadVideos]);

  const categories = ['all', ...Array.from(new Set(videos.map(v => v.category)))];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  const filteredVideos = videos.filter(video => {
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || video.difficulty === selectedDifficulty;
    const matchesSearch = searchQuery === '' || 
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Creator Video Library
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Learn from successful creators and platform experts. Master the art of asset creation, 
          market research, legal compliance, and more.
        </p>
      </div>

      {/* Filters and Controls */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>
                  {difficulty === 'all' ? 'All Levels' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 border border-gray-300 dark:border-gray-600 rounded-lg">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="font-semibold text-blue-600 dark:text-blue-400">{videos.length}</div>
            <div className="text-blue-700 dark:text-blue-300">Total Videos</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="font-semibold text-green-600 dark:text-green-400">{watchedVideos.length}</div>
            <div className="text-green-700 dark:text-green-300">Watched</div>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="font-semibold text-purple-600 dark:text-purple-400">{bookmarkedVideos.length}</div>
            <div className="text-purple-700 dark:text-purple-300">Bookmarked</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="font-semibold text-yellow-600 dark:text-yellow-400">{filteredVideos.length}</div>
            <div className="text-yellow-700 dark:text-yellow-300">Filtered</div>
          </div>
        </div>
      </Card>

      {/* Videos Grid/List */}
      {filteredVideos.length === 0 ? (
        <div className="text-center py-12">
          <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No videos found
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Try adjusting your search terms or filters
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
          : 'space-y-4'
        }>
          {filteredVideos.map((video) => {
            const isWatched = watchedVideos.includes(video.id);
            const isBookmarked = bookmarkedVideos.includes(video.id);

            if (viewMode === 'list') {
              return (
                <Card key={video.id} className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    {/* Thumbnail */}
                    <div className="relative flex-shrink-0 w-24 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                      {isWatched && (
                        <div className="absolute top-1 right-1">
                          <CheckCircle className="w-4 h-4 text-green-500 bg-white rounded-full" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                          {video.title}
                        </h3>
                        <button
                          onClick={() => toggleVideoBookmark(video.id)}
                          className="flex-shrink-0 ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          {isBookmarked ? (
                            <BookmarkCheck className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Bookmark className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                        {video.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-xs">
                          <span className="flex items-center text-gray-500 dark:text-gray-400">
                            <Clock className="w-3 h-3 mr-1" />
                            {video.duration}
                          </span>
                          <span className={`px-2 py-1 rounded-full ${getDifficultyColor(video.difficulty)}`}>
                            {video.difficulty}
                          </span>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => markVideoWatched(video.id)}
                          disabled={isWatched}
                        >
                          {isWatched ? 'Watched' : 'Watch'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            }

            // Grid view
            return (
              <Card key={video.id} className="p-0 overflow-hidden hover:shadow-lg transition-shadow">
                {/* Thumbnail */}
                <div className="relative h-32 bg-gray-200 dark:bg-gray-700">
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute top-2 right-2 flex items-center space-x-1">
                    {isWatched && (
                      <CheckCircle className="w-4 h-4 text-green-500 bg-white rounded-full" />
                    )}
                    <button
                      onClick={() => toggleVideoBookmark(video.id)}
                      className="p-1 bg-black bg-opacity-50 hover:bg-opacity-70 rounded"
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Bookmark className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                    {video.description}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                      {video.category}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(video.difficulty)}`}>
                      {video.difficulty}
                    </span>
                  </div>

                  <Button 
                    className="w-full" 
                    size="sm"
                    onClick={() => markVideoWatched(video.id)}
                    disabled={isWatched}
                  >
                    {isWatched ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Watched
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Watch Now
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VideoLibrary;