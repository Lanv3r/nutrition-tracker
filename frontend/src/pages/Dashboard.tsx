import ProductTable from "@/components/ProductTable";
import { useEffect, useMemo, useState } from "react";

type DashboardProps = { userId: number };

type Meal = {
  mealId: number;
  servingSizeGrams: number;
  productName: string;
  nutriments: Record<string, number>;
  createdAt: string;
};

export type Product = {
  mealId: number;
  name: string;
  servingSizeGrams: number;
  calories: number;
  createdAt: string;
};

export default function Dashboard({ userId }: DashboardProps) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchMeals = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/meals", {
          credentials: "include",
        });
        if (!response.ok)
          throw new Error(`Request failed (${response.status})`);
        const data = await response.json();
        const mappedMeals: Meal[] = data.map((m: any) => ({
          mealId: m.mealId ?? m.id ?? m.meal_id ?? 0,
          productName: m.productName ?? m.product_name ?? "Unknown product",
          servingSizeGrams: m.servingSizeGrams ?? m.serving_size_grams ?? 0,
          nutriments: m.nutriments ?? {},
          createdAt: m.createdAt ?? m.created_at ?? "",
        }));
        if (isMounted) setMeals(mappedMeals);
      } catch (err) {
        if (isMounted)
          setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMeals();
    return () => {
      isMounted = false; // avoid setting state if component unmounts
    };
  }, [userId]);

  const products = useMemo<Product[]>(() => {
    return meals.map((meal) => {
      const kcalPer100 =
        typeof meal.nutriments["energy-kcal_100g"] === "number"
          ? meal.nutriments["energy-kcal_100g"]
          : 0;
      const calories = (kcalPer100 * (meal.servingSizeGrams ?? 0)) / 100;

      return {
        mealId: meal.mealId,
        name: meal.productName,
        servingSizeGrams: meal.servingSizeGrams,
        calories: Math.round(calories),
        createdAt: meal.createdAt,
      };
    });
  }, [meals]);

  const getCsrfToken = async () => {
    const res = await fetch("/api/csrf-token", { credentials: "include" });
    if (!res.ok) throw new Error("Unable to fetch CSRF token");
    const data = await res.json();
    return data.csrfToken as string;
  };

  const handleUpdateServing = async (mealIds: number[], grams: number) => {
    const csrfToken = await getCsrfToken();
    const response = await fetch("/api/meals/serving", {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({ mealIds, servingSizeGrams: grams }),
    });
    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error ?? "Unable to update servings");
    }
    setMeals((prev) =>
      prev.map((meal) =>
        mealIds.includes(meal.mealId)
          ? { ...meal, servingSizeGrams: grams }
          : meal,
      ),
    );
  };

  const handleDeleteMeals = async (mealIds: number[]) => {
    const csrfToken = await getCsrfToken();
    const response = await fetch("/api/meals", {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({ mealIds }),
    });
    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error ?? "Unable to delete meals");
    }
    setMeals((prev) => prev.filter((meal) => !mealIds.includes(meal.mealId)));
  };

  return (
    <main className="p-4">
      {loading && <p className="text-muted-foreground">Loading dashboard…</p>}
      {error && <p className="text-red-600">{error}</p>}
      <ProductTable
        data={products}
        onEditServing={handleUpdateServing}
        onDeleteMeals={handleDeleteMeals}
      />
    </main>
  );
}
