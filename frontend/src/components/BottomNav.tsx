import { Link, useMatchRoute } from '@tanstack/react-router';
import { Home, Upload, PlaySquare, Users, UserCircle } from 'lucide-react';

const navItems = [
  {
    to: '/' as const,
    label: 'Home',
    icon: Home,
    exact: true,
  },
  {
    to: '/upload-video' as const,
    label: 'Upload',
    icon: Upload,
    exact: false,
  },
  {
    to: '/shorts' as const,
    label: 'Shorts',
    icon: PlaySquare,
    exact: false,
  },
  {
    to: '/subscriptions' as const,
    label: 'Subs',
    icon: Users,
    exact: false,
  },
  {
    to: '/profile' as const,
    label: 'Profile',
    icon: UserCircle,
    exact: false,
  },
];

export function BottomNav() {
  const matchRoute = useMatchRoute();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="flex items-stretch justify-around h-16 sm:h-20">
        {navItems.map(({ to, label, icon: Icon, exact }) => {
          const isActive = !!matchRoute({ to, fuzzy: !exact });

          return (
            <Link
              key={to}
              to={to}
              className={`
                flex flex-col items-center justify-center flex-1 gap-1 px-1 py-2
                transition-colors duration-150 select-none
                ${isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <div className={`
                relative flex items-center justify-center
                ${isActive ? 'after:absolute after:-top-1 after:left-1/2 after:-translate-x-1/2 after:w-8 after:h-1 after:rounded-b-full after:bg-primary' : ''}
              `}>
                <Icon
                  size={26}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className="transition-all duration-150"
                />
              </div>
              <span className={`text-xs font-medium leading-none ${isActive ? 'font-semibold' : ''}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
