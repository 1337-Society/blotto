import Head from 'next/head';

import { LinkIcon } from '@chakra-ui/icons';

import {
  Box,
  Divider,
  Grid,
  Heading,
  Text,
  Stack,
  VStack,
  Center,
  Card,
  CardBody,
  CardFooter,
  Container,
  Image,
  Link,
  Button,
  Flex,
  Icon,
  useColorMode,
  useColorModeValue
} from '@chakra-ui/react';
import { WalletSection } from '../components/wallet';

export interface BattleProps {
  title: string;
  text: string;
  art: string;
  href: string;
  value: number;
}


/*

The Capital
Snowfields
Dark Forest
Desert Depths
High Seas
Crimson Pass
Ruinheart Canyon
Stormhold Citadel
Shadowed Peaks
Emberwilds
Ironclad Arena
Echoing Abyss
Celestial Plateau
Obsidian Bastion
Inferno Bluffs
Frostbite Gorge
Azure Shores
Enchanted Glade
Thunderclap Ridge
Mystic Abyss
Starfall Summit
Bonechill Vale
Serpent's Nest
Lavaforge Spire
Crystal Expanse


*/

export const battles: BattleProps[] = [
  {
    title: 'The Capital',
    art: "/images/dao_maximalist_The_battle_of_Stormhold_Citadel_7e9d32ca-5495-48bf-938d-972a08f04b8f.png",
    text: 'Before you is the capital city of the imperum. Yours if you can rally the charge.',
    href: 'https://wikipedia.com/famous_battle',
    value: 7,
  },
  {
    title: 'Stormhold Citadel',
    art: "/images/dao_maximalist_The_battle_of_Stormhold_Citadel_7e9d32ca-5495-48bf-938d-972a08f04b8f.png",
    text: 'Before you is the capital city of the imperum. Yours if you can rally the charge.',
    href: 'https://wikipedia.com/famous_battle',
    value: 4,
  },
  {
    title: 'The Snowfields',
    art: "/images/dao_maximalist_The_battle_of_Stormhold_Citadel_7e9d32ca-5495-48bf-938d-972a08f04b8f.png",
    text: 'Before you is the capital city of the imperum. Yours if you can rally the charge.',
    href: 'https://wikipedia.com/famous_battle',
    value: 3,
  },
  {
    title: 'Dark Forest',
    art: "/images/dao_maximalist_The_battle_of_Stormhold_Citadel_7e9d32ca-5495-48bf-938d-972a08f04b8f.png",
    text: 'Before you is the capital city of the imperum. Yours if you can rally the charge.',
    href: 'https://wikipedia.com/famous_battle',
    value: 3,
  },
];

/*
<a href="#" class="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
    <img class="object-cover w-full rounded-t-lg h-96 md:h-auto md:w-48 md:rounded-none md:rounded-l-lg" src=${art>
    <div class="flex flex-col justify-between p-4 leading-normal">
        <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Noteworthy technology acquisitions 2021</h5>
        <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.</p>
    </div>
</a>
*/

const Widget = () => {
  return (
    <div className="Widget" style={{background:"#6060f0",width:"100%",color:"white"}}>
      <div style={{background:"#f06060",width:"19%",display:"inline-block",color:"white"}}>
        23
      </div> 77
    </div>
  );
}


/*

- art
  - logo title
  - get all the venues and all the art
  - put a pretty tug of war style art iconography on progress
  - would be fun to have some stats

- simple
  - test progress bar at 0 and 100%
  - make the progress bar actually alive

- contract interaction
 - make stake do something
  - reflect the contract state (play, or outcome)
  - show the actual live number of soldiers per battle
  - withdraw button for outcome page


*/


const Battle = ({ title, text, art, href, value }: BattleProps) => {
  return (
    <Card
      direction={{ base: 'column', sm: 'row' }}
      overflow='hidden'
      variant='outline'
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

      <Stack>

        <CardBody>
          <Heading size='md'>{title}</Heading>
          <Text py='3'>Victory points: {value}</Text>
          <Text py='2'>{text}</Text>
        </CardBody>

        <CardBody>

          <Widget></Widget>

        </CardBody>

        <CardFooter>
          <Button variant='solid' colorScheme='red'>Stake Red Soldiers</Button>
          &nbsp;
          <Button variant='solid' colorScheme='blue'>Stake Blue Soldiers</Button>
        </CardFooter>
      </Stack>

      <Image
        objectFit='cover'
        maxW={{ base: '100%', sm: '200px' }}
        src={art}
        alt={title}
      />

    </Card>
  );
};


export default function Home() {

  return (
    <Container maxW="5xl" py={10}>
      <Head>
        <title>Blotto</title>
        <meta name="description" content="Blotto on chain" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box textAlign="center">
        <Heading
          as="h1"
          fontSize={{ base: '3xl', sm: '4xl', md: '5xl' }}
          fontWeight="extrabold"
          mb={3}
        >
          Blotto
        </Heading>
      </Box>

      <Center>
      <VStack>
        {battles.map((entry) => (
          <Battle key={entry.title} {...entry}></Battle>
        ))}
      </VStack>
      </Center>

      <WalletSection />

      <Stack
        isInline={true}
        spacing={1}
        justifyContent="center"
        opacity={0.5}
        fontSize="sm"
      >
        <Text>Built with</Text>
        <Link
          href="https://cosmology.tech/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Cosmology
        </Link>
      </Stack>
    </Container>
  );
}
