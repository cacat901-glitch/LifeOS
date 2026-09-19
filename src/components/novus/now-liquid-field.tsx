"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/hooks/use-store";

// One transparent WebGL surface owns all desktop Now liquid. The same material
// is evaluated along authored hero, card and under-console flow paths. Existing
// plates supply density/height only: local advection, normals, refraction and
// caustics are evaluated per pixel. No rigidly transformed image is composited.
const VERTEX = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0., 1.); }
`;
const FRAGMENT = `
precision highp float;
uniform vec2 resolution;
uniform vec2 consoleSize;
uniform vec2 pointer;
uniform float time;
uniform float heroHeight;
uniform float mobileLayout;
uniform float secondaryLayout;
uniform float spaceVariant;
uniform sampler2D densityMap;
uniform sampler2D bottomMap;
uniform sampler2D activityMap;
uniform sampler2D todayMap;
float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p) {
  vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);
}
float fbm(vec2 p) { return .57*noise(p)+.28*noise(p*2.03)+.15*noise(p*4.01); }
float gaussian(float x, float w) { return exp(-x*x/(w*w)); }
float density(vec2 uv, float bottom) {
  vec4 sampleValue=bottom>2.5?texture2D(todayMap,uv):bottom>1.5?texture2D(activityMap,uv):bottom>.5?texture2D(bottomMap,uv):texture2D(densityMap,uv);
  float edge=smoothstep(0.,.07,uv.x)*(1.-smoothstep(.94,1.,uv.x))*smoothstep(0.,.08,uv.y)*(1.-smoothstep(.88,1.,uv.y));
  return dot(sampleValue.rgb,vec3(.299,.587,.114))*sampleValue.a*edge;
}
vec3 liquidVolume(vec2 uv, float bottom, float strength) {
  if(uv.x<0. || uv.x>1. || uv.y<0. || uv.y>1.) return vec3(0.);
  vec2 flow=vec2(fbm(uv*vec2(6.,4.)+vec2(-time*.06,time*.04)),fbm(uv*vec2(8.,5.)+vec2(time*.04,-time*.055)))-.5;
  vec2 q=uv+flow*vec2(.01,.026)+vec2(pointer.y*.001,pointer.y*.003);
  float h=density(q,bottom)*.7+(density(q+vec2(.002,.003),bottom)+density(q-vec2(.002,.003),bottom))*.15;
  float dx=density(q+vec2(.004,0),bottom)-density(q-vec2(.004,0),bottom);
  float dy=density(q+vec2(0,.008),bottom)-density(q-vec2(0,.008),bottom);
  vec3 normal=normalize(vec3(-dx*3.,-dy*3.,.55));
  vec3 lamp=normalize(vec3(.3+pointer.x*.2,-.6,.8));
  float reflection=pow(max(dot(normal,lamp),0.),6.);
  float fresnel=pow(1.-normal.z,2.);
  float veins=fbm(vec2(q.x*42.-time*.32,q.y*76.+flow.x*3.));
  float caustic=pow(max(0.,1.-abs(veins-.49)*9.),9.);
  float advected=density(q+normal.xy*.012+flow*.025,bottom);
  // The sampled density establishes shape; animated optical terms establish
  // the surface. Separate depths refract differently rather than translating.
  float diffuse=(density(q+vec2(.012,.02),bottom)+density(q-vec2(.012,.02),bottom))*.5;
  // Separate translucent body from silver ridges: dark folds remain visible
  // even when the crest catches the light.
  float volume=pow(h,1.5)*(.6+reflection*.5)+advected*.02+diffuse*.09;
  // Stage 1K precision enhancement is restricted to the Today signal map.
  // Hero (0), bottom flow (1), and activity material (2) are unchanged.
  if(bottom>2.5) volume+=pow(density(q,bottom),2.)*.27;
  float threads=caustic*pow(h,1.5)*(.035+.07*fresnel);
  float rim=clamp(length(vec2(dx,dy)),0.,.12)*.04;
  vec3 silver=mix(vec3(.63,.72,.85),vec3(.91,.96,1.),reflection*.6+caustic*.4);
  return (silver*volume+vec3(.8,.9,1.)*(threads+rim))*strength;
}
vec3 undercurrent(vec2 p) {
  float arch=.24+.8*pow(p.x-.43,2.);
  float disturbance=(fbm(vec2(p.x*4.-time*.04,p.y*2.+time*.03))-.5)*.025;
  float d=p.y-arch+disturbance;
  float width=.052+.085*gaussian(p.x-.47,.3);
  float body=gaussian(d,width)*.26;
  float edges=gaussian(d+width*.45,.006)*.2+gaussian(d-width*.4,.004)*.24;
  float interior=pow(.5+.5*sin(d*170.+fbm(vec2(p.x*4.-time*.1,d*8.))*7.),12.);
  float light=body+interior*gaussian(d,width)*.09+edges;
  return vec3(.73,.84,1.)*light*(1.-smoothstep(.75,1.2,abs(p.x-.45)*2.));
}

// Two unequal lobes sculpt the crest; the downstream fork passes above and
// below the dial. Local advection changes the internal folds, not the frame.
float path(float x, float variant) {
  if(variant<.5) return .88-.55*gaussian(x-.65,.13)-.54*smoothstep(.66,1.15,x);
  if(variant<1.5) return .57-.18*gaussian(x-.44,.36)+.26*smoothstep(.5,1.1,x);
  return .66-.19*gaussian(x-.47,.38)+.12*smoothstep(.6,1.2,x);
}
vec3 silk(vec2 p, float variant, float strength) {
  float x=p.x;
  float envelope=smoothstep(.02,.28,x)*(1.-smoothstep(.94,1.17,x));
  float crest=gaussian(x-.64,.15);
  float curl=fbm(vec2(x*6.-time*.065,variant*9.+time*.045))-.5;
  float centre=path(x,variant)+curl*.065;
  centre+=pointer.y*.009*gaussian(x-pointer.x,.3);
  float d=p.y-centre;
  float spread=mix(.027,.095,crest);
  if(variant>.5) spread=.045+.023*gaussian(x-.55,.4);
  // Variable refraction produces crossing internal grain and narrow caustics.
  float distortion=(fbm(vec2(x*13.-time*.13,d*9.+time*.09))-.5);
  float refracted=d+distortion*.045*envelope;
  float body=gaussian(refracted,spread*1.5);
  vec3 light=vec3(.42,.5,.6)*body*.07;
  for(int i=0;i<20;i++) {
    float f=float(i)/19.;
    float seed=float(i)*2.39996;
    float split=(f-.5)*2.;
    float fold=split*spread*(1.+.7*sin(x*6.+seed+time*.075));
    fold+=sin(x*17.+seed+time*.14)*.004*envelope;
    // Separate and rejoin into nonparallel filaments at the crest.
    fold+=crest*sin(x*28.+seed*.31-time*.12)*.012;
    float distance=abs(refracted-fold);
    float filament=gaussian(distance,.00085+f*.00045);
    float surface=gaussian(distance,.004+f*.007);
    float traveling=.5+.5*sin(x*24.-time*.7+seed);
    float exposure=.35+.65*gaussian(x-.62,.22);
    float vein=pow(noise(vec2(x*38.-time*.35,seed)),3.);
    light+=vec3(.76,.86,1.)*(surface*.009+filament*(.09+vein*.24)*traveling)*exposure;
  }
  // Fine suspended points in the same flowing coordinate system.
  vec2 cell=vec2(x*420.-time*.65,(d+distortion*.02)*420.);
  vec2 grid=floor(cell); vec2 uv=fract(cell)-.5;
  float particle=gaussian(length(uv),.12)*step(.973,hash(grid));
  light+=vec3(.73,.85,1.)*particle*.6*gaussian(d,.095)*crest;
  return light*envelope*strength;
}
void main() {
  vec2 pixel=vec2(gl_FragCoord.x,resolution.y-gl_FragCoord.y);
  if(secondaryLayout>.5) {
    vec2 s=pixel/resolution;
    float variant=spaceVariant;
    vec3 secondaryLight=vec3(0.);
    if(mobileLayout>.5) {
      // Secondary Spaces retain the same refractive material on phones with a
      // deliberately cheaper two-volume composition and no filament loop.
      vec2 upper=vec2(s.x*1.08-.02,(s.y+.02)*2.45+.05*sin(s.x*5.+variant));
      secondaryLight+=liquidVolume(upper,0.,1.48);
      vec2 lower=vec2(s.x*1.28-.12,(s.y-.43)*2.7+.24*pow(s.x-.48,2.)+variant*.025);
      secondaryLight+=liquidVolume(lower,1.,1.18);
      secondaryLight*=mix(.34,1.,smoothstep(.08,.72,s.x));
    } else {
      // One authored field crosses header, overview and working surface. The
      // variant only shifts composition; it never encodes user information.
      vec2 upper=vec2(s.x*1.08-.02,s.y*2.2+.04*sin(s.x*6.+variant*1.7));
      secondaryLight+=liquidVolume(upper,0.,1.58);
      vec2 bridge=vec2(s.x*1.34-.16,(s.y-.25)*2.65+.19*pow(s.x-(.38+variant*.035),2.));
      secondaryLight+=liquidVolume(bridge,2.,1.42);
      vec2 lower=vec2(s.x*1.18-.08,(s.y-.63)*2.75+.35*pow(s.x-.52,2.));
      secondaryLight+=liquidVolume(lower,1.,.72);
      vec2 thread=vec2(s.x*1.18-.09,s.y*1.75+.08+variant*.035);
      secondaryLight+=silk(thread,variant<1.5?1.:2.,.15);
      secondaryLight*=mix(.28,1.,smoothstep(.03,.7,s.x));
    }
    secondaryLight*=variant<.5?1.28:1.;
    secondaryLight=1.-exp(-secondaryLight*1.55);
    secondaryLight*=smoothstep(0.,.045,s.x)*(1.-smoothstep(.95,1.,s.x));
    secondaryLight*=smoothstep(0.,.025,s.y)*(1.-smoothstep(.94,1.,s.y));
    float secondaryAlpha=clamp(max(secondaryLight.r,max(secondaryLight.g,secondaryLight.b)),0.,.9);
    gl_FragColor=vec4(secondaryLight,secondaryAlpha);
    return;
  }
  if(mobileLayout>.5) {
    // Phone composition: the same optical material, fewer layers and no silk
    // particle loop. A broad right-hand crest folds into the primary dial.
    vec2 m=pixel/resolution;
    vec2 crest=vec2(.25+m.x*.78,(m.y+.06)*2.2);
    vec3 mobileLight=liquidVolume(crest,0.,1.6);
    vec2 cradle=vec2(m.x*.92+.05,(m.y-.46)*2.4+(m.x-.4)*.35);
    mobileLight+=liquidVolume(cradle,1.,1.4);
    mobileLight=1.-exp(-mobileLight*1.5);
    // Keep the editorial text quiet; avoid rectangular canvas boundaries.
    mobileLight*=mix(.22,1.,smoothstep(.24,.8,m.x));
    mobileLight*=smoothstep(0.,.04,m.y)*(1.-smoothstep(.84,1.,m.y));
    mobileLight*=smoothstep(0.,.04,m.x)*(1.-smoothstep(.97,1.,m.x));
    gl_FragColor=vec4(mobileLight,clamp(max(mobileLight.r,max(mobileLight.g,mobileLight.b)),0.,.95));
    return;
  }
  vec2 p=(pixel/resolution*vec2(consoleSize.x+160.,consoleSize.y+190.)-vec2(80.,0.))/consoleSize;
  vec3 light=vec3(0.);
  // Main crest and fork occupy the hero and enter the metric row.
  vec2 hero=vec2((p.x-.14)/.9,p.y*consoleSize.y/heroHeight);
  light+=silk(hero,0.,.12);
  vec2 heroVolume=vec2((p.x-.15)/.91,(p.y*consoleSize.y/(heroHeight+40.)+.075)/1.16);
  heroVolume.y-=.11*gaussian(heroVolume.x-.32,.22);
  light+=liquidVolume(heroVolume,0.,1.65);
  vec2 fork=hero; fork.y=1.42-hero.y; fork.x+=.03;
  light+=silk(fork,0.,.12)*smoothstep(.56,.85,hero.x);
  // A single continuous diagonal connecting the hero to the first instruments.
  vec2 bridge=vec2(1.-p.x,(p.y-.24)*5.);
  vec2 channel=vec2(.38+(p.x-(.28+.026*sin((p.y-.31)*30.)))*2.2,(p.y-.28)*3.4);
  light+=liquidVolume(channel,2.,1.45)*gaussian(p.x-.29,.065);
  // Local material behind Recent Activity, and a restrained Today trace.
  vec2 activity=vec2((p.x-.63)*3.,(p.y-.65)*4.);
  light+=liquidVolume(vec2((p.x-.64)*2.8,(p.y-.69)*3.3),2.,2.05)*smoothstep(.64,.7,p.x);
  vec2 today=vec2(p.x*3.4,(p.y-.82)*6.);
  light+=liquidVolume(vec2((p.x-.025)*3.3,(p.y-.72)*3.4),3.,2.1)*(1.-smoothstep(.29,.36,p.x));
  // Broad reflected light connects the lower optical instruments to the flow.
  // It shares the material clock, and never encodes user data.
  float pickup=gaussian(p.y-.94,.075)*( .76+.08*sin(time*.18+p.x*4.));
  light+=vec3(.055,.078,.11)*pickup*(.45+.55*gaussian(p.x-.77,.4));
  // Decorative dormant signal, deliberately not a historical data chart.
  light+=silk(vec2((p.x-.82)*6.,(p.y-.435)*28.),2.,.28)*smoothstep(.82,.85,p.x);
  // Wide intersecting arcs beneath the console, not a scrolling background.
  vec2 lower=vec2((p.x+.13)/1.2,(p.y-.87)*4.4);
  light+=liquidVolume(vec2((p.x+.16)/1.25,(p.y-.86)*2.8+.5*pow(p.x-.4,2.)),1.,.32);
  light+=undercurrent(vec2(p.x,(p.y-.96)*4.4));
  light+=silk(lower,1.,.14);
  vec2 crossing=vec2(lower.x,1.1-lower.y);
  light+=silk(crossing,2.,.07);
  // Filmic compression preserves internal detail at the silver crest.
  light=1.-exp(-light*1.5);
  vec2 screen=pixel/resolution;
  light*=smoothstep(0.,.075,screen.x)*(1.-smoothstep(.91,1.,screen.x))*(1.-smoothstep(.92,1.,screen.y));
  float alpha=clamp(max(light.r,max(light.g,light.b)),0.,.95);
  gl_FragColor=vec4(light,alpha);
}
`;

export function NowLiquidField({ pixelRatioCap = 1.35, mobile = false, intelligence = false, secondary = false, spaceVariant = 0, activity = 1 }: { pixelRatioCap?: number; mobile?: boolean; intelligence?: boolean; secondary?: boolean; spaceVariant?: number; activity?: number }) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const novusOpen = useAppStore(state => state.novusOpen);
  const activityRef = useRef(activity);
  activityRef.current = activity;
  useEffect(() => {
    const element = root.current;
    const surface = canvas.current;
    if (!element || !surface) return;
    const desktop = matchMedia("(min-width: 1024px)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let dispose: (() => void) | undefined;

    const initialize = () => {
      dispose?.(); dispose = undefined;
      element.dataset.renderer = "fallback";
      if ((!intelligence && ((!secondary && desktop.matches === mobile) || novusOpen)) || reduced.matches) return;
      const gl = surface.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, powerPreference: "high-performance" });
      if (!gl) return;
      const resources: WebGLShader[] = [];
      let program: WebGLProgram | null = null;
      let buffer: WebGLBuffer | null = null;
      const textures: WebGLTexture[] = [];
      const images: HTMLImageElement[] = [];
      let resourcesLost = false;
      const release = () => {
        // A restored context has a new resource generation. Lost objects were
        // already reclaimed by the browser and cannot be deleted in that one.
        if (!resourcesLost) {
          if (buffer) gl.deleteBuffer(buffer);
          if (program) gl.deleteProgram(program);
          resources.forEach(shader => gl.deleteShader(shader));
          textures.forEach(texture => gl.deleteTexture(texture));
        }
        images.forEach(image => { image.onload = null; image.onerror = null; });
      };
      try {
        const compile = (type: number, source: string) => {
          const shader = gl.createShader(type);
          if (!shader) throw new Error("Liquid shader allocation failed");
          resources.push(shader); gl.shaderSource(shader, source); gl.compileShader(shader);
          if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || "Liquid shader compilation failed");
          return shader;
        };
        program = gl.createProgram();
        if (!program) throw new Error("Liquid program allocation failed");
        gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
        gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Liquid program linking failed");
        gl.useProgram(program);
        gl.uniform1f(gl.getUniformLocation(program,"mobileLayout"),secondary ? (desktop.matches ? 0 : 1) : mobile ? 1 : 0);
        gl.uniform1f(gl.getUniformLocation(program,"secondaryLayout"),secondary ? 1 : 0);
        gl.uniform1f(gl.getUniformLocation(program,"spaceVariant"),spaceVariant);
        const loadDensity=(unit:number,name:string,url:string)=>{
          const texture=gl.createTexture(); if(!texture) throw new Error("Liquid texture allocation failed");
          textures.push(texture);gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,texture);
          gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,0]));
          gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
          gl.uniform1i(gl.getUniformLocation(program!,name),unit);
          const image=new Image();images.push(image);
          image.onload=()=>{gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);};
          image.onerror=()=>{dispose?.();dispose=undefined;element.dataset.renderer="fallback";};
          image.src=url;
        };
        loadDensity(0,"densityMap","/media/novus-hero-liquid.png");
        loadDensity(1,"bottomMap","/media/novus-bottom-flow.png");
        if (!mobile) {
          loadDensity(2,"activityMap","/media/novus-activity-stream.png");
          loadDensity(3,"todayMap","/media/novus-today-signal.png");
        }
        buffer=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
        const position=gl.getAttribLocation(program,"position");
        gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
        const uniforms={ resolution:gl.getUniformLocation(program,"resolution"),size:gl.getUniformLocation(program,"consoleSize"),time:gl.getUniformLocation(program,"time"),pointer:gl.getUniformLocation(program,"pointer"),hero:gl.getUniformLocation(program,"heroHeight") };
        let frame=0, elapsed=0, previous=0, inView=true, contextLost=false, speed=1;
        let px=.5, py=0, tx=.5, ty=0;
        const parent=element.parentElement!;
        const resize=()=>{
          const bounds=element.getBoundingClientRect();
          // Explicit quality ceiling; a single context covers the complete console.
          const ratio=Math.min(devicePixelRatio || 1,Math.max(.75,Math.min((mobile || (secondary && !desktop.matches)) ? 1.2 : 2,pixelRatioCap)));
          surface.width=Math.round(bounds.width*ratio); surface.height=Math.round(bounds.height*ratio);
          gl.viewport(0,0,surface.width,surface.height);
          gl.uniform2f(uniforms.resolution,surface.width,surface.height);
          gl.uniform2f(uniforms.size,parent.clientWidth,parent.clientHeight);
          gl.uniform1f(uniforms.hero,parent.querySelector(".now-desktop__hero")?.clientHeight || 300);
        };
        const draw=(now:number)=>{
          if(document.hidden || !inView || contextLost) { previous=0; frame=0; return; }
          speed+=(activityRef.current-speed)*.025;
          if(previous) elapsed+=Math.min((now-previous)/1000,.05)*(intelligence ? speed : 1);
          previous=now; px+=(tx-px)*.035; py+=(ty-py)*.035;
          gl.uniform1f(uniforms.time,elapsed); gl.uniform2f(uniforms.pointer,px,py);
          gl.drawArrays(gl.TRIANGLES,0,6);
          frame=requestAnimationFrame(draw);
        };
        const resume=()=>{ if(!frame && !document.hidden && inView && !contextLost) frame=requestAnimationFrame(draw); };
        const observer=new ResizeObserver(resize); observer.observe(parent);
        const intersection=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;resume();}); intersection.observe(element);
        const move=(event:PointerEvent)=>{
          if(event.pointerType!=="mouse") return;
          const b=parent.getBoundingClientRect(); tx=(event.clientX-b.left)/b.width;ty=(event.clientY-b.top)/b.height-.5;
        };
        const leave=()=>{tx=.5;ty=0;};
        if (!mobile) { parent.addEventListener("pointermove",move);parent.addEventListener("pointerleave",leave); }
        document.addEventListener("visibilitychange",resume);
        const lost=(event:Event)=>{event.preventDefault();contextLost=true;resourcesLost=true;cancelAnimationFrame(frame);frame=0;element.dataset.renderer="fallback";};
        surface.addEventListener("webglcontextlost",lost);
        resize();element.dataset.renderer="webgl";resume();
        dispose=()=>{cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();parent.removeEventListener("pointermove",move);parent.removeEventListener("pointerleave",leave);document.removeEventListener("visibilitychange",resume);surface.removeEventListener("webglcontextlost",lost);release();};
      } catch(error) { release(); console.warn("Novus liquid fallback:",error); }
    };
    initialize();desktop.addEventListener("change",initialize);reduced.addEventListener("change",initialize);
    surface.addEventListener("webglcontextrestored",initialize);
    return ()=>{dispose?.();desktop.removeEventListener("change",initialize);reduced.removeEventListener("change",initialize);surface.removeEventListener("webglcontextrestored",initialize);};
  }, [pixelRatioCap, mobile, intelligence, secondary, spaceVariant, novusOpen]);
  return <div ref={root} className={`now-liquid-field${mobile ? " now-liquid-field--mobile" : ""}`} aria-hidden="true" data-renderer="fallback"><canvas ref={canvas}/><div className="now-liquid-field__fallback" /></div>;
}
