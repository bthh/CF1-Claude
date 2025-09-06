import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPathEntryModal } from './UserPathEntryModal';
import { 
  InvestorPathModal, 
  CreatorPathModal 
} from './PathSpecificModals';

interface UserPathControllerProps {
  isOpen: boolean;
  onClose: () => void;
}

type UserPath = 'investor' | 'creator';
type ModalStep = 'entry' | 'path-specific' | 'completed';

export const UserPathController: React.FC<UserPathControllerProps> = ({
  isOpen,
  onClose
}) => {
  // Safely handle navigation - fallback if no router context
  let navigate: ((path: string) => void) | null = null;
  try {
    navigate = useNavigate();
  } catch (error) {
    // Router context not available, navigation will be disabled
    console.warn('Navigation disabled: Router context not available');
  }
  
  const [currentStep, setCurrentStep] = useState<ModalStep>('entry');
  const [selectedPath, setSelectedPath] = useState<UserPath | null>(null);

  const handlePathSelect = (path: UserPath) => {
    setSelectedPath(path);
    setCurrentStep('path-specific');
  };

  const handleContinue = () => {
    // Navigate to appropriate page based on selected path (if navigation is available)
    if (navigate) {
      switch (selectedPath) {
        case 'investor':
          navigate('/launchpad');
          break;
        case 'creator':
          navigate('/launchpad/create');
          break;
      }
    } else {
      // Fallback: redirect using window.location if navigate is not available
      switch (selectedPath) {
        case 'investor':
          window.location.href = '/launchpad';
          break;
        case 'creator':
          window.location.href = '/launchpad/create';
          break;
      }
    }
    
    // Close the modal flow
    handleClose();
  };

  const handleClose = () => {
    setCurrentStep('entry');
    setSelectedPath(null);
    onClose();
  };

  const handleBackToEntry = () => {
    setCurrentStep('entry');
    setSelectedPath(null);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Entry Modal - Choose Path */}
      <UserPathEntryModal
        isOpen={currentStep === 'entry'}
        onClose={handleClose}
        onSelectPath={handlePathSelect}
      />

      {/* Path-Specific Modals */}
      <InvestorPathModal
        isOpen={currentStep === 'path-specific' && selectedPath === 'investor'}
        onClose={handleBackToEntry}
        onContinue={handleContinue}
      />

      <CreatorPathModal
        isOpen={currentStep === 'path-specific' && selectedPath === 'creator'}
        onClose={handleBackToEntry}
        onContinue={handleContinue}
      />
    </>
  );
};