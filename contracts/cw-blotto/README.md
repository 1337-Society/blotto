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
    "armies": [{ "name": "Red" }, { "name": "Blue" }],
    "battlefields": [
      { "name": "The Capital", "value": 7 },
      { "name": "Crimson Cliffs", "value": 3 },
      { "name": "Ironclad Arena", "value": 5 },
      { "name": "Starfall Summit", "value": 6 }
    ],
    "battle_duration": "100000",
    "denom": "ujunox"
  }
}
```
