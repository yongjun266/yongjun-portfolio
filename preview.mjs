import {createServer} from 'node:http';
import {stat} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {networkInterfaces} from 'node:os';

const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'dist');
const port=Number(process.argv[2]||4322);
const lan=process.argv.includes('--lan');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.pdf':'application/pdf','.mp4':'video/mp4','.json':'application/json; charset=utf-8'};
const server=createServer(async(req,res)=>{
 try {
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end();return;}
  let urlPath=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let target=path.resolve(root,'.'+urlPath);
  if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  let status=200;
  try{if((await stat(target)).isDirectory())target=path.join(target,'index.html');await stat(target);}catch{target=path.join(root,'404.html');status=404;}
  const size=(await stat(target)).size;
  const headers={'Content-Type':types[path.extname(target)]||'application/octet-stream','Content-Length':size,'Accept-Ranges':'bytes','X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'};
  if(req.headers.range&&status===200){
    const range=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    let start,end;
    if(range&&range[1]===''&&range[2]){start=Math.max(0,size-Number(range[2]));end=size-1;}
    else if(range&&range[1]){start=Number(range[1]);end=range[2]?Math.min(Number(range[2]),size-1):size-1;}
    if(start===undefined||end===undefined||!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=size){res.writeHead(416,{'Content-Range':`bytes */${size}`});res.end();return;}
    res.writeHead(206,{...headers,'Content-Length':end-start+1,'Content-Range':`bytes ${start}-${end}/${size}`});
    if(req.method==='HEAD'){res.end();return;}
    const stream=createReadStream(target,{start,end});stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);return;
  }
  res.writeHead(status,headers);if(req.method==='HEAD'){res.end();return;}
  const stream=createReadStream(target);stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
 }catch{res.writeHead(400,{'Content-Type':'text/plain; charset=utf-8'});res.end('无法读取页面，请检查地址。');}
});
server.listen(port,lan?'0.0.0.0':'127.0.0.1',()=>{
 console.log(`作品集预览：http://127.0.0.1:${port}\n按 Ctrl+C 停止。`);
 if(lan){for(const entries of Object.values(networkInterfaces()))for(const entry of entries||[])if(entry.family==='IPv4'&&!entry.internal)console.log(`同一 Wi-Fi 下手机可尝试打开：http://${entry.address}:${port}`);}
});
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?`端口 ${port} 已在使用。请访问 http://127.0.0.1:${port}，或运行 node preview.mjs 4323 更换端口。`:error);process.exitCode=1;});
