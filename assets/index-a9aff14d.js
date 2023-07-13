import*as r from"three";import{OrbitControls as x}from"three/addons/controls/OrbitControls.js";(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))l(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const a of t.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&l(a)}).observe(document,{childList:!0,subtree:!0});function m(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function l(e){if(e.ep)return;e.ep=!0;const t=m(e);fetch(e.href,t)}})();const h=`#define GLSLIFY 1
varying vec3 vNormal;
varying vec2 vUv;
uniform float time;
uniform sampler2D textureA;

#define TEXEL_SIZE 1.0 / 512.0

vec3 tex(vec2 uv);
highp float random(vec2 co)
{
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt= dot(co.xy ,vec2(a,b));
    highp float sn= mod(dt,3.14);
    return fract(sin(sn) * c);
}

#ifndef TAU
  #define TAU 6.28318530718
#endif

//Use last part of hash function to generate new random radius and angle
vec2 mult(inout vec2 r) {
  r = fract(r * vec2(12.9898,78.233));
  return sqrt(r.x + .001) * vec2(sin(r.y * TAU), cos(r.y * TAU));
}

vec3 blur(vec2 uv, float radius, float aspect, float offset) {
  vec2 circle = vec2(radius);
  circle.x *= aspect;
  vec2 rnd = vec2(random(vec2(uv + offset)));

  vec3 acc = vec3(0.0);
  for (int i = 0; i < 20; i++) {
    acc += tex(uv + circle * mult(rnd)).xyz;
  }
  return acc / float(20);
}

vec3 blur(vec2 uv, float radius, float aspect) {
  return blur(uv, radius, aspect, 0.0);
}

vec3 blur(vec2 uv, float radius) {
  return blur(uv, radius, 1.0);
}

//
// Description : Array and textureless GLSL 2D simplex noise function.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x*34.0)+1.0)*x);
}

float snoise(vec2 v)
  {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
// First corner
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);

// Other corners
  vec2 i1;
  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
  //i1.y = 1.0 - i1.x;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  // x0 = x0 - 0.0 + 0.0 * C.xx ;
  // x1 = x0 - i1 + 1.0 * C.xx ;
  // x2 = x0 - 1.0 + 2.0 * C.xx ;
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

// Permutations
  i = mod289(i); // Avoid truncation effects in permutation
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));

  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;

// Gradients: 41 points uniformly over a line, mapped onto a diamond.
// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

// Normalise gradients implicitly by scaling m
// Approximation of: m *= inversesqrt( a0*a0 + h*h );
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

// Compute final noise value at P
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float aastep(float threshold, float value) {
  #ifdef GL_OES_standard_derivatives
    float afwidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757;
    return smoothstep(threshold-afwidth, threshold+afwidth, value);
  #else
    return step(threshold, value);
  #endif  
}

vec3 halftone(vec3 texcolor, vec2 st, float frequency) {
  float n = 0.1*snoise(st*200.0); // Fractal noise
  n += 0.05*snoise(st*400.0);
  n += 0.025*snoise(st*800.0);
  vec3 white = vec3(n*0.2 + 0.97);
  vec3 black = vec3(n + 0.1);

  // Perform a rough RGB-to-CMYK conversion
  vec4 cmyk;
  cmyk.xyz = 1.0 - texcolor;
  cmyk.w = min(cmyk.x, min(cmyk.y, cmyk.z)); // Create K
  cmyk.xyz -= cmyk.w; // Subtract K equivalent from CMY

  // Distance to nearest point in a grid of
  // (frequency x frequency) points over the unit square
  vec2 Kst = frequency*mat2(0.707, -0.707, 0.707, 0.707)*st;
  vec2 Kuv = 2.0*fract(Kst)-1.0;
  float k = aastep(0.0, sqrt(cmyk.w)-length(Kuv)+n);
  vec2 Cst = frequency*mat2(0.966, -0.259, 0.259, 0.966)*st;
  vec2 Cuv = 2.0*fract(Cst)-1.0;
  float c = aastep(0.0, sqrt(cmyk.x)-length(Cuv)+n);
  vec2 Mst = frequency*mat2(0.966, 0.259, -0.259, 0.966)*st;
  vec2 Muv = 2.0*fract(Mst)-1.0;
  float m = aastep(0.0, sqrt(cmyk.y)-length(Muv)+n);
  vec2 Yst = frequency*st; // 0 deg
  vec2 Yuv = 2.0*fract(Yst)-1.0;
  float y = aastep(0.0, sqrt(cmyk.z)-length(Yuv)+n);

  vec3 rgbscreen = 1.0 - 0.9*vec3(c,m,y) + n;
  return mix(rgbscreen, black, 0.85*k + 0.3*n);
}

vec3 halftone(vec3 texcolor, vec2 st) {
  return halftone(texcolor, st, 30.0);
}

float checker(vec2 uv, float repeats) {
  float cx = floor(repeats * uv.x);
  float cy = floor(repeats * uv.y); 
  float result = mod(cx + cy, 2.0);
  return sign(result);
}

vec3 tex(vec2 uv) {
  return texture2D(textureA, uv).rgb;
}

void main( void ) {
  //the checker box
  vec3 colorA = vNormal * 0.5 + 0.5;
  colorA += vec3(checker(vUv, 15.0)) * 0.05;

  //our texture with halftone + hash blur
  float dist = length(vUv - 0.5);
  float falloff = smoothstep(0.3, 0.7, dist);
  float radius = TEXEL_SIZE * 40.0;
  radius *= falloff;
  vec3 colorB = blur(vUv, radius, 1.0);
  falloff = smoothstep(0.5, 0.0, dist);
  colorB = mix(colorB, halftone(colorB, vUv, 35.0), falloff);

  //mix the two
  float blend = smoothstep(0.0, 0.7, vNormal.z);
  gl_FragColor.rgb = mix(colorA, colorB, blend);
  gl_FragColor.a = 1.0;
}`,p=`#define GLSLIFY 1
varying vec3 vNormal;
varying vec2 vUv;

void main() {
  vUv = uv;
  vNormal = position.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;const{innerWidth:f,innerHeight:u}=window,v=document.querySelector("#app"),d=new r.Scene,y=f/u,c=new r.PerspectiveCamera(50,y);c.position.set(-1.5,1.5,3);const n=new r.WebGLRenderer({antialias:!0});n.setPixelRatio(window.devicePixelRatio);n.setSize(f,u);v&&v.appendChild(n.domElement);const g=new x(c,n.domElement);g.addEventListener("change",s);const w=new r.ShaderMaterial({vertexShader:p,fragmentShader:h,uniforms:{textureA:{value:new r.TextureLoader().load("./baboon.png",s)},time:{value:0}}}),b=new r.BoxGeometry,C=new r.Mesh(b,w);d.add(C);function s(){n.render(d,c)}window.addEventListener("resize",()=>{const{innerWidth:i,innerHeight:o}=window;c.aspect=i/o,c.updateProjectionMatrix(),n.setSize(i,o),s()});
