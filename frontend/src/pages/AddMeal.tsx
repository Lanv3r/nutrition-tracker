import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2Icon } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import type { Result } from "@zxing/library";
import BarcodeScanner from "react-qr-barcode-scanner";
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
  | "alcohol_100g";

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
  {
    key: "pantothenic-acid_100g",
    label: "Pantothenic Acid (Vitamin B5) (mg / 100g)",
  },
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
];

type Product = {
  product_name?: string;
  brands?: string;
  nutriments?: Record<string, number>;
};

type AddMealProps = { userId: number };

export default function AddMeal({ userId }: AddMealProps) {
  const [barcode, setBarcode] = useState("");
  const [success, setSuccess] = useState<boolean>(false);
  const [fadeSuccess, setFadeSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [servingSizeGrams, setServingSizeGrams] = useState("");
  const lastScannedCodeRef = useRef("");
  const [scannerOpen, setScannerOpen] = useState(true);

  // auto-hide success after a short delay
  useEffect(() => {
    if (!success) return;
    setFadeSuccess(false);
    const fadeTimer = window.setTimeout(() => setFadeSuccess(true), 1000);
    const hideTimer = window.setTimeout(() => {
      setSuccess(false);
      setFadeSuccess(false); // reset so next alert shows fully opaque
    }, 3000);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, [success]);

  const fetchProductForBarcode = async (rawBarcode: string) => {
    setLoading(true);
    setError(null);

    if (!rawBarcode) {
      setError("Please enter a barcode.");
      setLoading(false);
      return;
    }

    const normalized_barcode = rawBarcode.replace(/\s+/g, "");
    if (/^\d+$/.test(normalized_barcode) === false) {
      setError("Barcode must contain only digits.");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${normalized_barcode}.json`,
        {
          method: "GET",
          headers: {
            "User-Agent":
              "NutritionTracker Web - 1.0.0 - https://rafis.us - scan",
            Accept: "application/json",
          },
        },
      );
      const data = await response.json();
      if (!data.status || data.status !== 1) {
        setProduct(null);
        throw new Error(data.status_verbose ?? "Invalid credentials");
      }
      setProduct(data.product ?? null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    await fetchProductForBarcode(barcode);
  };

  const addMeal = async () => {
    if (!product) return;
    const normalized_barcode = barcode.replace(/\s+/g, "");
    const payload = {
      userId: userId,
      barcode: normalized_barcode,
      servingSizeGrams: Number(servingSizeGrams),
      productName: product.product_name ?? "Unknown product",
      nutriments: product.nutriments ?? {},
    };
    try {
      const csrfRes = await fetch("/api/csrf-token", {
        credentials: "include",
      });
      if (!csrfRes.ok) throw new Error("Unable to fetch CSRF token");
      const { csrfToken } = await csrfRes.json();
      const response = await fetch("/api/meals", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error ?? "Unknown error");
      }
      setSuccess(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    }
  };

  const toggleScanner = () => {
    setScannerOpen((prev) => !prev);
    setBarcode("");
    setProduct(null);
    setError(null);
    lastScannedCodeRef.current = "";
  };
  const isLiveCameraSupported =
    typeof window !== "undefined" &&
    window.isSecureContext &&
    Boolean(navigator.mediaDevices?.getUserMedia);

  const handleScannerUpdate = (
    _scanError: unknown,
    result?: Result,
  ) => {
    if (!result) return;

    const nextCode = result.getText().trim();
    if (!nextCode || nextCode === lastScannedCodeRef.current) return;

    lastScannedCodeRef.current = nextCode;
    setError(null);
    setBarcode(nextCode);
    void fetchProductForBarcode(nextCode);
  };

  const handleScannerError = (scanError: string | DOMException) => {
    const message =
      typeof scanError === "string" ? scanError : scanError.message;

    if (
      typeof scanError !== "string" &&
      scanError.name === "NotAllowedError"
    ) {
      setError("Camera permission denied. Allow camera access and try again.");
      return;
    }

    setError(message || "Unable to start camera.");
  };

  return (
    <main className="flex min-h-svh flex-col items-center gap-6 bg-slate-50 p-8">
      <Card className="flex w-full max-w-xl flex-col gap-0 py-2">
        <CardHeader className="flex items-center justify-center">
          <CardTitle>Barcode Scanner</CardTitle>
        </CardHeader>
        {scannerOpen && !product && (
          <div id="card-wrap" className="flex flex-col items-center">
            <CardContent className="flex flex-col items-center justify-center px-2 py-2">
              {!isLiveCameraSupported ? (
                <p className="text-center text-sm text-red-600">
                  Live camera scanning requires HTTPS (or localhost in
                  development). Switch to manual entry below.
                </p>
              ) : (
                <div
                  id="scanner-wrap"
                  className="mx-auto w-full max-w-full overflow-hidden rounded-md border"
                  style={{ aspectRatio: "4 / 3", maxHeight: "65svh" }}
                >
                  <BarcodeScanner
                    width="100%"
                    height="100%"
                    facingMode="environment"
                    delay={200}
                    stopStream={!scannerOpen || Boolean(product)}
                    videoConstraints={{
                      facingMode: { ideal: "environment" },
                      width: { ideal: 1280 },
                      height: { ideal: 720 },
                    }}
                    onUpdate={handleScannerUpdate}
                    onError={handleScannerError}
                  />
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => toggleScanner()}>
                Enter Barcode Manually
              </Button>
            </CardFooter>
          </div>
        )}
        {!scannerOpen && !product && (
          <div id="card-wrap" className="flex flex-col items-center">
            <CardContent className="flex flex-col items-center justify-center px-2 py-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleScan();
                }}
                className="flex flex-col gap-1"
              >
                <Input
                  id="barcode-input"
                  type="text"
                  value={barcode}
                  placeholder="Enter barcode"
                  onChange={(event) => setBarcode(event.target.value)}
                />
                <Button
                  variant="outline"
                  type="submit"
                  disabled={!barcode || loading}
                >
                  {loading ? "Fetching data…" : "Fetch Data"}
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => toggleScanner()}>
                Scan Barcode
              </Button>
            </CardFooter>
          </div>
        )}
        {product && !error && (
          <CardContent className="flex max-h-[500px] flex-col items-center gap-4 overflow-y-auto">
            <p>Enter Meal Size in g:</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addMeal();
                setProduct(null);
                setBarcode("");
                setServingSizeGrams("");
              }}
              className="flex flex-col gap-1"
            >
              <Input
                id="serving-size-input"
                type="number"
                value={servingSizeGrams}
                placeholder="e.g., 150"
                onChange={(event) => setServingSizeGrams(event.target.value)}
              />
              <div className="flex flex-row gap-6">
                <Button
                  type="button"
                  variant="destructive"
                  className="bg-destructive/85 hover:bg-destructive"
                  onClick={() => {
                    setProduct(null);
                    setBarcode("");
                    setServingSizeGrams("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  type="submit"
                  disabled={!barcode || loading || !servingSizeGrams}
                >
                  {loading ? "Adding Meal…" : "Add Meal"}
                </Button>
              </div>
            </form>

            <section className="w-full max-w-3xl rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">
                {product.product_name ?? "Unknown product"}
              </h2>
              <ul className="mt-4 grid gap-2">
                {DISPLAY_NUTRIENTS.map(({ key, label }) => {
                  const value = product.nutriments?.[key] ?? 0;
                  return (
                    <li key={key} className="flex items-center justify-between">
                      <span>{label}</span>
                      <span>{value}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          </CardContent>
        )}
      </Card>
      {success && (
        <Alert
          className={`background-green-50 border-green-500 text-green-700 transition-opacity duration-2000 ${fadeSuccess ? "opacity-0" : "opacity-100"}`}
        >
          <CheckCircle2Icon />
          <AlertTitle>Success! Your changes have been saved</AlertTitle>
        </Alert>
      )}
      {error && <p className="text-red-600">{error}</p>}
    </main>
  );
}
