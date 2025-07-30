import { LinkProps, Link as RouterLink } from 'react-router';

export default function Link(
  props: Omit<LinkProps, 'children'> & { label: string }
) {
  return <RouterLink {...props}>{props.label}</RouterLink>;
}
