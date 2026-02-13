import { useEffect, useMemo, useState } from "react";
import { LabelList, Pie, PieChart, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import { Bar, BarChart, CartesianGrid, XAxis, ReferenceLine } from "recharts";

type DietOverviewProps = { userId: number };

type DayMeals = { date: string; meals: Meal[] };

type Meal = {
  mealId: number;
  servingSizeGrams: number;
  date: string;
  nutriments: Record<string, number>;
};

type NutrimentKey =
  | "energy-kcal_100g"
  | "proteins_100g"
  | "fat_100g"
  | "carbohydrates_100g";

const DISPLAY_NUTRIENTS: { key: NutrimentKey; label: string }[] = [
  { key: "energy-kcal_100g", label: "Calories" },
  { key: "proteins_100g", label: "Protein" },
  { key: "fat_100g", label: "Fat" },
  { key: "carbohydrates_100g", label: "Carbohydrates" },
];

const chartConfig = {
  fat: {
    label: "Fat",
    color: "var(--chart-1)",
  },
  protein: {
    label: "Protein",
    color: "var(--chart-2)",
  },
  carbs: {
    label: "Carbs",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export default function DietOverview({ userId }: DietOverviewProps) {
  const [meals1d, setMeals1d] = useState<Meal[]>([]);
  const [meals7d, setMeals7d] = useState<Meal[]>([]);
  const [meals30d, setMeals30d] = useState<Meal[]>([]);
  const [last7days, setLast7days] = useState<string[]>([]);
  const [goal, setGoal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentMeals = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/meals/recent?userId=${userId}`);
        if (!response.ok)
          throw new Error(`Request failed (${response.status})`);
        const days: DayMeals[] = await response.json();

        const withDates = days.map((day) => ({
          date: day.date,
          meals: (day.meals || []).map((m: any) => ({
            mealId: m.mealId ?? 0,
            servingSizeGrams: m.servingSizeGrams ?? 0,
            date: m.date,
            nutriments: m.nutriments ?? {},
          })),
        }));

        const allMeals = withDates.flatMap((d) => d.meals);
        const mealsLast7 = withDates.slice(-7).flatMap((d) => d.meals);
        const mealsLast1 = withDates.slice(-1).flatMap((d) => d.meals);

        setMeals30d(allMeals);
        setMeals7d(mealsLast7);
        setMeals1d(mealsLast1);
        setLast7days(withDates.slice(-7).map((d) => d.date));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    const fetchGoal = async () => {
      try {
        const response = await fetch(`/api/goal?userId=${userId}`);
        if (!response.ok)
          throw new Error(`Request failed (${response.status})`);
        const { goal } = await response.json();
        setGoal(goal ?? 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    };

    fetchRecentMeals();
    fetchGoal();
  }, [userId]);

  const totals1d = meals1d.reduce(
    (acc, meal) => {
      const factor = (meal.servingSizeGrams ?? 0) / 100;
      const nutriments = meal.nutriments ?? {};
      DISPLAY_NUTRIENTS.forEach(({ key }) => {
        const value = typeof nutriments[key] === "number" ? nutriments[key] : 0;
        acc[key] = (acc[key] ?? 0) + value * factor;
      });
      return acc;
    },
    {} as Record<NutrimentKey, number>,
  );

  const totals7d = meals7d.reduce(
    (acc, meal) => {
      const factor = (meal.servingSizeGrams ?? 0) / 100;
      const nutriments = meal.nutriments ?? {};
      DISPLAY_NUTRIENTS.forEach(({ key }) => {
        const value = typeof nutriments[key] === "number" ? nutriments[key] : 0;
        acc[key] = (acc[key] ?? 0) + value * factor;
      });
      return acc;
    },
    {} as Record<NutrimentKey, number>,
  );

  const totals30d = meals30d.reduce(
    (acc, meal) => {
      const factor = (meal.servingSizeGrams ?? 0) / 100;
      const nutriments = meal.nutriments ?? {};
      DISPLAY_NUTRIENTS.forEach(({ key }) => {
        const value = typeof nutriments[key] === "number" ? nutriments[key] : 0;
        acc[key] = (acc[key] ?? 0) + value * factor;
      });
      return acc;
    },
    {} as Record<NutrimentKey, number>,
  );

  const fatpr1d = parseFloat(
    (
      (((totals1d["fat_100g"] ?? 0) * 9) /
        (totals1d["energy-kcal_100g"] ?? 0)) *
      100
    ).toFixed(1),
  );
  const proteinpr1d = parseFloat(
    (
      (((totals1d["proteins_100g"] ?? 0) * 4) /
        (totals1d["energy-kcal_100g"] ?? 0)) *
      100
    ).toFixed(1),
  );
  const carbspr1d = parseFloat((100 - fatpr1d - proteinpr1d).toFixed(1));
  const fatpr7d = parseFloat(
    (
      (((totals7d["fat_100g"] ?? 0) * 9) /
        (totals7d["energy-kcal_100g"] ?? 0)) *
      100
    ).toFixed(1),
  );
  const proteinpr7d = parseFloat(
    (
      (((totals7d["proteins_100g"] ?? 0) * 4) /
        (totals7d["energy-kcal_100g"] ?? 0)) *
      100
    ).toFixed(1),
  );
  const carbspr7d = parseFloat((100 - fatpr7d - proteinpr7d).toFixed(1));
  const fatpr30d = parseFloat(
    (
      (((totals30d["fat_100g"] ?? 0) * 9) /
        (totals30d["energy-kcal_100g"] ?? 0)) *
      100
    ).toFixed(1),
  );
  const proteinpr30d = parseFloat(
    (
      (((totals30d["proteins_100g"] ?? 0) * 4) /
        (totals30d["energy-kcal_100g"] ?? 0)) *
      100
    ).toFixed(1),
  );
  const carbspr30d = parseFloat((100 - fatpr30d - proteinpr30d).toFixed(1));

  const chartData1d = [
    { macronutrient: "fat", percents: fatpr1d, fill: "var(--color-fat)" },
    {
      macronutrient: "protein",
      percents: proteinpr1d,
      fill: "var(--color-protein)",
    },
    { macronutrient: "carbs", percents: carbspr1d, fill: "var(--color-carbs)" },
  ];

  const chartData7d = [
    { macronutrient: "fat", percents: fatpr7d, fill: "var(--color-fat)" },
    {
      macronutrient: "protein",
      percents: proteinpr7d,
      fill: "var(--color-protein)",
    },
    { macronutrient: "carbs", percents: carbspr7d, fill: "var(--color-carbs)" },
  ];

  const chartDataMonth = [
    { macronutrient: "fat", percents: fatpr30d, fill: "var(--color-fat)" },
    {
      macronutrient: "protein",
      percents: proteinpr30d,
      fill: "var(--color-protein)",
    },
    {
      macronutrient: "carbs",
      percents: carbspr30d,
      fill: "var(--color-carbs)",
    },
  ];

  const cal0 =
    meals7d
      .filter((m) => m.date === last7days[0])
      .reduce((sum, m) => {
        const factor = (m.servingSizeGrams ?? 0) / 100;
        const n = m.nutriments ?? {};
        const value =
          typeof n["energy-kcal_100g"] === "number" ? n["energy-kcal_100g"] : 0;
        return sum + value * factor;
      }, 0) ?? 0;
  const cal1 =
    meals7d
      .filter((m) => m.date === last7days[1])
      .reduce((sum, m) => {
        const factor = (m.servingSizeGrams ?? 0) / 100;
        const n = m.nutriments ?? {};
        const value =
          typeof n["energy-kcal_100g"] === "number" ? n["energy-kcal_100g"] : 0;
        return sum + value * factor;
      }, 0) ?? 0;
  const cal2 =
    meals7d
      .filter((m) => m.date === last7days[2])
      .reduce((sum, m) => {
        const factor = (m.servingSizeGrams ?? 0) / 100;
        const n = m.nutriments ?? {};
        const value =
          typeof n["energy-kcal_100g"] === "number" ? n["energy-kcal_100g"] : 0;
        return sum + value * factor;
      }, 0) ?? 0;
  const cal3 =
    meals7d
      .filter((m) => m.date === last7days[3])
      .reduce((sum, m) => {
        const factor = (m.servingSizeGrams ?? 0) / 100;
        const n = m.nutriments ?? {};
        const value =
          typeof n["energy-kcal_100g"] === "number" ? n["energy-kcal_100g"] : 0;
        return sum + value * factor;
      }, 0) ?? 0;
  const cal4 =
    meals7d
      .filter((m) => m.date === last7days[4])
      .reduce((sum, m) => {
        const factor = (m.servingSizeGrams ?? 0) / 100;
        const n = m.nutriments ?? {};
        const value =
          typeof n["energy-kcal_100g"] === "number" ? n["energy-kcal_100g"] : 0;
        return sum + value * factor;
      }, 0) ?? 0;
  const cal5 =
    meals7d
      .filter((m) => m.date === last7days[5])
      .reduce((sum, m) => {
        const factor = (m.servingSizeGrams ?? 0) / 100;
        const n = m.nutriments ?? {};
        const value =
          typeof n["energy-kcal_100g"] === "number" ? n["energy-kcal_100g"] : 0;
        return sum + value * factor;
      }, 0) ?? 0;

  const barChartData = [
    { day: last7days[0], calories: Math.round(cal0) },
    { day: last7days[1], calories: Math.round(cal1) },
    { day: last7days[2], calories: Math.round(cal2) },
    { day: last7days[3], calories: Math.round(cal3) },
    { day: last7days[4], calories: Math.round(cal4) },
    { day: last7days[5], calories: Math.round(cal5) },
    {
      day: last7days[6],
      calories: Math.round(totals1d["energy-kcal_100g"] ?? 0),
    },
  ];

  const barChartConfig = {
    calories: {
      label: "Calories",
      color: "oklch(0.71 0.13 215)",
    },
  } satisfies ChartConfig;

  const ticks = useMemo(() => {
    const raw = [
      Math.round(goal / 4),
      Math.round(goal / 2),
      Math.round((3 * goal) / 4),
      Math.round(goal),
      Math.round(goal * 1.25),
    ];
    return Array.from(new Set(raw)).filter((t) => Number.isFinite(t)).sort((a, b) => a - b);
  }, [goal]);

  return (
    <main className="px-2">
      {loading && <p>Analyzing meals…</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && (
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-0 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-3 py-1">
          <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
              <CardTitle>Macronutrient Composition</CardTitle>
              <CardDescription>Today</CardDescription>
            </CardHeader>
            {meals1d.length > 0 && (
              <CardContent className="flex-1 pb-0 px-0">
                <ChartContainer
                  config={chartConfig}
                  className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[250px]"
                >
                  <PieChart
                    margin={{ top: 12, right: 28, bottom: 12, left: 28 }}
                  >
                    <ChartTooltip
                      content={
                        <ChartTooltipContent nameKey="percents" hideLabel />
                      }
                    />
                    <Pie
                      data={chartData1d}
                      dataKey="percents"
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
                            fill="hsla(var(--foreground))"
                          >
                            {payload.percents}%
                          </text>
                        );
                      }}
                      nameKey="macronutrient"
                    >
                      <LabelList
                        dataKey="macronutrient"
                        className="fill-background"
                        stroke="none"
                        fontSize={12}
                        formatter={(value: keyof typeof chartConfig) =>
                          chartConfig[value]?.label
                        }
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </CardContent>
            )}
            {meals1d.length == 0 && (
              <CardContent className="flex flex-1 items-center justify-center pb-0">
                <p>No meals logged in today.</p>
              </CardContent>
            )}
          </Card>
          <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
              <CardTitle>Macronutrient Composition</CardTitle>
              <CardDescription>Last 7 Days</CardDescription>
            </CardHeader>
            {meals7d.length > 0 && (
              <CardContent className="flex-1 pb-0 px-0">
                <ChartContainer
                  config={chartConfig}
                  className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[250px]"
                >
                  <PieChart
                    margin={{ top: 12, right: 28, bottom: 12, left: 28 }}
                  >
                    <ChartTooltip
                      content={
                        <ChartTooltipContent nameKey="percents" hideLabel />
                      }
                    />
                    <Pie
                      data={chartData7d}
                      dataKey="percents"
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
                            fill="hsla(var(--foreground))"
                          >
                            {payload.percents}%
                          </text>
                        );
                      }}
                      nameKey="macronutrient"
                    >
                      <LabelList
                        dataKey="macronutrient"
                        className="fill-background"
                        stroke="none"
                        fontSize={12}
                        formatter={(value: keyof typeof chartConfig) =>
                          chartConfig[value]?.label
                        }
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </CardContent>
            )}
            {meals7d.length == 0 && (
              <CardContent className="flex flex-1 items-center justify-center pb-0">
                <p>No meals logged in the last 7 days.</p>
              </CardContent>
            )}
          </Card>
          <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
              <CardTitle>Macronutrient Composition</CardTitle>
              <CardDescription>Last Month</CardDescription>
            </CardHeader>
            {meals30d.length > 0 && (
              <CardContent className="flex-1 pb-0 px-0">
                <ChartContainer
                  config={chartConfig}
                  className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[250px]"
                >
                  <PieChart
                    margin={{ top: 12, right: 28, bottom: 12, left: 28 }}
                  >
                    <ChartTooltip
                      content={
                        <ChartTooltipContent nameKey="percents" hideLabel />
                      }
                    />
                    <Pie
                      data={chartDataMonth}
                      dataKey="percents"
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
                            fill="hsla(var(--foreground))"
                          >
                            {payload.percents}%
                          </text>
                        );
                      }}
                      nameKey="macronutrient"
                    >
                      <LabelList
                        dataKey="macronutrient"
                        className="fill-background"
                        stroke="none"
                        fontSize={12}
                        formatter={(value: keyof typeof chartConfig) =>
                          chartConfig[value]?.label
                        }
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </CardContent>
            )}
            {meals30d.length == 0 && (
              <CardContent className="flex flex-1 items-center justify-center pb-0">
                <p>No meals logged in the last 30 days.</p>
              </CardContent>
            )}
          </Card>
        </div>
      )}
      <Card className="my-1 w-full max-w-xl mx-auto aspect-none">
        <CardHeader>
          <CardTitle>Calorie Target</CardTitle>
          <CardDescription>Last 7 days (Goal: {goal})</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={barChartConfig}
            className="max-h-64 w-full max-w-xl mx-auto aspect-none"
          >
            <BarChart accessibilityLayer data={barChartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={true}
                tickMargin={10}
                axisLine={true}
                tickFormatter={(value) => value}
              />
              <YAxis
                dataKey="calories"
                ticks={ticks}
                tickLine={true}
                tickMargin={10}
                axisLine={true}
                interval="preserveStartEnd"
              />
              <ReferenceLine
                y={goal}
                stroke="red"
                strokeDasharray="4 4"
                label=""
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="calories" fill="var(--color-calories)" radius={8} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </main>
  );
}
