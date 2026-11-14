import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Activity as ActivityIcon, CheckCircle2, PlusCircle, ArrowRight, User } from 'lucide-react';

export default function ActivityFeed({ activities = [], loading = false }) {
  if (loading) {
    return (
      <div className="space-y-3 py-2">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-charcoal-100 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-charcoal-100 rounded w-3/4" />
              <div className="h-2 bg-charcoal-100 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="py-8 text-center text-charcoal-400 text-xs">
        <ActivityIcon size={24} className="mx-auto text-charcoal-300 mb-2" />
        <p>No recent activity recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((act) => {
        const userName = act.userId?.name || 'Someone';
        const userInitial = userName.charAt(0).toUpperCase();

        return (
          <div key={act._id} className="flex items-start gap-3 text-xs">
            <div className="w-7 h-7 rounded-full bg-surface-muted text-charcoal font-bold flex items-center justify-center shrink-0 text-[11px] ring-1 ring-border">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-charcoal leading-snug">
                <span className="font-bold">{userName}</span>{' '}
                <span className="text-charcoal-500">{act.action}</span>
              </p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-charcoal-400">
                {act.projectId?.name && (
                  <span className="font-medium text-charcoal-600 bg-surface-muted px-1.5 py-0.5 rounded truncate max-w-[140px]">
                    {act.projectId.name}
                  </span>
                )}
                <span>
                  {act.timestamp
                    ? formatDistanceToNow(new Date(act.timestamp), { addSuffix: true })
                    : 'just now'}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
