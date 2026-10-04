import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Video, Copy, Calendar, RefreshCcw } from "lucide-react";
import { Layout } from "@/components/Layout";
import axiosInstance from "@/Interceptor/axiosInstance";

interface ZoomMeeting {
  uuid: string;
  id: number;
  host_id: string;
  topic: string;
  start_time: string;
  duration?: number;
  type: number; // 2 = Scheduled, 8 = Recurring
  join_url: string;
  agenda?: string;
  recurrence?: {
    type: number;
    repeat_interval: number;
    end_times: number;
  };
}

interface ZoomMeetingResponse {
  meetings: ZoomMeeting[];
}

const MEETINGS_QUERY_KEY = ["meetings"] as const;

async function fetchMeetings(): Promise<ZoomMeeting[]> {
  const res = await axiosInstance.get<ZoomMeetingResponse>(
    "/api/meet/list-meetings"
  );
  return res.data.meetings;
}

export default function VideoCalls() {
  const queryClient = useQueryClient();
  const { data: meetingData = [] } = useQuery({
    queryKey: MEETINGS_QUERY_KEY,
    queryFn: fetchMeetings,
  });
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [filter, setFilter] = useState<"all" | "scheduled" | "recurring">(
    "all"
  );
  const [formLoading, setFormLoading] = useState(false);

  /** Start Instant Meeting */
  const handleStartInstantMeeting = async () => {
    try {
      setLoading(true);
      const createRes = await axiosInstance.post("/api/meet/create-meeting", {
        topic: "Instant Meeting",
        start_time: new Date().toISOString(),
        duration: 30,
      });
      if (createRes.data.join_url) {
        window.open(createRes.data.join_url, "_blank");
      }
    } catch (err) {
      console.error("Error starting meeting:", err);
    } finally {
      setLoading(false);
    }
  };

  /** Schedule Meeting (One-time or Recurring) */
  const handleScheduleMeetings = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setFormLoading(true);

    const form = e.currentTarget;
    const topic = (form.elements.namedItem("topic") as HTMLInputElement).value;
    const duration = parseInt(
      (form.elements.namedItem("duration") as HTMLInputElement).value,
      10
    );
    const localDateTime = (
      form.elements.namedItem("startTime") as HTMLInputElement
    ).value;
    const utcDateTime = new Date(localDateTime).toISOString();

    try {
      if (isRecurring) {
        const recurrenceType = parseInt(
          (form.elements.namedItem("recurrenceType") as HTMLSelectElement)
            .value,
          10
        );
        const repeatInterval = parseInt(
          (form.elements.namedItem("repeatInterval") as HTMLInputElement).value,
          10
        );
        const endTimes = parseInt(
          (form.elements.namedItem("endTimes") as HTMLInputElement).value,
          10
        );

        await axiosInstance.post("/api/meet/schedule_recurring_meetings", {
          topic,
          start_time: utcDateTime,
          duration,
          recurrenceType,
          repeatInterval,
          endTimes,
        });
      } else {
        await axiosInstance.post("/api/meet/schedule-meetings", {
          topic,
          start_time: utcDateTime,
          duration,
        });
      }

      setIsModalOpen(false);
      await queryClient.invalidateQueries({ queryKey: MEETINGS_QUERY_KEY });
    } catch (err) {
      console.error("Error scheduling meeting:", err);
    } finally {
      setFormLoading(false);
    }
  };

  /** Deduplicate Recurring Meetings */
  const uniqueMeetings = meetingData.reduce<ZoomMeeting[]>((acc, meeting) => {
    if (meeting.type === 8) {
      const exists = acc.find((m) => m.topic === meeting.topic && m.type === 8);
      if (!exists) acc.push(meeting);
    } else {
      acc.push(meeting);
    }
    return acc;
  }, []);

  /** Apply Filter */
  const filteredMeetings = uniqueMeetings.filter((meeting) => {
    if (filter === "scheduled") return meeting.type === 2;
    if (filter === "recurring") return meeting.type === 8;
    return true;
  });

  return (
    <Layout>
      <div className="p-4 max-w-6xl mx-auto">
        <Card className="shadow-lg rounded-xl border border-gray-200">
          {/* Header */}
          <CardHeader className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b pb-4">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Zoom Meetings
            </CardTitle>
            <div className="flex gap-2">
              {(["all", "scheduled", "recurring"] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? "default" : "outline"}
                  onClick={() => setFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Button
                onClick={handleStartInstantMeeting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md"
                disabled={loading}
              >
                {loading ? (
                  "Starting..."
                ) : (
                  <>
                    <Video className="w-4 h-4 mr-2" /> Start Instant Meeting
                  </>
                )}
              </Button>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md"
              >
                Schedule Meeting
              </Button>
            </div>

            <ScrollArea className="h-[450px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMeetings.length === 0 ? (
                  <p className="text-gray-500 text-center text-sm col-span-2">
                    No meetings found
                  </p>
                ) : (
                  filteredMeetings.map((meeting) => (
                    <div
                      key={meeting.uuid}
                      className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-lg transition"
                    >
                      {/* Title & Status */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-1">
                            {meeting.topic}
                          </h3>
                          {meeting.agenda && (
                            <p className="text-xs text-gray-500 mb-1 italic">
                              {meeting.agenda}
                            </p>
                          )}

                          {/* Time & Date */}
                          <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-blue-500" />
                              {new Date(meeting.start_time).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                            </span>
                            <span>
                              {new Date(
                                meeting.start_time
                              ).toLocaleDateString()}
                            </span>
                          </div>

                          {meeting.duration && (
                            <p className="text-xs text-gray-500 mt-1">
                              Duration: {meeting.duration} min
                            </p>
                          )}

                          {/* Recurrence Info */}
                          {meeting.type === 8 && meeting.recurrence && (
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                              <RefreshCcw className="w-3 h-3" />
                              Every {
                                meeting.recurrence.repeat_interval
                              } days, {meeting.recurrence.end_times} times
                            </p>
                          )}
                        </div>
                        <Badge className="bg-gray-100 text-gray-600 text-xs px-2 py-1">
                          {meeting.type === 2 ? "Scheduled" : "Recurring"}
                        </Badge>
                      </div>

                      {/* Meeting Actions */}
                      <div className="flex justify-between items-center mt-4 border-t pt-3">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>ID: {meeting.id}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-gray-100"
                            onClick={() =>
                              navigator.clipboard.writeText(meeting.join_url)
                            }
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                          onClick={() =>
                            window.open(meeting.join_url, "_blank")
                          }
                        >
                          <Video className="w-3 h-3 mr-1" /> Join
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Meeting Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[420px] space-y-4 relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold text-gray-800">
              Schedule a Meeting
            </h2>

            <div className="flex gap-3 mb-4">
              <Button
                variant={!isRecurring ? "default" : "outline"}
                onClick={() => setIsRecurring(false)}
              >
                One-time
              </Button>
              <Button
                variant={isRecurring ? "default" : "outline"}
                onClick={() => setIsRecurring(true)}
              >
                Recurring
              </Button>
            </div>

            <form
              onSubmit={handleScheduleMeetings}
              className="flex flex-col gap-4"
            >
              <div>
                <label
                  htmlFor="topic"
                  className="block text-sm font-medium text-gray-600"
                >
                  Topic
                </label>
                <input
                  id="topic"
                  type="text"
                  placeholder="Enter meeting topic"
                  className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="startTime"
                  className="block text-sm font-medium text-gray-600"
                >
                  Start Time
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-400">
                  <Calendar className="w-5 h-5 text-gray-500 ml-2" />
                  <input
                    id="startTime"
                    type="datetime-local"
                    className="p-2 w-full outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="duration"
                  className="block text-sm font-medium text-gray-600"
                >
                  Duration (minutes)
                </label>
                <input
                  id="duration"
                  type="number"
                  placeholder="Enter duration"
                  className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              {isRecurring && (
                <>
                  <div>
                    <label
                      htmlFor="recurrenceType"
                      className="block text-sm font-medium text-gray-600"
                    >
                      Recurrence Type
                    </label>
                    <select
                      id="recurrenceType"
                      className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="1">Daily</option>
                      <option value="2">Weekly</option>
                      <option value="3">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="repeatInterval"
                      className="block text-sm font-medium text-gray-600"
                    >
                      Repeat Interval
                    </label>
                    <input
                      id="repeatInterval"
                      type="number"
                      placeholder="Repeat every X days"
                      className="border border-gray-300 p-2 rounded-lg w-full"
                      defaultValue={1}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="endTimes"
                      className="block text-sm font-medium text-gray-600"
                    >
                      End After (times)
                    </label>
                    <input
                      id="endTimes"
                      type="number"
                      placeholder="Number of occurrences"
                      className="border border-gray-300 p-2 rounded-lg w-full"
                      defaultValue={10}
                    />
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg"
                disabled={formLoading}
              >
                {formLoading ? "Scheduling..." : "Schedule Meeting"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
