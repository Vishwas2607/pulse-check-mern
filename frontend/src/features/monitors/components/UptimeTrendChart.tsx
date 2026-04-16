import dayjs from "dayjs";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import type { UptimeSeries} from "../types";
import { Card,CardHeader,CardFooter,CardTitle,CardDescription,CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import React from "react";

const chartConfig = {
  uptime: {
    label: "Uptime (%)",
    color: "var(--uptime)",
  },
} satisfies ChartConfig;


export const UptimeTrendChart = React.memo(({ data }: {data:UptimeSeries[]}) => {
  const chartData = data.map((d) => ({
    time: dayjs(d.timestamp).format("HH:mm"),
    uptime: d.uptimePercentage ? parseFloat(d.uptimePercentage.toFixed(2)) : null,
  }))

  return (
    <Card>
      <CardHeader className="items-center pb-0">
        <CardTitle>Uptime Percentage / Hour</CardTitle>
        <CardDescription>This shows the uptime percentage per hour of the monitor.</CardDescription>
      </CardHeader>
      <CardContent>
          <ChartContainer config={chartConfig} className="h-75 w-full">
            <LineChart data={chartData} margin={{ right:25, top:12}}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.4} />
              <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis domain={[0, 100]} tickLine={false} axisLine={true} tickFormatter={(value)=> `${value}%`} />
              <ChartTooltip content={<ChartTooltipContent className="bg-gray-800" indicator="dot" formatter={(value)=> value===null ? "No Data (Gap)": `${value}%`}/>} />
              <Line
                type="monotone"
                dataKey="uptime"
                stroke="var(--uptime)" 
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                activeDot={{r:4, fill:"red"}}
              />
            </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="bg-gray-800">
        <div className="leading-none text-center w-full text-muted-foreground">
            Showing uptime percentage for last 24 hours heartbeats.
        </div>
      </CardFooter>
    </Card>
  )
},
  (prevProps, nextProps) => {
    if (prevProps.data.length !== nextProps.data.length) return false;
    return prevProps.data.every((item, index) => {
      const nextItem = nextProps.data[index];
      return (
        item.timestamp.getTime() === nextItem.timestamp.getTime() &&
        item.uptimePercentage === nextItem.uptimePercentage
      );
    });
  }
)