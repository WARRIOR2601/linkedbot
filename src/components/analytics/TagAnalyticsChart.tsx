import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Tag } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TagData {
  tag: string;
  postCount: number;
  totalImpressions: number;
  avgEngagementRate: number;
  trend: "up" | "down" | "neutral";
}

interface TagAnalyticsChartProps {
  data: TagData[];
}

const TagAnalyticsChart = ({ data }: TagAnalyticsChartProps) => {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            Views by Tag
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Tag className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No tag data yet</p>
            <p className="text-sm mt-1">Posts with tags will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.slice(0, 10).map((item) => ({
    name: item.tag,
    posts: item.postCount,
    impressions: item.totalImpressions,
    engagement: item.avgEngagementRate,
  }));

  const TrendIcon = ({ trend }: { trend: "up" | "down" | "neutral" }) => {
    if (trend === "up") return <TrendingUp className="w-4 h-4 text-success" />;
    if (trend === "down") return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Tag className="w-5 h-5 text-primary" />
          Views by Tag
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bar Chart */}
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis 
                dataKey="name" 
                type="category" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar 
                dataKey="posts" 
                fill="hsl(var(--primary))" 
                name="Posts"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Ranked List */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Top Performing Tags</h4>
          {data.slice(0, 5).map((item, index) => (
            <div
              key={item.tag}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {index + 1}
                </span>
                <Badge variant="outline">{item.tag}</Badge>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium">{item.postCount} posts</p>
                  <p className="text-xs text-muted-foreground">
                    {item.totalImpressions.toLocaleString()} impressions
                  </p>
                </div>
                <TrendIcon trend={item.trend} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TagAnalyticsChart;
