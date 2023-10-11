# Blotto Game

A smart contract implementation of a Blotto Game: https://www.youtube.com/watch?v=7SZoCw1AfRc

Play:

1. Battle starts, players can see seven 7 different battle fields (each with their own strategic value score)
2. Players stake tokens on a battlefield and the army of their choice
3. After 7 days, the game ends.
4. For each battlefield the army with the most stake is declared the winner and earns victory points according to the value of the battlefield. The losing army in a battlefield loses their tokens, which are contributed towards the pot.
5. The army with the most victory points is declared the winner, and takes the pot.

# Payout math

At the end of the battle, victory points are assigned to armies based on the strategic value of the battle fields they won.

Fighter payout:
`prize_pool * your_staked_value / total_army_staked_value` + live_soldiers - dead_soldiers

## Instantiation

```json
{
  "data": {
    "armies": [
      {
        "name": "Red",
        "description": "The Red Army.",
        "image_uri": "https://user-images.githubusercontent.com/521978/274048963-f8812377-3780-49d7-bbcf-f1005513d8e4.png"
      },
      {
        "name": "Blue",
        "description": "The Blue Army.",
        "image_uri": "https://user-images.githubusercontent.com/521978/274048818-1d1e7655-fe76-48e8-85dc-67d14fc24bc8.png"
      }
    ],
    "battlefields": [
      {
        "name": "Stormhold Citadel",
        "description": "A formidable fortress atop a jagged peak, surrounded by perpetual thunderstorms that mask the clash of armies in a shroud of chaos.",
        "image_uri": "https://user-images.githubusercontent.com/521978/274047626-01f0e946-32f9-45b9-a334-2df6063666dd.png",
        "value": 7
      },
      {
        "name": "Crimson Passage",
        "description": "A narrow gorge, its red rock walls towering high above, where every step taken stains the earth with blood.",
        "image_uri": "https://user-images.githubusercontent.com/521978/274047700-dd9304eb-0c37-4f43-a0fd-cfad17624c6b.png",
        "value": 3
      },
      {
        "name": "Ironclad Arena",
        "description": "A colossal steel arena, mechanized and ever-changing, where combatants fight not only each other but the very ground beneath their feet.",
        "image_uri": "https://user-images.githubusercontent.com/521978/274047382-ca2bcad8-8e33-46df-9fa3-5b66eb179333.png",
        "value": 5
      },
      {
        "name": "Starfall Summit",
        "description": "A mountaintop battlefield under a celestial shower, where fallen stars grant power to those who can seize them.",
        "image_uri": "https://user-images.githubusercontent.com/521978/274047326-192415fe-df3c-4059-bf74-15d9c90857cc.png",
        "value": 6
      }
    ],
    "battle_duration": "100000",
    "denom": "ujunox"
  }
}
```
