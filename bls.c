#include <stdint.h>
#include <bls.h>

uint64_t g1[17 * 512];
uint64_t gsum[17];
uint64_t g2[33];
uint64_t gt[96];

__attribute__((visibility("default")))
int zkmain() {
    uint32_t len = (uint32_t)wasm_input(1);
    for (int i=0;i<len;i++) {
       for (int j=0; j<16; j++) { 
         g1[i*17 + j] = wasm_input(0);
       }
       g1[i*17 + 16] = 0;
    }

    for (int i=0; i<32; i++) {
        g2[i] = wasm_input(0);
    };
    g2[32] = 0;


    // Aggregate the sum of the pubkey
    blssum(len, g1, gsum);

    for (int i=0; i<96; i++) {
	    gt[i] = wasm_input(0);
    };
    blspair(gsum, g2, gt);
    return 1;
}
