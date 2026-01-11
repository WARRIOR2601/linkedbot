import { useExtension } from "@/hooks/useExtension";

export type ConnectionStatus = "not_connected" | "connected";

/**
 * Hook for checking Chrome Extension connection status
 * This replaces the old LinkedIn OAuth/Ayrshare logic
 */
export const useLinkedInAccount = () => {
  const { extensionStatus, isLoading, analytics } = useExtension();

  const getConnectionStatus = (): ConnectionStatus => {
    return extensionStatus.isConnected ? "connected" : "not_connected";
  };

  // Check if user can post (extension must be connected)
  const canPost = (): boolean => {
    return extensionStatus.isConnected;
  };

  return {
    account: null, // No longer storing OAuth account data
    isLoading,
    error: null,
    connectionStatus: getConnectionStatus(),
    extensionStatus,
    analytics,
    canPost: canPost(),
    refetch: () => {}, // No-op, useExtension handles refetching
  };
};
