import { getReasonPhrase } from 'http-status-codes';
import { Button, Container, Group, Text, Title } from '@mantine/core';
import { config } from '../config';
import Link from '../Link';
import { BaseError } from './errors';
import classes from './Error.module.css';

const DEFAULT_MESSAGE = {
  '0': [],
  '404': [
    'Page not found',
    <>
      You've finally reached the end of the internet. There is nothing left.
      <br />
      <Group justify="center">
        <Link
          to="/"
          label={
            <Button variant="subtle" size="md">
              Go home
            </Button>
          }
        />
      </Group>
    </>,
  ],
  '400': [
    'Bad request',
    <>You seem to have made a mistake. Go back and be better.</>,
  ],
  '403': [
    'Forbidden',
    <>Oh you dirty boy/girl/non-binary! Trying to be sneaky, are you?</>,
  ],
  '500': [
    'Internal server error',
    <>
      Damn! We've fucked something up. Sorry about that. You can try refreshing
      the page but it's probably not gonna work.
      <br />
      <Group justify="center">
        <Button
          variant="subtle"
          size="md"
          onClick={() => window.location.reload()}
        >
          Refresh the page
        </Button>
      </Group>
    </>,
  ],
  default: [
    'Something went wrong',
    <>
      Something is definitely wrong. You can try refreshing but if that doesn't
      work, well, you're out of luck. Sorry.
      <br />
      <Group justify="center">
        <Button
          variant="white"
          size="md"
          onClick={() => window.location.reload()}
        >
          Refresh the page
        </Button>
      </Group>
    </>,
  ],
};

const getTitle = (httpStatus?: number) => {
  return (
    DEFAULT_MESSAGE[`${httpStatus || 0}` as keyof typeof DEFAULT_MESSAGE][0]
    || getReasonPhrase(httpStatus || 500)
    || DEFAULT_MESSAGE.default[0]
  );
};

const getDescription = (error?: BaseError) => {
  if (config.env === 'development' && error?.devMessage) {
    return error.devMessage;
  }
  return (
    error?.description
    || DEFAULT_MESSAGE[
      `${error?.httpStatus || 0}` as keyof typeof DEFAULT_MESSAGE
    ][1]
    || DEFAULT_MESSAGE.default[1]
  );
};

export function Error({ error }: { error: BaseError }) {
  console.log('Error', error);
  return (
    <Container className={classes.root}>
      <div className={classes.label}>{error?.httpStatus || 500}</div>
      <Title className={classes.title}>{getTitle(error?.httpStatus)}</Title>
      <Text c="dimmed" size="lg" ta="center" className={classes.description}>
        {getDescription(error)}
      </Text>
    </Container>
  );
}
