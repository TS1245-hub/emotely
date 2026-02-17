// Content script for Remotely extension
// This runs on supported job sites

console.log('Remotely extension loaded');

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractJob') {
    sendResponse(extractJobFromPage());
  }
});
