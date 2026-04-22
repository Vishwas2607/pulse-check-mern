import dayjs from "dayjs"
import { formatXAxis } from "@/utils/helpers";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import type { FailureSeries, RangeType } from "../types"
import { Card,CardHeader,CardFooter,CardTitle,CardDescription,CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import React from "react";


const chartConfig = {
  failures: {
    label: "Failure Counts",
    color: "var(--downtime)",
  },
} satisfies ChartConfig;


export const FailureCountChart = React.memo(({ data,range }: {data: FailureSeries[], range:RangeType}) => {
const chartData = data.map((d) => {
  const count = Number(d.failureCount);
  return {
    time: d.timestamp,
    failures: isNaN(count) ? 0 : count,
  };
});

  return (
    <Card>
      <CardHeader className="items-center pb-0">
        <CardTitle>Failure Counts</CardTitle>
        <CardDescription>This shows the failure count of the monitor.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-75 w-full">
        <BarChart margin={{right:30, top:12}} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.4} />
          <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value)=>formatXAxis(value,range)} minTickGap={30}/>
          <YAxis tickLine={false} axisLine={true} />
          <ChartTooltip cursor={{fill:"var(--muted)"}} content={<ChartTooltipContent className="bg-gray-800 " labelFormatter={(value) => dayjs(value).format("MMM DD, YYYY HH:mm")}/>} />
          <Bar dataKey="failures" name="Failure Counts" fill={"var(--downtime)"} radius={[4, 4, 0, 0]} />
        </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="bg-gray-800">
        <div className="leading-none text-center w-full text-muted-foreground">
            Showing failure count for last {range} heartbeats.
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