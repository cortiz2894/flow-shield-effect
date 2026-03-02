"use client";

import { useRef, useMemo, useEffect, useCallback } from "react";
import { useControls, folder, button } from "leva";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { Preset } from "@/components/overlay/OverlayButtons";

interface ShieldProps {
  isActive?: boolean;
  posYOverride?: number;
  preset?: Preset;
}

const MAX_HITS = 6;

const SHIELD_PRESETS: Record<Preset, Record<string, unknown>> = {
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
    hexScale:     3.5,
    hexOpacity:   0.27,
    edgeWidth:    0.2,
    fresnelPower: 1.8,
    fresnelStrength: 1.75,
    flashSpeed:   0.6,
    color:"#3074ff",
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

function Shield({ isActive = false, posYOverride, preset }: ShieldProps) {
  const materialRef    = useRef<THREE.ShaderMaterial>(null!);
  const groupRef       = useRef<THREE.Group>(null!);
  const revealRef      = useRef(1);
  const timeRef        = useRef(0);
  const hitIdxRef      = useRef(0);
  const lifeRef        = useRef(1.0);
  const hitDamageRef   = useRef(10);

  const [
    {
      debugAlwaysOn,
      manualReveal,
      revealProgress,
      posX, posY, posZ,
      scale,
      color,
      hexScale,
      hexOpacity,
      showHex,
      edgeWidth,
      fresnelPower,
      fresnelStrength,
      opacity,
      revealSpeed,
      flashSpeed,
      flashIntensity,
      noiseScale,
      noiseEdgeColor,
      noiseEdgeWidth,
      noiseEdgeIntensity,
      noiseEdgeSmoothness,
      flowScale,
      flowSpeed,
      flowIntensity,
      hitRingSpeed,
      hitRingWidth,
      hitDuration,
      hitIntensity,
      hitImpactRadius,
      hitMaxRadius,
      hitDamage,
    },
    setShield,
  ] = useControls(
    "Force Shield",
    () => ({
      debugAlwaysOn:  { value: true,  label: "Show Shield"       },
      manualReveal:   { value: false, label: "Manual Reveal"     },
      revealProgress: { value: 0.0, min: 0, max: 1, step: 0.01, label: "↳ Reveal Progress" },
      Transform: folder(
        {
          posX:  { value: 0,   min: -10, max: 10, step: 0.1,  label: "Pos X"  },
          posY:  { value: 2, min: -10, max: 10, step: 0.1,  label: "Pos Y"  },
          posZ:  { value: 0.2, min: -10, max: 10, step: 0.1,  label: "Pos Z"  },
          scale: { value: 1,   min: 0.1, max: 5,  step: 0.05, label: "Scale"  },
        },
        { collapsed: true }
      ),
      color:           "#26aeff",
      hexScale:        { value: 3.0,  min: 1,    max: 20,  step: 0.5              },
      hexOpacity:      { value: 0.13, min: 0,    max: 1,   step: 0.01, label: "Hex Opacity"       },
      showHex:         { value: true, label: "Show Hex" },
      edgeWidth:       { value: 0.06, min: 0.01, max: 0.2, step: 0.005            },
      fresnelPower:    { value: 1.8,  min: 0.5,  max: 5,   step: 0.1,  label: "Fresnel Power"     },
      fresnelStrength: { value: 1.75, min: 0,    max: 3,   step: 0.05, label: "Fresnel Strength"  },
      opacity:         { value: 0.76, min: 0,    max: 1,   step: 0.01             },
      revealSpeed:     { value: 3.5,  min: 0.5,  max: 5,   step: 0.1              },
      flashSpeed:      { value: 0.6,  min: 0.5,  max: 8,   step: 0.1              },
      flashIntensity:  { value: 0.11, min: 0,    max: 1,   step: 0.01             },
      noiseScale:          { value: 1.3,  min: 0.5,  max: 10,  step: 0.1                          },
      noiseEdgeColor:      { value: "#26aeff",                            label: "Noise Edge Color"       },
      noiseEdgeWidth:      { value: 0.02, min: 0.01, max: 0.5, step: 0.01, label: "Noise Edge Width"      },
      noiseEdgeIntensity:  { value: 10.0, min: 0,    max: 10,  step: 0.1,  label: "Noise Edge Intensity"  },
      noiseEdgeSmoothness: { value: 0.5,  min: 0,    max: 1,   step: 0.01, label: "Noise Edge Smoothness" },
      "Flow Noise": folder(
        {
          flowScale:     { value: 2.4,  min: 0.1, max: 8, step: 0.1,  label: "Scale"     },
          flowSpeed:     { value: 1.13, min: 0,   max: 2, step: 0.01, label: "Speed"     },
          flowIntensity: { value: 4,    min: 0,   max: 4, step: 0.05, label: "Intensity" },
        },
        { collapsed: false }
      ),
      "Hit Effect": folder(
        {
          hitRingSpeed:    { value: 1.75, min: 0.1,  max: 6,    step: 0.05, label: "Ring Speed"    },
          hitRingWidth:    { value: 0.12, min: 0.01, max: 0.5,  step: 0.01, label: "Ring Width"    },
          hitMaxRadius:    { value: 0.85,  min: 0.2,  max: 3.14, step: 0.05, label: "Max Radius"    },
          hitDuration:     { value: 1.8,  min: 0.5,  max: 6,    step: 0.1,  label: "Duration"      },
          hitIntensity:    { value: 4.1,  min: 0,    max: 8,    step: 0.1,  label: "Intensity"     },
          hitImpactRadius: { value: 0.30, min: 0.1,  max: 1.5,  step: 0.05, label: "Impact Radius" },
          hitDamage:    { value: 5, min: 1, max: 100, step: 1, label: "Damage %" },
          "Reset Life": button(() => { lifeRef.current = 1.0; }),
        },
        { collapsed: false }
      ),
    }),
    { collapsed: true }
  );

  const visible = isActive || debugAlwaysOn;

  // Keep hitDamageRef in sync so the click handler always sees latest value
  hitDamageRef.current = hitDamage;

  // Apply preset values to Leva controls when preset changes
  useEffect(() => {
    if (preset) setShield(SHIELD_PRESETS[preset]);
  }, [preset]);

  // ── Shader material ──────────────────────────────────────────────────────
  const shieldMaterial = useMemo(() => {
    const hitPositions = Array.from({ length: MAX_HITS }, () => new THREE.Vector3(0, 1.8, 0));
    const hitTimes     = new Array(MAX_HITS).fill(-999);

    return new THREE.ShaderMaterial({
      uniforms: {
        uTime:               { value: 0 },
        uColor:              { value: new THREE.Color(color) },
        uLife:               { value: 1.0 },
        uHexScale:           { value: hexScale },
        uEdgeWidth:          { value: edgeWidth },
        uFresnelPower:       { value: fresnelPower },
        uFresnelStrength:    { value: fresnelStrength },
        uOpacity:            { value: opacity },
        uReveal:             { value: 1 },
        uFlashSpeed:         { value: flashSpeed },
        uFlashIntensity:     { value: flashIntensity },
        uNoiseScale:         { value: noiseScale },
        uNoiseEdgeColor:     { value: new THREE.Color(noiseEdgeColor) },
        uNoiseEdgeWidth:     { value: noiseEdgeWidth },
        uNoiseEdgeIntensity: { value: noiseEdgeIntensity },
        uNoiseEdgeSmoothness:{ value: noiseEdgeSmoothness },
        uHexOpacity:         { value: hexOpacity },
        uShowHex:            { value: 1.0 },
        uFlowScale:          { value: flowScale },
        uFlowSpeed:          { value: flowSpeed },
        uFlowIntensity:      { value: flowIntensity },
        uHitPos:             { value: hitPositions },
        uHitTime:            { value: hitTimes },
        uHitRingSpeed:       { value: hitRingSpeed },
        uHitRingWidth:       { value: hitRingWidth },
        uHitMaxRadius:       { value: hitMaxRadius },
        uHitDuration:        { value: hitDuration },
        uHitIntensity:       { value: hitIntensity },
        uHitImpactRadius:    { value: hitImpactRadius },
      },
      vertexShader: /* glsl */ `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        varying vec3 vObjPos;

        void main() {
          vObjPos  = position;
          vNormal  = normalize(normalMatrix * normal);
          vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
          vViewDir = normalize(-viewPosition.xyz);
          gl_Position = projectionMatrix * viewPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        #define MAX_HITS 6

        uniform float uTime;
        uniform vec3  uColor;
        uniform float uLife;
        uniform float uHexScale;
        uniform float uEdgeWidth;
        uniform float uFresnelPower;
        uniform float uFresnelStrength;
        uniform float uOpacity;
        uniform float uReveal;
        uniform float uFlashSpeed;
        uniform float uFlashIntensity;
        uniform float uNoiseScale;
        uniform vec3  uNoiseEdgeColor;
        uniform float uNoiseEdgeWidth;
        uniform float uNoiseEdgeIntensity;
        uniform float uNoiseEdgeSmoothness;
        uniform float uHexOpacity;
        uniform float uShowHex;
        uniform float uFlowScale;
        uniform float uFlowSpeed;
        uniform float uFlowIntensity;
        uniform vec3  uHitPos[MAX_HITS];
        uniform float uHitTime[MAX_HITS];
        uniform float uHitRingSpeed;
        uniform float uHitRingWidth;
        uniform float uHitMaxRadius;
        uniform float uHitDuration;
        uniform float uHitIntensity;
        uniform float uHitImpactRadius;

        varying vec3 vNormal;
        varying vec3 vViewDir;
        varying vec3 vObjPos;

        // ── Simplex 3D noise ─────────────────────────────────────────────
        vec3 mod289v3(vec3 x){ return x - floor(x*(1./289.))*289.; }
        vec4 mod289v4(vec4 x){ return x - floor(x*(1./289.))*289.; }
        vec4 permute(vec4 x){ return mod289v4(((x*34.)+1.)*x); }
        vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314*r; }

        float snoise(vec3 v){
          const vec2 C = vec2(1./6., 1./3.);
          const vec4 D = vec4(0., 0.5, 1., 2.);
          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g  = step(x0.yzx, x0.xyz);
          vec3 l  = 1. - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod289v3(i);
          vec4 p = permute(permute(permute(
            i.z+vec4(0.,i1.z,i2.z,1.))
           +i.y+vec4(0.,i1.y,i2.y,1.))
           +i.x+vec4(0.,i1.x,i2.x,1.));
          float n_ = 0.142857142857;
          vec3  ns = n_*D.wyz - D.xzx;
          vec4 j   = p - 49.*floor(p*ns.z*ns.z);
          vec4 x_  = floor(j*ns.z);
          vec4 y_  = floor(j - 7.*x_);
          vec4 x   = x_*ns.x + ns.yyyy;
          vec4 y   = y_*ns.x + ns.yyyy;
          vec4 h   = 1. - abs(x) - abs(y);
          vec4 b0  = vec4(x.xy, y.xy);
          vec4 b1  = vec4(x.zw, y.zw);
          vec4 s0  = floor(b0)*2.+1.;
          vec4 s1  = floor(b1)*2.+1.;
          vec4 sh  = -step(h, vec4(0.));
          vec4 a0  = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1  = b1.xzyw + s1.xzyw*sh.zzww;
          vec3 p0  = vec3(a0.xy, h.x);
          vec3 p1  = vec3(a0.zw, h.y);
          vec3 p2  = vec3(a1.xy, h.z);
          vec3 p3  = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
          p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
          vec4 m = max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
          m = m*m;
          return 42.*dot(m*m, vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
        }

        // ── Life color: uColor (full) → red (empty) ──────────────────────
        vec3 lifeColor(float life){
          return mix(vec3(1.0, 0.08, 0.04), uColor, life);
        }

        // ── Hex grid ─────────────────────────────────────────────────────
        float hexPattern(vec2 p){
          p *= uHexScale;
          const vec2 s = vec2(1., 1.7320508);
          vec4 hC = floor(vec4(p, p-vec2(0.5,1.))/s.xyxy) + 0.5;
          vec4 h  = vec4(p-hC.xy*s, p-(hC.zw+0.5)*s);
          vec2 cell = (dot(h.xy,h.xy) < dot(h.zw,h.zw)) ? h.xy : h.zw;
          cell = abs(cell);
          float d = max(dot(cell, s*0.5), cell.x);
          return smoothstep(0.5-uEdgeWidth, 0.5, d);
        }

        vec2 hexCellId(vec2 p){
          p *= uHexScale;
          const vec2 s = vec2(1., 1.7320508);
          vec4 hC = floor(vec4(p, p-vec2(0.5,1.))/s.xyxy) + 0.5;
          vec4 h  = vec4(p-hC.xy*s, p-(hC.zw+0.5)*s);
          return (dot(h.xy,h.xy) < dot(h.zw,h.zw)) ? hC.xy : hC.zw+0.5;
        }

        float cellFlash(vec2 cellId){
          float rnd   = fract(sin(dot(cellId, vec2(127.1,311.7)))*43758.5453);
          float phase = rnd * 6.2831;
          float speed = 0.5 + rnd * 1.5;
          return smoothstep(0.6, 1.0, sin(uTime*uFlashSpeed*speed+phase)) * uFlashIntensity;
        }

        void main(){
          // ── Reveal / dissolve ───────────────────────────────────────────
          float noise = snoise(vObjPos * uNoiseScale) * 0.5 + 0.5;
          float revealMask = smoothstep(uReveal - uNoiseEdgeWidth, uReveal, noise);
          if (revealMask < 0.001) discard;

          float innerFade  = mix(0.98, 0.15, uNoiseEdgeSmoothness);
          float edgeLow    = smoothstep(uReveal-uNoiseEdgeWidth, uReveal-uNoiseEdgeWidth*innerFade, noise);
          float edgeHigh   = smoothstep(uReveal-uNoiseEdgeWidth*0.15, uReveal, noise);
          float revealEdge = edgeLow * (1.0 - edgeHigh);

          // ── Fresnel ─────────────────────────────────────────────────────
          float fresnel = pow(1.0 - dot(vNormal, vViewDir), uFresnelPower) * uFresnelStrength;

          // ── Flow noise ──────────────────────────────────────────────────
          float t   = uTime * uFlowSpeed;
          float fn1 = snoise(vObjPos*uFlowScale + vec3(t, t*0.6, t*0.4));
          float fn2 = snoise(vObjPos*uFlowScale*2.1 + vec3(-t*0.5, t*0.9, t*0.3));
          float flowNoise = (fn1*0.6 + fn2*0.4)*0.5 + 0.5;

          // ── Hex: cube-face select + seam fade ───────────────────────
          // One projection per fragment (no overlap). Near the 45° seam
          // between cube faces, hexFade drives hex opacity to 0 so neither
          // a ghost grid NOR a hard discontinuity is visible — just the
          // fresnel/glow shows through in those bands.
          //   dominance = 1.0  → face center  → full hex
          //   dominance ≈ 0.71 → 45° seam     → hex fades to 0
          vec3 absN = abs(normalize(vObjPos));
          float dominance = max(absN.x, max(absN.y, absN.z));
          float hexFade   = smoothstep(0.65, 0.85, dominance);

          vec2 faceUV;
          if (absN.x >= absN.y && absN.x >= absN.z) {
            faceUV = vObjPos.yz;   // ±X face
          } else if (absN.y >= absN.z) {
            faceUV = vObjPos.xz;   // ±Y face
          } else {
            faceUV = vObjPos.xy;   // ±Z face
          }

          float hex   = hexPattern(faceUV) * hexFade;
          vec2  cId   = hexCellId(faceUV);
          float flash = cellFlash(cId) * hexFade;

          // ── Hit ring buffer ─────────────────────────────────────────────
          // Each slot: expanding noisy ring + initial hex highlight zone
          vec3  normPos    = normalize(vObjPos);
          float ringContrib = 0.0;
          float hexHitBoost = 0.0;

          for (int i = 0; i < MAX_HITS; i++) {
            float ht      = uHitTime[i];
            float elapsed = uTime - ht;

            // isActive: slot valid AND within lifetime
            float isActive = step(0.0, ht)
                           * step(0.0, elapsed)
                           * step(elapsed, uHitDuration);

            // Geodesic distance on the sphere surface (radians)
            float dist = acos(clamp(dot(normPos, normalize(uHitPos[i])), -1.0, 1.0));

            // Expanding ring — capped at uHitMaxRadius, fades as it reaches it
            float ringR      = min(elapsed * uHitRingSpeed, uHitMaxRadius);
            float noiseD     = snoise(normPos*5.0 + vec3(elapsed*2.0)) * 0.05;
            float ring       = smoothstep(uHitRingWidth, 0.0, abs(dist + noiseD - ringR));
            float fade       = 1.0 - smoothstep(uHitDuration*0.5, uHitDuration, elapsed);
            float radialFade = 1.0 - smoothstep(uHitMaxRadius*0.75, uHitMaxRadius, ringR);
            ringContrib     += ring * fade * radialFade * isActive;

            // Hex highlight: cells within impact radius flash on impact
            float zone     = smoothstep(uHitImpactRadius, 0.0, dist);
            float zoneFade = 1.0 - smoothstep(0.0, uHitDuration*0.35, elapsed);
            hexHitBoost   += zone * zoneFade * isActive;
          }

          ringContrib = min(ringContrib, 2.0);
          hexHitBoost = min(hexHitBoost, 1.0);

          // ── Combine ─────────────────────────────────────────────────────
          vec3  lColor = lifeColor(uLife);

          float effectiveHexOpacity = (uHexOpacity + hexHitBoost * uHitIntensity) * uShowHex;
          float intensity = hex * effectiveHexOpacity * (0.3 + fresnel*0.7) + fresnel*0.4 + flash * uShowHex;

          vec3 shieldColor = lColor * intensity * 2.0;
          shieldColor += lColor * (flowNoise * fresnel * uFlowIntensity);
          shieldColor += lColor * ringContrib * uHitIntensity;

          vec3 edgeColor = mix(uNoiseEdgeColor, lColor, 1.0 - uLife);
          vec3 edgeGlow  = edgeColor * revealEdge * uNoiseEdgeIntensity;

          float alpha = clamp(intensity*uOpacity*revealMask + revealEdge*uNoiseEdgeIntensity, 0.0, 1.0);

          gl_FragColor = vec4(shieldColor + edgeGlow, alpha);
        }
      `,
      transparent: true,
      depthWrite:  false,
      side:        THREE.FrontSide,
      blending:    THREE.AdditiveBlending,
    });
  }, []);

  if (shieldMaterial && materialRef.current !== shieldMaterial) {
    materialRef.current = shieldMaterial;
  }

  // ── Sync leva → uniforms ────────────────────────────────────────────────
  useEffect(() => {
    if (!materialRef.current) return;
    const u = materialRef.current.uniforms;
    u.uColor.value.set(color);
    u.uHexScale.value        = hexScale;
    u.uHexOpacity.value      = hexOpacity;
    u.uShowHex.value         = showHex ? 1.0 : 0.0;
    u.uEdgeWidth.value       = edgeWidth;
    u.uFresnelPower.value    = fresnelPower;
    u.uFresnelStrength.value = fresnelStrength;
    u.uOpacity.value         = opacity;
    u.uFlashSpeed.value      = flashSpeed;
    u.uFlashIntensity.value  = flashIntensity;
    u.uNoiseScale.value      = noiseScale;
    u.uNoiseEdgeColor.value.set(noiseEdgeColor);
    u.uNoiseEdgeWidth.value       = noiseEdgeWidth;
    u.uNoiseEdgeIntensity.value   = noiseEdgeIntensity;
    u.uNoiseEdgeSmoothness.value  = noiseEdgeSmoothness;
    u.uFlowScale.value     = flowScale;
    u.uFlowSpeed.value     = flowSpeed;
    u.uFlowIntensity.value = flowIntensity;
    u.uHitRingSpeed.value    = hitRingSpeed;
    u.uHitRingWidth.value    = hitRingWidth;
    u.uHitMaxRadius.value    = hitMaxRadius;
    u.uHitDuration.value     = hitDuration;
    u.uHitIntensity.value    = hitIntensity;
    u.uHitImpactRadius.value = hitImpactRadius;
  }, [
    color, hexScale, hexOpacity, showHex, edgeWidth,
    fresnelPower, fresnelStrength, opacity,
    flashSpeed, flashIntensity,
    noiseScale, noiseEdgeColor, noiseEdgeWidth, noiseEdgeIntensity, noiseEdgeSmoothness,
    flowScale, flowSpeed, flowIntensity,
    hitRingSpeed, hitRingWidth, hitMaxRadius, hitDuration, hitIntensity, hitImpactRadius,
  ]);

  // ── Click → spawn hit in ring buffer ────────────────────────────────────
  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!materialRef.current) return;

    // e.point is world-space; worldToLocal on the mesh gives object space,
    // which matches vObjPos (position attribute) in the vertex shader.
    const localPoint = e.object.worldToLocal(e.point.clone());

    const idx = hitIdxRef.current % MAX_HITS;
    hitIdxRef.current++;

    const u = materialRef.current.uniforms;
    u.uHitPos.value[idx].copy(localPoint);
    u.uHitTime.value[idx] = timeRef.current;

    // Each hit reduces life by hitDamage %
    lifeRef.current = Math.max(0, lifeRef.current - hitDamageRef.current / 100);
  }, []);

  // ── Per-frame ────────────────────────────────────────────────────────────
  useFrame((state, delta) => {
    if (!materialRef.current) return;

    timeRef.current = state.clock.elapsedTime;
    materialRef.current.uniforms.uTime.value = timeRef.current;
    materialRef.current.uniforms.uLife.value = lifeRef.current;

    if (manualReveal) {
      revealRef.current = revealProgress;
    } else {
      const target = visible ? 0 : 1;
      revealRef.current = THREE.MathUtils.lerp(
        revealRef.current,
        target,
        1 - Math.exp(-revealSpeed * delta)
      );
      if ( visible && revealRef.current < 0.005) revealRef.current = 0;
      if (!visible && revealRef.current > 0.995) revealRef.current = 1;
    }

    materialRef.current.uniforms.uReveal.value = revealRef.current;
    materialRef.current.visible = revealRef.current < 1;
  });

  return (
    <group ref={groupRef} position={[posX, posYOverride ?? posY, posZ]} scale={[scale, scale, scale]}>
      <mesh onClick={handleClick}>
        <sphereGeometry args={[1.8, 64, 64]} />
        <primitive object={shieldMaterial} attach="material" />
      </mesh>
    </group>
  );
}

export default Shield;
