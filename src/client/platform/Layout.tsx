import { Container } from '@mantine/core';
import { HeaderMenu } from './HeaderMenu';

export default function Layout({
  fluid,
  children,
}: {
  fluid?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Container fluid={fluid}>
      <HeaderMenu />
      {children}
    </Container>
  );
}
