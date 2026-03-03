import { useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useMultiAccount } from '../hooks/useMultiAccount';
import { useGetCallerUserProfile } from '../hooks/useGetCallerUserProfile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  UserCircle,
  LogIn,
  UserPlus,
  LogOut,
  Loader2,
  Settings,
  Check,
  PlusCircle,
  X,
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';

interface ProfileDropdownMenuProps {
  /** Trigger element — defaults to a UserCircle icon button */
  triggerClassName?: string;
  align?: 'start' | 'center' | 'end';
}

/** Returns initials from a display name or truncated principal */
function getInitials(name?: string, principal?: string): string {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.trim().slice(0, 2).toUpperCase();
  }
  if (principal) {
    return principal.slice(0, 2).toUpperCase();
  }
  return 'U';
}

/** Truncate a principal for display */
function truncatePrincipal(principal: string): string {
  if (principal.length <= 16) return principal;
  return principal.slice(0, 8) + '…' + principal.slice(-4);
}

export function ProfileDropdownMenu({
  triggerClassName,
  align = 'end',
}: ProfileDropdownMenuProps) {
  const { identity, isInitializing } = useInternetIdentity();
  const {
    accounts,
    currentPrincipal,
    isLoggingIn,
    addAccount,
    removeAccount,
    signOutCurrent,
    updateActiveAccountName,
  } = useMultiAccount();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch current user profile to get display name
  const { data: userProfile } = useGetCallerUserProfile();

  // Sync display name into the accounts list whenever profile loads
  useEffect(() => {
    if (userProfile && currentPrincipal) {
      updateActiveAccountName(
        userProfile.name,
        userProfile.channelName ?? undefined
      );
    }
  }, [userProfile, currentPrincipal, updateActiveAccountName]);

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  if (isInitializing) {
    return (
      <Button variant="ghost" size="icon" disabled className={triggerClassName}>
        <Loader2 className="w-5 h-5 animate-spin" />
      </Button>
    );
  }

  // Active account info
  const activeAccount = accounts.find((a) => a.principal === currentPrincipal);
  const activeDisplayName =
    activeAccount?.displayName || userProfile?.name;
  const activeInitials = getInitials(
    activeDisplayName,
    currentPrincipal ?? undefined
  );

  // Other (non-active) stored accounts
  const otherAccounts = accounts.filter(
    (a) => a.principal !== currentPrincipal
  );

  const handleSignOut = async () => {
    await signOutCurrent();
    queryClient.clear();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative min-w-[44px] min-h-[44px] ${triggerClassName ?? ''}`}
          aria-label="Profile menu"
        >
          {isLoggingIn ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isAuthenticated ? (
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                {activeInitials}
              </AvatarFallback>
            </Avatar>
          ) : (
            <UserCircle className="w-6 h-6" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        sideOffset={8}
        className="w-64 z-[200]"
        style={{ zIndex: 200 }}
      >
        {isAuthenticated ? (
          <>
            {/* Active account header */}
            <DropdownMenuLabel className="flex items-center gap-3 py-3">
              <Avatar className="w-9 h-9 shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                  {activeInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-sm truncate">
                  {activeDisplayName || 'My Account'}
                </span>
                {activeAccount?.channelName && (
                  <span className="text-xs text-muted-foreground truncate">
                    @{activeAccount.channelName}
                  </span>
                )}
                <span className="text-xs text-muted-foreground truncate">
                  {currentPrincipal ? truncatePrincipal(currentPrincipal) : ''}
                </span>
              </div>
              <Check className="w-4 h-4 text-primary ml-auto shrink-0" />
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* Navigation items */}
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => navigate({ to: '/profile' })}
                className="gap-2 cursor-pointer"
              >
                <UserCircle className="w-4 h-4" />
                My Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate({ to: '/settings' })}
                className="gap-2 cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Other stored accounts */}
            {otherAccounts.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground py-1 px-2">
                  Other accounts
                </DropdownMenuLabel>
                {otherAccounts.map((account) => (
                  <DropdownMenuItem
                    key={account.principal}
                    className="flex items-center gap-2 cursor-pointer pr-1"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Avatar className="w-7 h-7 shrink-0">
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                        {getInitials(account.displayName, account.principal)}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className="flex-1 text-sm truncate"
                      onClick={() => addAccount()}
                    >
                      {account.displayName || truncatePrincipal(account.principal)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeAccount(account.principal);
                      }}
                      className="p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                      aria-label="Remove account"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </>
            )}

            {/* Add account */}
            <DropdownMenuItem
              onClick={() => addAccount()}
              className="gap-2 cursor-pointer"
              disabled={isLoggingIn}
            >
              <PlusCircle className="w-4 h-4" />
              {isLoggingIn ? 'Signing in…' : 'Add Account'}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Sign out */}
            <DropdownMenuItem
              onClick={handleSignOut}
              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </DropdownMenuItem>
          </>
        ) : (
          <>
            {/* Unauthenticated state */}
            <DropdownMenuLabel className="text-sm font-normal text-muted-foreground py-3">
              Sign in to your account
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* Previously stored accounts for quick re-login */}
            {accounts.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground py-1 px-2">
                  Previous accounts
                </DropdownMenuLabel>
                {accounts.map((account) => (
                  <DropdownMenuItem
                    key={account.principal}
                    className="flex items-center gap-2 cursor-pointer pr-1"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Avatar className="w-7 h-7 shrink-0">
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                        {getInitials(account.displayName, account.principal)}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className="flex-1 text-sm truncate"
                      onClick={() => addAccount()}
                    >
                      {account.displayName || truncatePrincipal(account.principal)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeAccount(account.principal);
                      }}
                      className="p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                      aria-label="Remove account"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuItem
              onClick={() => addAccount()}
              className="gap-2 cursor-pointer"
              disabled={isLoggingIn}
            >
              <UserPlus className="w-4 h-4" />
              {isLoggingIn ? 'Signing in…' : 'Create Account'}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => addAccount()}
              className="gap-2 cursor-pointer"
              disabled={isLoggingIn}
            >
              <LogIn className="w-4 h-4" />
              {isLoggingIn ? 'Signing in…' : 'Sign In'}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
