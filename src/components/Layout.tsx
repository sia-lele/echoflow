import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/', label: '首页', icon: HomeIcon },
  { to: '/watch-map', label: '追剧', icon: MapIcon },
  { to: '/learning', label: '学习', icon: HeadphonesIcon },
  { to: '/review', label: '复习', icon: RefreshIcon },
  { to: '/progress', label: '成长', icon: ChartIcon },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pt-6 pb-28 md:pb-10">
        {children}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:bottom-auto md:static bg-card border-t border-muted md:border-b md:border-t-0 z-40 pb-safe">
        <div className="max-w-2xl mx-auto flex items-center justify-around md:justify-start md:gap-1 md:px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center md:flex-row md:gap-2 py-2.5 px-3 md:py-3 text-xs md:text-sm transition-colors ${
                  active ? 'text-done' : 'text-ink/50'
                }`}
              >
                <Icon className="w-5 h-5 md:w-4 md:h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function MapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}

function HeadphonesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}
