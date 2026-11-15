// Harf Çarkı — bildirim sunucusu (Cloudflare Worker, ücretsiz)
// Bu dosyanın TAMAMINI Cloudflare'deki "Edit code" ekranına yapıştır.
// Gizli anahtar (SA_JSON) bu dosyada YOK; Cloudflare ayarlarına ayrıca eklenir.

const PID = 'isim-zinciri-aeb8d';
const ORIGINS = ['https://harfcarki.github.io'];

const T = {
  tr: {
    inv: n => `📩 @${n} seni oyuna çağırıyor!`, invB: c => `Oda: ${c} — katılmak için dokun`, join: 'Katıl', no: 'Yok say',
    fr: n => `👋 @${n} seni arkadaş olarak eklemek istiyor`, frB: 'Kabul etmek için dokun',
    acc: n => `🎉 @${n} arkadaşlık isteğini kabul etti`, accB: 'Artık birlikte oynayabilirsiniz',
    dm: n => `💬 @${n}`, rep: '📨 Geri bildirimine cevap geldi', repB: 'Okumak için dokun',
    test: '🔔 Deneme bildirimi', testB: 'Bildirimler çalışıyor! ✅',
    report: n => `🚩 Yeni şikayet (@${n})`, reportB: 'Yönetici panelinde gör'
  },
  az: {
    inv: n => `📩 @${n} səni oyuna çağırır!`, invB: c => `Otaq: ${c} — qoşulmaq üçün toxun`, join: 'Qoşul', no: 'Keç',
    fr: n => `👋 @${n} səni dost kimi əlavə etmək istəyir`, frB: 'Qəbul etmək üçün toxun',
    acc: n => `🎉 @${n} dostluq istəyini qəbul etdi`, accB: 'İndi birlikdə oynaya bilərsiniz',
    dm: n => `💬 @${n}`, rep: '📨 Rəyinə cavab gəldi', repB: 'Oxumaq üçün toxun',
    test: '🔔 Sınaq bildirişi', testB: 'Bildirişlər işləyir! ✅',
    report: n => `🚩 Yeni şikayət (@${n})`, reportB: 'İdarə panelində bax'
  }
};

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': ORIGINS.includes(origin) ? origin : ORIGINS[0],
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Vary': 'Origin'
    };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (req.method === 'GET') {
      const ok = !!env.SA_JSON;
      return new Response(ok ? 'Harf Çarkı bildirim sunucusu çalışıyor ✅' : '⚠️ SA_JSON gizli anahtarı eklenmemiş',
        { headers: { ...cors, 'content-type': 'text/plain; charset=utf-8' } });
    }
    try {
      const out = await handle(req, env);
      return json(out, 200, cors);
    } catch (e) {
      return json({ ok: false, err: String(e && e.message || e) }, 200, cors);
    }
  }
};

const json = (o, s, h) => new Response(JSON.stringify(o), { status: s, headers: { ...h, 'content-type': 'application/json' } });

// ---------- ana iş ----------
const RL = new Map();
async function handle(req, env) {
  if (!env.SA_JSON) throw new Error('SA_JSON eksik');
  const auth = req.headers.get('Authorization') || '';
  const uid = await verifyIdToken(auth.replace(/^Bearer\s+/i, ''));
  const now = Date.now();
  const hits = (RL.get(uid) || []).filter(t => t > now - 60e3); hits.push(now); RL.set(uid, hits);
  if (hits.length > 40) throw new Error('çok fazla istek');

  const { kind, path } = await req.json();
  if (typeof path !== 'string' || !/^[A-Za-z0-9_\-\/]{3,200}$/.test(path)) throw new Error('geçersiz yol');
  const fresh = d => Math.abs(now - Number(d.at || 0)) < 3 * 60e3;
  let to, msg, skipBlock = false, targets = null;

  if (kind === 'invite' && /^invites\/[A-Za-z0-9_]+$/.test(path)) {
    const d = await fsGet(env, path); if (!d || d.from !== uid || !fresh(d)) throw new Error('davet yok');
    to = d.to;
    msg = L => ({ title: L.inv(d.fromName), body: L.invB(d.room), type: 'invite', tag: 'inv-' + d.room, url: './?oda=' + d.room, a1: L.join, a2: L.no });
  } else if (kind === 'friend' && /^friendReqs\/[A-Za-z0-9]+_[A-Za-z0-9]+$/.test(path)) {
    const d = await fsGet(env, path); if (!d || d.from !== uid || !fresh(d)) throw new Error('istek yok');
    to = d.to;
    msg = L => ({ title: L.fr(d.fromName), body: L.frB, type: 'friend', tag: 'fr-' + uid, url: './?arkadas=1' });
  } else if (kind === 'accept' && /^users\/[A-Za-z0-9]+\/friends\/[A-Za-z0-9]+$/.test(path)) {
    const [, owner, , who] = path.split('/'); if (who !== uid) throw new Error('yetki yok');
    const d = await fsGet(env, path); if (!d || !fresh(d)) throw new Error('kayıt yok');
    to = owner;
    msg = L => ({ title: L.acc(d.name), body: L.accB, type: 'friend', tag: 'acc-' + uid, url: './?arkadas=1' });
  } else if (kind === 'dm' && /^dms\/[A-Za-z0-9]+_[A-Za-z0-9]+\/msgs\/[A-Za-z0-9]+$/.test(path)) {
    const pid = path.split('/')[1], mem = pid.split('_'); if (!mem.includes(uid)) throw new Error('yetki yok');
    const d = await fsGet(env, path); if (!d || d.from !== uid || !fresh(d)) throw new Error('mesaj yok');
    const c = await fsGet(env, 'dms/' + pid); const nm = (c && c.names && c.names[uid]) || '';
    to = mem[0] === uid ? mem[1] : mem[0];
    msg = L => ({ title: L.dm(nm), body: String(d.text || '').slice(0, 140), type: 'dm', tag: 'dm-' + pid, url: './?dm=' + uid });
  } else if (kind === 'reply' && /^feedback\/[A-Za-z0-9]+$/.test(path)) {
    if (!(await fsGet(env, 'admins/' + uid))) throw new Error('yetki yok');
    const d = await fsGet(env, path); if (!d) throw new Error('kayıt yok');
    to = d.uid; skipBlock = true;
    msg = L => ({ title: L.rep, body: L.repB, type: 'reply', tag: 'reply', url: './?mesaj=1' });
  } else if (kind === 'test' && path === 'users/' + uid) {
    to = uid; skipBlock = true;
    msg = L => ({ title: L.test, body: L.testB, type: 'test', tag: 'test', url: './' });
  } else if (kind === 'report' && path === 'users/' + uid) {
    const me = await fsGet(env, 'users/' + uid);
    targets = (await fsList(env, 'admins')).map(x => x.id); skipBlock = true;
    msg = L => ({ title: L.report((me && me.username) || '?'), body: L.reportB, type: 'report', tag: 'report', url: './?panel=1' });
  } else throw new Error('bilinmeyen istek');

  if (!targets) {
    if (!to || to === uid && kind !== 'test') return { ok: true, sent: 0 };
    if (!skipBlock && await fsGet(env, `users/${to}/blocked/${uid}`)) return { ok: true, sent: 0 };
    targets = [to];
  }
  let sent = 0;
  for (const t of targets.slice(0, 10)) sent += await sendTo(env, t, msg);
  return { ok: true, sent };
}

async function sendTo(env, uid, msg) {
  const toks = await fsList(env, `users/${uid}/tokens`);
  let n = 0;
  for (const tk of toks.slice(-8)) {
    const L = T[tk.lang] || T.tr, m = msg(L), data = {};
    for (const [k, v] of Object.entries(m)) if (v != null) data[k] = String(v);
    const r = await fetch(`https://fcm.googleapis.com/v1/projects/${PID}/messages:send`, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + await gToken(env), 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: { token: tk.id, data, webpush: { headers: { Urgency: 'high', TTL: '86400' } } } })
    });
    if (r.ok) n++;
    else if (r.status === 404 || r.status === 400) {
      const t = await r.text();
      if (/UNREGISTERED|not a valid FCM|registration-token/i.test(t)) await fsDelete(env, `users/${uid}/tokens/${tk.id}`);
    }
  }
  return n;
}

// ---------- Firestore REST ----------
const FS = `https://firestore.googleapis.com/v1/projects/${PID}/databases/(default)/documents/`;
const encPath = p => p.split('/').map(encodeURIComponent).join('/');
async function fsGet(env, path) {
  const r = await fetch(FS + encPath(path), { headers: { Authorization: 'Bearer ' + await gToken(env) } });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error('firestore ' + r.status);
  return dec({ mapValue: { fields: (await r.json()).fields || {} } });
}
async function fsList(env, path) {
  const r = await fetch(FS + encPath(path) + '?pageSize=50', { headers: { Authorization: 'Bearer ' + await gToken(env) } });
  if (!r.ok) return [];
  const j = await r.json();
  return (j.documents || []).map(d => ({ id: d.name.split('/').pop(), ...dec({ mapValue: { fields: d.fields || {} } }) }));
}
async function fsDelete(env, path) {
  await fetch(FS + encPath(path), { method: 'DELETE', headers: { Authorization: 'Bearer ' + await gToken(env) } }).catch(() => {});
}
function dec(v) {
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) return Date.parse(v.timestampValue);
  if ('nullValue' in v) return null;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(dec);
  if ('mapValue' in v) { const o = {}; for (const [k, x] of Object.entries(v.mapValue.fields || {})) o[k] = dec(x); return o; }
  return null;
}

// ---------- Google erişim anahtarı (servis hesabı) ----------
let GT = { tok: '', exp: 0 };
async function gToken(env) {
  if (GT.tok && GT.exp > Date.now() + 60e3) return GT.tok;
  const sa = JSON.parse(env.SA_JSON);
  const now = Math.floor(Date.now() / 1000);
  const head = b64u(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const body = b64u(JSON.stringify({
    iss: sa.client_email, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/firebase.messaging https://www.googleapis.com/auth/datastore'
  }));
  const pem = sa.private_key.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const key = await crypto.subtle.importKey('pkcs8', b64d(pem), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(head + '.' + body));
  const jwt = head + '.' + body + '.' + b64u(sig);
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + jwt
  });
  const j = await r.json();
  if (!j.access_token) throw new Error('google anahtar hatası');
  GT = { tok: j.access_token, exp: Date.now() + (j.expires_in || 3600) * 1000 };
  return GT.tok;
}

// ---------- Firebase giriş anahtarı doğrulama ----------
let JW = { keys: null, exp: 0 };
async function verifyIdToken(tok) {
  const p = (tok || '').split('.'); if (p.length !== 3) throw new Error('giriş gerekli');
  const h = JSON.parse(new TextDecoder().decode(b64d(p[0]))), c = JSON.parse(new TextDecoder().decode(b64d(p[1])));
  if (!JW.keys || JW.exp < Date.now()) {
    const r = await fetch('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com');
    JW = { keys: (await r.json()).keys, exp: Date.now() + 3600e3 };
  }
  const jwk = JW.keys.find(k => k.kid === h.kid); if (!jwk) throw new Error('anahtar bulunamadı');
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64d(p[2]), new TextEncoder().encode(p[0] + '.' + p[1]));
  const now = Date.now() / 1000;
  if (!ok || c.aud !== PID || c.iss !== 'https://securetoken.google.com/' + PID || c.exp < now || !c.sub) throw new Error('giriş geçersiz');
  return c.sub;
}

function b64u(x) {
  const b = typeof x === 'string' ? new TextEncoder().encode(x) : new Uint8Array(x);
  let s = ''; for (const ch of b) s += String.fromCharCode(ch);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64d(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '=';
  const bin = atob(s), out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
