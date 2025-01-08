// import RiveCanvas, { type RiveCanvas as RiveCanvasType } from "@rive-app/canvas-advanced";

// export default class RuntimeLoader {
//   // Singleton helpers
//   private static runtime: RiveCanvasType;
//   // Flag to indicate that loading has started/completed
//   private static isLoading = false;
//   // List of callbacks for the runtime that come in while loading
//   private static callBackQueue: Array<(rive: RiveCanvasType) => void> = [];
//   // Path to the Wasm file; default path works for testing only;
//   // if embedded wasm is used then this is never used.
//   private static wasmURL: string = `/miami/rive.wasm`;

//   // Class is never instantiated
//   private constructor() {}

//   // Loads the runtime
//   private static loadRuntime() {
//     RiveCanvas({
//       // Loads Wasm bundle
//       locateFile: (_) => RuntimeLoader.wasmURL
//     }).then((rive) => {
//       RuntimeLoader.runtime = rive;
//       // Fire all the callbacks
//       while (RuntimeLoader.callBackQueue.length > 0) {
//         const cbThing = RuntimeLoader.callBackQueue.shift();
//         if (cbThing) {
//           cbThing(RuntimeLoader.runtime);
//         }
//       }
//     });
//   }

//   // Provides a runtime instance via a callback
//   public static getInstance(callback: (rive: RiveCanvasType) => void) {
//     // If it's not loading, start loading runtime
//     if (!RuntimeLoader.isLoading) {
//       RuntimeLoader.isLoading = true;
//       RuntimeLoader.loadRuntime();
//     }
//     if (!RuntimeLoader.runtime) {
//       RuntimeLoader.callBackQueue.push(callback);
//     } else {
//       callback(RuntimeLoader.runtime);
//     }
//   }

//   // Provides a runtime instance via a promise
//   public static awaitInstance(): Promise<RiveCanvasType> {
//     return new Promise((resolve) =>
//       RuntimeLoader.getInstance((rive) => resolve(rive))
//     );
//   }

//   // Manually sets the wasm url
//   public static setWasmUrl(url: string) {
//     RuntimeLoader.wasmURL = url;
//   }
// }