import { ProfileDropdownMenu } from "./ProfileDropdownMenu";

/**
 * AuthButton — thin wrapper around ProfileDropdownMenu for use in the header.
 * Renders a profile icon button that opens the unified profile/auth dropdown.
 */
export function AuthButton() {
  return <ProfileDropdownMenu align="end" />;
}
