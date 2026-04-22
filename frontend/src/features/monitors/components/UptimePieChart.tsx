import { TrendingDown, TrendingUp } from "lucide-react"
import { Pie, PieChart,Label } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../../../components/ui/chart"


import clsx from "clsx"
import React from "react"
import type { RangeType } from "../types"

const chartConfig = {
  visitors: {
    label: "Percentage",
  },
  uptime: {
    label: "Uptime (%)",
    color: "var(--uptime)",
  },
  downTime: {
    label: "Downtime (%)",
    color: "var(--downtime)",
  },
} satisfies ChartConfig

export const UptimePieChart = React.memo(({uptimePercentage, range}: {uptimePercentage: number, range:RangeType})=> {
    
    const chartData = [
        { monitor: "Uptime", percentage: uptimePercentage, fill: "var(--uptime)" },
        { monitor: "Downtime", percentage: (100 - uptimePercentage), fill: "var(--downtime)" },
    ]
    const isCritical = uptimePercentage < 99;
    const uptimeDiff = uptimePercentage -(100-uptimePercentage);
    const message = uptimeDiff > 0 ? `Uptime percentage leads downtime by ${uptimeDiff.toFixed(2)} ` : `Uptime percentage lags downtime by ${Math.abs(parseFloat(uptimeDiff.toFixed(2)))}`;
    
    const cls = clsx(
      "flex flex-col border-2 border-border",
      {"border-destructive" : isCritical}
    )
  return (
    <Card className={cls}>
      <CardHeader className="items-center pb-0">
        <CardTitle>Uptime VS Downtime</CardTitle>
        <CardDescription>This shows the uptime percentage checks of monitor with respect to downtime checks percentage.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-65 px-0"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="Percentage" className="bg-gray-800"/>}
            />
            <Pie
              data={chartData}
              dataKey="percentage"
              innerRadius={80}
              outerRadius={120}
              labelLine={false}
              nameKey="monitor"
              stroke="none"
            >
            <Label 
            value={`${uptimePercentage}%`}
            position="center"
            className= "fill-foreground text-xl md:text-2xl font-bold"
            />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm bg-gray-800">
        <div className="flex items-center gap-2 leading-none font-medium">
          {message} {uptimeDiff > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        </div>
        <div className="leading-none text-muted-foreground">
          Showing uptime percentage for last {range} hours heartbeats.
        </div>
      </CardFooter>
    </Card>
  )
});
