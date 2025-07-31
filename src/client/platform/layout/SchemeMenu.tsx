import {
  IconBrightnessUp,
  IconBrightnessUpFilled,
  IconCircleLetterA,
  IconCircleLetterAFilled,
  IconMoon,
  IconMoonFilled,
} from '@tabler/icons-react';
import swich from 'swich';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Menu,
  useMantineColorScheme,
} from '@mantine/core';

export default function SchemeMenu() {
  const { setColorScheme, colorScheme } = useMantineColorScheme();

  return (
    <Box>
      <Menu width={200} shadow="md">
        <Menu.Target>
          <ActionIcon aria-label="Color scheme">
            {swich([
              ['light', <IconBrightnessUpFilled size={14} />],
              ['dark', <IconMoonFilled size={14} />],
              ['auto', <IconCircleLetterAFilled size={14} />],
            ])(colorScheme)}
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item
            onClick={() => setColorScheme('light')}
            leftSection={
              colorScheme === 'light' ? (
                <IconBrightnessUpFilled size={14} />
              ) : (
                <IconBrightnessUp size={14} />
              )
            }
          >
            Light
          </Menu.Item>
          <Menu.Item
            onClick={() => setColorScheme('dark')}
            leftSection={
              colorScheme === 'dark' ? (
                <IconMoonFilled size={14} />
              ) : (
                <IconMoon size={14} />
              )
            }
          >
            Dark
          </Menu.Item>
          <Menu.Item
            onClick={() => setColorScheme('auto')}
            leftSection={
              colorScheme === 'auto' ? (
                <IconCircleLetterAFilled size={14} />
              ) : (
                <IconCircleLetterA size={14} />
              )
            }
          >
            Auto
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Box>
  );
}
