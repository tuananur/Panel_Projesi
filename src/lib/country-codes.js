// Search Console ülke boyutu ISO 3166-1 alpha-3 (küçük harf) döner, GA4 countryId alpha-2 döner.
// Ülke adlarını Intl.DisplayNames ile ürettiğimiz için tek ihtiyaç alpha-3 → alpha-2 eşlemesi.
const ALPHA3_ALPHA2 = 'afg:AF ala:AX alb:AL dza:DZ asm:AS and:AD ago:AO aia:AI ata:AQ atg:AG arg:AR arm:AM abw:AW aus:AU aut:AT aze:AZ bhs:BS bhr:BH bgd:BD brb:BB blr:BY bel:BE blz:BZ ben:BJ bmu:BM btn:BT bol:BO bes:BQ bih:BA bwa:BW bvt:BV bra:BR iot:IO brn:BN bgr:BG bfa:BF bdi:BI cpv:CV khm:KH cmr:CM can:CA cym:KY caf:CF tcd:TD chl:CL chn:CN cxr:CX cck:CC col:CO com:KM cog:CG cod:CD cok:CK cri:CR civ:CI hrv:HR cub:CU cuw:CW cyp:CY cze:CZ dnk:DK dji:DJ dma:DM dom:DO ecu:EC egy:EG slv:SV gnq:GQ eri:ER est:EE swz:SZ eth:ET flk:FK fro:FO fji:FJ fin:FI fra:FR guf:GF pyf:PF atf:TF gab:GA gmb:GM geo:GE deu:DE gha:GH gib:GI grc:GR grl:GL grd:GD glp:GP gum:GU gtm:GT ggy:GG gin:GN gnb:GW guy:GY hti:HT hmd:HM vat:VA hnd:HN hkg:HK hun:HU isl:IS ind:IN idn:ID irn:IR irq:IQ irl:IE imn:IM isr:IL ita:IT jam:JM jpn:JP jey:JE jor:JO kaz:KZ ken:KE kir:KI prk:KP kor:KR kwt:KW kgz:KG lao:LA lva:LV lbn:LB lso:LS lbr:LR lby:LY lie:LI ltu:LT lux:LU mac:MO mdg:MG mwi:MW mys:MY mdv:MV mli:ML mlt:MT mhl:MH mtq:MQ mrt:MR mus:MU myt:YT mex:MX fsm:FM mda:MD mco:MC mng:MN mne:ME msr:MS mar:MA moz:MZ mmr:MM nam:NA nru:NR npl:NP nld:NL ncl:NC nzl:NZ nic:NI ner:NE nga:NG niu:NU nfk:NF mkd:MK mnp:MP nor:NO omn:OM pak:PK plw:PW pse:PS pan:PA png:PG pry:PY per:PE phl:PH pcn:PN pol:PL prt:PT pri:PR qat:QA reu:RE rou:RO rus:RU rwa:RW blm:BL shn:SH kna:KN lca:LC maf:MF spm:PM vct:VC wsm:WS smr:SM stp:ST sau:SA sen:SN srb:RS syc:SC sle:SL sgp:SG sxm:SX svk:SK svn:SI slb:SB som:SO zaf:ZA sgs:GS ssd:SS esp:ES lka:LK sdn:SD sur:SR sjm:SJ swe:SE che:CH syr:SY twn:TW tjk:TJ tza:TZ tha:TH tls:TL tgo:TG tkl:TK ton:TO tto:TT tun:TN tur:TR tkm:TM tca:TC tuv:TV uga:UG ukr:UA are:AE gbr:GB usa:US umi:UM ury:UY uzb:UZ vut:VU ven:VE vnm:VN vgb:VG vir:VI wlf:WF esh:EH yem:YE zmb:ZM zwe:ZW';

const alpha3Map = new Map(
  ALPHA3_ALPHA2.split(' ').map((pair) => {
    const [a3, a2] = pair.split(':');
    return [a3, a2];
  })
);

export const UNKNOWN_COUNTRY_LABEL = 'Bilinmiyor';

let displayNames = null;
function getDisplayNames() {
  if (displayNames === null) {
    try {
      displayNames = new Intl.DisplayNames(['tr'], { type: 'region' });
    } catch {
      displayNames = false;
    }
  }
  return displayNames || null;
}

function isUnknownCode(code) {
  if (!code) return true;
  const normalized = String(code).trim().toLowerCase();
  return !normalized || normalized === 'zzz' || normalized === 'zz' || normalized === '(not set)' || normalized === 'unknown';
}

export function alpha3ToAlpha2(code) {
  if (isUnknownCode(code)) return null;
  return alpha3Map.get(String(code).trim().toLowerCase()) || null;
}

/** alpha-2 veya alpha-3 kodundan Türkçe ülke adı. Çözülemezse null. */
export function countryNameFromCode(code) {
  if (isUnknownCode(code)) return null;
  const raw = String(code).trim();
  const alpha2 = raw.length === 3 ? alpha3ToAlpha2(raw) : raw.toUpperCase();
  if (!alpha2) return null;
  const names = getDisplayNames();
  if (!names) return alpha2;
  try {
    const name = names.of(alpha2);
    return name && name !== alpha2 ? name : alpha2;
  } catch {
    return alpha2;
  }
}

/** GA4 (not set) / unknown değerlerini ayrı bir kayıt olarak işaretler. */
export function isUnknownCountryValue(value) {
  if (!value) return true;
  const normalized = String(value).trim().toLowerCase();
  return !normalized || normalized === '(not set)' || normalized === 'unknown' || normalized === 'zz' || normalized === 'zzz';
}
