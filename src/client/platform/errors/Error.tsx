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
      You've reached the end of the internet. There is nothing left.{' '}
      <Link to="/" label="Go home" />
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
    </>,
  ],
  default: [
    'Something went wrong',
    <>
      Something is definitely wrong. You can try refreshing but if that doesn't
      work, well, you're out of luck. Sorry.
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
    error?.message
    || DEFAULT_MESSAGE[
      `${error?.httpStatus || 0}` as keyof typeof DEFAULT_MESSAGE
    ][1]
    || DEFAULT_MESSAGE.default[1]
  );
};

export function Error({ error }: { error: BaseError }) {
  console.log('Error', error);
  return (
    <div className={classes.root}>
      <Container>
        <div className={classes.label}>{error?.httpStatus || 500}</div>
        <Title className={classes.title}>{getTitle(error?.httpStatus)}</Title>
        <Text size="lg" ta="center" className={classes.description}>
          {getDescription(error)}
        </Text>
        <Group justify="center">
          <Button
            variant="white"
            size="md"
            onClick={() => window.location.reload()}
          >
            Refresh the page
          </Button>
        </Group>
      </Container>
    </div>
  );
}
