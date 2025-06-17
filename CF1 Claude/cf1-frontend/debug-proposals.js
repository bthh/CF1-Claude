// Quick debug script to check if there are approved proposals in localStorage
const localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};

// Simulate checking localStorage for approved proposals
console.log('Checking for stored proposals...');

// Check if there's data in localStorage
const storedData = typeof window !== 'undefined' ? window.localStorage?.getItem('cf1-submissions') : null;
if (storedData) {
  try {
    const parsed = JSON.parse(storedData);
    console.log('Found stored submissions:', parsed);
    
    const approvedSubmissions = parsed.state?.submissions?.filter(s => s.status === 'approved') || [];
    console.log('Approved submissions found:', approvedSubmissions.length);
    
    approvedSubmissions.forEach((submission, index) => {
      console.log(`${index + 1}. ${submission.assetName} (${submission.category})`);
    });
  } catch (error) {
    console.error('Error parsing stored data:', error);
  }
} else {
  console.log('No stored submissions found in localStorage');
}