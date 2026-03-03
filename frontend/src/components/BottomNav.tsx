import { Link, useMatchRoute, useRouterState } from '@tanstack/react-router';
import { Home, Upload, PlaySquare, Users } from 'lucide-react';
import { ProfileDropdownMenu } from './ProfileDropdownMenu';

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
];

export function BottomNav() {
  const matchRoute = useMatchRoute();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  // Determine if the Profile tab should appear active
  const isProfileActive =
    currentPath === '/profile' ||
    currentPath === '/settings' ||
    currentPath.startsWith('/channel/');

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border"
      style={{ overflow: 'visible' }}
    >
      <div className="flex items-stretch justify-around h-16 sm:h-20" style={{ overflow: 'visible' }}>
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

        {/* Profile tab — opens dropdown instead of navigating */}
        <div
          className={`
            flex flex-col items-center justify-center flex-1 gap-1 px-1 py-2
            transition-colors duration-150 select-none relative
            ${isProfileActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}
          `}
          style={{ overflow: 'visible' }}
        >
          {isProfileActive && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-b-full bg-primary" />
          )}
          <ProfileDropdownMenu
            align="end"
            triggerClassName={`
              !bg-transparent !border-0 !shadow-none hover:!bg-transparent
              flex flex-col items-center gap-1 w-full h-full
              ${isProfileActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}
            `}
          />
          <span className={`text-xs font-medium leading-none ${isProfileActive ? 'font-semibold' : ''}`}>
            Profile
          </span>
        </div>
      </div>
    </nav>
  );
}
