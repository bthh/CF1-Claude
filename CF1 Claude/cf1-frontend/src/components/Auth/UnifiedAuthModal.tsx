/**
 * CF1 Frontend - Unified Authentication Modal
 * Supports both traditional email/password and wallet authentication
 */

import React, { useState, useEffect } from 'react';
import { X, Mail, Wallet, User, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useUnifiedAuthStore } from '../../store/unifiedAuthStore';
import { useCosmJS } from '../../hooks/useCosmJS';
import Card from '../UI/Card';
import CF1Button from '../UI/CF1Button';
import LoadingSpinner from '../UI/LoadingSpinner';

interface UnifiedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UnifiedAuthModal: React.FC<UnifiedAuthModalProps> = ({ isOpen, onClose }) => {
  const {
    loading,
    error,
    authMode,
    loginWithEmail,
    registerWithEmail,
    loginWithWallet,
    forgotPassword,
    resetPassword,
    showLogin,
    showRegister,
    showForgotPassword,
    clearError
  } = useUnifiedAuthStore();

  // Wallet integration
  const { connect: connectWallet, address: walletAddress, isConnecting } = useCosmJS();

  // Form states
  const [authChoice, setAuthChoice] = useState<'choice' | 'email' | 'wallet'>('choice');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    acceptedTerms: false,
    resetToken: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes or auth mode changes
  useEffect(() => {
    if (isOpen) {
      setAuthChoice('choice');
      clearError();
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        acceptedTerms: false,
        resetToken: new URLSearchParams(window.location.search).get('resetToken') || ''
      });
      setValidationErrors({});
    }
  }, [isOpen, authMode, clearError]);

  // Validate form inputs
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (authChoice === 'email') {
      if (!formData.email) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Invalid email format';
      }

      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (authMode === 'register' && formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      }

      if (authMode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        }
        if (!formData.acceptedTerms) {
          errors.acceptedTerms = 'You must accept the terms of service';
        }
      }

      if (authMode === 'reset-password' && !formData.password) {
        errors.password = 'New password is required';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const { [field]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleEmailAuth = async () => {
    if (!validateForm()) return;

    try {
      if (authMode === 'login') {
        await loginWithEmail({
          email: formData.email,
          password: formData.password
        });
      } else if (authMode === 'register') {
        await registerWithEmail({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName || undefined,
          lastName: formData.lastName || undefined,
          acceptedTerms: formData.acceptedTerms
        });
      } else if (authMode === 'forgot-password') {
        await forgotPassword(formData.email);
      } else if (authMode === 'reset-password') {
        await resetPassword(formData.resetToken, formData.password);
      }
    } catch (error) {
      console.error('Email auth error:', error);
    }
  };

  const handleWalletAuth = async () => {
    try {
      // First connect wallet if not already connected
      if (!walletAddress) {
        await connectWallet();
        return; // Will be called again after connection
      }

      // Authenticate with wallet
      await loginWithWallet({
        walletAddress,
        signature: undefined // TODO: Implement signing for security
      });
      
      // Close modal on successful authentication
      onClose();
    } catch (error) {
      console.error('Wallet auth error:', error);
    }
  };

  // Auto-authenticate with wallet once connected
  useEffect(() => {
    if (walletAddress && authChoice === 'wallet' && !loading && isOpen) {
      handleWalletAuth();
    }
  }, [walletAddress, authChoice, loading, isOpen]);

  if (!isOpen) return null;

  const renderAuthChoice = () => (
    <div className="text-center space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Welcome to CF1
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose your preferred sign-in method
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => setAuthChoice('email')}
          className="w-full p-4 flex items-center space-x-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 group"
        >
          <div className="flex items-center justify-center w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
            <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 text-left">
            <div className="font-medium text-gray-900 dark:text-gray-100">Continue with Email</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Traditional email and password</div>
          </div>
        </button>

        <button
          onClick={() => setAuthChoice('wallet')}
          disabled={isConnecting}
          className="w-full p-4 flex items-center space-x-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg transition-colors duration-200 group"
        >
          <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 text-left">
            <div className="font-medium text-white">
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </div>
            <div className="text-xs text-blue-100">Blockchain wallet authentication</div>
          </div>
        </button>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          New to CF1? Start with email to create your account, then link your wallet later for full blockchain features.
        </p>
      </div>
    </div>
  );

  const renderEmailAuth = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {authMode === 'login' ? 'Sign In' : 
           authMode === 'register' ? 'Create Account' :
           authMode === 'forgot-password' ? 'Reset Password' : 'Set New Password'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {authMode === 'login' ? 'Enter your credentials to access your account' :
           authMode === 'register' ? 'Create your CF1 account to get started' :
           authMode === 'forgot-password' ? 'Enter your email to receive a reset link' :
           'Enter your new password'}
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleEmailAuth(); }} className="space-y-4">
        {/* Email Field */}
        {authMode !== 'reset-password' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.email 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                placeholder="Enter your email"
                disabled={loading}
              />
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.email}</p>
            )}
          </div>
        )}

        {/* Name Fields for Registration */}
        {authMode === 'register' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                First Name (Optional)
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="First name"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Last Name (Optional)
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Last name"
                disabled={loading}
              />
            </div>
          </div>
        )}

        {/* Password Field */}
        {(authMode === 'login' || authMode === 'register' || authMode === 'reset-password') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {authMode === 'reset-password' ? 'New Password' : 'Password'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.password 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                placeholder={authMode === 'reset-password' ? 'Enter new password' : 'Enter your password'}
                disabled={loading}
              />
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {validationErrors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.password}</p>
            )}
          </div>
        )}

        {/* Confirm Password for Registration */}
        {authMode === 'register' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.confirmPassword 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                placeholder="Confirm your password"
                disabled={loading}
              />
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.confirmPassword}</p>
            )}
          </div>
        )}

        {/* Terms Acceptance for Registration */}
        {authMode === 'register' && (
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="acceptedTerms"
              checked={formData.acceptedTerms}
              onChange={(e) => handleInputChange('acceptedTerms', e.target.checked)}
              className="mt-1"
              disabled={loading}
            />
            <label htmlFor="acceptedTerms" className="text-sm text-gray-700 dark:text-gray-300">
              I agree to the <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a> and{' '}
              <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
            </label>
            {validationErrors.acceptedTerms && (
              <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.acceptedTerms}</p>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <CF1Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <LoadingSpinner size="small" />
              <span>Processing...</span>
            </div>
          ) : (
            authMode === 'login' ? 'Sign In' :
            authMode === 'register' ? 'Create Account' :
            authMode === 'forgot-password' ? 'Send Reset Link' : 'Set New Password'
          )}
        </CF1Button>

        {/* Action Links */}
        <div className="text-center space-y-2">
          {authMode === 'login' && (
            <>
              <button
                type="button"
                onClick={showForgotPassword}
                className="text-sm text-blue-600 hover:underline"
                disabled={loading}
              >
                Forgot your password?
              </button>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Don't have an account? </span>
                <button
                  type="button"
                  onClick={showRegister}
                  className="text-sm text-blue-600 hover:underline"
                  disabled={loading}
                >
                  Sign up
                </button>
              </div>
            </>
          )}
          
          {authMode === 'register' && (
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Already have an account? </span>
              <button
                type="button"
                onClick={showLogin}
                className="text-sm text-blue-600 hover:underline"
                disabled={loading}
              >
                Sign in
              </button>
            </div>
          )}

          {(authMode === 'forgot-password' || authMode === 'reset-password') && (
            <button
              type="button"
              onClick={showLogin}
              className="text-sm text-blue-600 hover:underline"
              disabled={loading}
            >
              Back to sign in
            </button>
          )}
        </div>
      </form>

      {/* Back to choices */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
        <button
          onClick={() => setAuthChoice('choice')}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          disabled={loading}
        >
          ← Choose different sign-in method
        </button>
      </div>
    </div>
  );

  const renderWalletAuth = () => (
    <div className="text-center space-y-6">
      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Connect Your Wallet
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {walletAddress ? 'Authenticating with your wallet...' : 'Connect your blockchain wallet to continue'}
        </p>
      </div>

      {walletAddress ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span>Wallet Connected</span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Connected Address:</p>
            <p className="font-mono text-sm break-all">{walletAddress}</p>
          </div>
          {loading && (
            <div className="flex items-center justify-center space-x-2">
              <LoadingSpinner size="small" />
              <span>Signing you in...</span>
            </div>
          )}
        </div>
      ) : (
        <CF1Button
          onClick={handleWalletAuth}
          className="w-full"
          disabled={isConnecting || loading}
        >
          {isConnecting || loading ? (
            <div className="flex items-center justify-center space-x-2">
              <LoadingSpinner size="small" />
              <span>Connecting...</span>
            </div>
          ) : (
            <>
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </>
          )}
        </CF1Button>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Back to choices */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setAuthChoice('choice')}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          disabled={loading}
        >
          ← Choose different sign-in method
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="w-6" /> {/* Spacer */}
          <h1 className="text-base font-medium text-gray-900 dark:text-white">
            {authChoice === 'choice' ? 'Sign In to CF1' : 
             authChoice === 'email' ? 'Email Authentication' : 'Wallet Authentication'}
          </h1>
          <button
            onClick={() => {
              clearError();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full p-1 transition-colors"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 py-6">
          {authChoice === 'choice' && renderAuthChoice()}
          {authChoice === 'email' && renderEmailAuth()}
          {authChoice === 'wallet' && renderWalletAuth()}
        </div>
      </div>
    </div>
  );
};

export default UnifiedAuthModal;