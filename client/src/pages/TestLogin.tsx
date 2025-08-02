import { useState } from "react";

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
      console.log('Sending login request...');
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const data = await response.json();
      console.log('Response data:', data);
      setResult({ type: "real-login", data, status: response.status });
    } catch (error) {
      console.error('Login error:', error);
      setResult({ type: "real-login", error: error, errorMessage: error.message });
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-4xl space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-4">Vercel Login Test</h1>
          <p className="text-gray-600 mb-6">Test environment and login functionality</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <button 
              onClick={testEnvCheck} 
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? "Testing..." : "Test Environment"}
            </button>
            <button 
              onClick={testLogin} 
              disabled={loading || !email || !password}
              className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? "Testing..." : "Test Login (No Auth)"}
            </button>
            <button 
              onClick={testRealLogin} 
              disabled={loading || !email || !password}
              className="bg-purple-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? "Testing..." : "Test Real Login"}
            </button>

          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
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
        </div>
      </div>
    </div>
  );
} 