/**
 * ==============================================================================
 * COMPONENT: StockChart (src/components/dashboard/stock-chart.tsx)
 * PURPOSE: Interactive bar chart displaying current stock vs reorder threshold.
 * ==============================================================================
 */

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface StockChartProps {
  data: Array<{
    name: string;
    stock: number;
    reorder: number;
  }>;
}

export function StockChart({ data }: StockChartProps) {
  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle className="text-base font-bold text-slate-800">
          Stock Levels vs. Reorder Minimums
        </CardTitle>
        <CardDescription>
          Comparison of available on-hand stock against safety reorder thresholds
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-slate-400">
            No product data available to chart.
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "12px", fontSize: "12px" }}
                />
                <Bar
                  dataKey="stock"
                  name="Current Stock"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="reorder"
                  name="Reorder Level"
                  fill="#f97316"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
