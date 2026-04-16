"use client"

import dayjs from "dayjs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import type { FailureSeries } from "../types"
import { Card,CardHeader,CardFooter,CardTitle,CardDescription,CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import React from "react";


const chartConfig = {
  responseTime: {
    label: "Failure Counts",
    color: "var(--downtime)",
  },
} satisfies ChartConfig;


export const FailureCountChart = React.memo(({ data }: {data: FailureSeries[]}) => {
  const chartData = data.map((d) => ({
    time: dayjs(d.timestamp).format("HH:mm"),
    failures: d.failureCount ?? 0,
  }))

  return (
    <Card>
      <CardHeader className="items-center pb-0">
        <CardTitle>Failure Count / Hour</CardTitle>
        <CardDescription>This shows the failure count per hour of the monitor.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-75 w-full">
        <BarChart margin={{right:30, top:12}} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.4}/>
          <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickLine={false} axisLine={true}/>
          <ChartTooltip cursor={{fill:"var(--muted)"}} content={<ChartTooltipContent className="bg-gray-800 "/>} />
          <Bar dataKey="failures" fill={"var(--downtime)"} radius={[4, 4, 0, 0]} />
        </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="bg-gray-800">
        <div className="leading-none text-center w-full text-muted-foreground">
            Showing failure count per hour for last 24 hours heartbeats.
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
        item.failureCount === nextItem.failureCount
      );
    });
  }
)