pragma circom 2.0.4;
 
include "../../../node_modules/circomlib/circuits/bitify.circom";
include "../../../node_modules/circomlib/circuits/comparators.circom";
include "../../../node_modules/circomlib/circuits/mimcsponge.circom";

/* 
A SNARK-powered auto-battler game.

Two NPC fighters, named "home" and "away", battle for `nRounds`.
The fighter with the most health remaining wins. 
*/
template battle(nStats, nRounds) {
    // Fighters have 4 stats: Health, Damage, AttackRecoveryTime, and HealthPerTurn.
    signal input homeStats[nStats];
    signal input awayStats[nStats];
    // The random seed for this match.
    signal input rand;
    // How often each fighter can attack. 
    signal homeRecovery;
    signal awayRecovery;
    // Boolean. 1 if home fighter wins, 0 otherwise.
    signal output homeVictory;

    // Fighters health at the end of each round.
    signal homeHealths[nRounds];
    signal awayHealths[nRounds];
    // Used to determine whether each fighter has hit on a given turn.
    signal homeAttackIndex[nRounds];
    signal awayAttackIndex[nRounds];
    // A counter tracking how many chances each fighter has had to attack.
    signal homeAttackTurns[nRounds];
    signal awayAttackTurns[nRounds];
    // Whether or not each fighter has hit on a given turn.
    signal homeHasHit[nRounds];
    signal awayHasHit[nRounds];

    homeHealths[0] <== homeStats[0] + 100000; 
    awayHealths[0] <== awayStats[0] + 100000;

    homeAttackTurns[0] <== 0;
    awayAttackTurns[0] <== 0;

    component homeRecoveryIsZero = IsZero();
    homeRecoveryIsZero.in <== homeStats[2];
    
    component awayRecoveryIsZero = IsZero();
    awayRecoveryIsZero.in <== awayStats[2];

    homeRecovery <== homeStats[2] + nRounds * homeRecoveryIsZero.out;
    awayRecovery <== awayStats[2] + nRounds * awayRecoveryIsZero.out;

    // Generate random seeds for each fighter.
    component homeRand = MiMCSponge(1, 220, 1);
    homeRand.ins[0] <== rand;
    homeRand.k <== 0;

    component awayRand = MiMCSponge(1, 220, 1);
    awayRand.ins[0] <== rand + 1;
    awayRand.k <== 0;

    // Split each seed into a string of `nRounds` bits. Each bit indicates the fighter's 50% chance to hit on that turn.
    component homeNum2Bits = Num2Bits_strict();
    homeNum2Bits.in <== homeRand.outs[0];

    component awayNum2Bits = Num2Bits_strict();
    awayNum2Bits.in <== awayRand.outs[0];

    component homeRound[nRounds];
    homeRound[0] = IsEqual();
    homeRound[0].in[0] <== 0;
    homeRound[0].in[1] <== homeRecoveryIsZero.out;

    component awayRound[nRounds];
    awayRound[0] = IsEqual();
    awayRound[0].in[0] <== 0;
    awayRound[0].in[1] <== awayRecoveryIsZero.out;

    for (var i = 1; i < nRounds; i++) {
        // Workaround logic to determine if this is an attack round, ie. (attackRecoveryTime % nRounds) == 0.
        homeAttackIndex[i] <-- i / homeRecovery;
        homeAttackIndex[i] * homeRecovery === i;

        awayAttackIndex[i] <-- i / awayRecovery;
        awayAttackIndex[i] * awayRecovery === i;

        homeAttackTurns[i] <== homeAttackTurns[i-1] + homeRound[i-1].out;
        awayAttackTurns[i] <== awayAttackTurns[i-1] + awayRound[i-1].out;
        
        homeRound[i] = IsEqual();
        homeRound[i].in[0] <== homeAttackIndex[i];
        homeRound[i].in[1] <== homeAttackTurns[i];

        awayRound[i] = IsEqual();
        awayRound[i].in[0] <== awayAttackIndex[i];
        awayRound[i].in[1] <== awayAttackTurns[i];

        // If this is an attack round, and the random bit for this round is true, hit the opponent.
        homeHasHit[i] <== homeRound[i-1].out * homeNum2Bits.out[i];
        awayHasHit[i] <== awayRound[i-1].out * awayNum2Bits.out[i];

        // Add healthPerTurn to health, but if the opponent has hit, also subtract their damage.
        homeHealths[i] <== homeHealths[i-1] + homeStats[3] - awayStats[1] * awayHasHit[i];
        awayHealths[i] <== awayHealths[i-1] + awayStats[3] - homeStats[1] * homeHasHit[i];
    }

    // Determine which fighter has the most health.
    component greaterThan = GreaterThan(252);
    greaterThan.in[0] <== homeHealths[nRounds-1];
    greaterThan.in[1] <== awayHealths[nRounds-1];

    homeVictory <== greaterThan.out;
}

component main { public [ homeStats, awayStats, rand ] } = battle(4, 10);
