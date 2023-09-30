import { LinkIcon } from '@chakra-ui/icons';
import {
  Box,
  Heading,
  Icon,
  Link,
  Stack,
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import { FeatureProps } from './types';

export const Product = ({ title, text, art, href }: FeatureProps) => {
  return (
    <Link href={href} target="_blank" _hover={{ textDecoration: 'none' }}>
      <Stack
        h="full"
        minH={36}
        p={5}
        spacing={2.5}
        justifyContent="center"
        borderRadius={5}
        boxShadow={useColorModeValue(
          '0 2px 5px #ccc',
          '0 1px 3px #727272, 0 2px 12px -2px #2f2f2f'
        )}
        _hover={{
          color: useColorModeValue('purple.600', 'purple.300'),
          boxShadow: useColorModeValue(
            '0 2px 5px #bca5e9',
            '0 0 3px rgba(150, 75, 213, 0.8), 0 3px 8px -2px rgba(175, 89, 246, 0.9)'
          )
        }}
      >
        <Heading fontSize="xl">{title}&ensp;&rarr;</Heading>
        <Text>{text}</Text>
        <img src={art}></img>
      </Stack>
    </Link>
  );
};

