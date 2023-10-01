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

export interface BattleProps {
  title: string;
  text: string;
  art: string;
  href: string;
  value: number;
}

const Widget = () => {
  return (
    <div className="Widget" style={{background:"#6060f0",width:"100%",color:"white"}}>
      <div style={{background:"#f06060",width:"19%",display:"inline-block",color:"white"}}>
        23
      </div> 77
    </div>
  );
}

export const Battle = ({ title, text, art, href, value }: BattleProps) => {
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

/*
export const battles: BattleProps[] = [
    {
        title: 'The Capital',
        text: 'Before you rise the spires of the capital city of the Imperium. Yours if you can rally the charge.',
        art: "/images/the_capitol.png",
        href: 'https://wikipedia.com/famous_battle',
        value: 7,
    },
    {
        "title": "Crimson Cliffs",
        text: "A narrow gorge, its red rock walls towering high above, where every step taken stains the earth with blood.",
        art: "/images/crimson_cliffs.png",
        href: 'https://wikipedia.com/famous_battle',
        value: 7,
    },
    {
        "title": "Ironclad Arena",
        text: "A colossal steel arena, mechanized and ever-changing, where combatants fight not only each other but the very ground beneath their feet.",
        art: "/images/ironclad_arena.png",
        href: 'https://wikipedia.com/famous_battle',
        value: 7,
    },
    {
        "title": "Azure Shores",
        text: "A serene coastal battlefield with crystal-clear waters, where the beauty of nature contrasts starkly with the brutality of combat.",
        art: "/images/azure_shores.png",
        href: 'https://wikipedia.com/famous_battle',
        value: 7,
    },
    {
        "title": "Starfall Summit",
        text: "A mountaintop battlefield under a celestial shower, where fallen stars grant power to those who can seize them.",
        art: "/images/starfall_summit.png",
        href: 'https://wikipedia.com/famous_battle',
        value: 7,
    },
    {
        "title": "Crystal Expanse",
        text: "A crystalline battleground where reflective surfaces distort reality and create a kaleidoscope of chaos for those who fight within.",
        art: "/images/crystal_expanse.png",
        href: 'https://wikipedia.com/famous_battle',
        value: 7,
    },
    {
        "title": "Enchanted Glade",
        text: "A magical forest clearing where the trees whisper secrets and the flora itself defends against intruders.",
        art: "/images/enchanted_glade.png",
        href: 'https://wikipedia.com/famous_battle',
        value: 7,
    },
]
*/

export const Battles = ({battlefields: BattleProps }) => {

    let b = []
    battlefields.forEach(entry=>{
        let scratch = {
            id: entry.id,
            title: entry.name,
            art: entry.ipfs_uri,
            value: entry.value,
            winner: null
        }
        b.push(scratch)
    })

    return (
        <Center>
        <VStack>
            {b.map((entry) => (
                <Battle key={entry.title} {...entry}></Battle>
            ))}
        </VStack>
        </Center>
    )
};

/*

ChatGPT generated:

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

    {
        "title": "Mystic Abyss",
        text: "A swirling vortex of arcane energy, where the laws of reality bend and magic runs rampant.",
        art: "/images/dao_maximalist_The_battle_of_Stormhold_Citadel_7e9d32ca-5495-48bf-938d-972a08f04b8f.png",
        href: 'https://wikipedia.com/famous_battle',
        value: 7,
    },

    {
        "title": "Ruinheart Canyon",
        text: "A desolate chasm filled with the crumbling remnants of ancient civilizations, where history's ghosts watch over the battles.",
        art: "/images/dao_maximalist_The_battle_of_Stormhold_Citadel_7e9d32ca-5495-48bf-938d-972a08f04b8f.png",
        href: 'https://wikipedia.com/famous_battle',
        value: 7,
    },
    {
        "title": "Stormhold Citadel",
        text: "A formidable fortress atop a jagged peak, surrounded by perpetual thunderstorms that mask the clash of armies in a shroud of chaos.",
        art: "/images/dao_maximalist_The_battle_of_Stormhold_Citadel_7e9d32ca-5495-48bf-938d-972a08f04b8f.png",
        href: 'https://wikipedia.com/famous_battle',
        value: 7,
    },
    {
        "title": "Shadowed Peaks",
        text: "A labyrinthine network of dimly lit caves and tunnels, where ambushes are as common as the shadows that conceal them.",
        art: "/images/dao_maximalist_The_battle_of_Stormhold_Citadel_7e9d32ca-5495-48bf-938d-972a08f04b8f.png",
        href: 'https://wikipedia.com/famous_battle',
        value: 7,
    },
    {
        "title": "Emberwilds",
        text: "A fiery wasteland, where rivers of molten lava and flaming trees create an unforgiving hellscape for those who dare to tread.",
        art: "/images/dao_maximalist_The_battle_of_Stormhold_Citadel_7e9d32ca-5495-48bf-938d-972a08f04b8f.png",
        href: 'https://wikipedia.com/famous_battle',
        value: 7,
    },
    {
        "title": "Echoing Abyss",
        text: "A bottomless chasm whose walls seem to absorb sound, creating an eerie silence broken only by the screams of those who fall into its depths.",
        art: "/images/dao_maximalist_The_battle_of_Stormhold_Citadel_7e9d32ca-5495-48bf-938d-972a08f04b8f.png",
        href: 'https://wikipedia.com/famous_battle',
        value: 7,
    },

    {
        "title": "Celestial Plateau",
        text: "A lofty plateau where the heavens meet the earth, where celestial forces intervene as the mortal realm becomes their battleground.",
        art: "/images/dao_maximalist_The_battle_of_Stormhold_Citadel_7e9d32ca-5495-48bf-938d-972a08f04b8f.png",
        href: 'https://wikipedia.com/famous_battle',
        value: 7,
    },
    {
        "title": "Obsidian Bastion",
        text: "A towering fortress carved from the darkest obsidian, its impenetrable walls housing secrets as black as its stone.",
        art: "/images/dao_maximalist_The_battle_of_Stormhold_Citadel_7e9d32ca-5495-48bf-938d-972a08f04b8f.png",
        href: 'https://wikipedia.com/famous_battle',
        value: 7,
    },

    {
        "title": "Inferno Bluffs",
        text: "A landscape perpetually ablaze, where rivers of fire cut through jagged cliffs, turning the battlefield into a searing furnace.",
        art: "/images/dao_maximalist_The_battle_of_Stormhold_Citadel_7e9d32ca-5495-48bf-938d-972a08f04b8f.png",
        href: 'https://wikipedia.com/famous_battle',
        value: 7,
    },
    {
        "title": "Frostbite Gorge",
        text: "A frozen crevasse where icy winds howl relentlessly, turning the very air to frost and freezing the souls of those who dare to cross.",
        art: "/images/dao_maximalist_The_battle_of_Stormhold_Citadel_7e9d32ca-5495-48bf-938d-972a08f04b8f.png",
        href: 'https://wikipedia.com/famous_battle',
        value: 7,
    },
    {
        "title": "Thunderclap Ridge",
        text: "A rocky outcrop in a perpetual thunderstorm, where lightning strikes illuminate the chaos of battle.",
        art: "/images/dao_maximalist_The_battle_of_Stormhold_Citadel_7e9d32ca-5495-48bf-938d-972a08f04b8f.png",
        href: 'https://wikipedia.com/famous_battle',
        value: 7,
    },
    {
        "title": "Bonechill Vale",
        text: "A frozen wasteland where ancient bones protrude from the ice, and the cold saps the strength of all who enter.",
        art: "/images/dao_maximalist_The_battle_of_Stormhold_Citadel_7e9d32ca-5495-48bf-938d-972a08f04b8f.png",
        href: 'https://wikipedia.com/famous_battle',
        value: 7,
    },
    {
        "title": "Serpent's Nest",
        text: "A treacherous swamp filled with hidden dangers, where venomous creatures and deadly plants lie in wait.",
        art: "/images/dao_maximalist_The_battle_of_Stormhold_Citadel_7e9d32ca-5495-48bf-938d-972a08f04b8f.png",
        href: 'https://wikipedia.com/famous_battle',
        value: 7,
    },
    {
        "title": "Lavaforge Spire",
        text: "A towering spire rising from a sea of lava, where the heat is only matched by the intensity of the battles fought there.",
        art: "/images/dao_maximalist_The_battle_of_Stormhold_Citadel_7e9d32ca-5495-48bf-938d-972a08f04b8f.png",
        href: 'https://wikipedia.com/famous_battle',
        value: 7,
    },

*/

