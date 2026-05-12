'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@haspataal/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@haspataal/ui';
import { Input } from '@haspataal/ui';
import { Label } from '@haspataal/ui';
import { Building2, Stethoscope } from 'lucide-react';

export default function LoginPage() {
  const [role, setRole] = useState('admin');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('1234');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn('credentials', {
      redirect: false,
      mobile,
      password,
      role,
    });

    if (res?.error) {
      alert('Invalid Credentials or Role');
      setLoading(false);
    } else {
      if (role === 'admin') router.push('/dashboard/admin/orders');
      else router.push('/dashboard/doctor/orders');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Provider Login</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sign in to your hospital or doctor account
          </p>
        </CardHeader>
        <CardContent>
          {/* Role Selector */}
          <div className="flex bg-muted rounded-lg p-1 mb-6">
            <button
              onClick={() => setRole('admin')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                role === 'admin'
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Building2 className="inline h-4 w-4 mr-2" />
              Hospital Admin
            </button>
            <button
              onClick={() => setRole('doctor')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                role === 'doctor'
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Stethoscope className="inline h-4 w-4 mr-2" />
              Doctor / Lab
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="10-digit mobile"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="border-t mt-6 pt-4 text-xs text-muted-foreground text-center">
            <p>Prototype: Use default password <strong>1234</strong> for all demo accounts.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
