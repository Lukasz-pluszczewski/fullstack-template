import { Link as RouterLink, type LinkProps } from 'react-router';

export default function Link(
  props: Omit<LinkProps, 'children'> & { label: React.ReactNode }
) {
  return <RouterLink {...props}>{props.label}</RouterLink>;
}
