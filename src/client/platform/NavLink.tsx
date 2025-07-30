import { NavLinkProps, NavLink as RouterNavLink } from 'react-router';

export default function NavLink(
  props: Omit<NavLinkProps, 'children'> & { label: string }
) {
  return <RouterNavLink {...props}>{props.label}</RouterNavLink>;
}

/*
<RouterNavLink {...props}>
  {({ isActive }) => (
    <MantineNavLink
      active={isActive}
      label={props.label}
      description={props.description}
      rightSection={props.rightSection}
      leftSection={props.leftSection}
    />
  )}
</RouterNavLink>
 */
