# 녹음에서 말 놓는 소리를 잘라 낸다. 사용법은 README.md의 "소리" 참고
import sys, struct, wave, math
raw, out = sys.argv[1], sys.argv[2]
data=open(raw,'rb').read(); n=len(data)//2
x=struct.unpack('<%dh'%n,data); sr=24000
hits={'move-1':1.19,'move-2':2.62,'move-3':5.63,'move-4':12.25,'move-5':14.52,'move-6':16.35,'move-7':21.30,'capture-1':8.16,'capture-2':18.76}
LEN=int(0.38*sr); PRE=int(0.003*sr); FADE=int(0.15*sr)
for name,t in hits.items():
  s=int((t-0.06)*sr)
  # attack = first sample above 25% of local peak
  seg=x[s:s+int(0.2*sr)]; pk=max(abs(v) for v in seg)
  a=s+next(i for i,v in enumerate(seg) if abs(v)>pk*0.25)
  clip=list(x[a-PRE:a-PRE+LEN])
  g=0.89*32767/pk
  for i in range(len(clip)):
    f=1.0
    if i<PRE: f=i/PRE
    if i>LEN-FADE: f*=((LEN-i)/FADE)**2
    clip[i]=max(-32767,min(32767,int(clip[i]*g*f)))
  w=wave.open(f'{out}/{name}.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
  w.writeframes(struct.pack('<%dh'%len(clip),*clip)); w.close()
  print(name, f'attack {a/sr:.3f}s gain {g:.1f}x')
