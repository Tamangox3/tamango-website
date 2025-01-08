import type { MiamiLogger } from "./logger";
import { isFunction } from "@lib/utils";
import { decodeImage } from "@rive-app/canvas";
import type { FileAsset, ImageAsset } from "@rive-app/canvas-advanced";

export const RIVE_ASSETS = [
  "SEQ10 - BAMBINO1-3144911.webp",
  "SEQ10 - BAMBINO2-3144912.webp",
  "SEQ10 - BAMBINO3-3144913.webp",
  "SEQ10_00_esplosioni-3145133.webp",
  "SEQ10_02_esplosioni-3145132.webp",
  "SEQ10_03_esplosioni-3143488.webp",
  "SEQ10_04_esplosioni-3145135.webp",
  "SEQ10_07_esplosioni-3143489.webp",
  "SEQ10_08_esplosioni-3145136.webp",
  "SEQ10_09_esplosioni-3145137.webp",
  "SEQ10_12_esplosioni-3143487.webp",
  "SEQ10_13_esplosioni-3145138.webp",
  "SEQ10_14_esplosioni-3145131.webp",
  "SEQ10_16_esplosioni-3143485.webp",
  "SEQ10_19_doppietta-3145175.webp",
  "SEQ10_20_fucile-3145173.webp",
  "SEQ10_24_esplosioni-3143486.webp",
  "SEQ10_25_esplosioni-3145134.webp",
  "SEQ10_BG_PONGO_WHITE_1-3143381.webp",
  "SEQ10_BG_PONGO_WHITE_2-3143382.webp",
  "SEQ10_FERMARCI-3143384.webp",
  "SEQ10_MANCARCI-3143383.webp",
  "SEQ10_SEGUIRCI-3143385.webp",
  "SEQ10_SPARARCI-3143386.webp",
  "SEQ1_00_corvoinizio1-2868367.webp",
  "SEQ1_00_corvoinizio2-2868368.webp",
  "SEQ1_00_corvoinizio3-2868366.webp",
  "SEQ1_00_corvoinizio_b1-2914368.webp",
  "SEQ1_00_corvoinizio_b2-2914366.webp",
  "SEQ1_00_corvoinizio_b3-2914367.webp",
  "SEQ1_00_corvoinizio_b4-2914369.webp",
  "SEQ1_10_corvoa1-2952638.webp",
  "SEQ1_10_corvoa2-2952637.webp",
  "SEQ1_10_corvoa3-2952636.webp",
  "SEQ1_10_corvob1-2952635.webp",
  "SEQ1_10_corvob2-2952639.webp",
  "SEQ1_10_corvob3-2952641.webp",
  "SEQ1_10_corvoc1-2952640.webp",
  "SEQ1_10_corvoc2-2952642.webp",
  "SEQ1_10_corvoc3-2952643.webp",
  "SEQ1_11_sfondonero1-2952632.webp",
  "SEQ1_11_sfondonero2-2952630.webp",
  "SEQ1_11_sfondonero3-2952631.webp",
  "SEQ1_T_flat arancione-3050692.webp",
  "SEQ1_T_ombra per T- mettere in moltiplica-3050927.webp",
  "SEQ1_T_silhouette nera-3050691.webp",
  "SEQ1_alberi dx-2914300.webp",
  "SEQ1_alberi sx-2914302.webp",
  "SEQ1_bosco sfondo-2914296.webp",
  "SEQ1_città sfondo-2925984.webp",
  "SEQ1_fronde davanti-2914276.webp",
  "SEQ1_fronde dietro-2914279.webp",
  "SEQ1_ombra alberi strada - parte superiore-2925989.webp",
  "SEQ1_ombra alberi strada dx-2926137.webp",
  "SEQ1_ombra alberi strada sx-2926136.webp",
  "SEQ1_pupetto1-2925871.webp",
  "SEQ1_pupetto1-a-3050323.webp",
  "SEQ1_pupetto1-b-3050324.webp",
  "SEQ1_pupetto1-c-3050325.webp",
  "SEQ1_pupetto1-d-3050322.webp",
  "SEQ1_pupetto10-2925881.webp",
  "SEQ1_pupetto11-2925883.webp",
  "SEQ1_pupetto12-2925880.webp",
  "SEQ1_pupetto13-2925882.webp",
  "SEQ1_pupetto14-2925884.webp",
  "SEQ1_pupetto15-2925886.webp",
  "SEQ1_pupetto16-2925885.webp",
  "SEQ1_pupetto17-2925887.webp",
  "SEQ1_pupetto2-2925873.webp",
  "SEQ1_pupetto2-a-3050330.webp",
  "SEQ1_pupetto2-b-3050331.webp",
  "SEQ1_pupetto2-c-3050328.webp",
  "SEQ1_pupetto2-d-3050329.webp",
  "SEQ1_pupetto3-2925872.webp",
  "SEQ1_pupetto3-a-3050332.webp",
  "SEQ1_pupetto3-b-3050333.webp",
  "SEQ1_pupetto3-c-3050336.webp",
  "SEQ1_pupetto3-d-3050334.webp",
  "SEQ1_pupetto4-2925875.webp",
  "SEQ1_pupetto4-a-3050335.webp",
  "SEQ1_pupetto4-b-3050337.webp",
  "SEQ1_pupetto4-c-3050342.webp",
  "SEQ1_pupetto4-d-3050339.webp",
  "SEQ1_pupetto5-2925874.webp",
  "SEQ1_pupetto5-a-3050338.webp",
  "SEQ1_pupetto5-b-3050341.webp",
  "SEQ1_pupetto5-c-3050340.webp",
  "SEQ1_pupetto5-d-3050343.webp",
  "SEQ1_pupetto6-2925877.webp",
  "SEQ1_pupetto6-a-3050345.webp",
  "SEQ1_pupetto6-b-3050344.webp",
  "SEQ1_pupetto6-c-3050347.webp",
  "SEQ1_pupetto6-d-3050346.webp",
  "SEQ1_pupetto7-2925876.webp",
  "SEQ1_pupetto7-a-3050349.webp",
  "SEQ1_pupetto7-b-3050348.webp",
  "SEQ1_pupetto7-c-3050350.webp",
  "SEQ1_pupetto7-d-3050351.webp",
  "SEQ1_pupetto8-2925878.webp",
  "SEQ1_pupetto8-a-3050356.webp",
  "SEQ1_pupetto8-b-3050353.webp",
  "SEQ1_pupetto8-c-3050352.webp",
  "SEQ1_pupetto8-d-3050355.webp",
  "SEQ1_pupetto9-2925879.webp",
  "SEQ1_pupetto9-a-3050357.webp",
  "SEQ1_pupetto9-b-3050354.webp",
  "SEQ1_pupetto9-c-3050358.webp",
  "SEQ1_pupetto9-d-3050359.webp",
  "SEQ1_sfondo cielo-2914186.webp",
  "SEQ1_strada_sfumatura-3154453.webp",
  "SEQ1_tronco-2914274.webp",
  "SEQ5-1-3154096.webp",
  "SEQ5-10-3154104.webp",
  "SEQ5-11-3154105.webp",
  "SEQ5-12-3154106.webp",
  "SEQ5-13-3154107.webp",
  "SEQ5-14-3154108.webp",
  "SEQ5-15-3154109.webp",
  "SEQ5-16-3154110.webp",
  "SEQ5-17-3154111.webp",
  "SEQ5-18-3154112.webp",
  "SEQ5-19-3154113.webp",
  "SEQ5-2-3154095.webp",
  "SEQ5-20-3154114.webp",
  "SEQ5-21-3154115.webp",
  "SEQ5-22-3154116.webp",
  "SEQ5-23-3154117.webp",
  "SEQ5-24-3154118.webp",
  "SEQ5-25-3154119.webp",
  "SEQ5-26-3154120.webp",
  "SEQ5-27-3154121.webp",
  "SEQ5-28-3154122.webp",
  "SEQ5-29-3154123.webp",
  "SEQ5-3-3154098.webp",
  "SEQ5-30-3154124.webp",
  "SEQ5-31-3154125.webp",
  "SEQ5-32-3154126.webp",
  "SEQ5-33-3154127.webp",
  "SEQ5-34-3154128.webp",
  "SEQ5-35-3154129.webp",
  "SEQ5-36-3154130.webp",
  "SEQ5-37-3154131.webp",
  "SEQ5-38-3154132.webp",
  "SEQ5-39-3154133.webp",
  "SEQ5-4-3154097.webp",
  "SEQ5-40-3154134.webp",
  "SEQ5-41-3154135.webp",
  "SEQ5-42-3154136.webp",
  "SEQ5-43-3154137.webp",
  "SEQ5-44-3154138.webp",
  "SEQ5-45-3154139.webp",
  "SEQ5-46-3154140.webp",
  "SEQ5-47-3154141.webp",
  "SEQ5-48-3154142.webp",
  "SEQ5-49-3154143.webp",
  "SEQ5-5-3154101.webp",
  "SEQ5-6-3154100.webp",
  "SEQ5-7-3154102.webp",
  "SEQ5-8-3154099.webp",
  "SEQ5-9-3154103.webp",
  "SEQ7-0-2890536.webp",
  "SEQ7-1-2890535.webp",
  "SEQ7-12-2890544.webp",
  "SEQ7-13-2890545.webp",
  "SEQ7-14-2890546.webp",
  "SEQ7-15-2890547.webp",
  "SEQ7-16-2890549.webp",
  "SEQ7-17-2890548.webp",
  "SEQ7-18-2890550.webp",
  "SEQ7-19-2890551.webp",
  "SEQ7-2-2890537.webp",
  "SEQ7-20-2890554.webp",
  "SEQ7-21-2890553.webp",
  "SEQ7-22-2890556.webp",
  "SEQ7-23-2890555.webp",
  "SEQ7-24-2890557.webp",
  "SEQ7-25-2890558.webp",
  "SEQ7-26-2890559.webp",
  "SEQ7-27-2890560.webp",
  "SEQ7-28-2890561.webp",
  "SEQ7-29-2890562.webp",
  "SEQ7-3-2890538.webp",
  "SEQ7-30-2890564.webp",
  "SEQ7-31-2890565.webp",
  "SEQ7-32-2890566.webp",
  "SEQ7-33-2890567.webp",
  "SEQ7-34-2890568.webp",
  "SEQ7-35-2890569.webp",
  "SEQ7-36-2890570.webp",
  "SEQ7-37-2890571.webp",
  "SEQ7-38-2890572.webp",
  "SEQ7-39-2890573.webp",
  "SEQ7-4-2890539.webp",
  "SEQ7-40-2890574.webp",
  "SEQ7-5-2890540.webp",
  "SEQ7-6-2890552.webp",
  "SEQ7-7-2890541.webp",
  "SEQ7-8-2890542.webp",
  "SEQ7-9-2890543.webp",
  "SEQ8_1-3090748.webp",
  "SEQ8_2-3078226.webp",
  "SEQ8_3-3078227.webp",
  "SEQ8_4-3078228.webp",
  "SEQ8_5-3078229.webp",
  "SEQ8_6-3078230.webp",
  "SEQ8_7-3136938.webp",
  "SEQ8_8-3136937.webp",
  "SEQ9_108-3153737.webp",
  "SEQ9_13-3153705.webp",
  "SEQ9_16-3153706.webp",
  "SEQ9_18-3153707.webp",
  "SEQ9_19-3153709.webp",
  "SEQ9_21-3153708.webp",
  "SEQ9_22-3153710.webp",
  "SEQ9_26-3153711.webp",
  "SEQ9_31-3153712.webp",
  "SEQ9_37-3153714.webp",
  "SEQ9_38-3153713.webp",
  "SEQ9_41-3153715.webp",
  "SEQ9_42-3153716.webp",
  "SEQ9_44-3153717.webp",
  "SEQ9_48-3153719.webp",
  "SEQ9_49-3153720.webp",
  "SEQ9_50-3153718.webp",
  "SEQ9_52-3153721.webp",
  "SEQ9_54-3153723.webp",
  "SEQ9_55-3153724.webp",
  "SEQ9_57-3153725.webp",
  "SEQ9_59-3153726.webp",
  "SEQ9_60-3153727.webp",
  "SEQ9_61-3153728.webp",
  "SEQ9_66-3153731.webp",
  "SEQ9_67-3153729.webp",
  "SEQ9_78-3153730.webp",
  "SEQ9_82-3153732.webp",
  "SEQ9_88-3153733.webp",
  "SEQ9_92-3153734.webp",
  "SEQ9_96-3153735.webp",
  "SEQ9_97-3153736.webp"
] as const;

export type MiamiAssetsMap = Map<string, (() => Promise<Uint8Array>) | Uint8Array>;

export type RiveAsset = typeof RIVE_ASSETS[number];

export async function loadRiveAsset(base: string, asset: RiveAsset) {
  const url = `${base}/${asset}`;
  try {
    const response = await fetch(url,
      {
        method: "GET",
        redirect: "manual",
      });
    if (response.status !== 200) {
      throw new Error(`Failed to load asset: ${url}`);
    }
    return new Uint8Array(await response.arrayBuffer());
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export const miamiAssetLoader = (assets: MiamiAssetsMap, logger?: MiamiLogger) => {
  
  // This function returns a boolean value, true means that the asset is custom-loaded, false means that the asset is loaded by rive
  return (asset: FileAsset) => {
    const filename = asset.uniqueFilename.split(".")[0];

    if (!asset.isImage || !asset.uniqueFilename || !assets.has(filename)) {
      // non-image assets or invalid ones are not loaded
      return true;
    }

    // if loader is a function, call it, otherwise it means the asset is already loaded
    const assetLoader = assets.get(filename)!;

    if (isFunction<Promise<Uint8Array>>(assetLoader)) {
      assetLoader()
        .then(async (data) => {
          const decodedImage = await decodeImage(data);
          // Temporary comment out the line below to avoid crashing safari
          // (asset as ImageAsset).setRenderImage(decodedImage);
          decodedImage.unref();           
        })
        .catch((err) => {
          logger?.error("Error loading asset", err);
        });
    } else if (assetLoader instanceof Uint8Array) {
      decodeImage(assetLoader).then((decodedImage) => {
        (asset as ImageAsset).setRenderImage(decodedImage);     
        decodedImage.unref();  
      });
    } else {
      logger?.error("Asset loader is not a function or Uint8Array");
      return false;
    }
    return true;
  }
}

