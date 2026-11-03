import re,sys,collections
D='/Users/philipplackner/Cardigan/docs/design/'
NAMES=['more','board','plus','label','trash','edit','refresh','log-out','boards','search','close','chevron-down','upload','chevron-left','close-small','filter','check','alert','rename','file','download','cloud-off','info','arrow-left','arrow-right','columns','chevron-right']
icons=[]
def load():
    order={}
    for f in ['auth','board-list','board-view','card-detail','labels','import-export']:
        s=open(D+f+'.html').read()
        for m in re.finditer(r'<svg class="ico[^"]*"[^>]*>(.*?)</svg>',s,re.S):
            k=m.group(1).strip(); order[k]=order.get(k,0)+1
    return [k for k,v in sorted(order.items(),key=lambda x:-x[1])]
ICONS=load()
def blocks(s,cls):
    out=[]
    for m in re.finditer(r'<(\w+)[^>]*class="(?:[^"]* )?'+cls+r'(?: [^"]*)?"[^>]*>',s):
        t=m.group(1); i=m.end(); depth=1
        pat=re.compile(r'<(/?)'+t+r'\b[^>]*?(/?)>')
        for mm in pat.finditer(s,i):
            if mm.group(1): depth-=1
            elif not mm.group(2): depth+=1
            if depth==0: out.append(s[m.start():mm.end()]); break
    return out
def norm(b):
    b=re.sub(r'<svg class="ico[^"]*"[^>]*>(.*?)</svg>',lambda m:'<i:'+(NAMES[ICONS.index(m.group(1).strip())] if m.group(1).strip() in ICONS else '?')+'/>',b,flags=re.S)
    return re.sub(r'\s+',' ',b)
if __name__=='__main__':
    cls=sys.argv[1]; mx=int(sys.argv[2]) if len(sys.argv)>2 else 40
    c=collections.Counter()
    for f in ['auth','board-list','board-view','card-detail','labels','import-export']:
        for b in blocks(open(D+f+'.html').read(),cls): c[norm(b)]+=1
    for k,v in c.most_common(mx): print(v,'|',k[:1500]); print()
