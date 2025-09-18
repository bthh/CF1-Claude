import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  Download, 
  FileText, 
  Briefcase, 
  Scale, 
  Wrench, 
  Search,
  Filter,
  Star,
  ArrowRight
} from 'lucide-react';
import { useDiscoveryStore } from '../../store/discoveryStore';
import Card from '../UI/Card';
import CF1Button from '../UI/CF1Button';
import LoadingSpinner from '../UI/LoadingSpinner';

const DocumentationHub: React.FC = () => {
  const { 
    documentation, 
    bookmarkedContent, 
    loading, 
    loadDocumentation,
    toggleContentBookmark
  } = useDiscoveryStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (documentation.length === 0) {
      loadDocumentation();
    }
  }, [documentation.length, loadDocumentation]);

  const categories = ['all', ...Array.from(new Set(documentation.map(doc => doc.category)))];
  const types = ['all', 'guide', 'template', 'legal', 'business-plan', 'tool'];

  const filteredDocs = documentation.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    const matchesSearch = searchQuery === '' || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesType && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'guide':
        return <BookOpen className="w-5 h-5" />;
      case 'template':
        return <FileText className="w-5 h-5" />;
      case 'legal':
        return <Scale className="w-5 h-5" />;
      case 'business-plan':
        return <Briefcase className="w-5 h-5" />;
      case 'tool':
        return <Wrench className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'guide':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'template':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'legal':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'business-plan':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400';
      case 'tool':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
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
          Creator Documentation Hub
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Everything you need to succeed as an asset creator. From getting started guides 
          to legal templates and business planning tools.
        </p>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documentation..."
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

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {types.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Quick Access Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { type: 'guide', label: 'Getting Started', count: documentation.filter(d => d.type === 'guide').length },
          { type: 'template', label: 'Templates', count: documentation.filter(d => d.type === 'template').length },
          { type: 'legal', label: 'Legal Docs', count: documentation.filter(d => d.type === 'legal').length },
          { type: 'tool', label: 'Tools', count: documentation.filter(d => d.type === 'tool').length }
        ].map((category) => (
          <Card 
            key={category.type}
            className={`p-4 cursor-pointer transition-all ${
              selectedType === category.type 
                ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedType(category.type)}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getTypeColor(category.type)}`}>
                {getTypeIcon(category.type)}
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {category.label}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {category.count} items
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Documentation Grid */}
      {filteredDocs.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No documentation found
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Try adjusting your search terms or filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => {
            const isBookmarked = bookmarkedContent.includes(doc.id);

            return (
              <Card key={doc.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2 rounded-lg ${getTypeColor(doc.type)}`}>
                    {getTypeIcon(doc.type)}
                  </div>
                  <button
                    onClick={() => toggleContentBookmark(doc.id)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <Star className={`w-4 h-4 ${
                      isBookmarked ? 'text-yellow-500 fill-current' : 'text-gray-400'
                    }`} />
                  </button>
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {doc.title}
                </h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {doc.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(doc.type)}`}>
                    {doc.type.replace('-', ' ')}
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                    {doc.category}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {doc.downloadUrl ? (
                    <CF1Button size="sm" className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </CF1Button>
                  ) : (
                    <CF1Button size="sm" className="flex-1">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Read
                    </CF1Button>
                  )}
                  <CF1Button size="sm" variant="outline">
                    <ArrowRight className="w-4 h-4" />
                  </CF1Button>
                </div>

                {/* Tags */}
                {doc.tags && doc.tags.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.slice(0, 3).map((tag, index) => (
                        <span 
                          key={index}
                          className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {doc.tags.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          +{doc.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DocumentationHub;