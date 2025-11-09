import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle, } from "@/components/ui/alert"
import { AlertCircleIcon } from "lucide-react"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"

type LoginProps = {
  onSuccess: () => void
  onGoToSignup: () => void
}



export default function Login({ onSuccess, onGoToSignup }: LoginProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(error ?? "Invalid credentials")
      }

      onSuccess()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-3 self-center font-medium">
          <Avatar className="size-10 rounded-lg">
            <AvatarImage
              src="https://github.com/Lanv3r/nutrition-tracker/blob/main/Eatr_logo1.png?raw=true"
              alt="Eatr logo"
            />
            <AvatarFallback>Eatr logo</AvatarFallback>
          </Avatar>
          Eatr
        </div>      
        <main >
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="text-xl">Welcome back</CardTitle>
            </CardHeader>
            <CardContent>
              <form >
                <FieldGroup>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="username">Username</FieldLabel>
                      <Input id="username" type="text" value={username} placeholder="janedoe@gmail.com" onChange={(event) => setUsername(event.target.value)}/>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <Input id="password" type="password" value={password} placeholder="••••••••" onChange={(event) => setPassword(event.target.value)}/>
                    </Field>
                  </FieldGroup>
                  {error && <Alert variant="destructive">
                      <AlertCircleIcon />
                      <AlertTitle>Unable to process your login.</AlertTitle>
                      <AlertDescription>
                        <p>Please verify your information and try again.</p>
                        <ul className="list-inside list-disc text-sm">
                          <li>{error}</li>
                        </ul>
                      </AlertDescription>
                    </Alert>}
                  <FieldGroup>
                    <Field>
                      <Button type="submit" onClick={handleLogin} disabled={loading}>
                        {loading ? "Logging in…" : "Login"}
                      </Button>
                      <FieldDescription className="px-6 text-center text-sm text-muted-foreground">
                        Don’t have an account?{" "}
                        <button
                          type="button"
                          onClick={onGoToSignup}
                          className="font-medium text-primary underline-offset-4 underline hover:text-primary/70"
                        >
                          Sign up
                        </button>
                      </FieldDescription>
                    </Field>
                  </FieldGroup>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>     
        </main>
      </div>
    </div>
  )
}
