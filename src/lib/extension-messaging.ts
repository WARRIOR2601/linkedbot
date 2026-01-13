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
 * Sync authentication token to extension for API calls
 */
export const syncTokenToExtension = (token: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && 
        window.chrome && 
        window.chrome.runtime && 
        window.chrome.runtime.sendMessage) {
      try {
        console.debug("[LinkedBot] Syncing token to extension");
        window.chrome.runtime.sendMessage(EXTENSION_ID, { 
          type: "LINKEDBOT_SYNC_TOKEN", 
          token 
        }, (response) => {
          if (window.chrome?.runtime?.lastError) {
            console.debug("[LinkedBot] Token sync: Extension not available");
            resolve(false);
          } else {
            console.debug("[LinkedBot] Token sync response:", response);
            resolve(true);
          }
        });
      } catch (error) {
        console.debug("[LinkedBot] Token sync failed", error);
        resolve(false);
      }
    } else {
      resolve(false);
    }
  });
};

/**
 * Request profile data refresh from extension via chrome.runtime.sendMessage
 */
export const requestProfileRefresh = () => {
  if (typeof window !== 'undefined' && 
      window.chrome && 
      window.chrome.runtime && 
      window.chrome.runtime.sendMessage) {
    try {
      console.debug("[LinkedBot] Requesting profile refresh via chrome.runtime.sendMessage");
      window.chrome.runtime.sendMessage(EXTENSION_ID, { type: "LINKEDBOT_REQUEST_PROFILE" }, (response) => {
        if (window.chrome?.runtime?.lastError) {
          console.debug("[LinkedBot] Profile refresh: Extension not available, falling back to postMessage");
          window.postMessage({ type: "LINKEDBOT_REQUEST_PROFILE" }, "*");
        } else {
          console.debug("[LinkedBot] Profile refresh response:", response);
        }
      });
    } catch (error) {
      console.debug("[LinkedBot] Profile refresh failed, falling back to postMessage", error);
      window.postMessage({ type: "LINKEDBOT_REQUEST_PROFILE" }, "*");
    }
  } else {
    // Fallback to postMessage if chrome API not available
    console.debug("[LinkedBot] Requesting profile refresh via postMessage (fallback)");
    window.postMessage({ type: "LINKEDBOT_REQUEST_PROFILE" }, "*");
  }
};

/**
 * Send disconnect message to extension
 */
export const disconnectExtension = () => {
  if (typeof window !== 'undefined' && 
      window.chrome && 
      window.chrome.runtime && 
      window.chrome.runtime.sendMessage) {
    try {
      console.debug("[LinkedBot] Sending disconnect message to extension");
      window.chrome.runtime.sendMessage(EXTENSION_ID, { type: "LINKEDBOT_DISCONNECT" }, (response) => {
        if (window.chrome?.runtime?.lastError) {
          console.debug("[LinkedBot] Disconnect: Extension not available");
        } else {
          console.debug("[LinkedBot] Disconnect response:", response);
        }
      });
    } catch (error) {
      console.debug("[LinkedBot] Disconnect failed", error);
    }
  }
};
