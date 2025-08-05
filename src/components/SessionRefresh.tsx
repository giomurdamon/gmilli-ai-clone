"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/auth";

interface SessionRefreshProps {
  onRefresh?: () => void;
}

export function SessionRefresh({ onRefresh }: SessionRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState("");

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setMessage("");

    try {
      const result = await authService.refreshUserSession();

      if (result) {
        setMessage(`✅ Session refreshed! Status: ${result.profile?.approval_status}`);

        // Call the parent's refresh callback if provided
        if (onRefresh) {
          onRefresh();
        }

        // Refresh the page after a short delay to ensure new data is loaded
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage("❌ No user session found. Please login.");
      }
    } catch (error) {
      setMessage(`❌ Refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <Button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
      >
        {isRefreshing ? '🔄 Refreshing...' : '🔄 Refresh Session'}
      </Button>

      {message && (
        <div className={`text-sm p-2 rounded ${
          message.includes('✅') ? 'text-green-400 bg-green-900/20' : 'text-red-400 bg-red-900/20'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}
