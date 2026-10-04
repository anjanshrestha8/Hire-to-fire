import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axiosInstance from "@/Interceptor/axiosInstance";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  createdAt: string;
  related_id?: number;
  related_type?: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

interface NotificationBellProps {
  onRefresh?: () => void;
}

const NOTIFICATIONS_QUERY_KEY = ["notifications"] as const;

async function fetchNotifications(): Promise<NotificationsResponse> {
  try {
    const response = await axiosInstance.get("/api/notification/my", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    if (response.data.success) {
      const notificationData: Notification[] = response.data.data || [];
      const unreadFromData = notificationData.filter((n) => !n.is_read).length;
      return {
        notifications: notificationData,
        unreadCount: response.data.unread_count || unreadFromData,
      };
    }

    console.error("API returned success: false", response.data);
    return { notifications: [], unreadCount: 0 };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { notifications: [], unreadCount: 0 };
  }
}

const NotificationBell: React.FC<NotificationBellProps> = (_props) => {
  void _props;
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const { data, isFetching, isLoading, refetch } = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: fetchNotifications,
    refetchInterval: 30000,
  });

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;
  const loading = isLoading || isFetching;

  const markAsRead = async (notificationId: number) => {
    try {
      await axiosInstance.patch(
        `/api/notification/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      queryClient.setQueryData<NotificationsResponse>(
        NOTIFICATIONS_QUERY_KEY,
        (prev) => {
          if (!prev) return prev;
          return {
            notifications: prev.notifications.map((notif) =>
              notif.id === notificationId ? { ...notif, is_read: true } : notif
            ),
            unreadCount: Math.max(0, prev.unreadCount - 1),
          };
        }
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.patch(
        "/api/notification/mark-all-read",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      queryClient.setQueryData<NotificationsResponse>(
        NOTIFICATIONS_QUERY_KEY,
        (prev) => {
          if (!prev) return prev;
          return {
            notifications: prev.notifications.map((notif) => ({
              ...notif,
              is_read: true,
            })),
            unreadCount: 0,
          };
        }
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "task_assignment":
      case "task_created":
        return "bg-blue-100 text-blue-800";
      case "task_status_update":
      case "task_completed":
        return "bg-green-100 text-green-800";
      case "task_deadline":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-900 font-bold";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );

      if (diffInMinutes < 1) {
        return "Just now";
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
      } else if (diffInMinutes < 1440) {
        // 24 hours
        return `${Math.floor(diffInMinutes / 60)}h ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch {
      return "Unknown time";
    }
  };

  // Helper function to format notification type
  const formatNotificationType = (type: string | null | undefined) => {
    if (!type) return "General"; // Default fallback
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handleRefresh = () => {
    void refetch();
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-red-500 text-white rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 z-50">
          <Card className="shadow-lg border bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Notifications{" "}
                {notifications.length > 0 && `(${notifications.length})`}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  className="text-xs h-6 px-2"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Refresh"}
                </Button>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs h-6 px-2"
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {loading && notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No notifications yet</p>
                    <p className="text-xs mt-1">
                      You'll see task updates and system notifications here
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        !notification.is_read
                          ? "bg-gray-50 border-l-2 border-l-blue-500"
                          : ""
                      }`}
                      onClick={() =>
                        !notification.is_read && markAsRead(notification.id)
                      }
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </h4>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge
                              className={`text-xs ${getTypeColor(
                                notification.type
                              )}`}
                            >
                              {formatNotificationType(notification.type)}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {formatDate(notification.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {/* Debug info (remove in production) */}
              {process.env.NODE_ENV === "development" && (
                <div className="p-2 bg-gray-50 border-t text-xs text-gray-500">
                  Debug: {notifications.length} notifications, {unreadCount}{" "}
                  unread
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default NotificationBell;
