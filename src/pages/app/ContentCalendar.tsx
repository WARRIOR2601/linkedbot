import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Calendar as CalendarIcon,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";

// Mock scheduled posts
const scheduledPosts = [
  {
    id: 1,
    title: "5 AI Tools Every Marketer Needs in 2024",
    date: "2024-01-15",
    time: "09:00",
    status: "scheduled",
  },
  {
    id: 2,
    title: "Why Personal Branding Matters More Than Ever",
    date: "2024-01-16",
    time: "14:00",
    status: "scheduled",
  },
  {
    id: 3,
    title: "Leadership Lessons from My First Year as CEO",
    date: "2024-01-17",
    time: "10:00",
    status: "draft",
  },
  {
    id: 4,
    title: "The Future of Remote Work",
    date: "2024-01-18",
    time: "11:00",
    status: "scheduled",
  },
  {
    id: 5,
    title: "Building a Growth Mindset",
    date: "2024-01-19",
    time: "09:00",
    status: "scheduled",
  },
];

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const ContentCalendar = () => {
  const [view, setView] = useState<"week" | "month">("week");
  const [currentDate, setCurrentDate] = useState(new Date());

  const getWeekDates = () => {
    const week = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const getMonthDates = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const dates = [];

    // Add padding for days before the first of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      const day = new Date(year, month, -i);
      dates.unshift({ date: day, isCurrentMonth: false });
    }

    // Add days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      dates.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Add padding for days after the last of the month
    const remainingDays = 42 - dates.length;
    for (let i = 1; i <= remainingDays; i++) {
      dates.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return dates;
  };

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;
  };

  const getPostsForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return scheduledPosts.filter((post) => post.date === dateStr);
  };

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction * 7);
    setCurrentDate(newDate);
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const weekDates = getWeekDates();
  const monthDates = getMonthDates();

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Content Calendar</h1>
            <p className="text-muted-foreground">Schedule and manage your LinkedIn posts</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setView("week")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  view === "week" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setView("month")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  view === "month" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                Month
              </button>
            </div>
            <Button variant="hero">
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </div>
        </div>

        {/* Calendar Navigation */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => (view === "week" ? navigateWeek(-1) : navigateMonth(-1))}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-lg font-semibold">
              {view === "week"
                ? `${months[weekDates[0].getMonth()]} ${weekDates[0].getDate()} - ${
                    months[weekDates[6].getMonth()]
                  } ${weekDates[6].getDate()}, ${weekDates[6].getFullYear()}`
                : `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => (view === "week" ? navigateWeek(1) : navigateMonth(1))}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </CardHeader>
          <CardContent>
            {view === "week" ? (
              // Week View
              <div className="grid grid-cols-7 gap-4">
                {weekDates.map((date, index) => {
                  const posts = getPostsForDate(date);
                  const isToday = formatDate(date) === formatDate(new Date());

                  return (
                    <div
                      key={index}
                      className={`min-h-[200px] rounded-lg border ${
                        isToday ? "border-primary bg-primary/5" : "border-border"
                      } p-3`}
                    >
                      <div className="text-center mb-3">
                        <p className="text-xs text-muted-foreground">{daysOfWeek[date.getDay()]}</p>
                        <p
                          className={`text-lg font-semibold ${
                            isToday ? "text-primary" : ""
                          }`}
                        >
                          {date.getDate()}
                        </p>
                      </div>
                      <div className="space-y-2">
                        {posts.map((post) => (
                          <div
                            key={post.id}
                            className={`p-2 rounded-md text-xs cursor-pointer transition-all hover:scale-[1.02] ${
                              post.status === "scheduled"
                                ? "bg-success/20 border border-success/30"
                                : "bg-warning/20 border border-warning/30"
                            }`}
                          >
                            <p className="font-medium truncate">{post.title}</p>
                            <p className="text-muted-foreground flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              {post.time}
                            </p>
                          </div>
                        ))}
                        <button className="w-full p-2 rounded-md border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all text-xs text-muted-foreground">
                          <Plus className="w-3 h-3 mx-auto" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Month View
              <div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {monthDates.map(({ date, isCurrentMonth }, index) => {
                    const posts = getPostsForDate(date);
                    const isToday = formatDate(date) === formatDate(new Date());

                    return (
                      <div
                        key={index}
                        className={`min-h-[100px] rounded-lg p-2 ${
                          isCurrentMonth ? "" : "opacity-30"
                        } ${
                          isToday
                            ? "bg-primary/10 border border-primary"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <p
                          className={`text-sm font-medium mb-1 ${
                            isToday ? "text-primary" : ""
                          }`}
                        >
                          {date.getDate()}
                        </p>
                        <div className="space-y-1">
                          {posts.slice(0, 2).map((post) => (
                            <div
                              key={post.id}
                              className={`p-1 rounded text-xs truncate ${
                                post.status === "scheduled"
                                  ? "bg-success/20"
                                  : "bg-warning/20"
                              }`}
                            >
                              {post.title}
                            </div>
                          ))}
                          {posts.length > 2 && (
                            <p className="text-xs text-muted-foreground">
                              +{posts.length - 2} more
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Posts List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scheduledPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CalendarIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{post.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {post.date} at {post.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        post.status === "scheduled"
                          ? "bg-success/20 text-success"
                          : "bg-warning/20 text-warning"
                      }`}
                    >
                      {post.status}
                    </span>
                    <Button variant="ghost" size="icon">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ContentCalendar;
