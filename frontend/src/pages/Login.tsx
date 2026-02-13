import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import PasswordField from "@/components/PasswordField";
import { Separator } from "@/components/ui/separator";

type LoginProps = {
  onSuccess: (userId: number, name: string) => void;
  onGoToSignup: () => void;
};

export default function Login({ onSuccess, onGoToSignup }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const csrfRes = await fetch("/api/csrf-token", {
        credentials: "include",
      });
      if (!csrfRes.ok) throw new Error("Unable to fetch CSRF token");
      const { csrfToken } = await csrfRes.json();
      const response = await fetch("/api/demo-login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
      });
      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error ?? "Unable to start demo");
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const csrfRes = await fetch("/api/csrf-token", {
        credentials: "include",
      });
      if (!csrfRes.ok) throw new Error("Unable to fetch CSRF token");
      const { csrfToken } = await csrfRes.json();
      const response = await fetch("/api/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({ username, password }),
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
    <div className="bg-muted min-h-svh gap-6 p-6 md:p-10 grid lg:grid-cols-[1fr_auto_1fr] place-items-center">
      <div className="hidden lg:flex w-full justify-center px-2">
        <div className="space-y-4 text-center max-w-xl">
          <h1 className="text-3xl font-semibold">Welcome to Eatr</h1>
          <p className="text-muted-foreground">
            Track meals, see your macros, and explore charts in seconds.
          </p>
          <div className="flex justify-center gap-2 w-full">
            <img
              src="/images/bar_graph.png"
              alt="Bar Graph"
              className="h-auto w-[27.49vw] object-contain"
            />
            <img
              src="/images/pie_chart.png"
              alt="Pie Chart"
              className="h-auto w-[17.51vw] object-contain"
            />
          </div>
          <p className="text-muted-foreground">
            Want a quick tour? Use the demo to explore a passwordless account
            with recent data.
          </p>
          <Button
            className="bg-emerald-600 text-white shadow-lg hover:bg-emerald-500 hover:shadow-xl transition animate-pulse"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            Try the demo! (no password)
          </Button>
          <p className="text-xs text-muted-foreground">
            Demo data is reset and updated automatically.
          </p>
        </div>
      </div>
      <Separator
        orientation="vertical"
        className="hidden lg:block h-2/3 w-px bg-border"
      />
      <div className="flex w-full max-w-sm flex-col gap-6 justify-center">
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
              <CardTitle className="text-xl">Welcome back</CardTitle>
            </CardHeader>
            <CardContent>
              <form id="login-form" onSubmit={handleLogin}>
                <FieldGroup>
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
                      />
                    </Field>
                    <Field>
                      <PasswordField
                        id="login-password"
                        label="Password"
                        value={password}
                        onChange={setPassword}
                      />
                      <FieldDescription>
                        Must be at least 8 characters long.
                      </FieldDescription>
                    </Field>
                  </FieldGroup>
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircleIcon />
                      <AlertTitle>Unable to process your login.</AlertTitle>
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
                      <Button type="submit" disabled={loading}>
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
        <div className="flex flex-col items-center gap-2 lg:hidden">
          <Button
            className="bg-emerald-600 text-white shadow-lg hover:bg-emerald-500 hover:shadow-xl transition animate-pulse w-full"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            Try the demo! (no password)
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Demo data is reset and updated automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
