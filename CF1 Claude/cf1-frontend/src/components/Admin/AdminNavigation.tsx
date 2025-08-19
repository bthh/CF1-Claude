import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Settings, 
  Users, 
  Crown, 
  ArrowLeft,
  ChevronRight,
  Database,
  UserCheck,
  Zap,
  Activity,
  BarChart3,
  FileText,
  MessageSquare,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useAdminAuthContext } from '../../hooks/useAdminAuth';

type AdminType = 'creator' | 'platform' | 'super';

interface AdminOption {
  type: AdminType;
  label: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  available: boolean;
}

const AdminNavigation: React.FC = () => {
  const { 
    isCreatorAdmin, 
    isSuperAdmin, 
    isPlatformAdmin, 
    isOwner,
    hasAccessToCreatorAdmin,
    hasAccessToPlatformAdmin,
    hasAccessToFeatureToggles
  } = useAdminAuthContext();
  const navigate = useNavigate();
  const [selectedAdminType, setSelectedAdminType] = useState<AdminType | null>(null);

  // Define admin options based on user permissions
  const adminOptions: AdminOption[] = [
    {
      type: 'creator',
      label: 'Creator Admin',
      description: 'Manage proposals, tokens, and creator tools',
      icon: <BarChart3 className="w-6 h-6" />,
      route: '/admin/creator',
      available: hasAccessToCreatorAdmin()
    },
    {
      type: 'platform',
      label: 'Platform Admin', 
      description: 'User management, compliance, and content moderation',
      icon: <Users className="w-6 h-6" />,
      route: '/admin/platform',
      available: hasAccessToPlatformAdmin()
    },
    {
      type: 'super',
      label: 'Super Admin',
      description: 'System configuration, feature toggles, and admin management',
      icon: <Shield className="w-6 h-6" />,
      route: '/admin/super',
      available: isSuperAdmin || isOwner
    }
  ];

  // Filter available admin options
  const availableOptions = adminOptions.filter(option => option.available);

  // Auto-redirect creator-only admins to their admin panel
  React.useEffect(() => {
    if (isCreatorAdmin && !isSuperAdmin && !isPlatformAdmin && !isOwner) {
      const creatorOption = adminOptions.find(opt => opt.type === 'creator');
      if (creatorOption) {
        navigate(creatorOption.route, { replace: true });
      }
    }
  }, [isCreatorAdmin, isSuperAdmin, isPlatformAdmin, isOwner, navigate]);

  const handleAdminTypeSelect = (adminType: AdminType) => {
    const option = adminOptions.find(opt => opt.type === adminType);
    if (option && option.available) {
      navigate(option.route);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="bg-white border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToDashboard}
                className="flex items-center text-secondary-600 hover:text-secondary-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </button>
              <div className="h-6 w-px bg-secondary-300" />
              <h1 className="text-2xl font-bold text-secondary-900 flex items-center">
                <Shield className="w-7 h-7 mr-3 text-primary-600" />
                Admin Panel
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200">
          <div className="p-6 border-b border-secondary-200">
            <h2 className="text-lg font-semibold text-secondary-900 mb-2">
              Select Admin Panel
            </h2>
            <p className="text-secondary-600">
              Choose the admin panel you want to access based on your permissions.
            </p>
          </div>

          <div className="p-6">
            {availableOptions.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-secondary-900 mb-2">
                  No Admin Access
                </h3>
                <p className="text-secondary-600">
                  You don't have access to any admin panels. Contact your administrator if you believe this is an error.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableOptions.map((option) => (
                  <div
                    key={option.type}
                    onClick={() => handleAdminTypeSelect(option.type)}
                    className="relative bg-white border-2 border-secondary-200 rounded-lg p-6 cursor-pointer hover:border-primary-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <div className="flex-shrink-0 text-primary-600 group-hover:text-primary-700">
                            {option.icon}
                          </div>
                          <h3 className="ml-3 text-lg font-semibold text-secondary-900 group-hover:text-primary-700">
                            {option.label}
                          </h3>
                        </div>
                        <p className="text-secondary-600 text-sm leading-relaxed">
                          {option.description}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-secondary-400 group-hover:text-primary-600 transition-colors" />
                    </div>

                    {/* Status indicator */}
                    <div className="mt-4 flex items-center">
                      <CheckCircle className="w-4 h-4 text-success-600 mr-2" />
                      <span className="text-sm text-success-700 font-medium">
                        Access Granted
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick access info */}
        <div className="mt-6 bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-start">
            <Shield className="w-5 h-5 text-primary-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-primary-900 mb-1">
                Admin Access Information
              </h3>
              <p className="text-sm text-primary-700 leading-relaxed">
                Your admin access is based on your role and permissions. If you need access to additional admin panels, 
                contact your system administrator. All admin actions are logged for security and audit purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNavigation;