import { IconChevronDown } from '@tabler/icons-react';
import { Box, Burger, Center, Container, Group, Menu } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import NavLink from './NavLink';
import SchemeMenu from './SchemeMenu';
import classes from './HeaderMenu.module.css';

const links = [
  { link: '/', label: 'Home' },
  {
    link: '/examples',
    label: 'Examples',
    links: [
      { link: '/examples/form', label: 'Form' },
      { link: '/examples/table', label: 'Table' },
      { link: '/examples/dropzone', label: 'Dropzone' },
      { link: '/examples/dates', label: 'Dates' },
      { link: '/examples/modal', label: 'Modal' },
      { link: '/examples/notifications', label: 'Notifications' },
      { link: '/examples/spotlight', label: 'Spotlight' },
    ],
  },
];

export function HeaderMenu() {
  const [opened, { toggle }] = useDisclosure(false);

  const items = links.map((link) => {
    const menuItems = link.links?.map((item) => (
      <Menu.Item key={item.link}>
        <NavLink to={item.link} label={item.label} className={classes.link} />
      </Menu.Item>
    ));

    if (menuItems) {
      return (
        <Menu
          key={link.label}
          trigger="hover"
          transitionProps={{ exitDuration: 0 }}
          withinPortal
        >
          <Menu.Target>
            <span className={classes.link}>
              <Center>
                <span className={classes.linkLabel}>{link.label}</span>
                <IconChevronDown size={14} stroke={1.5} />
              </Center>
            </span>
          </Menu.Target>
          <Menu.Dropdown>{menuItems}</Menu.Dropdown>
        </Menu>
      );
    }

    return (
      <NavLink
        key={link.label}
        label={link.label}
        to={link.link}
        className={classes.link}
      />
    );
  });

  return (
    <header className={classes.header}>
      <Container size="md">
        <div className={classes.inner}>
          <Group>
            <Box>Logo goes here</Box>
            <Group gap={5} visibleFrom="sm">
              {items}
            </Group>
          </Group>

          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              size="sm"
              hiddenFrom="sm"
            />
            <SchemeMenu />
          </Group>
        </div>
      </Container>
    </header>
  );
}
