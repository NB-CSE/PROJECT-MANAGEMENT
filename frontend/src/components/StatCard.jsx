import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, badge, accent = false }) {
  return (
    <div
      className={`p-5 rounded-2xl border transition-all duration-200 shadow-card hover:shadow-card-hover ${
        accent
          ? 'bg-lime/20 border-lime-dark/30'
          : 'bg-white border-border'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-charcoal-400">{title}</p>
          <h3 className="text-3xl font-extrabold text-charcoal mt-2 tracking-tight">{value}</h3>
          {subtitle && (
            <p className="text-xs text-charcoal-500 mt-1 font-medium">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div
            className={`p-3 rounded-xl flex items-center justify-center shrink-0 ${
              accent ? 'bg-charcoal text-lime' : 'bg-surface-muted text-charcoal'
            }`}
          >
            <Icon size={22} />
          </div>
        )}
      </div>
      {badge && (
        <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
          <span className="text-charcoal-400">{badge.label}</span>
          <span className="font-bold text-charcoal">{badge.value}</span>
        </div>
      )}
    </div>
  );
}
