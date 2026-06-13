'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [setupDone, setSetupDone] = useState(false);

  const handleSetup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 422) {
          toast.info('Admin account already exists. You can now log in.');
        } else {
          toast.error(data.error || 'Failed to create admin account');
        }
      } else {
        toast.success('Admin account created successfully!');
        setSetupDone(true);
      }
    } catch (error: any) {
      toast.error(error.message || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold mb-4 text-foreground">ChurchPresent  Setup</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h2 className="font-semibold mb-2">Admin Account</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Create the admin account to access all features and manage the application.
            </p>
            <div className="space-y-2 text-sm font-mono bg-background p-3 rounded">
              <div>Email: <span className="text-primary">admin@propresenter.local</span></div>
              <div>Password: <span className="text-primary">AdminProPresenter123!</span></div>
            </div>
          </div>

          <Button
            onClick={handleSetup}
            disabled={loading || setupDone}
            className="w-full"
            size="lg"
          >
            {loading ? 'Creating...' : setupDone ? 'Setup Complete ✓' : 'Create Admin Account'}
          </Button>

          {setupDone && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                Admin account created! You can now <a href="/auth/login" className="font-semibold underline">log in here</a>.
              </p>
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Already have an account? <a href="/auth/login" className="text-primary underline">Sign in here</a>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
