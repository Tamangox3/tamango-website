import type { MiamiLogger } from "./logger";
import { isFunction } from "@lib/utils";
import type { FileAsset } from "@rive-app/webgl2-advanced";

export const RIVE_ASSETS = [

  "SEQ10-FERMARCI-3176029.webp",
  "SEQ10-MANCARCI-3176030.webp",
  "SEQ10-SEGUIRCI-3176031.webp",
  "SEQ10-SPARARCI-3176032.webp",
  "SEQ10_00_esplosioni-3145133.webp",
  "SEQ10_02_esplosioni-3145132.webp",
  "SEQ10_03_esplosioni-3143488.webp",
  "SEQ10_04_esplosioni-3145135.webp",
  "SEQ10_07_esplosioni-3143489.webp",
  "SEQ10_08_esplosioni-3145136.webp",
  "SEQ10_09_esplosioni-3145137.webp",
  "SEQ10_12_esplosioni-3143487.webp",
  "SEQ10_13_esplosioni-3145138.webp",
  "SEQ10_13_esplosioni-3175714.webp",
  "SEQ10_14_esplosioni-3145131.webp",
  "SEQ10_16_esplosioni-3143485.webp",
  "SEQ10_19_doppietta-3145175.webp",
  "SEQ10_20_fucile-3145173.webp",
  "SEQ10_20_fucile-3174130.webp",
  "SEQ10_24_esplosioni-3143486.webp",
  "SEQ10_25_esplosioni-3145134.webp",
  "SEQ11-1-3174131.webp",
  "SEQ11-10-3174132.webp",
  "SEQ11-11-3174129.webp",
  "SEQ11-2-3174128.webp",
  "SEQ11-3-3174127.webp",
  "SEQ11-4-3174125.webp",
  "SEQ11-5-3174126.webp",
  "SEQ11-6-3174124.webp",
  "SEQ11-7-3174123.webp",
  "SEQ11-8-3174122.webp",
  "SEQ11-9-3174121.webp",
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
  "SEQ1_T_flat arancione-3050692.webp",
  "SEQ1_T_silhouette nera-3050691.webp",
  "SEQ1_alberi dx - sopra-3167727.webp",
  "SEQ1_alberi dx - sotto-3167728.webp",
  "SEQ1_alberi sx - sopra-3167559.webp",
  "SEQ1_alberi sx - sotto-3167558.webp",
  "SEQ1_bosco sfondo-3167575.webp",
  "SEQ1_cielo_2_2-3173433.webp",
  "SEQ1_cielo_3_2-3173432.webp",
  "SEQ1_cielo_4_2-3173434.webp",
  "SEQ1_città sfondo-3167557.webp",
  "SEQ1_corvo grande_1-3175089.webp",
  "SEQ1_corvo grande_2-3175091.webp",
  "SEQ1_corvo grande_3-3175090.webp",
  "SEQ1_fronde davanti_1-3168135.webp",
  "SEQ1_fronde davanti_2-3168137.webp",
  "SEQ1_fronde davanti_3-3168136.webp",
  "SEQ1_fronde davanti_4-3168138.webp",
  "SEQ1_fronde dietro_1-3168130.webp",
  "SEQ1_fronde dietro_2-3168127.webp",
  "SEQ1_fronde dietro_3-3168129.webp",
  "SEQ1_fronde dietro_4-3168126.webp",
  "SEQ1_fronde dietro_5-3168128.webp",
  "SEQ1_ombra alberi strada - parte superiore-3167555.webp",
  "SEQ1_ombra alberi strada dx - 1-3167554.webp",
  "SEQ1_ombra alberi strada dx - 2-3167553.webp",
  "SEQ1_ombra alberi strada sx - 1-3167551.webp",
  "SEQ1_ombra alberi strada sx - 2-3167552.webp",
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
  "SEQ1_pupos_braccio-3155886.webp",
  "SEQ1_pupos_capelli-3155884.webp",
  "SEQ1_pupos_corpo-3155883.webp",
  "SEQ1_pupos_gamba-3155885.webp",
  "SEQ1_pupos_piede-3155889.webp",
  "SEQ1_strada_sfumatura-3154453.webp",
  "SEQ1_tronco_1-3168310.webp",
  "SEQ1_tronco_2-3168311.webp",
  "SEQ1_tronco_3-3168309.webp",
  "SEQ1_tronco_4-3168312.webp",
  "SEQ3_CITTA_LUCE_1-3163439.webp",
  "SEQ3_CITTA_LUCE_2-3163441.webp",
  "SEQ3_CITTA_LUCE_3-3163440.webp",
  "SEQ3_CITTA_LUCE_4-3163442.webp",
  "SEQ3_CITTA_LUCE_5-3163443.webp",
  "SEQ3_Coppia_CITTA_1_3_1_webp-3163579.webp",
  "SEQ3_Coppia_CITTA_1_3_2_webp-3163580.webp",
  "SEQ3_Coppia_CITTA_1_3_3_webp-3163581.webp",
  "SEQ3_LARGA_CITTA_1_6_10_webp-3163591.webp",
  "SEQ3_LARGA_CITTA_1_6_11_webp-3163592.webp",
  "SEQ3_LARGA_CITTA_1_6_12_webp-3163593.webp",
  "SEQ3_LARGA_CITTA_1_6_13_webp-3163594.webp",
  "SEQ3_LARGA_CITTA_1_6_1_webp-3163582.webp",
  "SEQ3_LARGA_CITTA_1_6_2_webp-3163583.webp",
  "SEQ3_LARGA_CITTA_1_6_3_webp-3163584.webp",
  "SEQ3_LARGA_CITTA_1_6_4_webp-3163585.webp",
  "SEQ3_LARGA_CITTA_1_6_5_webp-3163586.webp",
  "SEQ3_LARGA_CITTA_1_6_6_webp-3163587.webp",
  "SEQ3_LARGA_CITTA_1_6_7_webp-3163588.webp",
  "SEQ3_LARGA_CITTA_1_6_8_webp-3163589.webp",
  "SEQ3_LARGA_CITTA_1_6_9_webp-3163590.webp",
  "SEQ3_OUT_CITTA_1_5_23_webp-3163603.webp",
  "SEQ3_Stretta_CITTA_1_2_10_webp-3163613.webp",
  "SEQ3_Stretta_CITTA_1_2_1_webp-3163604.webp",
  "SEQ3_Stretta_CITTA_1_2_2_webp-3163605.webp",
  "SEQ3_Stretta_CITTA_1_2_3_webp-3163606.webp",
  "SEQ3_Stretta_CITTA_1_2_4_webp-3163607.webp",
  "SEQ3_Stretta_CITTA_1_2_5_webp-3163608.webp",
  "SEQ3_Stretta_CITTA_1_2_6_webp-3163609.webp",
  "SEQ3_Stretta_CITTA_1_2_7_webp-3163610.webp",
  "SEQ3_Stretta_CITTA_1_2_8_webp-3163611.webp",
  "SEQ3_Stretta_CITTA_1_2_9_webp-3163612.webp",
  "SEQ3_TRIO_CITTA_1_4_1_webp-3163505.webp",
  "SEQ3_TRIO_CITTA_1_4_2_webp-3163506.webp",
  "SEQ3_TRIO_CITTA_1_4_3_webp-3163507.webp",
  "SEQ3_VARIE_CITTA_1_7_1_webp-3163614.webp",
  "SEQ3_VARIE_CITTA_1_7_2_webp-3163615.webp",
  "SEQ3_VARIE_CITTA_1_7_3_webp-3163616.webp",
  "SEQ3_VARIE_CITTA_1_7_4_webp-3163617.webp",
  "SEQ3_VARIE_CITTA_1_7_5_webp-3163618.webp",
  "SEQ3_VARIE_CITTA_1_7_6_webp-3163619.webp",
  "SEQ3_VARIE_CITTA_1_8_1_webp-3163620.webp",
  "SEQ3_VARIE_CITTA_1_8_2_webp-3163621.webp",
  "SEQ3_VARIE_CITTA_1_8_3_webp-3163622.webp",
  "SEQ3_VARIE_CITTA_2_1_1_webp-3163623.webp",
  "SEQ3_VARIE_CITTA_2_1_2_webp-3163624.webp",
  "SEQ3_VARIE_CITTA_2_2_1_webp-3163625.webp",
  "SEQ3_VARIE_CITTA_2_2_2_webp-3163626.webp",
  "SEQ3_VARIE_CITTA_2_2_3_webp-3163627.webp",
  "SEQ3_VARIE_CITTA_2_2_5_webp-3163628.webp",
  "SEQ3_ZOOM_CITTA_1_5_10_webp-3163638.webp",
  "SEQ3_ZOOM_CITTA_1_5_11_webp-3163639.webp",
  "SEQ3_ZOOM_CITTA_1_5_12_webp-3163640.webp",
  "SEQ3_ZOOM_CITTA_1_5_13_webp-3163641.webp",
  "SEQ3_ZOOM_CITTA_1_5_14_webp-3163642.webp",
  "SEQ3_ZOOM_CITTA_1_5_15_webp-3163643.webp",
  "SEQ3_ZOOM_CITTA_1_5_16_webp-3163644.webp",
  "SEQ3_ZOOM_CITTA_1_5_1_webp-3163629.webp",
  "SEQ3_ZOOM_CITTA_1_5_2_webp-3163630.webp",
  "SEQ3_ZOOM_CITTA_1_5_3_webp-3163631.webp",
  "SEQ3_ZOOM_CITTA_1_5_4_webp-3163632.webp",
  "SEQ3_ZOOM_CITTA_1_5_5_webp-3163633.webp",
  "SEQ3_ZOOM_CITTA_1_5_6_webp-3163634.webp",
  "SEQ3_ZOOM_CITTA_1_5_7_webp-3163635.webp",
  "SEQ3_ZOOM_CITTA_1_5_8_webp-3163636.webp",
  "SEQ3_ZOOM_CITTA_1_5_9_webp-3163637.webp",
  "SEQ8-ALBERO1-3176087.webp",
  "SEQ8-ALBERO2-3176086.webp",
  "SEQ8-ALBERO3-3176085.webp",
  "SEQ8-BOCCA-3176084.webp",
  "SEQ8-BOCCA2-3176083.webp",
  "SEQ8-BOCCA3-3176080.webp",
  "SEQ8-OCCHIO-3176082.webp",
  "SEQ8-OCCHIO2-3176081.webp",
  "SEQ8-ORECCHIO-3176079.webp"
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
      return false;
    }

    // if loader is a function, call it, otherwise it means the asset is already loaded
    const assetLoader = assets.get(filename)!;

    if (isFunction<Promise<Uint8Array>>(assetLoader)) {
      assetLoader()
        .then(async (data) => {
          asset.decode(data);          
        })
        .catch((err) => {
          logger?.error("Error loading asset", err);
        });
    } else if (assetLoader instanceof Uint8Array) {
      asset.decode(assetLoader);
    } else {
      logger?.error("Asset loader is not a function or Uint8Array");
      return false;
    }

    return true;
  }
}

