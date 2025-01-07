// import {setMethodParamQualifier} from "../helpers/qualifier";
//
// // TODO
// export function Qualifier(qualifier: string | symbol | TCtor) {
//   return (target: TCtor, propertyKey: string | symbol, parameterIndex: number) => {
//     let qId: string | symbol;
//     if (typeof qualifier === "string" || typeof qualifier === "symbol") {
//       qId = qualifier;
//     } else {
//       qId = getClassId(qualifier);
//     }
//
//     setMethodParamQualifier(target, propertyKey, parameterIndex, qId);
//   }
// }
