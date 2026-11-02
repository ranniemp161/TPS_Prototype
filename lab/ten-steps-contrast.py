# Ten accent steps (TJ, 2 Nov 2026). Oklch steps and WCAG contrast, sRGB relative luminance.
import math, json
def s2l(c): return c/12.92 if c <= .04045 else ((c+.055)/1.055)**2.4
def l2s(c): return 12.92*c if c <= .0031308 else 1.055*c**(1/2.4)-.055
def hex2rgb(h): h=h.lstrip('#'); return [int(h[i:i+2],16)/255 for i in (0,2,4)]
def rgb2hex(r): return '#'+''.join('%02X'%round(min(1,max(0,x))*255) for x in r)
def to_oklch(h):
    r,g,b=[s2l(x) for x in hex2rgb(h)]
    l=.4122214708*r+.5363325363*g+.0514459929*b; m=.2119034982*r+.6806995451*g+.1073969566*b; s=.0883024619*r+.2817188376*g+.6299787005*b
    l,m,s=[math.copysign(abs(x)**(1/3),x) for x in (l,m,s)]
    L=.2104542553*l+.7936177850*m-.0040720468*s; A=1.9779984951*l-2.4285922050*m+.4505937099*s; B=.0259040371*l+.7827717662*m-.8086757660*s
    return L, math.hypot(A,B), math.degrees(math.atan2(B,A))%360
def from_oklch(L,C,H):
    A=C*math.cos(math.radians(H)); B=C*math.sin(math.radians(H))
    l=(L+.3963377774*A+.2158037573*B)**3; m=(L-.1055613458*A-.0638541728*B)**3; s=(L-.0894841775*A-1.2914855480*B)**3
    rgb=[4.0767416621*l-3.3077115913*m+.2309699292*s,-1.2684380046*l+2.6097574011*m-.3413193965*s,-.0041960863*l-.7034186147*m+1.7076147010*s]
    return rgb2hex([l2s(x) for x in rgb])
def lum(h): r,g,b=[s2l(x) for x in hex2rgb(h)]; return .2126*r+.7152*g+.0722*b
def cr(a,b): x,y=sorted([lum(a),lum(b)],reverse=True); return (x+.05)/(y+.05)
OFF=[-.12,-.06,0,.06,.12]
def text_step(L,C,H,grounds):
    acc=from_oklch(L,C,H)
    if all(cr(acc,g)>=4.5 for g in grounds): return acc
    l=L
    while True:
        l-=.001; t=from_oklch(l,C,H)
        if all(cr(t,g)>=4.5 for g in grounds): return t
out={}
cL,cC,cH=to_oklch('#A64C45'); print('coral base oklch %.4f %.4f %.2f'%(cL,cC,cH))
for n,h in [('hover/deep #8C362F','#8C362F'),('rib-1','#C86D58'),('rib-2','#B95A4B'),('cognac #AC7137','#AC7137')]: print(n,'oklch %.4f %.4f %.2f'%to_oklch(h))
print('cognac seeds hex', from_oklch(.6,.105,63))
CG=['#F3EFEC','#E2CAC6','#D7C2C9']  # coral cream, tint, soft
for i,o in enumerate(OFF,1):
    acc='#A64C45' if o==0 else from_oklch(cL+o,cC,cH)
    hv=to_oklch('#8C362F'); dp='#8C362F' if o==0 else from_oklch(hv[0]+o,hv[1],hv[2])
    r1=to_oklch('#C86D58'); r2=to_oklch('#B95A4B')
    rib1='#C86D58' if o==0 else from_oklch(r1[0]+o,r1[1],r1[2]); rib2='#B95A4B' if o==0 else from_oklch(r2[0]+o,r2[1],r2[2])
    ts=text_step(cL+o,cC,cH,CG[:2])
    out['coral-%d'%i]=dict(L=round(cL+o,4),acc=acc,deep=dp,rib1=rib1,rib2=rib2,text=ts,
      acc_cr=[round(cr(acc,g),2) for g in CG], deep_cr=[round(cr(dp,g),2) for g in CG], rib2_cr=[round(cr(rib2,g),2) for g in CG], text_cr=[round(cr(ts,g),2) for g in CG])
GG=['#F3EFEC','#E8E0D3']
for i,o in enumerate(OFF,1):
    L=.6+o; acc='#AC7137' if o==0 else from_oklch(L,.105,63)
    ts=text_step(L,.105,63,GG)
    out['cognac-%d'%i]=dict(L=round(L,3),acc=acc,hover=from_oklch(L-.07,.105,63),text=ts,acc_cr=[round(cr(acc,g),2) for g in GG],text_cr=[round(cr(ts,g),2) for g in GG],
      today_text_cr=[round(cr('#8E5516',g),2) for g in GG] if o==0 else None)
for k,v in out.items(): print(k, json.dumps(v))
