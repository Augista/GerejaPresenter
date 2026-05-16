'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [presentations, setPresentations] = useState<any[]>([]);
  const [songs, setSongs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'presentations' | 'songs'>('users');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Check if user is admin
  const isAdmin = user?.user_metadata?.role === 'admin' || user?.email === 'admin@propresenter.local';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You don&apos;t have permission to access this page</p>
          <Link href="/dashboard">
            <Button className="w-full">Go to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            Logged in as: <span className="font-medium text-foreground">{user?.email}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 flex gap-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('presentations')}
            className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'presentations'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Presentations
          </button>
          <button
            onClick={() => setActiveTab('songs')}
            className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'songs'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Songs
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'users' && (
          <Card className="border-border">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">User Management</h2>
              <p className="text-sm text-muted-foreground">
                View and manage all users in the system. This page displays user data from the database.
              </p>
              <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">
                  Admin functionality coming soon. You can view all users, presentations, and songs here.
                </p>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'presentations' && (
          <Card className="border-border">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Presentations Management</h2>
              <p className="text-sm text-muted-foreground">
                View and manage all presentations in the system.
              </p>
              <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">
                  Admin functionality coming soon. You can view all presentations here.
                </p>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'songs' && (
          <Card className="border-border">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Songs Management</h2>
              <p className="text-sm text-muted-foreground">
                View and manage all songs in the system.
              </p>
              <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">
                  Admin functionality coming soon. You can view all songs here.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
