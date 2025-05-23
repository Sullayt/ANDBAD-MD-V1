process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1'
import './config.js' 
import { createRequire } from 'module'
import path, { join } from 'path'
import {fileURLToPath, pathToFileURL} from 'url'
import { platform } from 'process'
import * as ws from 'ws'
import fs, { watchFile, unwatchFile, writeFileSync, readdirSync, statSync, unlinkSync, existsSync, readFileSync, copyFileSync, watch, rmSync, readdir, stat, mkdirSync, rename, writeFile } from 'fs'
import yargs from 'yargs'
import { spawn } from 'child_process'
import lodash from 'lodash'
import chalk from 'chalk'
import syntaxerror from 'syntax-error'
import { tmpdir } from 'os'
import { format } from 'util'
import P from 'pino'
import pino from 'pino'
import Pino from 'pino'
import { Boom } from '@hapi/boom'
import { makeWASocket, protoType, serialize } from './lib/simple.js'
import {Low, JSONFile} from 'lowdb'
import { mongoDB, mongoDBV2 } from './lib/mongoDB.js'
import store from './lib/store.js'
import readline from 'readline'
import NodeCache from 'node-cache'
import pkg from 'google-libphonenumber'
const { PhoneNumberUtil } = pkg
const phoneUtil = PhoneNumberUtil.getInstance()
const {DisconnectReason, useMultiFileAuthState, MessageRetryMap, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser, PHONENUMBER_MCC} = await import('@whiskeysockets/baileys')
const { CONNECTING } = ws
const { chain } = lodash
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000
protoType()
serialize()
global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
}; global.__dirname = function dirname(pathURL) {
  return path.dirname(global.__filename(pathURL, true));
}; global.__require = function require(dir = import.meta.url) {
  return createRequire(dir);
};
global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({...query, ...(apikeyqueryname ? {[apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name]} : {})})) : '')
global.timestamp = { start: new Date }
const __dirname = global.__dirname(import.meta.url);
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = new RegExp('^[#/.]')
global.db = new Low(/https?:\/\//.test(opts['db'] || '') ? new cloudDBAdapter(opts['db']) : new JSONFile('media/database/database.json'))
global.DATABASE = global.db; 
global.loadDatabase = async function loadDatabase() {
if (global.db.READ) {
return new Promise((resolve) => setInterval(async function() {
if (!global.db.READ) {
clearInterval(this);
resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
}}, 1 * 1000));
}
if (global.db.data !== null) return;
global.db.READ = true;
await global.db.read().catch(console.error);
global.db.READ = null;
global.db.data = {
users: {},
chats: {},
stats: {},
msgs: {},
sticker: {},
settings: {},
...(global.db.data || {}),
};
global.db.chain = chain(global.db.data);
};
loadDatabase();
// Initialization of global connections
if (global.conns instanceof Array) {
  console.log('Connections already initialized...');
} else {
  global.conns = [];
}

/* ------------------------------------------------*/

global.chatgpt = new Low(new JSONFile(path.join(__dirname, '/db/chatgpt.json')));
global.loadChatgptDB = async function loadChatgptDB() {
if (global.chatgpt.READ) {
return new Promise((resolve) =>
setInterval(async function() {
if (!global.chatgpt.READ) {
clearInterval(this);
resolve( global.chatgpt.data === null ? global.loadChatgptDB() : global.chatgpt.data );
}}, 1 * 1000));
}
if (global.chatgpt.data !== null) return;
global.chatgpt.READ = true;
await global.chatgpt.read().catch(console.error);
global.chatgpt.READ = null;
global.chatgpt.data = {
users: {},
...(global.chatgpt.data || {}),
};
global.chatgpt.chain = lodash.chain(global.chatgpt.data);
};
loadChatgptDB();

global.creds = 'creds.json'
global.authFile = 'session'
global.authFileJB  = 'AndbadBot'
/*global.rutaBot = join(__dirname, authFile)
global.rutaJadiBot = join(__dirname, authFileJB)

if (!fs.existsSync(rutaJadiBot)) {
fs.mkdirSync(rutaJadiBot)
}
*/
const {state, saveState, saveCreds} = await useMultiFileAuthState(global.authFile)
const msgRetryCounterMap = (MessageRetryMap) => { }
const msgRetryCounterCache = new NodeCache()
const {version} = await fetchLatestBaileysVersion()
let phoneNumber = global.botNumberCode
const methodCodeQR = process.argv.includes("qr")
const methodCode = !!phoneNumber || process.argv.includes("code")
const MethodMobile = process.argv.includes("mobile")
let rl = readline.createInterface({
input: process.stdin,
output: process.stdout,
terminal: true,
})

const question = (texto) => {
rl.clearLine(rl.input, 0)
return new Promise((resolver) => {
rl.question(texto, (respuesta) => {
rl.clearLine(rl.input, 0)
resolver(respuesta.trim())
})})
}

let option;
if (methodCodeQR) {
  option = '1';
}
if (!methodCodeQR && !methodCode && !fs.existsSync(`./${authFile}/creds.json`)) {
  do {
    let lineM = '┄╴───┈┈┈┈──┈┈┈┈───┈╴♡';
    option = await question(`╭${lineM}  
│ ${chalk.blueBright('╭┄┈┅┈┄┈┅┈┄┅┈┄┈┅┄┈┅┈┄')}
│ ${chalk.blueBright('┊')} ${chalk.blue.bgBlue.bold.cyan("LINKING METHOD")}
│ ${chalk.blueBright('╰┄┈┅┈┄┈┅┈┄┅┈┄┈┅┄┈┅┈┄')}   
│ ${chalk.blueBright('╭┄┈┅┈┄┈┅┈┄┅┈┄┈┅┄┈┅┈┄')}     
│ ${chalk.blueBright('┊')} ${chalk.bold.redBright(`⇢  Option 1:`)} ${chalk.greenBright("QR Code")}
│ ${chalk.blueBright('┊')} ${chalk.bold.redBright(`⇢  Option 2:`)} ${chalk.greenBright("8-digit Code")}
│ ${chalk.blueBright('╰┄┈┅┈┄┈┅┈┄┅┈┄┈┅┄┈┅┈┄')}
│ ${chalk.blueBright('╭┄┈┅┈┄┈┅┈┄┅┈┄┈┅┄┈┅┈┄')}     
│ ${chalk.blueBright('┊')} ${chalk.italic.magenta("Type only the number of")}
│ ${chalk.blueBright('┊')} ${chalk.italic.magenta("the option to connect")}
│ ${chalk.blueBright('╰┄┈┅┈┄┈┅┈┄┅┈┄┈┅┄┈┅┈┄')} 
│ ${chalk.italic.red(`CrowBot-ST 🌠`)}
╰${lineM}\n${chalk.bold.magentaBright('---> ')}`);
    if (!/^[1-2]$/.test(option)) {
      console.log(chalk.bold.redBright(`ONLY NUMBERS ${chalk.bold.greenBright("1")} OR ${chalk.bold.greenBright("2")} ARE ALLOWED, NO LETTERS OR SPECIAL CHARACTERS.\n${chalk.bold.yellowBright("TIP: COPY THE OPTION NUMBER AND PASTE IT INTO THE CONSOLE.")}`));
    }
  } while (option !== '1' && option !== '2' || fs.existsSync(`./${authFile}/creds.json`));
}

const filterStrings = [
"Q2xvc2luZyBzdGFsZSBvcGVu", // "Closing stable open"
"Q2xvc2luZyBvcGVuIHNlc3Npb24=", // "Closing open session"
"RmFpbGVkIHRvIGRlY3J5cHQ=", // "Failed to decrypt"
"U2Vzc2lvbiBlcnJvcg==", // "Session error"
"RXJyb3I6IEJhZCBNQUM=", // "Error: Bad MAC" 
"RGVjcnlwdGVkIG1lc3NhZ2U=" // "Decrypted message" 
]
console.info = () => {} 
console.debug = () => {} 
['log', 'warn', 'error'].forEach(methodName => redefineConsoleMethod(methodName, filterStrings))
const connectionOptions = {
logger: pino({ level: 'silent' }),
printQRInTerminal: opcion == '1' ? true : methodCodeQR ? true : false,
mobile: MethodMobile, 
browser: opcion == '1' ? ['Andbad-bot', 'Edge', '20.0.04'] : methodCodeQR ? ['Andbad-bot-ST', 'Edge', '20.0.04'] : ["Ubuntu", "Chrome", "20.0.04"],
auth: {
creds: state.creds,
keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "fatal" }).child({ level: "fatal" })),
},
markOnlineOnConnect: true, 
generateHighQualityLinkPreview: true, 
syncFullHistory: false,
getMessage: async (clave) => {
let jid = jidNormalizedUser(clave.remoteJid)
let msg = await store.loadMessage(jid, clave.id)
return msg?.message || ""
},
msgRetryCounterCache, // Resolve pending messages
msgRetryCounterMap, // Determine whether to retry sending a message or not
defaultQueryTimeoutMs: undefined,
version: [2, 3000, 1015901307],
}
global.conn = makeWASocket(connectionOptions)
if (!fs.existsSync(`./${authFile}/creds.json`)) {
if (option === '2' || methodCode) {
option = '2'
if (!conn.authState.creds.registered) {
let addNumber
if (!!phoneNumber) {
addNumber = phoneNumber.replace(/[^0-9]/g, '')
} else {
do {
phoneNumber = await question(chalk.bgBlack(chalk.bold.greenBright(`Please enter the WhatsApp number.\n${chalk.bold.yellowBright("TIP: Copy the WhatsApp number and paste it into the console.")}\n${chalk.bold.yellowBright("Example: +50557865603")}\n${chalk.bold.magentaBright('---> ')}`)))
phoneNumber = phoneNumber.replace(/\D/g,'')
if (!phoneNumber.startsWith('+')) {
phoneNumber = `+${phoneNumber}`
}
} while (!await isValidPhoneNumber(phoneNumber))
rl.close()
addNumber = phoneNumber.replace(/\D/g, '')
setTimeout(async () => {
let codeBot = await conn.requestPairingCode(addNumber)
codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot
console.log(chalk.bold.white(chalk.bgMagenta('PAIRING CODE:')), chalk.bold.white(chalk.white(codeBot)))
}, 2000)
}}}
}

conn.isInit = false
conn.well = false

if (!opts['test']) {
if (global.db) setInterval(async () => {
if (global.db.data) await global.db.write()
if (opts['autocleartmp'] && (global.support || {}).find) (tmp = [os.tmpdir(), 'tmp', "AndbadBot"], tmp.forEach(filename => cp.spawn('find', [filename, '-amin', '2', '-type', 'f', '-delete'])))}, 30 * 1000)}
if (opts['server']) (await import('./lib/server.js')).default(global.conn, PORT)
async function getMessage(key) {
if (store) {
} return {
conversation: 'SimpleBot',
}}
async function connectionUpdate(update) {  
const {connection, lastDisconnect, isNewLogin} = update
global.stopped = connection
if (isNewLogin) conn.isInit = true
const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
await global.reloadHandler(true).catch(console.error)

global.timestamp.connect = new Date;
}
if (global.db.data == null) loadDatabase();
if (update.qr != 0 && update.qr != undefined || methodCodeQR) {
  if (option == '1' || methodCodeQR) {
    console.log(chalk.bold.yellow(`\n🍭 SCAN THE QR CODE, IT EXPIRES IN 45 SECONDS`));
  }
}
if (connection == 'open') {
  console.log(chalk.bold.greenBright(`\n❒⸺⸺⸺⸺【• CONNECTED •】⸺⸺⸺⸺❒\n│\n│ 🟢 Successfully connected to WhatsApp.\n│\n❒⸺⸺⸺⸺【• CONNECTED •】⸺⸺⸺⸺❒`));
}
let reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
if (connection === 'close') {
  if (reason === DisconnectReason.badSession) {
    console.log(chalk.bold.cyanBright("⚠️ NO CONNECTION, DELETE THE ${global.authFile} FOLDER AND SCAN THE QR CODE ⚠️"));
  } else if (reason === DisconnectReason.connectionClosed) {
    console.log(chalk.bold.magentaBright("╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ☹\n┆ ⚠️ CONNECTION CLOSED, RECONNECTING....\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ☹"));
    await global.reloadHandler(true).catch(console.error);
  } else if (reason === DisconnectReason.connectionLost) {
    console.log(chalk.bold.blueBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ☂\n┆ ⚠️ CONNECTION LOST WITH THE SERVER, RECONNECTING....\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ☂`));
    await global.reloadHandler(true).catch(console.error);
  } else if (reason === DisconnectReason.connectionReplaced) {
    console.log(chalk.bold.yellowBright("╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ✗\n┆ ⚠️ CONNECTION REPLACED, A NEW SESSION HAS BEEN OPENED, PLEASE CLOSE THE CURRENT SESSION FIRST.\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ✗"));
  } else if (reason === DisconnectReason.loggedOut) {
    console.log(chalk.bold.redBright(`\n⚠️ NO CONNECTION, DELETE THE ${global.authFile} FOLDER AND SCAN THE QR CODE ⚠️`));
    await global.reloadHandler(true).catch(console.error);
  } else if (reason === DisconnectReason.restartRequired) {
    console.log(chalk.bold.cyanBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ✓\n┆ 🎩 CONNECTING TO THE SERVER...\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ✓`));
    await global.reloadHandler(true).catch(console.error);
  } else if (reason === DisconnectReason.timedOut) {
    console.log(chalk.bold.yellowBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ▸\n┆ ⌛ CONNECTION TIMEOUT, RECONNECTING....\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ▸`));
    await global.reloadHandler(true).catch(console.error);
  } else {
    console.log(chalk.bold.redBright(`\n⚠️❗ UNKNOWN DISCONNECTION REASON: ${reason || 'Not found'} >> ${connection || 'Not found'}`));
  }
}
process.on('uncaughtException', console.error);

async function connectSubBots() {
  const subBotDirectory = './AndbadBot';
  if (!existsSync(subBotDirectory)) {
    console.log('🍭 Andbad-md has no linked Sub-Bots.');
    return;
  }

  const subBotFolders = readdirSync(subBotDirectory).filter(file => 
    statSync(join(subBotDirectory, file)).isDirectory()
  );
}

const botPromises = subBotFolders.map(async folder => {
const authFile = join(subBotDirectory, folder);
if (existsSync(join(authFile, 'creds.json'))) {
return await connectionUpdate(authFile);
}
});

const bots = await Promise.all(botPromises);
global.conns = bots.filter(Boolean);
console.log(chalk.bold.greenBright(`🍭 All Sub-Bots connected successfully.`))
}

(async () => {
global.conns = [];

const mainBotAuthFile = 'session';
try {
const mainBot = await connectionUpdate(mainBotAuthFile);
global.conns.push(mainBot);
console.log(chalk.bold.greenBright(`🍭 Andbad connected successfully.`))

await connectSubBots();
} catch (error) {
console.error(chalk.bold.cyanBright(`🥀 Error starting Andbad-md: `, error))
}
})();

let isInit = true;
let handler = await import('./handler.js');
global.reloadHandler = async function(restatConn) {
try {
const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error);
if (Object.keys(Handler || {}).length) handler = Handler;
} catch (e) {
console.error(e);
}
if (restatConn) {
const oldChats = global.conn.chats;
try {
global.conn.ws.close();
} catch { }
conn.ev.removeAllListeners();
global.conn = makeWASocket(connectionOptions, {chats: oldChats});
isInit = true;
}
if (!isInit) {
conn.ev.off('messages.upsert', conn.handler)
conn.ev.off('connection.update', conn.connectionUpdate)
conn.ev.off('creds.update', conn.credsUpdate)
}
conn.handler = handler.handler.bind(global.conn)
conn.connectionUpdate = connectionUpdate.bind(global.conn)
conn.credsUpdate = saveCreds.bind(global.conn, true)

const currentDateTime = new Date()
const messageDateTime = new Date(conn.ev)
if (currentDateTime >= messageDateTime) {
  const chats = Object.entries(conn.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0])
} else {
  const chats = Object.entries(conn.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0])
}

conn.ev.on('messages.upsert', conn.handler)
conn.ev.on('connection.update', conn.connectionUpdate)
conn.ev.on('creds.update', conn.credsUpdate)
isInit = false
return true
}

const pluginFolder = global.__dirname(join(__dirname, './plugins/index'))
const pluginFilter = (filename) => /\.js$/.test(filename)
global.plugins = {}
async function filesInit() {
  for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
    try {
      const file = global.__filename(join(pluginFolder, filename))
      const module = await import(file)
      global.plugins[filename] = module.default || module
    } catch (e) {
      conn.logger.error(e)
      delete global.plugins[filename]
    }
  }
}
filesInit().then((_) => Object.keys(global.plugins)).catch(console.error)

global.reload = async (_ev, filename) => {
  if (pluginFilter(filename)) {
    const dir = global.__filename(join(pluginFolder, filename), true)
    if (filename in global.plugins) {
      if (existsSync(dir)) conn.logger.info(`UPDATED - '${filename}' SUCCESSFULLY`)
      else {
        conn.logger.warn(`FILE DELETED: '${filename}'`)
        return delete global.plugins[filename];
      }
    } else conn.logger.info(`NEW PLUGIN DETECTED: '${filename}'`)
    const err = syntaxerror(readFileSync(dir), filename, {
      sourceType: 'module',
      allowAwaitOutsideFunction: true,
    });
    if (err) conn.logger.error(`SYNTAX ERROR WHILE LOADING '${filename}'\n${format(err)}`);
    else {
      try {
        const module = (await import(`${global.__filename(dir)}?update=${Date.now()}`));
        global.plugins[filename] = module.default || module;
      } catch (e) {
        conn.logger.error(`ERROR REQUIRING PLUGIN '${filename}\n${format(e)}'`);
      } finally {
        global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)));
      }
    }
  }
};
Object.freeze(global.reload);
watch(pluginFolder, global.reload);
await global.reloadHandler();
async function _quickTest() {
  const test = await Promise.all([
    spawn('ffmpeg'),
    spawn('ffprobe'),
    spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
    spawn('convert'),
    spawn('magick'),
    spawn('gm'),
    spawn('find', ['--version']),
  ].map((p) => {
    return Promise.race([
      new Promise((resolve) => {
        p.on('close', (code) => {
          resolve(code !== 127);
        });
      }),
      new Promise((resolve) => {
        p.on('error', (_) => resolve(false));
      })
    ]);
  }));
  const [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test;
  const s = global.support = { ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find };
  Object.freeze(global.support);
}
function clearTmp() {
  const tmpDir = join(__dirname, 'tmp')
  const filenames = readdirSync(tmpDir)
  filenames.forEach(file => {
    const filePath = join(tmpDir, file)
    unlinkSync(filePath)
  })
}
function purgeSession() {
  let prekey = []
  let directory = readdirSync("./session")
  let filesFolderPreKeys = directory.filter(file => {
    return file.startsWith('pre-key-')
  })
  prekey = [...prekey, ...filesFolderPreKeys]
  filesFolderPreKeys.forEach(files => {
    unlinkSync(`./session/${files}`)
  })
} 
function purgeSessionSB() {
  try {
    const directoryList = readdirSync(`./${authFileJB}/`);
    let SBprekey = [];
    directoryList.forEach(directory => {
      if (statSync(`./${authFileJB}/${directory}`).isDirectory()) {
        const DSBPreKeys = readdirSync(`./${authFileJB}/${directory}`).filter(fileInDir => {
          return fileInDir.startsWith('pre-key-')
        })
        SBprekey = [...SBprekey, ...DSBPreKeys];
        DSBPreKeys.forEach(fileInDir => {
          if (fileInDir !== 'creds.json') {
            unlinkSync(`./${authFileJB}/${directory}/${fileInDir}`)
          }
        })
      }
    })
    if (SBprekey.length === 0) {
      console.log(chalk.bold.green(`\n╭» 🟡 AndbadBot 🟡\n│→ NOTHING TO DELETE \n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― 🗑️♻️`))
    } else {
      console.log(chalk.bold.cyanBright(`\n╭» ⚪ AndbadBot ⚪\n│→ NON-ESSENTIAL FILES DELETED\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― 🗑️♻️`))
    }
  } catch (err) {
    console.log(chalk.bold.red(`\n╭» 🔴 AndbadBot 🔴\n│→ AN ERROR OCCURRED\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― 🗑️♻️\n` + err))
  }
}
function purgeOldFiles() {
  const directories = ['./session/', './AndbadBot/']
  directories.forEach(dir => {
    readdirSync(dir, (err, files) => {
      if (err) throw err
      files.forEach(file => {
        if (file !== 'creds.json') {
          const filePath = path.join(dir, file);
          unlinkSync(filePath, err => {
            if (err) {
              console.log(chalk.bold.red(`\n╭» 🔴 FILE 🔴\n│→ ${file} COULD NOT BE DELETED\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― 🗑️❌\n` + err))
            } else {
              console.log(chalk.bold.green(`\n╭» 🟣 FILE 🟣\n│→ ${file} SUCCESSFULLY DELETED\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― 🗑️♻️`))
            }
          })
        }
      })
    })
  })
}
function redefineConsoleMethod(methodName, filterStrings) {
  const originalConsoleMethod = console[methodName]
  console[methodName] = function() {
    const message = arguments[0]
    if (typeof message === 'string' && filterStrings.some(filterString => message.includes(atob(filterString)))) {
      arguments[0] = ""
    }
    originalConsoleMethod.apply(console, arguments)
  }
}
setInterval(async () => {
  if (stopped === 'close' || !conn || !conn.user) return
  await clearTmp()
  console.log(chalk.bold.cyanBright(`\n╭» 🟢 MULTIMEDIA 🟢\n│→ TMP FOLDER FILES DELETED\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― 🗑️♻️`))
}, 1000 * 60 * 4) // 4 min 

setInterval(async () => {
  if (stopped === 'close' || !conn || !conn.user) return
  await purgeOldFiles()
  console.log(chalk.bold.cyanBright(`\n╭» 🟠 FILES 🟠\n│→ RESIDUAL FILES DELETED\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― 🗑️♻️`))
}, 1000 * 60 * 10)

_quickTest().then(() => conn.logger.info(chalk.bold(`🍭  D O N E\n`.trim()))).catch(console.error)

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.bold.greenBright("Updated"))
  import(`${file}?update=${Date.now()}`)
})

async function isValidPhoneNumber(number) {
  try {
    number = number.replace(/\s+/g, '')
    // If the number starts with '+521' or '+52 1', remove the '1'
    if (number.startsWith('+255')) {
      number = number.replace('+255', '+255'); // Change +521 to +52
    } else if (number.startsWith('+255') && number[4] === '1') {
      number = number.replace('+255', '+255'); // Change +52 1 to +52
    }
    const parsedNumber = phoneUtil.parseAndKeepRawInput(number)
    return phoneUtil.isValidNumber(parsedNumber)
  } catch (error) {
    return false
  }
}
