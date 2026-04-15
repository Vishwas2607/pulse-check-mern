import dayjs from "dayjs";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import type { SeriesType } from "../types";
import { Card,CardHeader,CardFooter,CardTitle,CardDescription,CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

type Props = {
  data: SeriesType[]
}

const chartConfig = {
  uptime: {
    label: "Uptime (%)",
    color: "var(--uptime)",
  },
} satisfies ChartConfig;


export default function UptimeTrendChart({ data }: Props) {
  const chartData = data.map((d) => ({
    time: dayjs(d.timestamp).format("HH:mm"),
    uptime: d.uptimePercentage ?? 0,
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
              <ChartTooltip content={<ChartTooltipContent className="bg-gray-800"/>} />
              <Line
                type="monotone"
                dataKey="uptime"
                stroke="var(--uptime)" 
                strokeWidth={2}
                dot={false}
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
}