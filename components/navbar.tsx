'use client'

import {
  Box,
  Flex,
  Text,
  Stack,
  useColorModeValue,
  useBreakpointValue,
} from '@chakra-ui/react'

import { WalletSection } from '../components/wallet';

export function NavBar() {

  return (

    <header>

        <Flex flex={{ base: 1}} justify={{ base: 'center', md: 'start' }} >
          <Text fontFamily={'kablammo'} fontSize={"64"} color={'white'}>
            BLOTTO
          </Text>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          direction={'row'}
          color={'white'}
          >
          <WalletSection></WalletSection>
        </Stack>

    </header>

  )
}

