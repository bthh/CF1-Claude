// @ts-nocheck
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ProposalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate('/launchpad')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Proposal Detail: {id}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            This is a working proposal detail page for proposal ID: {id}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Proposal Information
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          If you can see this page, then the navigation from Launchpad → ProposalDetail is working correctly.
          The proposal ID is: <strong>{id}</strong>
        </p>
        
        <button 
          onClick={() => alert('This proves the page is interactive!')}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Test Button
        </button>
      </div>
    </div>
  );
};

export default ProposalDetail;