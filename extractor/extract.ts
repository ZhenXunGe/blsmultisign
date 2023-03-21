const bls = require('@noble/bls12-381');
// If you're using single file, use global variable instead: `window.nobleBls12381`

export function hexToBytes(hex0x: string): Uint8Array {
  if (typeof hex0x !== 'string') {
      throw new TypeError('hexToBytes: expected string, got ' + typeof hex0x);
  }
  let hex = hex0x.slice(2, hex0x.length);
  if (hex0x.length % 2) throw new Error('hexToBytes: received invalid unpadded hex');

  const array = new Uint8Array(hex.length / 2);
  for (let i = 0; i < array.length; i++) {
      const j = i * 2;
      const hexByte = hex.slice(j, j + 2);
      if (hexByte.length !== 2) throw new Error('Invalid byte sequence');
      const byte = Number.parseInt(hexByte, 16);
      if (Number.isNaN(byte) || byte < 0) throw new Error('Invalid byte sequence');
      array[i] = byte;
   }
   return array;
}


function frToLimbs(x: bigint) {
  var acc = x;
  //console.log(acc.toString());
  var r:Array<string> = [];
  for (var i=0;i<8;i++) {
    const b = BigInt("0x40000000000000");
    const l = acc / b;
    const rem = acc % b;
    r.push("PUBKEYS=\"$PUBKEYS " + rem.toString() + ":i64\"");
    acc = l;
  }
  return r;
}

function pubkeyToG1(pubkey0x: string) {
    const publicKey = hexToBytes(pubkey0x);
    const g1 = bls.PointG1.fromHex(publicKey);
    return g1;
}

async function msgToG2(msg0x: string) {
  const msg = hexToBytes(msg0x);
  const g2 = await bls.PointG2.hashToCurve(msg);
  return g2;
}

function fp2ToLimbs(fp2: any) {
  for (var limb of frToLimbs(fp2.c0.value)) {
     console.log(limb.toString()); 
  }
  for (var limb of frToLimbs(fp2.c1.value)) {
     console.log(limb.toString()); 
  }
}

function g2ToLimbs(g2: any) {
  const x = g2.toAffine()[0];
  const y = g2.toAffine()[1];
  fp2ToLimbs(x);
  fp2ToLimbs(y);

}

function g1ToLimbs(g1: any) {
    const x:bigint = g1.toAffine()[0].value;
    const y:bigint = g1.toAffine()[1].value;
    for (var limb of frToLimbs(x)) {
       console.log(limb.toString()); 
    }
    for (var limb of frToLimbs(y)) {
       console.log(limb.toString()); 
    }
}

function gtToLimbs(gt: any) {
    fp2ToLimbs(gt.c0.c0);
    fp2ToLimbs(gt.c0.c1);
    fp2ToLimbs(gt.c0.c2);
    fp2ToLimbs(gt.c1.c0);
    fp2ToLimbs(gt.c1.c1);
    fp2ToLimbs(gt.c1.c2);
}

function setPublicInput(nbpubkey: number) {
    console.log(`NB_PUBKEY=${nbpubkey}`); 
}

const key = [
    "0x996FB3CA66BE9B298CB854575FA745F25239B3034B4E079C32513E2F7DD7B57F38559744D1F7C4E091DC40027FDF496B",
    "0x9889e6ebf0adbde68576e419582e630f72372c68157697799370a14b2c3368a86a8e5b60070772e66cb8c690b376f105"
];

async function main() {
    let g1s = [];
    for (var k of key) {
      const g1 = pubkeyToG1(k); 
      g1ToLimbs(g1);
      g1s.push(g1);
    }
    let acc = g1s.pop();
    for (var g of g1s) {
      console.log(g.toAffine()[0].value);
      acc = acc.add(g); 
    }

    setPublicInput(key.length);

    console.log(`# G2`); 
    let g2 = await msgToG2("0x1234");
    g2ToLimbs(g2);

    console.log(`# Pairing result`); 
    let gt = await bls.pairing(acc, g2);
    gtToLimbs(gt);

    /*
    console.log("g1-x ", acc.toAffine()[0]);
    console.log("g1-y ", acc.toAffine()[1]);
    console.log("g2-x ", g2.toAffine()[0]);
    console.log("g2-y ", g2.toAffine()[1]);
    console.log(gt.c0);
    console.log(gt.c1);
    */
}

main().then(()=>{process.exit();});
