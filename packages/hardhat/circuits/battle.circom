pragma circom 2.0.4;
 
include "../../../node_modules/circomlib/circuits/mimcsponge.circom";
include "../../../node_modules/circomlib/circuits/comparators.circom";

template mainFunc(n) {
    signal input healthA;
    signal input healthB;
    signal input healthPerTurnA;
    signal input healthPerTurnB;
    signal input damageA;
    signal input damageB;
    signal input rand;
 	signal output victoryA;
 	signal healthsA[n];
 	signal healthsB[n];
    signal isHitA[n];
    signal isHitB[n];
    component hashA[n];
    component hashB[n];

    // Prevent underflow
    healthsA[0] <== healthA + 100000;
    healthsB[0] <== healthB + 100000;

    hashA[0] = MiMCSponge(1, 220, 1);
    hashA[0].ins[0] <== rand;
    hashA[0].k <== 0;

    hashB[0] = MiMCSponge(1, 220, 1);
    hashB[0].ins[0] <== rand + 1;
    hashB[0].k <== 0;
 	
    for (var i = 1; i < n; i++) {
        hashA[i] = MiMCSponge(1, 220, 1);
        hashA[i].ins[0] <== hashA[i-1].outs[0];
        hashA[i].k <== 0;

        hashB[i] = MiMCSponge(1, 220, 1);
        hashB[i].ins[0] <== hashB[i-1].outs[0];
        hashB[i].k <== 0;

        isHitA[i] <-- (hashA[i].outs[0] % 2) == 0;
        isHitB[i] <-- (hashB[i].outs[0] % 2) == 0;

        healthsA[i] <== healthsA[i-1] + healthPerTurnA - damageB * isHitA[i];
        healthsB[i] <== healthsB[i-1] + healthPerTurnB - damageA * isHitB[i];
    }

    component greaterThan = GreaterThan(252);
    greaterThan.in[0] <== healthsA[n-1];
    greaterThan.in[1] <== healthsB[n-1];

    victoryA <== greaterThan.out;
}

component main { public [ healthA, healthPerTurnA, damageA, healthB, healthPerTurnB, damageB, rand ] } = mainFunc(10);
