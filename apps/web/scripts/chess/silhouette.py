# 체스 말 3D 모델(GLB)의 정면 윤곽선을 24x24 SVG path로 뽑는다. 사용: python3 silhouette.py queen.glb out.txt
import json, struct, math, sys
path, out = sys.argv[1], sys.argv[2]
d=open(path,'rb').read()
L=struct.unpack('<I',d[12:16])[0]; j=json.loads(d[20:20+L]); binstart=20+L+8
def acc(i):
    a=j['accessors'][i]; v=j['bufferViews'][a['bufferView']]
    off=binstart+v.get('byteOffset',0)+a.get('byteOffset',0)
    n={'VEC3':3,'SCALAR':1}[a['type']]; c=a['count']
    fmt={5126:'f',5123:'H',5125:'I'}[a['componentType']]
    vals=struct.unpack_from('<%d%s'%(c*n,fmt),d,off)
    return [vals[k*n:(k+1)*n] for k in range(c)] if n>1 else list(vals)
P=acc(0); I=acc(3)
ymin=min(p[1] for p in P); ymax=max(p[1] for p in P)
tris=[(P[I[k]],P[I[k+1]],P[I[k+2]]) for k in range(0,len(I),3)]
N=600
prof=[]
for s in range(N+1):
    y=ymin+(ymax-ymin)*s/N
    y=min(max(y,ymin+1e-6),ymax-1e-6)
    r=0
    for t in tris:
        for a,b in ((t[0],t[1]),(t[1],t[2]),(t[2],t[0])):
            if (a[1]-y)*(b[1]-y)<=0 and a[1]!=b[1]:
                u=(y-a[1])/(b[1]-a[1]); x=a[0]+(b[0]-a[0])*u; z=a[2]+(b[2]-a[2])*u
                r=max(r,math.hypot(x,z))
    prof.append((r,y))
# 메시 다각형 때문에 생기는 잔물결을 없앤다: 각 높이에서 주변 몇 칸의 최댓값(바깥 윤곽 유지) 후 평균
W=4
rs=[r for r,_ in prof]
mx=[max(rs[max(0,i-W):i+W+1]) for i in range(len(rs))]
sm=[sum(mx[max(0,i-W):i+W+1])/len(mx[max(0,i-W):i+W+1]) for i in range(len(mx))]
prof=[(sm[i],prof[i][1]) for i in range(len(prof))]
# RDP simplify of right half
def rdp(pts,eps):
    if len(pts)<3: return pts
    (x1,y1),(x2,y2)=pts[0],pts[-1]; dx,dy=x2-x1,y2-y1; n=math.hypot(dx,dy) or 1
    i,dm=0,0
    for k in range(1,len(pts)-1):
        dd=abs(dy*pts[k][0]-dx*pts[k][1]+x2*y1-y2*x1)/n
        if dd>dm: i,dm=k,dd
    if dm>eps: return rdp(pts[:i+1],eps)[:-1]+rdp(pts[i:],eps)
    return [pts[0],pts[-1]]
H=ymax-ymin
scale=22/H
def tx(r,y): return (r*scale, 23-(y-ymin)*scale)
right=[tx(r,y) for r,y in prof]
right=[(0,23)]+right+[(0,right[-1][1])]
right=rdp(right,0.1)
pts=[(12+x,y) for x,y in right]+[(12-x,y) for x,y in reversed(right)]
dpath='M'+' L'.join(f'{x:.2f} {y:.2f}' for x,y in pts)+'Z'
open(out,'w').write(dpath)
print(len(pts),'points, max half-width',round(max(x for x,_ in right),2))
