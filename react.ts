// import React, { useEffect, useState } from "react";
// export function Entangle(pointer) {
//   const [state, setState] = useState(get(pointer));
//   useEffect(() => {
//     return Observe(pointer, () => {
//       console.log("notified");
//       setState(get(pointer));
//     });
//   }, []);
//   return [state, (val) => set(pointer, val)];
// }
