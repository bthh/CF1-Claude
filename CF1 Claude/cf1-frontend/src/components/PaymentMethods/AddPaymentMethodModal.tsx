import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  Building, 
  Wallet,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { usePaymentMethodsStore } from '../../store/paymentMethodsStore';
import { useNotifications } from '../../hooks/useNotifications';

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PaymentMethodType = 'card' | 'bank' | 'crypto';

const AddPaymentMethodModal: React.FC<AddPaymentMethodModalProps> = ({
  isOpen,
  onClose
}) => {
  const { success, error } = useNotifications();
  const {
    addCreditCard,
    addBankAccount,
    addCryptoWallet,
    validateCardNumber,
    validateBankAccount,
    saving
  } = usePaymentMethodsStore();

  const [selectedType, setSelectedType] = useState<PaymentMethodType>('card');
  const [showCardNumber, setShowCardNumber] = useState(false);
  
  // Card form data
  const [cardData, setCardData] = useState({
    type: 'credit' as const,
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    holderName: '',
    nickname: '',
    isDefault: false
  });

  // Bank form data
  const [bankData, setBankData] = useState({
    accountType: 'checking' as const,
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    accountHolderName: '',
    nickname: '',
    isDefault: false
  });

  // Crypto form data
  const [cryptoData, setCryptoData] = useState({
    address: '',
    network: 'ethereum' as const,
    walletType: 'metamask' as const,
    nickname: '',
    isDefault: false
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const paymentTypes = [
    {
      id: 'card' as const,
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Add a credit or debit card for quick payments'
    },
    {
      id: 'bank' as const,
      name: 'Bank Account',
      icon: Building,
      description: 'Link your bank account for ACH transfers'
    },
    {
      id: 'crypto' as const,
      name: 'Crypto Wallet',
      icon: Wallet,
      description: 'Connect your crypto wallet for blockchain payments'
    }
  ];

  const validateCard = () => {
    const errors: string[] = [];
    
    if (!cardData.cardNumber) {
      errors.push('Card number is required');
    } else {
      const validation = validateCardNumber(cardData.cardNumber);
      if (!validation.isValid) {
        errors.push('Invalid card number');
      }
    }

    if (!cardData.expiryMonth || !cardData.expiryYear) {
      errors.push('Expiry date is required');
    } else {
      const currentDate = new Date();
      const expiryDate = new Date(parseInt(cardData.expiryYear), parseInt(cardData.expiryMonth) - 1);
      if (expiryDate < currentDate) {
        errors.push('Card has expired');
      }
    }

    if (!cardData.cvv || cardData.cvv.length < 3) {
      errors.push('Valid CVV is required');
    }

    if (!cardData.holderName.trim()) {
      errors.push('Cardholder name is required');
    }

    return errors;
  };

  const validateBank = () => {
    const errors: string[] = [];
    
    if (!bankData.bankName.trim()) {
      errors.push('Bank name is required');
    }

    if (!bankData.accountHolderName.trim()) {
      errors.push('Account holder name is required');
    }

    const validation = validateBankAccount(bankData.routingNumber, bankData.accountNumber);
    if (!validation.isValid) {
      errors.push(...validation.errors);
    }

    return errors;
  };

  const validateCrypto = () => {
    const errors: string[] = [];
    
    if (!cryptoData.address.trim()) {
      errors.push('Wallet address is required');
    } else if (cryptoData.address.length < 26) {
      errors.push('Invalid wallet address');
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let errors: string[] = [];
    
    switch (selectedType) {
      case 'card':
        errors = validateCard();
        break;
      case 'bank':
        errors = validateBank();
        break;
      case 'crypto':
        errors = validateCrypto();
        break;
    }

    setValidationErrors(errors);
    
    if (errors.length > 0) {
      return;
    }

    try {
      switch (selectedType) {
        case 'card':
          const validation = validateCardNumber(cardData.cardNumber);
          await addCreditCard({
            type: cardData.type,
            last4: cardData.cardNumber.slice(-4),
            expiryMonth: parseInt(cardData.expiryMonth),
            expiryYear: parseInt(cardData.expiryYear),
            holderName: cardData.holderName,
            nickname: cardData.nickname,
            isDefault: cardData.isDefault,
            brand: validation.brand
          });
          success('Credit card added successfully!');
          break;
          
        case 'bank':
          await addBankAccount({
            accountType: bankData.accountType,
            bankName: bankData.bankName,
            accountNumber: bankData.accountNumber,
            routingNumber: bankData.routingNumber,
            accountHolderName: bankData.accountHolderName,
            nickname: bankData.nickname,
            isDefault: bankData.isDefault
          });
          success('Bank account added successfully! Verification will take 1-2 business days.');
          break;
          
        case 'crypto':
          await addCryptoWallet({
            address: cryptoData.address,
            network: cryptoData.network,
            walletType: cryptoData.walletType,
            nickname: cryptoData.nickname,
            isDefault: cryptoData.isDefault
          });
          success('Crypto wallet connected successfully!');
          break;
      }
      
      // Reset forms
      setCardData({
        type: 'credit',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        holderName: '',
        nickname: '',
        isDefault: false
      });
      setBankData({
        accountType: 'checking',
        bankName: '',
        accountNumber: '',
        routingNumber: '',
        accountHolderName: '',
        nickname: '',
        isDefault: false
      });
      setCryptoData({
        address: '',
        network: 'ethereum',
        walletType: 'metamask',
        nickname: '',
        isDefault: false
      });
      setValidationErrors([]);
      onClose();
      
    } catch (err) {
      error('Failed to add payment method. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add Payment Method
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
          <div className="p-6">
            {/* Payment Type Selection */}
            <div className="mb-8">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Choose Payment Method Type
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {paymentTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 border-2 rounded-xl text-left transition-all ${
                      selectedType === type.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <type.icon className={`w-6 h-6 ${
                        selectedType === type.id ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {type.name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {type.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-red-800 dark:text-red-200 font-medium mb-1">
                      Please fix the following errors:
                    </h4>
                    <ul className="text-red-700 dark:text-red-300 text-sm space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Form Content */}
            <form onSubmit={handleSubmit}>
              {/* Credit Card Form */}
              {selectedType === 'card' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Card Type
                      </label>
                      <select
                        value={cardData.type}
                        onChange={(e) => setCardData({ ...cardData, type: e.target.value as any })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="credit">Credit Card</option>
                        <option value="debit">Debit Card</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Cardholder Name *
                      </label>
                      <input
                        type="text"
                        value={cardData.holderName}
                        onChange={(e) => setCardData({ ...cardData, holderName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Card Number *
                    </label>
                    <div className="relative">
                      <input
                        type={showCardNumber ? 'text' : 'password'}
                        value={cardData.cardNumber}
                        onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value.replace(/\D/g, '') })}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="1234567890123456"
                        maxLength={16}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCardNumber(!showCardNumber)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showCardNumber ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Expiry Month *
                      </label>
                      <select
                        value={cardData.expiryMonth}
                        onChange={(e) => setCardData({ ...cardData, expiryMonth: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Month</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                          <option key={month} value={month.toString().padStart(2, '0')}>
                            {month.toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Expiry Year *
                      </label>
                      <select
                        value={cardData.expiryYear}
                        onChange={(e) => setCardData({ ...cardData, expiryYear: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Year</option>
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        CVV *
                      </label>
                      <input
                        type="text"
                        value={cardData.cvv}
                        onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '') })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="123"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nickname (Optional)
                    </label>
                    <input
                      type="text"
                      value={cardData.nickname}
                      onChange={(e) => setCardData({ ...cardData, nickname: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Main Card, Backup Card"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="cardDefault"
                      checked={cardData.isDefault}
                      onChange={(e) => setCardData({ ...cardData, isDefault: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="cardDefault" className="text-sm text-gray-700 dark:text-gray-300">
                      Set as default payment method
                    </label>
                  </div>
                </div>
              )}

              {/* Bank Account Form */}
              {selectedType === 'bank' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Account Type
                      </label>
                      <select
                        value={bankData.accountType}
                        onChange={(e) => setBankData({ ...bankData, accountType: e.target.value as any })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="checking">Checking</option>
                        <option value="savings">Savings</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Bank Name *
                      </label>
                      <input
                        type="text"
                        value={bankData.bankName}
                        onChange={(e) => setBankData({ ...bankData, bankName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Chase Bank"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Account Holder Name *
                    </label>
                    <input
                      type="text"
                      value={bankData.accountHolderName}
                      onChange={(e) => setBankData({ ...bankData, accountHolderName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Routing Number *
                      </label>
                      <input
                        type="text"
                        value={bankData.routingNumber}
                        onChange={(e) => setBankData({ ...bankData, routingNumber: e.target.value.replace(/\D/g, '') })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="021000021"
                        maxLength={9}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Account Number *
                      </label>
                      <input
                        type="text"
                        value={bankData.accountNumber}
                        onChange={(e) => setBankData({ ...bankData, accountNumber: e.target.value.replace(/\D/g, '') })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="1234567890"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nickname (Optional)
                    </label>
                    <input
                      type="text"
                      value={bankData.nickname}
                      onChange={(e) => setBankData({ ...bankData, nickname: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Primary Checking, Savings Account"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="bankDefault"
                      checked={bankData.isDefault}
                      onChange={(e) => setBankData({ ...bankData, isDefault: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="bankDefault" className="text-sm text-gray-700 dark:text-gray-300">
                      Set as default payment method
                    </label>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-1">
                          Bank Account Verification
                        </p>
                        <p className="text-yellow-700 dark:text-yellow-300">
                          After adding your bank account, we'll send small verification deposits (usually under $1) 
                          within 1-2 business days. You'll need to verify these amounts to complete setup.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Crypto Wallet Form */}
              {selectedType === 'crypto' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Network
                      </label>
                      <select
                        value={cryptoData.network}
                        onChange={(e) => setCryptoData({ ...cryptoData, network: e.target.value as any })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="ethereum">Ethereum</option>
                        <option value="bitcoin">Bitcoin</option>
                        <option value="neutron">Neutron</option>
                        <option value="polygon">Polygon</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Wallet Type
                      </label>
                      <select
                        value={cryptoData.walletType}
                        onChange={(e) => setCryptoData({ ...cryptoData, walletType: e.target.value as any })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="metamask">MetaMask</option>
                        <option value="coinbase">Coinbase Wallet</option>
                        <option value="hardware">Hardware Wallet</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Wallet Address *
                    </label>
                    <input
                      type="text"
                      value={cryptoData.address}
                      onChange={(e) => setCryptoData({ ...cryptoData, address: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      placeholder="0x742d35Cc5BF8EE5f7DB4C3e6B2c1A3B4f5F6D7E8"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nickname (Optional)
                    </label>
                    <input
                      type="text"
                      value={cryptoData.nickname}
                      onChange={(e) => setCryptoData({ ...cryptoData, nickname: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., MetaMask Wallet, Hardware Wallet"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="cryptoDefault"
                      checked={cryptoData.isDefault}
                      onChange={(e) => setCryptoData({ ...cryptoData, isDefault: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="cryptoDefault" className="text-sm text-gray-700 dark:text-gray-300">
                      Set as default payment method
                    </label>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-blue-800 dark:text-blue-200 font-medium mb-1">
                          Crypto Wallet Connection
                        </p>
                        <p className="text-blue-700 dark:text-blue-300">
                          Your wallet will be verified automatically. Make sure you have access to this address 
                          for future transactions and withdrawals.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              type="button"
              disabled={saving}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Add Payment Method</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPaymentMethodModal;