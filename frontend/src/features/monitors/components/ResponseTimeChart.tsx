"use client"

import dayjs from "dayjs"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import type { ResponseSeries } from "../types"
import { Card,CardHeader,CardFooter,CardTitle,CardDescription,CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import React from "react";

const chartConfig = {
  responseTime: {
    label: "Response Time (ms)",
    color: "var(--responsetime)",
  },
} satisfies ChartConfig;


export const ResponseTimeChart = React.memo(({ data }: {data:ResponseSeries[]}) => {
  const chartData = data.map((d) => ({
    time: dayjs(d.timestamp).format("HH:mm"),
    response: d.avgResponseTime ? parseFloat(d.avgResponseTime.toFixed(2)) : null,
  }))

  return (
    <Card>
      <CardHeader className="items-center pb-0">
        <CardTitle>Average Response Time / Hour</CardTitle>
        <CardDescription>This shows the average response time per hour of the monitor.</CardDescription>
      </CardHeader>
      <CardContent>
      <ChartContainer config={chartConfig} className="h-75 w-full">
        <LineChart margin={{ right:25, top:12}} data={chartData}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.4}  />
          <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8}  />
          <YAxis  tickLine={false} axisLine={true} tickFormatter={(value)=> `${value}ms`}/>
          <ChartTooltip content={<ChartTooltipContent className="bg-gray-800" indicator="dot" formatter={(value)=> value===null ? "No Data (Gap)": `${value}%`}/>} />
          <Line
            type="monotone"
            dataKey="response"
            stroke="var(--responsetime)"
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
            Showing average response time per hour for last 24 hours heartbeats.
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
        item.avgResponseTime === nextItem.avgResponseTime
      );
    });
  }
)