import dayjs from "dayjs"
import { formatXAxis } from "@/utils/helpers";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import type { RangeType, ResponseSeries } from "../types"
import { Card,CardHeader,CardFooter,CardTitle,CardDescription,CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import React from "react";

const chartConfig = {
  responseTime: {
    label: "Response Time (ms)",
    color: "var(--responsetime)",
  },
} satisfies ChartConfig;


export const ResponseTimeChart = React.memo(({ data, range }: {data:ResponseSeries[], range:RangeType}) => {
  const chartData = data.map((d) => ({
    time: d.timestamp,
    response: d.avgResponseTime ? parseFloat(d.avgResponseTime.toFixed(2)) : null,
  }))

  return (
    <Card>
      <CardHeader className="items-center pb-0">
        <CardTitle>Average Response Time</CardTitle>
        <CardDescription>This shows the average response time per hour of the monitor.</CardDescription>
      </CardHeader>
      <CardContent>
      <ChartContainer config={chartConfig} className="h-75 w-full">
        <LineChart margin={{ right:25, top:12}} data={chartData}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.4}  />
          <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value)=>formatXAxis(value,range)} minTickGap={30} />
          <YAxis  tickLine={false} axisLine={true} tickFormatter={(value)=> `${value}ms`}/>
          <ChartTooltip content={<ChartTooltipContent className="bg-gray-800" indicator="dot" labelFormatter={(value) => dayjs(value).format("MMM DD, YYYY HH:mm")} formatter={(value)=> value===null ? "No Data (Gap)": `${value}ms`}/>} />
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
            Showing average response time per hour for last {range} heartbeats.
        </div>
      </CardFooter>
    </Card>
  )
},
  (prevProps, nextProps) => {
    if (prevProps.data.length !== nextProps.data.length) return false;
    return prevProps.range === nextProps.range && prevProps.data === nextProps.data;
  }
)