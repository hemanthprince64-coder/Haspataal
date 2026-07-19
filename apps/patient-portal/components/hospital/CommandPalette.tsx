'use client';

import { Search, User, FileText, Settings, Calendar, LogOut, Activity } from 'lucide-react';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const commands = [
    {
      name: 'Search Patients',
      icon: User,
      action: () => router.push('/hospital/dashboard/reception'),
    },
    {
      name: 'View Queue',
      icon: Calendar,
      action: () => router.push('/hospital/dashboard/consultation'),
    },
    { name: 'New Bill', icon: FileText, action: () => router.push('/hospital/dashboard/billing') },
    {
      name: 'Release Readiness',
      icon: Activity,
      action: () => router.push('/hospital/dashboard/readiness'),
    },
    { name: 'Settings', icon: Settings, action: () => router.push('/hospital/dashboard/setup') },
    {
      name: 'Sign Out',
      icon: LogOut,
      action: () =>
        document
          .querySelector('form[action*="logoutHospital"]')
          ?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })),
    },
  ];

  const filteredCommands =
    query === ''
      ? commands
      : commands.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (action: () => void) => {
    setOpen(false);
    setQuery('');
    action();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden shadow-2xl">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Type a command or search..."
            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="py-6 text-center text-sm text-slate-500">No results found.</div>
          ) : (
            filteredCommands.map((c) => (
              <button
                key={c.name}
                className="w-full flex items-center gap-2 rounded-md px-2 py-2.5 text-sm hover:bg-slate-100 hover:text-slate-900 transition-colors"
                onClick={() => handleSelect(c.action)}
              >
                <c.icon className="h-4 w-4 text-slate-500" />
                <span>{c.name}</span>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
