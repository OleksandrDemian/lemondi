import {TArgModFlag, TArgModFlags} from "./types";

export const ArgMod = (() => {
  const flagMap: { [key in TArgModFlag]: number } = {
    isAsync: 1,    // 2^0 = 1
    isArray: 2,    // 2^1 = 2
    // Add more flags as needed, for example:
    // isReadOnly: 4,   // 2^2 = 4
    // isHidden: 8,     // 2^3 = 8
  };
  const flags = Object.keys(flagMap);

  function generate (props: TArgModFlags) {
    let result = 0;
    // Iterate over flagMap and apply bitwise OR if the flag is true
    for (const [flag, bit] of Object.entries(flagMap)) {
      if (props[flag as TArgModFlag]) {
        result |= bit;
      }
    }

    return result;
  }

  function decode (mod: number): TArgModFlags {
    // @ts-ignore
    const result: TArgModFlags = {};
    for (const flag of flags) {
      result[flag] = (mod & flagMap[flag]) !== 0;
    }

    return result;
  }

  return {
    generate: generate,
    decode: decode,
  };
})();

// const tests = [
//   {
//     isAsync: true,
//     isArray: false,
//   },
//   {
//     isAsync: true,
//     isArray: true,
//   },
//   {
//     isAsync: false,
//     isArray: false,
//   },
//   {
//     isAsync: false,
//     isArray: false,
//   }
// ];
//
// for (const test of tests) {
//   const mod = ArgMod.generate(test);
//   const result = ArgMod.decode(mod);
//   console.log("Mod", mod);
//   console.log(JSON.stringify(test) === JSON.stringify(result));
// }
