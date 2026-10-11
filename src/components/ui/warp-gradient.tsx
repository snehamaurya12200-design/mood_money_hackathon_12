import React, { useEffect, useRef, useState, useMemo } from "react";
import { cn } from "@/src/lib/utils";
import { useInView } from "./warp-gradient-utils/use-in-view";

export type WarpGradientPattern = "bands" | "swirl" | "radial" | "waves";

export interface WarpGradientProps extends React.HTMLAttributes<HTMLDivElement> {
  colors?: string[];
  pattern?: WarpGradientPattern;
  density?: number;
  softness?: number;
  warp?: number;
  turbulence?: number;
  scale?: number;
  rotation?: number; // in degrees
  speed?: number;
  grain?: number;
  glossyHighlights?: boolean;
  vignette?: boolean;
  satinSheen?: boolean;
  interactiveMouse?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const MOOD_MONEY_WARP_CONFIG: Required<
  Omit<
    WarpGradientProps,
    | keyof React.HTMLAttributes<HTMLDivElement>
    | "className"
    | "children"
    | "glossyHighlights"
    | "vignette"
    | "satinSheen"
    | "interactiveMouse"
  >
> = {
  colors: ["#552139", "#E94355", "#F2C6D5", "#FFF9F1"],
  pattern: "bands",
  density: 0.3,
  softness: 0.9,
  warp: 0.65,
  turbulence: 0.15,
  scale: 0.55,
  rotation: -25,
  speed: 0.2,
  grain: 0.12,
};

// Helper: parse hex color string to normalized RGB [r, g, b]
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16) / 255;
    const g = parseInt(clean[1] + clean[1], 16) / 255;
    const b = parseInt(clean[2] + clean[2], 16) / 255;
    return [r, g, b];
  }
  const r = parseInt(clean.substring(0, 2), 16) / 255 || 0;
  const g = parseInt(clean.substring(2, 4), 16) / 255 || 0;
  const b = parseInt(clean.substring(4, 6), 16) / 255 || 0;
  return [r, g, b];
}

const VERTEX_SHADER_SRC = `#version 300 es
precision highp float;
in vec2 a_position;
out vec2 v_uv;

void main() {
  v_uv = (a_position + 1.0) * 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SRC = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_colors[4];
uniform float u_density;
uniform float u_softness;
uniform float u_warp;
uniform float u_turbulence;
uniform float u_scale;
uniform float u_rotation;
uniform float u_grain;
uniform int u_pattern;
uniform vec2 u_mouse;
uniform float u_interactive;

mat2 rotate2d(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  vec2 shift = vec2(100.0);
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < 4; ++i) {
    v += a * noise(p);
    p = rot * p * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

// Compute elevation field with domain warping and interactive ripple
float computeField(vec2 st, float t, vec2 mouseOffset) {
  vec2 p = st + mouseOffset * 0.15;
  
  vec2 q = vec2(
    fbm(p + vec2(0.0, 0.0) + vec2(t * 0.08, t * 0.05)),
    fbm(p + vec2(5.2, 1.3) + vec2(-t * 0.06, t * 0.09))
  );

  vec2 r = vec2(
    fbm(p + 3.0 * q + vec2(1.7, 9.2) + vec2(t * 0.10, -t * 0.07)),
    fbm(p + 3.0 * q + vec2(8.3, 2.8) + vec2(-t * 0.05, t * 0.08))
  );

  float field = 0.0;
  if (u_pattern == 0) {
    // Bands: flowing ribbons of liquid cherry satin
    float warpedY = p.y + (r.x * 2.0 - 1.0) * u_warp;
    float warpedX = p.x + (r.y * 2.0 - 1.0) * u_turbulence;
    field = sin(warpedY * 3.14159 * u_density * 4.0 + warpedX * 1.5 + t * 0.3);
    field = field * 0.5 + 0.5;
    field = mix(field, fbm(p + r * u_warp), 0.35);
  } else if (u_pattern == 1) {
    // Swirl
    float angle = atan(p.y, p.x) + length(p) * u_warp * 3.0 + t * 0.3;
    field = sin(angle * u_density * 4.0) * 0.5 + 0.5;
  } else if (u_pattern == 2) {
    // Radial
    float dist = length(p) + (r.x - 0.5) * u_warp;
    field = sin(dist * u_density * 6.0 - t * 0.4) * 0.5 + 0.5;
  } else {
    // Waves
    field = fbm(p * u_density + r * u_warp);
  }
  return clamp(field, 0.0, 1.0);
}

vec3 samplePalette(float t) {
  t = clamp(t, 0.0, 1.0);
  if (t < 0.333) {
    float f = smoothstep(0.0, 0.333, t);
    return mix(u_colors[0], u_colors[1], f);
  } else if (t < 0.666) {
    float f = smoothstep(0.333, 0.666, t);
    return mix(u_colors[1], u_colors[2], f);
  } else {
    float f = smoothstep(0.666, 1.0, t);
    return mix(u_colors[2], u_colors[3], f);
  }
}

void main() {
  vec2 st = (gl_FragCoord.xy - 0.5 * u_resolution) / max(min(u_resolution.x, u_resolution.y), 1.0);
  
  // Apply rotation and scale
  st = rotate2d(u_rotation) * st;
  st *= u_scale;

  // Normalized mouse offset relative to viewport
  vec2 mouseOffset = vec2(0.0);
  if (u_interactive > 0.5) {
    mouseOffset = (u_mouse - 0.5) * 0.8;
  }

  // Base field elevation
  float field = computeField(st, u_time, mouseOffset);

  // 3D Glass / Satin Surface Normal Estimation via finite differences
  float eps = 0.015;
  float fieldRight = computeField(st + vec2(eps, 0.0), u_time, mouseOffset);
  float fieldUp    = computeField(st + vec2(0.0, eps), u_time, mouseOffset);
  
  vec3 normal = normalize(vec3(
    -(fieldRight - field) * 4.0,
    -(fieldUp - field) * 4.0,
    eps * 3.0
  ));

  // Lighting vectors
  vec3 lightDir = normalize(vec3(-0.45, 0.55, 0.70)); // Elegant top-left directional key light
  vec3 viewDir  = vec3(0.0, 0.0, 1.0);
  vec3 halfVec  = normalize(lightDir + viewDir);

  // Specular sheen for liquid cherry glass
  float spec = pow(max(dot(normal, halfVec), 0.0), 18.0);
  float diff = max(dot(normal, lightDir), 0.0) * 0.2 + 0.8;

  // Fresnel edge reflectance
  float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);

  // Base Cherry Cola palette lookup
  vec3 col = samplePalette(field) * diff;

  // Restrained Butter Yellow (#F6DF79 = rgb(0.965, 0.875, 0.475)) specular glint on crests
  vec3 butterYellow = vec3(0.965, 0.875, 0.475);
  col += butterYellow * spec * 0.35;

  // Soft satin rim
  col += mix(u_colors[2], vec3(1.0), 0.3) * fresnel * 0.22;

  // Film grain
  if (u_grain > 0.0) {
    float grainVal = (hash(gl_FragCoord.xy + fract(u_time * 19.41)) - 0.5) * u_grain;
    col += grainVal;
  }

  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

export function WarpGradient({
  colors = MOOD_MONEY_WARP_CONFIG.colors,
  pattern = MOOD_MONEY_WARP_CONFIG.pattern,
  density = MOOD_MONEY_WARP_CONFIG.density,
  softness = MOOD_MONEY_WARP_CONFIG.softness,
  warp = MOOD_MONEY_WARP_CONFIG.warp,
  turbulence = MOOD_MONEY_WARP_CONFIG.turbulence,
  scale = MOOD_MONEY_WARP_CONFIG.scale,
  rotation = MOOD_MONEY_WARP_CONFIG.rotation,
  speed = MOOD_MONEY_WARP_CONFIG.speed,
  grain = MOOD_MONEY_WARP_CONFIG.grain,
  glossyHighlights = true,
  vignette = true,
  satinSheen = true,
  interactiveMouse = true,
  className,
  children,
  style,
  ...props
}: WarpGradientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isInView = useInView(containerRef);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  // Mouse coords for subtle liquid displacement
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0.5,
    y: 0.5,
    targetX: 0.5,
    targetY: 0.5,
  });

  // Track pointer movement across viewport smoothly
  useEffect(() => {
    if (!interactiveMouse || typeof window === "undefined") return;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;
      if ("touches" in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ("clientX" in e) {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }
      const normX = Math.min(Math.max(clientX / window.innerWidth, 0), 1);
      const normY = Math.min(Math.max(clientY / window.innerHeight, 0), 1);
      mouseRef.current.targetX = normX;
      mouseRef.current.targetY = 1.0 - normY; // Invert for WebGL Y coordinates
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [interactiveMouse]);

  // Parse color array into 4 RGB vec3 values
  const rgbColors = useMemo(() => {
    const list: [number, number, number][] = [];
    const baseColors = colors && colors.length > 0 ? colors : MOOD_MONEY_WARP_CONFIG.colors;
    for (let i = 0; i < 4; i++) {
      const hex = baseColors[Math.min(i, baseColors.length - 1)];
      list.push(hexToRgb(hex));
    }
    return list;
  }, [colors]);

  // Reduced motion detection
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  // WebGL2 Lifecycle
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let gl: WebGL2RenderingContext | null = null;
    try {
      gl = canvas.getContext("webgl2", {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: "low-power",
      });
    } catch {
      gl = null;
    }

    if (!gl) {
      setWebglSupported(false);
      return;
    }

    function createShader(glCtx: WebGL2RenderingContext, type: number, source: string) {
      const shader = glCtx.createShader(type);
      if (!shader) return null;
      glCtx.shaderSource(shader, source);
      glCtx.compileShader(shader);
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        console.warn("Shader compile error:", glCtx.getShaderInfoLog(shader));
        glCtx.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
    if (!vs || !fs) {
      setWebglSupported(false);
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      setWebglSupported(false);
      return;
    }

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("Program link error:", gl.getProgramInfoLog(program));
      setWebglSupported(false);
      return;
    }

    gl.useProgram(program);

    // Quad geometry (full-screen triangle fan)
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);
    const vao = gl.createVertexArray();
    const vbo = gl.createBuffer();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uResLoc = gl.getUniformLocation(program, "u_resolution");
    const uTimeLoc = gl.getUniformLocation(program, "u_time");
    const uColorsLoc = gl.getUniformLocation(program, "u_colors");
    const uDensityLoc = gl.getUniformLocation(program, "u_density");
    const uSoftnessLoc = gl.getUniformLocation(program, "u_softness");
    const uWarpLoc = gl.getUniformLocation(program, "u_warp");
    const uTurbulenceLoc = gl.getUniformLocation(program, "u_turbulence");
    const uScaleLoc = gl.getUniformLocation(program, "u_scale");
    const uRotationLoc = gl.getUniformLocation(program, "u_rotation");
    const uGrainLoc = gl.getUniformLocation(program, "u_grain");
    const uPatternLoc = gl.getUniformLocation(program, "u_pattern");
    const uMouseLoc = gl.getUniformLocation(program, "u_mouse");
    const uInteractiveLoc = gl.getUniformLocation(program, "u_interactive");

    let animationFrameId: number;
    const startTime = performance.now();
    let isRunning = true;

    // Pattern map
    const patternMap: Record<WarpGradientPattern, number> = {
      bands: 0,
      swirl: 1,
      radial: 2,
      waves: 3,
    };

    const resize = () => {
      if (!canvas || !container || !gl) return;
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // Cap DPR for silky 60fps
      const w = Math.max(Math.floor(rect.width * dpr), 1);
      const h = Math.max(Math.floor(rect.height * dpr), 1);

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    resize();

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(container);

    // Flat colors array for uniform upload
    const flatColors = new Float32Array(12);
    rgbColors.forEach((rgb, idx) => {
      flatColors[idx * 3] = rgb[0];
      flatColors[idx * 3 + 1] = rgb[1];
      flatColors[idx * 3 + 2] = rgb[2];
    });

    const rotationRadians = (rotation * Math.PI) / 180;
    const patternInt = patternMap[pattern] ?? 0;

    const render = (currentTime: number) => {
      if (!gl || !isRunning) return;

      if (!isInView) {
        // Paused while out of view to save battery and GPU
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      // Smooth mouse lerp
      const m = mouseRef.current;
      m.x += (m.targetX - m.x) * 0.04;
      m.y += (m.targetY - m.y) * 0.04;

      const elapsed = prefersReducedMotion ? 0 : (currentTime - startTime) * 0.001 * speed;

      gl.useProgram(program);
      gl.bindVertexArray(vao);

      if (uResLoc) gl.uniform2f(uResLoc, canvas.width, canvas.height);
      if (uTimeLoc) gl.uniform1f(uTimeLoc, elapsed);
      if (uColorsLoc) gl.uniform3fv(uColorsLoc, flatColors);
      if (uDensityLoc) gl.uniform1f(uDensityLoc, density);
      if (uSoftnessLoc) gl.uniform1f(uSoftnessLoc, softness);
      if (uWarpLoc) gl.uniform1f(uWarpLoc, warp);
      if (uTurbulenceLoc) gl.uniform1f(uTurbulenceLoc, turbulence);
      if (uScaleLoc) gl.uniform1f(uScaleLoc, scale);
      if (uRotationLoc) gl.uniform1f(uRotationLoc, rotationRadians);
      if (uGrainLoc) gl.uniform1f(uGrainLoc, grain);
      if (uPatternLoc) gl.uniform1i(uPatternLoc, patternInt);
      if (uMouseLoc) gl.uniform2f(uMouseLoc, m.x, m.y);
      if (uInteractiveLoc) gl.uniform1f(uInteractiveLoc, interactiveMouse ? 1.0 : 0.0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    // Context loss safety
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
    };
    const handleContextRestored = () => {
      setWebglSupported(false);
    };
    canvas.addEventListener("webglcontextlost", handleContextLost, false);
    canvas.addEventListener("webglcontextrestored", handleContextRestored, false);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);
      if (gl) {
        gl.deleteProgram(program);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        gl.deleteBuffer(vbo);
        gl.deleteVertexArray(vao);
      }
    };
  }, [
    rgbColors,
    pattern,
    density,
    softness,
    warp,
    turbulence,
    scale,
    rotation,
    speed,
    grain,
    isInView,
    prefersReducedMotion,
    interactiveMouse,
  ]);

  // CSS fallback gradient
  const cssFallbackGradient = useMemo(() => {
    const c = colors && colors.length > 0 ? colors : MOOD_MONEY_WARP_CONFIG.colors;
    return `radial-gradient(130% 110% at -10% -20%, ${c[0]} 0%, ${c[1]} 30%, ${c[2]} 65%, ${c[3]} 100%)`;
  }, [colors]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative isolate overflow-hidden select-none",
        className
      )}
      style={style}
      {...props}
    >
      {/* 1. Underlying WebGL2 Canvas / CSS Fallback */}
      {webglSupported ? (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 w-full h-full z-0 pointer-events-none object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 w-full h-full z-0 pointer-events-none"
          style={{ background: cssFallbackGradient }}
        />
      )}

      {/* 2. Soft Glossy Lighting (Specular highlight from top-left) */}
      {glossyHighlights && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[1] pointer-events-none mix-blend-screen opacity-65"
          style={{
            background:
              "radial-gradient(ellipse 65% 50% at 20% 15%, rgba(255, 255, 255, 0.45) 0%, rgba(246, 223, 121, 0.14) 35%, transparent 65%)",
          }}
        />
      )}

      {/* 3. Satin Sheen (Diagonal flowing wave) */}
      {satinSheen && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[1] pointer-events-none opacity-40"
          style={{
            background:
              "linear-gradient(135deg, rgba(242, 198, 213, 0.18) 0%, transparent 40%, rgba(233, 67, 85, 0.08) 70%, transparent 100%)",
          }}
        />
      )}

      {/* 4. Subtle Edge Shading / Vignette */}
      {vignette && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[2] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(41, 34, 37, 0.22) 100%)",
          }}
        />
      )}

      {/* 5. Foreground Content */}
      {children}
    </div>
  );
}

export default WarpGradient;
