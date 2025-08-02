import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testEnvCheck = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/env-check");
      const data = await response.json();
      setResult({ type: "env", data });
    } catch (error) {
      setResult({ type: "env", error: error });
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/test-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      setResult({ type: "login", data, status: response.status });
    } catch (error) {
      setResult({ type: "login", error: error });
    } finally {
      setLoading(false);
    }
  };

  const testRealLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      setResult({ type: "real-login", data, status: response.status });
    } catch (error) {
      setResult({ type: "real-login", error: error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-50 to-sage-100 dark:from-sage-900 dark:to-sage-800 p-4">
      <div className="w-full max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Vercel Login Test</CardTitle>
            <CardDescription>Test environment and login functionality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button onClick={testEnvCheck} disabled={loading}>
                {loading ? "Testing..." : "Test Environment"}
              </Button>
              <Button onClick={testLogin} disabled={loading || !email || !password}>
                {loading ? "Testing..." : "Test Login (No Auth)"}
              </Button>
              <Button onClick={testRealLogin} disabled={loading || !email || !password}>
                {loading ? "Testing..." : "Test Real Login"}
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>

            {result && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">
                  Result ({result.type}):
                </h3>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 