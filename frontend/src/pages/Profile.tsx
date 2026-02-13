import {  useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2Icon, Goal } from "lucide-react"

import {
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Alert, AlertTitle } from "@/components/ui/alert"

type ProfileProps = { userId: number }

export default function Profile({ userId }: ProfileProps) {
	const [goal, setGoal] = useState("")
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<boolean>(false)
  const [fadeSuccess, setFadeSuccess] = useState(false)

	const sendGoal = async () => {
		if (!goal) return
		const payload = {
			userId: userId,
			goal: goal
		}
		try {
      const response = await fetch("/api/goal", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			})
			if (!response.ok) {
				const { error } = await response.json()
				throw new Error(error ?? "Unknown error")
			}
			setSuccess(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      setError(message)
    } 
		
	}

	// auto-hide success after a short delay
	useEffect(() => {
		if (!success) return
		setFadeSuccess(false)
		const fadeTimer = window.setTimeout(() => setFadeSuccess(true), 1000)
		const hideTimer = window.setTimeout(() => {
			setSuccess(false)
			setFadeSuccess(false) // reset so next alert shows fully opaque
		}, 3000)
		return () => {
			window.clearTimeout(fadeTimer)
			window.clearTimeout(hideTimer)
		}
	}, [success])

	return (
		<main className="p-4">
      <Card className="w-[90%]">
				<CardHeader className="flex items-center justify-center">
					<CardTitle>Your Profile</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={(e) => {
							e.preventDefault()
							sendGoal()
						}}
						className="flex flex-col gap-1"
					>
						<FieldLabel htmlFor="goal" className="whitespace-nowrap">Set Daily Calorie Goal</FieldLabel>
						<Input id="goal" type="number" value={goal} placeholder="Ex: 2000" onChange={(event) => setGoal(event.target.value)} className="flex-1"/>
						<Button variant="outline" id="goal" type="submit">
							{goal ? goal : "Set"}
							<Goal />
						</Button>
					</form>
					
				</CardContent>
			</Card>
			{success && (
				<Alert className={`background-green-50 border-green-500 text-green-700 transition-opacity duration-2000 ${fadeSuccess ? "opacity-0" : "opacity-100"}`}>
					<CheckCircle2Icon />
					<AlertTitle>Success! Your changes have been saved</AlertTitle>
				</Alert>
			)}
			{error && <p className="text-red-600">{error}</p>}
    </main>
	)
}
