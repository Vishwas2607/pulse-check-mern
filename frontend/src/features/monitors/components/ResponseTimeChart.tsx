"use client"

import dayjs from "dayjs"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import type { SeriesType } from "../types"
import { Card,CardHeader,CardFooter,CardTitle,CardDescription,CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

type Props = {
  data: SeriesType[]
}

const chartConfig = {
  responseTime: {
    label: "Response Time (ms)",
    color: "var(--responsetime)",
  },
} satisfies ChartConfig;


export default function ResponseTimeChart({ data }: Props) {
  const chartData = data.map((d) => ({
    time: dayjs(d.timestamp).format("HH:mm"),
    response: d.avgResponseTime ?? 0,
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
          <ChartTooltip content={<ChartTooltipContent className="bg-gray-800"/>} />
          <Line
            type="monotone"
            dataKey="response"
            stroke="var(--responsetime)"
            strokeWidth={2}
            dot={false}
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
}