"use strict";
const http = require("node:http");
const net = require("node:net");
const { createHash } = require("node:crypto");
const { createReadStream, realpathSync } = require("node:fs");
const { stat } = require("node:fs/promises");
const path = require("node:path");
const { spawn } = require("node:child_process");

const host = "127.0.0.1";
const firstPort = 4173;
const root = path.join(__dirname, "app");
const id = createHash("sha256").update(realpathSync.native(__dirname).toLowerCase()).digest("hex");
const pipe = "\\\\.\\pipe\\conecta-rural-" + id;
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

async function serve(req, res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, "http://" + host).pathname);
    if (pathname.includes("\\") || pathname.includes("\0") || pathname.includes(":")) throw Error();
  } catch {
    res.writeHead(400).end();
    return;
  }
  let file = path.resolve(root, "." + pathname);
  if (file !== root && !file.startsWith(root + path.sep)) {
    res.writeHead(404).end();
    return;
  }
  if (file === root) file = path.join(root, "index.html");
  let info = await stat(file).catch(() => null);
  // The portal routes with hashes; extensionless URLs also get the SPA shell.
  if (!info?.isFile() && !path.extname(file) && !pathname.startsWith("/assets/")) {
    file = path.join(root, "index.html");
    info = await stat(file).catch(() => null);
  }
  if (!info?.isFile()) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, {
    "Content-Type": mime[path.extname(file).toLowerCase()] || "application/octet-stream",
    "Content-Length": info.size,
    "Cache-Control": "no-cache",
  });
  if (req.method === "HEAD") res.end();
  else {
    const stream = createReadStream(file);
    stream.on("error", () => res.destroy());
    res.on("close", () => stream.destroy());
    stream.pipe(res);
  }
}

function listen(server, ...args) {
  return new Promise((resolve, reject) => {
    const failed = (error) => { server.off("listening", ready); reject(error); };
    const ready = () => { server.off("error", failed); resolve(); };
    server.once("error", failed);
    server.once("listening", ready);
    server.listen(...args);
  });
}

function command(value) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection(pipe);
    let reply = "";
    socket.setEncoding("utf8");
    socket.setTimeout(3000, () => socket.destroy(new Error("El servidor no respondio.")));
    socket.once("connect", () => socket.write(value + "\n"));
    socket.on("data", (chunk) => { reply += chunk; });
    socket.once("error", reject);
    socket.once("end", () => resolve(reply.trim()));
  });
}

function openBrowser(port) {
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw Error("Puerto local no valido.");
  const url = "http://" + host + ":" + port;
  console.log("Conecta Rural Empresarial: " + url);
  if (process.env.CONECTA_NO_BROWSER === "1") return;
  const browser = spawn("rundll32.exe", ["url.dll,FileProtocolHandler", url], {
    windowsHide: true, stdio: "ignore",
  });
  const hint = () => console.log("No se pudo abrir el navegador. Abre la direccion anterior manualmente.");
  browser.once("error", hint);
  browser.once("exit", (code) => { if (code !== 0) hint(); });
}

async function start() {
  if (!(await stat(path.join(root, "index.html")).catch(() => null))?.isFile()) {
    throw Error("Falta app\\index.html. Extrae todos los archivos del ZIP.");
  }
  const web = http.createServer((req, res) => {
    serve(req, res).catch(() => {
      if (res.headersSent) res.destroy();
      else res.writeHead(500).end();
    });
  });
  let port;
  let stopping = false;
  const control = net.createServer((client) => {
    let input = "";
    client.setEncoding("utf8");
    client.setTimeout(3000, () => client.destroy());
    client.on("error", () => client.destroy());
    client.on("data", (chunk) => {
      input += chunk;
      if (input.length > 24) { client.destroy(); return; }
      if (!input.endsWith("\n")) return;
      if (input === "status\n") client.end(String(port || 0));
      else if (input === "stop\n" && port && !stopping) {
        stopping = true;
        control.close();
        const timer = setTimeout(() => web.closeAllConnections(), 1000);
        timer.unref();
        web.close(() => {
          clearTimeout(timer);
          client.end("OK");
        });
      } else client.end("Ocupado");
    });
  });

  try {
    await listen(control, pipe);
  } catch (error) {
    if (error.code !== "EADDRINUSE") throw error;
    for (let attempt = 0; attempt < 20; attempt++) {
      const current = Number(await command("status"));
      if (current) {
        console.log("Esta copia ya esta en ejecucion.");
        openBrowser(current);
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
    throw Error("Esta copia no termino de arrancar. Intenta de nuevo.");
  }

  try {
    for (const candidate of [firstPort, firstPort + 1, firstPort + 2, firstPort + 3, firstPort + 4, 0]) {
      try {
        await listen(web, { host, port: candidate, exclusive: true });
        break;
      } catch (error) {
        if (!["EADDRINUSE", "EACCES"].includes(error.code) || candidate === 0) throw error;
        console.log("Puerto " + candidate + " ocupado o reservado. Probando otro.");
      }
    }
    // A successful request also verifies that the packaged index is readable.
    const address = web.address().port;
    const response = await fetch("http://" + host + ":" + address + "/", { signal: AbortSignal.timeout(5000) });
    await response.arrayBuffer();
    if (!response.ok) throw Error("El servidor local no pudo cargar la aplicacion.");
    port = address;
    openBrowser(port);
    console.log("Deja esta ventana abierta. Usa CERRAR.cmd para detener el servidor.");
  } catch (error) {
    control.close();
    web.close();
    throw error;
  }
}

async function main() {
  if (process.argv[2] === "stop") {
    try {
      if (await command("stop") !== "OK") throw Error("El servidor aun esta arrancando. Intenta de nuevo.");
      console.log("Servidor de Conecta Rural cerrado.");
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      console.log("Esta copia de Conecta Rural ya estaba cerrada.");
    }
  } else await start();
}

main().catch((error) => {
  console.error("ERROR: " + error.message);
  process.exitCode = 1;
});
