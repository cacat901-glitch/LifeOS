"use client";

import { useEffect, useRef } from "react";

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
  vec2 q=uv+flow*vec2(.018,.045)+vec2(pointer.y*.001,pointer.y*.003);
  float h=density(q,bottom)*.6+(density(q+vec2(.0015,.002),bottom)+density(q-vec2(.0015,.002),bottom))*.2;
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
  float volume=h*(.68+reflection*.32)+advected*.035+diffuse*.15;
  float threads=caustic*pow(h,1.5)*(.035+.07*fresnel);
  float rim=clamp(length(vec2(dx,dy)),0.,.12)*.04;
  vec3 silver=mix(vec3(.63,.72,.85),vec3(.91,.96,1.),reflection*.6+caustic*.4);
  return (silver*volume+vec3(.8,.9,1.)*(threads+rim))*strength;
}
vec3 undercurrent(vec2 p) {
  float arch=.24+.8*pow(p.x-.43,2.);
  float disturbance=(fbm(vec2(p.x*7.-time*.04,p.y*3.+time*.03))-.5)*.045;
  float d=p.y-arch+disturbance;
  float width=.037+.065*gaussian(p.x-.47,.3);
  float body=gaussian(d,width)*.14;
  float edges=gaussian(d+width*.45,.006)*.2+gaussian(d-width*.4,.004)*.24;
  float interior=pow(.5+.5*sin(d*270.+fbm(vec2(p.x*5.-time*.1,d*12.))*13.),12.);
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
  vec2 p=(pixel/resolution*vec2(consoleSize.x+160.,consoleSize.y+190.)-vec2(80.,0.))/consoleSize;
  vec3 light=vec3(0.);
  // Main crest and fork occupy the hero and enter the metric row.
  vec2 hero=vec2((p.x-.14)/.9,p.y*consoleSize.y/heroHeight);
  light+=silk(hero,0.,.28);
  vec2 heroVolume=vec2((p.x-.15)/.91,(p.y*consoleSize.y/(heroHeight+40.)+.02)/1.16);
  light+=liquidVolume(heroVolume,0.,1.6);
  vec2 fork=hero; fork.y=1.42-hero.y; fork.x+=.03;
  light+=silk(fork,0.,.12)*smoothstep(.56,.85,hero.x);
  // A single continuous diagonal connecting the hero to the first instruments.
  vec2 bridge=vec2(1.-p.x,(p.y-.24)*5.);
  vec2 channel=vec2(.38+(p.x-(.28+.026*sin((p.y-.31)*30.)))*2.2,(p.y-.28)*3.4);
  light+=liquidVolume(channel,2.,.9)*gaussian(p.x-.29,.052);
  // Local material behind Recent Activity, and a restrained Today trace.
  vec2 activity=vec2((p.x-.63)*3.,(p.y-.65)*4.);
  light+=liquidVolume(vec2((p.x-.64)*2.8,(p.y-.7)*3.3),2.,1.75)*smoothstep(.64,.7,p.x);
  vec2 today=vec2(p.x*3.4,(p.y-.82)*6.);
  light+=liquidVolume(vec2(p.x*3.3,(p.y-.69)*3.4),3.,1.7)*(1.-smoothstep(.29,.36,p.x));
  // Decorative dormant signal, deliberately not a historical data chart.
  light+=silk(vec2((p.x-.82)*6.,(p.y-.435)*28.),2.,.85)*smoothstep(.82,.85,p.x);
  // Wide intersecting arcs beneath the console, not a scrolling background.
  vec2 lower=vec2((p.x+.13)/1.2,(p.y-.87)*4.4);
  light+=liquidVolume(vec2((p.x+.16)/1.25,(p.y-.86)*2.8+.5*pow(p.x-.4,2.)),1.,.62);
  light+=undercurrent(vec2(p.x,(p.y-.96)*4.4));
  light+=silk(lower,1.,.3);
  vec2 crossing=vec2(lower.x,1.1-lower.y);
  light+=silk(crossing,2.,.15);
  // Filmic compression preserves internal detail at the silver crest.
  light=1.-exp(-light*1.5);
  vec2 screen=pixel/resolution;
  light*=smoothstep(0.,.075,screen.x)*(1.-smoothstep(.91,1.,screen.x))*(1.-smoothstep(.92,1.,screen.y));
  float alpha=clamp(max(light.r,max(light.g,light.b)),0.,.95);
  gl_FragColor=vec4(light,alpha);
}
`;

export function NowLiquidField({ pixelRatioCap = 1.35 }: { pixelRatioCap?: number }) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
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
      if (!desktop.matches || reduced.matches) return;
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
        loadDensity(2,"activityMap","/media/novus-activity-stream.png");
        loadDensity(3,"todayMap","/media/novus-today-signal.png");
        buffer=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
        const position=gl.getAttribLocation(program,"position");
        gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
        const uniforms={ resolution:gl.getUniformLocation(program,"resolution"),size:gl.getUniformLocation(program,"consoleSize"),time:gl.getUniformLocation(program,"time"),pointer:gl.getUniformLocation(program,"pointer"),hero:gl.getUniformLocation(program,"heroHeight") };
        let frame=0, elapsed=0, previous=0, inView=true, contextLost=false;
        let px=.5, py=0, tx=.5, ty=0;
        const parent=element.parentElement!;
        const resize=()=>{
          const bounds=element.getBoundingClientRect();
          // Explicit quality ceiling; a single context covers the complete console.
          const ratio=Math.min(devicePixelRatio || 1,Math.max(.75,Math.min(2,pixelRatioCap)));
          surface.width=Math.round(bounds.width*ratio); surface.height=Math.round(bounds.height*ratio);
          gl.viewport(0,0,surface.width,surface.height);
          gl.uniform2f(uniforms.resolution,surface.width,surface.height);
          gl.uniform2f(uniforms.size,parent.clientWidth,parent.clientHeight);
          gl.uniform1f(uniforms.hero,parent.querySelector(".now-desktop__hero")?.clientHeight || 300);
        };
        const draw=(now:number)=>{
          if(document.hidden || !inView || contextLost) { previous=0; frame=0; return; }
          if(previous) elapsed+=Math.min((now-previous)/1000,.05);
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
        parent.addEventListener("pointermove",move);parent.addEventListener("pointerleave",leave);
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
  }, [pixelRatioCap]);
  return <div ref={root} className="now-liquid-field" aria-hidden="true" data-renderer="fallback"><canvas ref={canvas}/><div className="now-liquid-field__fallback" /></div>;
}
