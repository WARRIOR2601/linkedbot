// Chrome Extension ID for Linkedbot
export const EXTENSION_ID = "difggmpfgojmpedopbmkoodmipdkfnkn";

// Extend Window interface to include chrome
declare global {
  interface Window {
    chrome?: {
      runtime?: {
        sendMessage: (
          extensionId: string,
          message: any,
          callback?: (response: any) => void
        ) => void;
        lastError?: { message: string };
      };
    };
  }
}

/**
 * Send a message to the Chrome extension
 * Safely checks if chrome API is available before sending
 */
export const sendExtensionMessage = (message: { type: string; [key: string]: any }) => {
  if (typeof window !== 'undefined' && 
      window.chrome && 
      window.chrome.runtime && 
      window.chrome.runtime.sendMessage) {
    try {
      window.chrome.runtime.sendMessage(EXTENSION_ID, message, (response) => {
        if (window.chrome?.runtime?.lastError) {
          console.debug("Extension message: Extension not available");
        } else {
          console.debug("Extension message sent:", message.type, response);
        }
      });
    } catch (error) {
      console.debug("Extension message: Failed to communicate", error);
    }
  }
};

/**
 * Send FORCE_CHECK message to trigger immediate post check
 */
export const triggerExtensionForceCheck = () => {
  sendExtensionMessage({ type: "FORCE_CHECK" });
};

/**
 * Request profile data refresh from extension via window.postMessage
 */
export const requestProfileRefresh = () => {
  if (typeof window !== 'undefined') {
    console.debug("[LinkedBot] Requesting profile refresh");
    window.postMessage({ type: "LINKEDBOT_REQUEST_PROFILE" }, "*");
  }
};
