import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import PasswordField from "@/components/PasswordField";

type SignupProps = {
  onSuccess: (userId: number, name: string) => void;
  onGoToLogin: () => void;
};

export default function Signup({ onSuccess, onGoToLogin }: SignupProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const passwordsMatch = password === confirmPassword && password.length > 0;
  const [goal, setGoal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/csrf-token", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setCsrfToken(data.csrfToken);
        }
      } catch {
        // ignore; submit will fail with clear error
      }
    })();
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
        },
        body: JSON.stringify({ username, password, goal }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error ?? "Invalid credentials");
      }
      const me = await fetch("/api/me", { credentials: "include" });
      if (!me.ok) throw new Error("Unable to load session");
      const { userId, username: sessionUsername } = await me.json();
      onSuccess(userId, sessionUsername);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

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
        <main>
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Create an account</CardTitle>
              <CardDescription>
                Enter your information below to create your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form id="signup-form" onSubmit={handleSignup}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="username">Username</FieldLabel>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      placeholder="janedoe@gmail.com"
                      autoComplete="username"
                      onChange={(event) => setUsername(event.target.value)}
                      required
                    />
                  </Field>
                  <Field>
                    <PasswordField
                      id="signup-password"
                      label="Password"
                      value={password}
                      onChange={setPassword}
                    />
                    <FieldDescription>
                      Must be at least 8 characters long.
                    </FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Confirm Password
                    </FieldLabel>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      required
                    />
                    <FieldDescription>
                      Please confirm your password.
                    </FieldDescription>
                    {!passwordsMatch &&
                      confirmPassword.length > 0 &&
                      password.length > 0 && (
                        <FieldDescription className="text-red-600">
                          Passwords must match.
                        </FieldDescription>
                      )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="goal">Daily Calorie Goal</FieldLabel>
                    <Input
                      id="goal"
                      type="number"
                      value={goal}
                      placeholder="Enter your daily calorie goal"
                      onChange={(event) => setGoal(event.target.value)}
                    />
                  </Field>
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircleIcon />
                      <AlertTitle>Unable to process your signup.</AlertTitle>
                      <AlertDescription>
                        <p>Please verify your information and try again.</p>
                        <ul className="list-inside list-disc text-sm">
                          <li>{error}</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                  <FieldGroup>
                    <Field>
                      <Button
                        type="submit"
                        disabled={loading || !passwordsMatch}
                      >
                        {loading ? "Creating account…" : "Create account"}
                      </Button>
                      <FieldDescription className="px-6 text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={onGoToLogin}
                          className="font-medium text-primary underline-offset-4 underline hover:text-primary/70"
                        >
                          Sign in
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
  );
}
