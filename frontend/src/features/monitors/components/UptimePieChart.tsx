import { TrendingDown, TrendingUp } from "lucide-react"
import { Pie, PieChart } from "recharts"

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

const chartConfig = {
  visitors: {
    label: "Percentage",
  },
  uptime: {
    label: "Uptime",
    color: "var(--chart-1)",
  },
  downTime: {
    label: "Downtime",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export default function UptimePieChart({uptimePercentage}: {uptimePercentage: number}) {
    const chartData = [
        { monitor: "Uptime", percentage: uptimePercentage, fill: "var(--chart-1)" },
        { monitor: "Downtime", percentage: (100 - uptimePercentage), fill: "var(--chart-2)" },
    ]

    const uptimeDiff = uptimePercentage -(100-uptimePercentage);
    const message = uptimeDiff > 0 ? `Uptime percentage leads downtime by ${uptimeDiff} ` : `Uptime percentage lags downtime by ${Math.abs(uptimeDiff)}`;

  return (
    <Card className="flex flex-col">
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
              content={<ChartTooltipContent nameKey="Percentage" hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="percentage"
              outerRadius={120}
              labelLine={false}
              label={({ payload, ...props }) => {
                return (
                  <text
                    cx={props.cx}
                    cy={props.cy}
                    x={props.x}
                    y={props.y}
                    textAnchor={props.textAnchor}
                    dominantBaseline={props.dominantBaseline}
                    fill="var(--color-foreground)"
                  >
                    {payload.percentage}
                  </text>
                )
              }}
              nameKey="monitor"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm bg-gray-800">
        <div className="flex items-center gap-2 leading-none font-medium">
          {message} {uptimeDiff > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        </div>
        <div className="leading-none text-muted-foreground">
          Showing uptime percentage for last 30 days heartbeats.
        </div>
      </CardFooter>
    </Card>
  )
}
