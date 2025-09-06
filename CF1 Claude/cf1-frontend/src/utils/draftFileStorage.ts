/**
 * File storage utilities for proposal drafts
 * Handles persistence of uploaded files across draft saves/loads
 */

interface StoredFileData {
  name: string;
  type: string;
  size: number;
  lastModified: number;
  data: string; // base64 encoded file content
}

const STORAGE_KEY_PREFIX = 'cf1-draft-files-';

/**
 * Convert File to storable format with base64 encoding
 */
export const storeFile = async (file: File, draftId: string, fieldName: string): Promise<void> => {
  try {
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = () => {
        const base64Data = reader.result as string;
        const storedFile: StoredFileData = {
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified,
          data: base64Data
        };
        
        const storageKey = `${STORAGE_KEY_PREFIX}${draftId}-${fieldName}`;
        localStorage.setItem(storageKey, JSON.stringify(storedFile));
        resolve();
      };
      
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error(`Error storing file for ${fieldName}:`, error);
    throw error;
  }
};

/**
 * Retrieve stored file and convert back to File object
 */
export const retrieveFile = (draftId: string, fieldName: string): File | null => {
  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${draftId}-${fieldName}`;
    const storedData = localStorage.getItem(storageKey);
    
    if (!storedData) {
      return null;
    }
    
    const fileData: StoredFileData = JSON.parse(storedData);
    
    // Convert base64 back to blob
    const byteCharacters = atob(fileData.data.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: fileData.type });
    
    // Create File object with original metadata
    const file = new File([blob], fileData.name, {
      type: fileData.type,
      lastModified: fileData.lastModified
    });
    
    return file;
  } catch (error) {
    console.error(`Error retrieving file for ${fieldName}:`, error);
    return null;
  }
};

/**
 * Store all files from form data
 */
export const storeAllFiles = async (draftId: string, files: {
  businessPlan?: File | null;
  financialProjections?: File | null;
  legalDocuments?: File | null;
  assetValuation?: File | null;
}): Promise<void> => {
  const storePromises: Promise<void>[] = [];
  
  if (files.businessPlan) {
    storePromises.push(storeFile(files.businessPlan, draftId, 'businessPlan'));
  }
  if (files.financialProjections) {
    storePromises.push(storeFile(files.financialProjections, draftId, 'financialProjections'));
  }
  if (files.legalDocuments) {
    storePromises.push(storeFile(files.legalDocuments, draftId, 'legalDocuments'));
  }
  if (files.assetValuation) {
    storePromises.push(storeFile(files.assetValuation, draftId, 'assetValuation'));
  }
  
  await Promise.all(storePromises);
};

/**
 * Retrieve all files for a draft
 */
export const retrieveAllFiles = (draftId: string) => {
  return {
    businessPlan: retrieveFile(draftId, 'businessPlan'),
    financialProjections: retrieveFile(draftId, 'financialProjections'),
    legalDocuments: retrieveFile(draftId, 'legalDocuments'),
    assetValuation: retrieveFile(draftId, 'assetValuation')
  };
};

/**
 * Clean up stored files for a draft
 */
export const cleanupDraftFiles = (draftId: string): void => {
  const fields = ['businessPlan', 'financialProjections', 'legalDocuments', 'assetValuation'];
  
  fields.forEach(fieldName => {
    const storageKey = `${STORAGE_KEY_PREFIX}${draftId}-${fieldName}`;
    localStorage.removeItem(storageKey);
  });
};

/**
 * Get total storage size for draft files (for debugging)
 */
export const getDraftFileStorageSize = (draftId: string): number => {
  const fields = ['businessPlan', 'financialProjections', 'legalDocuments', 'assetValuation'];
  let totalSize = 0;
  
  fields.forEach(fieldName => {
    const storageKey = `${STORAGE_KEY_PREFIX}${draftId}-${fieldName}`;
    const data = localStorage.getItem(storageKey);
    if (data) {
      totalSize += data.length;
    }
  });
  
  return totalSize;
};