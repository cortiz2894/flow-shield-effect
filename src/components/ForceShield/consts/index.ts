import { Preset } from "@/components/overlay/OverlayButtons";

export const MAX_HITS = 6;

export const SHIELD_PRESETS: Record<Preset, Record<string, unknown>> = {
  default: {
    hexScale:     3.0,
    hexOpacity:   0.13,
    edgeWidth:    0.06,
    fresnelPower: 1.8,
    fresnelStrength: 1.75,
    flashSpeed:   0.6,
    flashIntensity: 0.11,
    flowScale:    2.4,
    flowSpeed:    1.13,
    flowIntensity: 4,
    hitRingSpeed: 1.75,
    hitRingWidth: 0.12,
    hitMaxRadius: 0.85,
  },
  droideka: {
    hexScale:     3,
    hexOpacity:   0.27,
    edgeWidth:    0.2,
    fresnelPower: 1.8,
    fresnelStrength: 1.75,
    flashSpeed:   0.6,
    color:"#5992f7",
    noiseEdgeColor:"#7faaf5",
    noiseEdgeWidth:0.1,
    noiseEdgeIntensity:0.6,
    noiseScale:1,
    opacity:0.29,
    flashIntensity: 0.11,
    flowScale:    6.2,
    flowSpeed:    1.08,
    flowIntensity: 4,
    hitRingSpeed: 0.8,
    hitRingWidth: 0.12,
    hitMaxRadius: 2.1,
  },
};