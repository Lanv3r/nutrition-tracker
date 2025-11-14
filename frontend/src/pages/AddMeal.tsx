import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type NutrimentKey =
  | "energy-kcal_100g"
  | "proteins_100g"
  | "fat_100g"
  | "carbohydrates_100g"
  | "fiber_100g"
  | "sugars_100g"
  | "salt_100g"
  | "saturated-fat_100g"
  | "sodium_100g"
  | "vitamin-a_100g"
  | "vitamin-d_100g"
  | "vitamin-e_100g"
  | "vitamin-k_100g"
  | "vitamin-c_100g"
  | "vitamin-b1_100g"
  | "vitamin-b2_100g"
  | "vitamin-pp_100g"
  | "vitamin-b6_100g"
  | "vitamin-b9_100g"
  | "vitamin-b12_100g"
  | "biotin_100g"
  | "pantothenic-acid_100g"
  | "calcium_100g"
  | "iron_100g"
  | "magnesium_100g"
  | "zinc_100g"
  | "potassium_100g"
  | "phosphorus_100g"
  | "selenium_100g"
  | "iodine_100g"
  | "cholesterol_100g"
  | "trans-fat_100g"
  | "polyunsaturated-fat_100g"
  | "monounsaturated-fat_100g"
  | "omega-3-fat_100g"
  | "omega-6-fat_100g"
  | "caffeine_100g"
  | "taurine_100g"
  | "alcohol_100g"

	const DISPLAY_NUTRIENTS: { key: NutrimentKey; label: string }[] = [
  { key: "energy-kcal_100g", label: "Calories (kcal / 100g)" },
  { key: "proteins_100g", label: "Protein (g / 100g)" },
  { key: "fat_100g", label: "Fat (g / 100g)" },
  { key: "carbohydrates_100g", label: "Carbohydrates (g / 100g)" },
  { key: "fiber_100g", label: "Fiber (g / 100g)" },
  { key: "sugars_100g", label: "Sugar (g / 100g)" },
  { key: "salt_100g", label: "Salt (g / 100g)" },
  { key: "saturated-fat_100g", label: "Saturated Fat (g / 100g)" },
  { key: "sodium_100g", label: "Sodium (mg / 100g)" },
  { key: "vitamin-a_100g", label: "Vitamin A (µg / 100g)" },
  { key: "vitamin-d_100g", label: "Vitamin D (µg / 100g)" },
  { key: "vitamin-e_100g", label: "Vitamin E (mg / 100g)" },
  { key: "vitamin-k_100g", label: "Vitamin K (µg / 100g)" },
  { key: "vitamin-c_100g", label: "Vitamin C (mg / 100g)" },
  { key: "vitamin-b1_100g", label: "Vitamin B1 (Thiamine) (mg / 100g)" },
  { key: "vitamin-b2_100g", label: "Vitamin B2 (Riboflavin) (mg / 100g)" },
  { key: "vitamin-pp_100g", label: "Vitamin B3 (Niacin) (mg / 100g)" },
  { key: "vitamin-b6_100g", label: "Vitamin B6 (mg / 100g)" },
  { key: "vitamin-b9_100g", label: "Vitamin B9 (Folate) (µg / 100g)" },
  { key: "vitamin-b12_100g", label: "Vitamin B12 (µg / 100g)" },
  { key: "biotin_100g", label: "Biotin (Vitamin B8) (µg / 100g)" },
  { key: "pantothenic-acid_100g", label: "Pantothenic Acid (Vitamin B5) (mg / 100g)" },
  { key: "calcium_100g", label: "Calcium (mg / 100g)" },
  { key: "iron_100g", label: "Iron (mg / 100g)" },
  { key: "magnesium_100g", label: "Magnesium (mg / 100g)" },
  { key: "zinc_100g", label: "Zinc (mg / 100g)" },
  { key: "potassium_100g", label: "Potassium (mg / 100g)" },
  { key: "phosphorus_100g", label: "Phosphorus (mg / 100g)" },
  { key: "selenium_100g", label: "Selenium (µg / 100g)" },
  { key: "iodine_100g", label: "Iodine (µg / 100g)" },
  { key: "cholesterol_100g", label: "Cholesterol (mg / 100g)" },
  { key: "trans-fat_100g", label: "Trans Fat (g / 100g)" },
  { key: "polyunsaturated-fat_100g", label: "Polyunsaturated Fat (g / 100g)" },
  { key: "monounsaturated-fat_100g", label: "Monounsaturated Fat (g / 100g)" },
  { key: "omega-3-fat_100g", label: "Omega-3 Fat (g / 100g)" },
  { key: "omega-6-fat_100g", label: "Omega-6 Fat (g / 100g)" },
  { key: "caffeine_100g", label: "Caffeine (mg / 100g)" },
  { key: "taurine_100g", label: "Taurine (mg / 100g)" },
  { key: "alcohol_100g", label: "Alcohol (% vol / 100g)" },
]

type Product = {
  product_name?: string
  brands?: string
  nutriments?: Record<string, number>
}

type AddMealProps = { userId: number }

export default function AddMeal({ userId }: AddMealProps) {
	const [barcode, setBarcode] = useState("")
  const [error, setError] = useState<string | null>(null)
	const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
	const [servingSizeGrams, setServingSizeGrams] = useState("")

	const handleScan = async () => {
    setLoading(true)
    setError(null)

		if (!barcode) {
			setError("Please enter a barcode.")
			setLoading(false)
			return
		}

		const normalized_barcode = barcode.replace(/\s+/g, '')
		if (/^\d+$/.test(normalized_barcode) === false) {
			setError("Barcode must contain only digits.")
			setLoading(false)
			return
		}
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${normalized_barcode}.json`, {
        method: "GET",
        headers: {'User-Agent': 'NutritionTracker Web - 1.0.0 - https://yourdomain.com - scan', 'Accept': 'application/json'}
      })
			const data = await response.json()
      if (!data.status || data.status !== 1) {
				setProduct(null)
        throw new Error(data.status_verbose ?? "Invalid credentials")
      }
			setProduct(data.product ?? null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

	const addMeal = async () => {
		if (!product) return
		const normalized_barcode = barcode.replace(/\s+/g, '')
		const payload = {
			userId: userId,
			barcode: normalized_barcode,
			servingSizeGrams: Number(servingSizeGrams),
			productName: product.product_name ?? "Unknown product",
			nutriments: product.nutriments ?? {},
		}
		await fetch("/api/meals", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		})
	}
		
  return (
    <main className="flex min-h-svh flex-col items-center gap-6 bg-slate-50 p-8">
			<Input type="text" value={barcode} placeholder="Enter barcode" onChange={(event) => setBarcode(event.target.value)}/>
			<Button variant="outline" onClick={handleScan} disabled={!barcode || loading}>
				{loading ? "Fetching data…" : "Fetch Nutrition Data"}
			</Button>
			{product && !error && (
				<>
					<p>Enter Meal Size in g:</p>
					<Input type="number" value={servingSizeGrams} placeholder="e.g., 150" onChange={(event) => setServingSizeGrams(event.target.value)}/>
					<Button variant="outline" onClick={addMeal} disabled={!barcode || loading || !servingSizeGrams}>
						{loading ? "Adding Meal…" : "Add Meal"}
					</Button>
					<section className="w-full max-w-3xl rounded-lg border bg-white p-6 shadow-sm">
						<h2 className="text-xl font-semibold">{product.product_name ?? "Unknown product"}</h2>
						<ul className="mt-4 grid gap-2">
							{DISPLAY_NUTRIENTS.map(({ key, label }) => {
								const value = product.nutriments?.[key] ?? 0
								return (
									<li key={key} className="flex items-center justify-between">
										<span>{label}</span>
										<span>{value}</span>
									</li>
								)
							})}
						</ul>
					</section>
				</>
				
			)}
			{error && <p className="text-red-600">{error}</p>}
    </main>
  )
}