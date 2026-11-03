import sys,zlib,struct
def topng(data:bytes,out,level=9):
    W=2048
    payload=struct.pack('>I',len(data))+data
    H=(len(payload)+W-1)//W
    payload+=b'\0'*(W*H-len(payload))
    raw=b''.join(b'\0'+payload[i*W:(i+1)*W] for i in range(H))
    def chunk(t,d): return struct.pack('>I',len(d))+t+d+struct.pack('>I',zlib.crc32(t+d)&0xffffffff)
    png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',W,H,8,0,0,0,0))+chunk(b'IDAT',zlib.compress(raw,level))+chunk(b'IEND',b'')
    open(out,'wb').write(png); return len(png)
if __name__=='__main__':
    print(topng(open(sys.argv[1],'rb').read(),sys.argv[2],int(sys.argv[3]) if len(sys.argv)>3 else 9))
