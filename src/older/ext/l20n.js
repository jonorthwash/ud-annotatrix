'use strict';

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function () {
  'use strict';

  var cp = [function (n) {
    return 'other';
  }, function (n) {
    return n == 1 ? 'one' : 'other';
  }, function (n) {
    return n == 0 || n == 1 ? 'one' : 'other';
  }, function (n) {
    var s = String(n).split('.'),
        v0 = !s[1];
    return n == 1 && v0 ? 'one' : 'other';
  }];

  var pluralData = {
    cardinal: {
      af: cp[1],
      ak: cp[2],
      am: function am(n) {
        return n >= 0 && n <= 1 ? 'one' : 'other';
      },
      ar: function ar(n) {
        var s = String(n).split('.'),
            t0 = Number(s[0]) == n,
            n100 = t0 && s[0].slice(-2);
        return n == 0 ? 'zero' : n == 1 ? 'one' : n == 2 ? 'two' : n100 >= 3 && n100 <= 10 ? 'few' : n100 >= 11 && n100 <= 99 ? 'many' : 'other';
      },
      as: function as(n) {
        return n >= 0 && n <= 1 ? 'one' : 'other';
      },
      asa: cp[1],
      ast: cp[3],
      az: cp[1],
      be: function be(n) {
        var s = String(n).split('.'),
            t0 = Number(s[0]) == n,
            n10 = t0 && s[0].slice(-1),
            n100 = t0 && s[0].slice(-2);
        return n10 == 1 && n100 != 11 ? 'one' : n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14) ? 'few' : t0 && n10 == 0 || n10 >= 5 && n10 <= 9 || n100 >= 11 && n100 <= 14 ? 'many' : 'other';
      },
      bem: cp[1],
      bez: cp[1],
      bg: cp[1],
      bh: cp[2],
      bm: cp[0],
      bn: function bn(n) {
        return n >= 0 && n <= 1 ? 'one' : 'other';
      },
      bo: cp[0],
      br: function br(n) {
        var s = String(n).split('.'),
            t0 = Number(s[0]) == n,
            n10 = t0 && s[0].slice(-1),
            n100 = t0 && s[0].slice(-2),
            n1000000 = t0 && s[0].slice(-6);
        return n10 == 1 && n100 != 11 && n100 != 71 && n100 != 91 ? 'one' : n10 == 2 && n100 != 12 && n100 != 72 && n100 != 92 ? 'two' : (n10 == 3 || n10 == 4 || n10 == 9) && (n100 < 10 || n100 > 19) && (n100 < 70 || n100 > 79) && (n100 < 90 || n100 > 99) ? 'few' : n != 0 && t0 && n1000000 == 0 ? 'many' : 'other';
      },
      brx: cp[1],
      bs: function bs(n) {
        var s = String(n).split('.'),
            i = s[0],
            f = s[1] || '',
            v0 = !s[1],
            i10 = i.slice(-1),
            i100 = i.slice(-2),
            f10 = f.slice(-1),
            f100 = f.slice(-2);
        return v0 && i10 == 1 && i100 != 11 || f10 == 1 && f100 != 11 ? 'one' : v0 && i10 >= 2 && i10 <= 4 && (i100 < 12 || i100 > 14) || f10 >= 2 && f10 <= 4 && (f100 < 12 || f100 > 14) ? 'few' : 'other';
      },
      ca: cp[3],
      ce: cp[1],
      cgg: cp[1],
      chr: cp[1],
      ckb: cp[1],
      cs: function cs(n) {
        var s = String(n).split('.'),
            i = s[0],
            v0 = !s[1];
        return n == 1 && v0 ? 'one' : i >= 2 && i <= 4 && v0 ? 'few' : !v0 ? 'many' : 'other';
      },
      cy: function cy(n) {
        return n == 0 ? 'zero' : n == 1 ? 'one' : n == 2 ? 'two' : n == 3 ? 'few' : n == 6 ? 'many' : 'other';
      },
      da: function da(n) {
        var s = String(n).split('.'),
            i = s[0],
            t0 = Number(s[0]) == n;
        return n == 1 || !t0 && (i == 0 || i == 1) ? 'one' : 'other';
      },
      de: cp[3],
      dsb: function dsb(n) {
        var s = String(n).split('.'),
            i = s[0],
            f = s[1] || '',
            v0 = !s[1],
            i100 = i.slice(-2),
            f100 = f.slice(-2);
        return v0 && i100 == 1 || f100 == 1 ? 'one' : v0 && i100 == 2 || f100 == 2 ? 'two' : v0 && (i100 == 3 || i100 == 4) || f100 == 3 || f100 == 4 ? 'few' : 'other';
      },
      dv: cp[1],
      dz: cp[0],
      ee: cp[1],
      el: cp[1],
      en: cp[3],
      eo: cp[1],
      es: cp[1],
      et: cp[3],
      eu: cp[1],
      fa: function fa(n) {
        return n >= 0 && n <= 1 ? 'one' : 'other';
      },
      ff: function ff(n) {
        return n >= 0 && n < 2 ? 'one' : 'other';
      },
      fi: cp[3],
      fil: function fil(n) {
        var s = String(n).split('.'),
            i = s[0],
            f = s[1] || '',
            v0 = !s[1],
            i10 = i.slice(-1),
            f10 = f.slice(-1);
        return v0 && (i == 1 || i == 2 || i == 3) || v0 && i10 != 4 && i10 != 6 && i10 != 9 || !v0 && f10 != 4 && f10 != 6 && f10 != 9 ? 'one' : 'other';
      },
      fo: cp[1],
      fr: function fr(n) {
        return n >= 0 && n < 2 ? 'one' : 'other';
      },
      fur: cp[1],
      fy: cp[3],
      ga: function ga(n) {
        var s = String(n).split('.'),
            t0 = Number(s[0]) == n;
        return n == 1 ? 'one' : n == 2 ? 'two' : t0 && n >= 3 && n <= 6 ? 'few' : t0 && n >= 7 && n <= 10 ? 'many' : 'other';
      },
      gd: function gd(n) {
        var s = String(n).split('.'),
            t0 = Number(s[0]) == n;
        return n == 1 || n == 11 ? 'one' : n == 2 || n == 12 ? 'two' : t0 && n >= 3 && n <= 10 || t0 && n >= 13 && n <= 19 ? 'few' : 'other';
      },
      gl: cp[3],
      gsw: cp[1],
      gu: function gu(n) {
        return n >= 0 && n <= 1 ? 'one' : 'other';
      },
      guw: cp[2],
      gv: function gv(n) {
        var s = String(n).split('.'),
            i = s[0],
            v0 = !s[1],
            i10 = i.slice(-1),
            i100 = i.slice(-2);
        return v0 && i10 == 1 ? 'one' : v0 && i10 == 2 ? 'two' : v0 && (i100 == 0 || i100 == 20 || i100 == 40 || i100 == 60 || i100 == 80) ? 'few' : !v0 ? 'many' : 'other';
      },
      ha: cp[1],
      haw: cp[1],
      he: function he(n) {
        var s = String(n).split('.'),
            i = s[0],
            v0 = !s[1],
            t0 = Number(s[0]) == n,
            n10 = t0 && s[0].slice(-1);
        return n == 1 && v0 ? 'one' : i == 2 && v0 ? 'two' : v0 && (n < 0 || n > 10) && t0 && n10 == 0 ? 'many' : 'other';
      },
      hi: function hi(n) {
        return n >= 0 && n <= 1 ? 'one' : 'other';
      },
      hr: function hr(n) {
        var s = String(n).split('.'),
            i = s[0],
            f = s[1] || '',
            v0 = !s[1],
            i10 = i.slice(-1),
            i100 = i.slice(-2),
            f10 = f.slice(-1),
            f100 = f.slice(-2);
        return v0 && i10 == 1 && i100 != 11 || f10 == 1 && f100 != 11 ? 'one' : v0 && i10 >= 2 && i10 <= 4 && (i100 < 12 || i100 > 14) || f10 >= 2 && f10 <= 4 && (f100 < 12 || f100 > 14) ? 'few' : 'other';
      },
      hsb: function hsb(n) {
        var s = String(n).split('.'),
            i = s[0],
            f = s[1] || '',
            v0 = !s[1],
            i100 = i.slice(-2),
            f100 = f.slice(-2);
        return v0 && i100 == 1 || f100 == 1 ? 'one' : v0 && i100 == 2 || f100 == 2 ? 'two' : v0 && (i100 == 3 || i100 == 4) || f100 == 3 || f100 == 4 ? 'few' : 'other';
      },
      hu: cp[1],
      hy: function hy(n) {
        return n >= 0 && n < 2 ? 'one' : 'other';
      },
      id: cp[0],
      ig: cp[0],
      ii: cp[0],
      in: cp[0],
      is: function is(n) {
        var s = String(n).split('.'),
            i = s[0],
            t0 = Number(s[0]) == n,
            i10 = i.slice(-1),
            i100 = i.slice(-2);
        return t0 && i10 == 1 && i100 != 11 || !t0 ? 'one' : 'other';
      },
      it: cp[3],
      iu: function iu(n) {
        return n == 1 ? 'one' : n == 2 ? 'two' : 'other';
      },
      iw: function iw(n) {
        var s = String(n).split('.'),
            i = s[0],
            v0 = !s[1],
            t0 = Number(s[0]) == n,
            n10 = t0 && s[0].slice(-1);
        return n == 1 && v0 ? 'one' : i == 2 && v0 ? 'two' : v0 && (n < 0 || n > 10) && t0 && n10 == 0 ? 'many' : 'other';
      },
      ja: cp[0],
      jbo: cp[0],
      jgo: cp[1],
      ji: cp[3],
      jmc: cp[1],
      jv: cp[0],
      jw: cp[0],
      ka: cp[1],
      kab: function kab(n) {
        return n >= 0 && n < 2 ? 'one' : 'other';
      },
      kaj: cp[1],
      kcg: cp[1],
      kde: cp[0],
      kea: cp[0],
      kk: cp[1],
      kkj: cp[1],
      kl: cp[1],
      km: cp[0],
      kn: function kn(n) {
        return n >= 0 && n <= 1 ? 'one' : 'other';
      },
      ko: cp[0],
      ks: cp[1],
      ksb: cp[1],
      ksh: function ksh(n) {
        return n == 0 ? 'zero' : n == 1 ? 'one' : 'other';
      },
      ku: cp[1],
      kw: function kw(n) {
        return n == 1 ? 'one' : n == 2 ? 'two' : 'other';
      },
      ky: cp[1],
      lag: function lag(n) {
        var s = String(n).split('.'),
            i = s[0];
        return n == 0 ? 'zero' : (i == 0 || i == 1) && n != 0 ? 'one' : 'other';
      },
      lb: cp[1],
      lg: cp[1],
      lkt: cp[0],
      ln: cp[2],
      lo: cp[0],
      lt: function lt(n) {
        var s = String(n).split('.'),
            f = s[1] || '',
            t0 = Number(s[0]) == n,
            n10 = t0 && s[0].slice(-1),
            n100 = t0 && s[0].slice(-2);
        return n10 == 1 && (n100 < 11 || n100 > 19) ? 'one' : n10 >= 2 && n10 <= 9 && (n100 < 11 || n100 > 19) ? 'few' : f != 0 ? 'many' : 'other';
      },
      lv: function lv(n) {
        var s = String(n).split('.'),
            f = s[1] || '',
            v = f.length,
            t0 = Number(s[0]) == n,
            n10 = t0 && s[0].slice(-1),
            n100 = t0 && s[0].slice(-2),
            f100 = f.slice(-2),
            f10 = f.slice(-1);
        return t0 && n10 == 0 || n100 >= 11 && n100 <= 19 || v == 2 && f100 >= 11 && f100 <= 19 ? 'zero' : n10 == 1 && n100 != 11 || v == 2 && f10 == 1 && f100 != 11 || v != 2 && f10 == 1 ? 'one' : 'other';
      },
      mas: cp[1],
      mg: cp[2],
      mgo: cp[1],
      mk: function mk(n) {
        var s = String(n).split('.'),
            i = s[0],
            f = s[1] || '',
            v0 = !s[1],
            i10 = i.slice(-1),
            f10 = f.slice(-1);
        return v0 && i10 == 1 || f10 == 1 ? 'one' : 'other';
      },
      ml: cp[1],
      mn: cp[1],
      mo: function mo(n) {
        var s = String(n).split('.'),
            v0 = !s[1],
            t0 = Number(s[0]) == n,
            n100 = t0 && s[0].slice(-2);
        return n == 1 && v0 ? 'one' : !v0 || n == 0 || n != 1 && n100 >= 1 && n100 <= 19 ? 'few' : 'other';
      },
      mr: function mr(n) {
        return n >= 0 && n <= 1 ? 'one' : 'other';
      },
      ms: cp[0],
      mt: function mt(n) {
        var s = String(n).split('.'),
            t0 = Number(s[0]) == n,
            n100 = t0 && s[0].slice(-2);
        return n == 1 ? 'one' : n == 0 || n100 >= 2 && n100 <= 10 ? 'few' : n100 >= 11 && n100 <= 19 ? 'many' : 'other';
      },
      my: cp[0],
      nah: cp[1],
      naq: function naq(n) {
        return n == 1 ? 'one' : n == 2 ? 'two' : 'other';
      },
      nb: cp[1],
      nd: cp[1],
      ne: cp[1],
      nl: cp[3],
      nn: cp[1],
      nnh: cp[1],
      no: cp[1],
      nqo: cp[0],
      nr: cp[1],
      nso: cp[2],
      ny: cp[1],
      nyn: cp[1],
      om: cp[1],
      or: cp[1],
      os: cp[1],
      pa: cp[2],
      pap: cp[1],
      pl: function pl(n) {
        var s = String(n).split('.'),
            i = s[0],
            v0 = !s[1],
            i10 = i.slice(-1),
            i100 = i.slice(-2);
        return n == 1 && v0 ? 'one' : v0 && i10 >= 2 && i10 <= 4 && (i100 < 12 || i100 > 14) ? 'few' : v0 && i != 1 && (i10 == 0 || i10 == 1) || v0 && i10 >= 5 && i10 <= 9 || v0 && i100 >= 12 && i100 <= 14 ? 'many' : 'other';
      },
      prg: function prg(n) {
        var s = String(n).split('.'),
            f = s[1] || '',
            v = f.length,
            t0 = Number(s[0]) == n,
            n10 = t0 && s[0].slice(-1),
            n100 = t0 && s[0].slice(-2),
            f100 = f.slice(-2),
            f10 = f.slice(-1);
        return t0 && n10 == 0 || n100 >= 11 && n100 <= 19 || v == 2 && f100 >= 11 && f100 <= 19 ? 'zero' : n10 == 1 && n100 != 11 || v == 2 && f10 == 1 && f100 != 11 || v != 2 && f10 == 1 ? 'one' : 'other';
      },
      ps: cp[1],
      pt: function pt(n) {
        var s = String(n).split('.'),
            t0 = Number(s[0]) == n;
        return t0 && n >= 0 && n <= 2 && n != 2 ? 'one' : 'other';
      },
      "pt-PT": cp[3],
      rm: cp[1],
      ro: function ro(n) {
        var s = String(n).split('.'),
            v0 = !s[1],
            t0 = Number(s[0]) == n,
            n100 = t0 && s[0].slice(-2);
        return n == 1 && v0 ? 'one' : !v0 || n == 0 || n != 1 && n100 >= 1 && n100 <= 19 ? 'few' : 'other';
      },
      rof: cp[1],
      root: cp[0],
      ru: function ru(n) {
        var s = String(n).split('.'),
            i = s[0],
            v0 = !s[1],
            i10 = i.slice(-1),
            i100 = i.slice(-2);
        return v0 && i10 == 1 && i100 != 11 ? 'one' : v0 && i10 >= 2 && i10 <= 4 && (i100 < 12 || i100 > 14) ? 'few' : v0 && i10 == 0 || v0 && i10 >= 5 && i10 <= 9 || v0 && i100 >= 11 && i100 <= 14 ? 'many' : 'other';
      },
      rwk: cp[1],
      sah: cp[0],
      saq: cp[1],
      sdh: cp[1],
      se: function se(n) {
        return n == 1 ? 'one' : n == 2 ? 'two' : 'other';
      },
      seh: cp[1],
      ses: cp[0],
      sg: cp[0],
      sh: function sh(n) {
        var s = String(n).split('.'),
            i = s[0],
            f = s[1] || '',
            v0 = !s[1],
            i10 = i.slice(-1),
            i100 = i.slice(-2),
            f10 = f.slice(-1),
            f100 = f.slice(-2);
        return v0 && i10 == 1 && i100 != 11 || f10 == 1 && f100 != 11 ? 'one' : v0 && i10 >= 2 && i10 <= 4 && (i100 < 12 || i100 > 14) || f10 >= 2 && f10 <= 4 && (f100 < 12 || f100 > 14) ? 'few' : 'other';
      },
      shi: function shi(n) {
        var s = String(n).split('.'),
            t0 = Number(s[0]) == n;
        return n >= 0 && n <= 1 ? 'one' : t0 && n >= 2 && n <= 10 ? 'few' : 'other';
      },
      si: function si(n) {
        var s = String(n).split('.'),
            i = s[0],
            f = s[1] || '';
        return n == 0 || n == 1 || i == 0 && f == 1 ? 'one' : 'other';
      },
      sk: function sk(n) {
        var s = String(n).split('.'),
            i = s[0],
            v0 = !s[1];
        return n == 1 && v0 ? 'one' : i >= 2 && i <= 4 && v0 ? 'few' : !v0 ? 'many' : 'other';
      },
      sl: function sl(n) {
        var s = String(n).split('.'),
            i = s[0],
            v0 = !s[1],
            i100 = i.slice(-2);
        return v0 && i100 == 1 ? 'one' : v0 && i100 == 2 ? 'two' : v0 && (i100 == 3 || i100 == 4) || !v0 ? 'few' : 'other';
      },
      sma: function sma(n) {
        return n == 1 ? 'one' : n == 2 ? 'two' : 'other';
      },
      smi: function smi(n) {
        return n == 1 ? 'one' : n == 2 ? 'two' : 'other';
      },
      smj: function smj(n) {
        return n == 1 ? 'one' : n == 2 ? 'two' : 'other';
      },
      smn: function smn(n) {
        return n == 1 ? 'one' : n == 2 ? 'two' : 'other';
      },
      sms: function sms(n) {
        return n == 1 ? 'one' : n == 2 ? 'two' : 'other';
      },
      sn: cp[1],
      so: cp[1],
      sq: cp[1],
      sr: function sr(n) {
        var s = String(n).split('.'),
            i = s[0],
            f = s[1] || '',
            v0 = !s[1],
            i10 = i.slice(-1),
            i100 = i.slice(-2),
            f10 = f.slice(-1),
            f100 = f.slice(-2);
        return v0 && i10 == 1 && i100 != 11 || f10 == 1 && f100 != 11 ? 'one' : v0 && i10 >= 2 && i10 <= 4 && (i100 < 12 || i100 > 14) || f10 >= 2 && f10 <= 4 && (f100 < 12 || f100 > 14) ? 'few' : 'other';
      },
      ss: cp[1],
      ssy: cp[1],
      st: cp[1],
      sv: cp[3],
      sw: cp[3],
      syr: cp[1],
      ta: cp[1],
      te: cp[1],
      teo: cp[1],
      th: cp[0],
      ti: cp[2],
      tig: cp[1],
      tk: cp[1],
      tl: function tl(n) {
        var s = String(n).split('.'),
            i = s[0],
            f = s[1] || '',
            v0 = !s[1],
            i10 = i.slice(-1),
            f10 = f.slice(-1);
        return v0 && (i == 1 || i == 2 || i == 3) || v0 && i10 != 4 && i10 != 6 && i10 != 9 || !v0 && f10 != 4 && f10 != 6 && f10 != 9 ? 'one' : 'other';
      },
      tn: cp[1],
      to: cp[0],
      tr: cp[1],
      ts: cp[1],
      tzm: function tzm(n) {
        var s = String(n).split('.'),
            t0 = Number(s[0]) == n;
        return n == 0 || n == 1 || t0 && n >= 11 && n <= 99 ? 'one' : 'other';
      },
      ug: cp[1],
      uk: function uk(n) {
        var s = String(n).split('.'),
            i = s[0],
            v0 = !s[1],
            i10 = i.slice(-1),
            i100 = i.slice(-2);
        return v0 && i10 == 1 && i100 != 11 ? 'one' : v0 && i10 >= 2 && i10 <= 4 && (i100 < 12 || i100 > 14) ? 'few' : v0 && i10 == 0 || v0 && i10 >= 5 && i10 <= 9 || v0 && i100 >= 11 && i100 <= 14 ? 'many' : 'other';
      },
      ur: cp[3],
      uz: cp[1],
      ve: cp[1],
      vi: cp[0],
      vo: cp[1],
      vun: cp[1],
      wa: cp[2],
      wae: cp[1],
      wo: cp[0],
      xh: cp[1],
      xog: cp[1],
      yi: cp[3],
      yo: cp[0],
      zh: cp[0],
      zu: function zu(n) {
        return n >= 0 && n <= 1 ? 'one' : 'other';
      }
    },
    ordinal: {
      af: cp[0],
      am: cp[0],
      ar: cp[0],
      as: function as(n) {
        return n == 1 || n == 5 || n == 7 || n == 8 || n == 9 || n == 10 ? 'one' : n == 2 || n == 3 ? 'two' : n == 4 ? 'few' : n == 6 ? 'many' : 'other';
      },
      az: function az(n) {
        var s = String(n).split('.'),
            i = s[0],
            i10 = i.slice(-1),
            i100 = i.slice(-2),
            i1000 = i.slice(-3);
        return i10 == 1 || i10 == 2 || i10 == 5 || i10 == 7 || i10 == 8 || i100 == 20 || i100 == 50 || i100 == 70 || i100 == 80 ? 'one' : i10 == 3 || i10 == 4 || i1000 == 100 || i1000 == 200 || i1000 == 300 || i1000 == 400 || i1000 == 500 || i1000 == 600 || i1000 == 700 || i1000 == 800 || i1000 == 900 ? 'few' : i == 0 || i10 == 6 || i100 == 40 || i100 == 60 || i100 == 90 ? 'many' : 'other';
      },
      be: function be(n) {
        var s = String(n).split('.'),
            t0 = Number(s[0]) == n,
            n10 = t0 && s[0].slice(-1),
            n100 = t0 && s[0].slice(-2);
        return (n10 == 2 || n10 == 3) && n100 != 12 && n100 != 13 ? 'few' : 'other';
      },
      bg: cp[0],
      bn: function bn(n) {
        return n == 1 || n == 5 || n == 7 || n == 8 || n == 9 || n == 10 ? 'one' : n == 2 || n == 3 ? 'two' : n == 4 ? 'few' : n == 6 ? 'many' : 'other';
      },
      bs: cp[0],
      ca: function ca(n) {
        return n == 1 || n == 3 ? 'one' : n == 2 ? 'two' : n == 4 ? 'few' : 'other';
      },
      ce: cp[0],
      cs: cp[0],
      cy: function cy(n) {
        return n == 0 || n == 7 || n == 8 || n == 9 ? 'zero' : n == 1 ? 'one' : n == 2 ? 'two' : n == 3 || n == 4 ? 'few' : n == 5 || n == 6 ? 'many' : 'other';
      },
      da: cp[0],
      de: cp[0],
      dsb: cp[0],
      el: cp[0],
      en: function en(n) {
        var s = String(n).split('.'),
            t0 = Number(s[0]) == n,
            n10 = t0 && s[0].slice(-1),
            n100 = t0 && s[0].slice(-2);
        return n10 == 1 && n100 != 11 ? 'one' : n10 == 2 && n100 != 12 ? 'two' : n10 == 3 && n100 != 13 ? 'few' : 'other';
      },
      es: cp[0],
      et: cp[0],
      eu: cp[0],
      fa: cp[0],
      fi: cp[0],
      fil: cp[1],
      fr: cp[1],
      fy: cp[0],
      ga: cp[1],
      gl: cp[0],
      gu: function gu(n) {
        return n == 1 ? 'one' : n == 2 || n == 3 ? 'two' : n == 4 ? 'few' : n == 6 ? 'many' : 'other';
      },
      he: cp[0],
      hi: function hi(n) {
        return n == 1 ? 'one' : n == 2 || n == 3 ? 'two' : n == 4 ? 'few' : n == 6 ? 'many' : 'other';
      },
      hr: cp[0],
      hsb: cp[0],
      hu: function hu(n) {
        return n == 1 || n == 5 ? 'one' : 'other';
      },
      hy: cp[1],
      id: cp[0],
      in: cp[0],
      is: cp[0],
      it: function it(n) {
        return n == 11 || n == 8 || n == 80 || n == 800 ? 'many' : 'other';
      },
      iw: cp[0],
      ja: cp[0],
      ka: function ka(n) {
        var s = String(n).split('.'),
            i = s[0],
            i100 = i.slice(-2);
        return i == 1 ? 'one' : i == 0 || i100 >= 2 && i100 <= 20 || i100 == 40 || i100 == 60 || i100 == 80 ? 'many' : 'other';
      },
      kk: function kk(n) {
        var s = String(n).split('.'),
            t0 = Number(s[0]) == n,
            n10 = t0 && s[0].slice(-1);
        return n10 == 6 || n10 == 9 || t0 && n10 == 0 && n != 0 ? 'many' : 'other';
      },
      km: cp[0],
      kn: cp[0],
      ko: cp[0],
      ky: cp[0],
      lo: cp[1],
      lt: cp[0],
      lv: cp[0],
      mk: function mk(n) {
        var s = String(n).split('.'),
            i = s[0],
            i10 = i.slice(-1),
            i100 = i.slice(-2);
        return i10 == 1 && i100 != 11 ? 'one' : i10 == 2 && i100 != 12 ? 'two' : (i10 == 7 || i10 == 8) && i100 != 17 && i100 != 18 ? 'many' : 'other';
      },
      ml: cp[0],
      mn: cp[0],
      mo: cp[1],
      mr: function mr(n) {
        return n == 1 ? 'one' : n == 2 || n == 3 ? 'two' : n == 4 ? 'few' : 'other';
      },
      ms: cp[1],
      my: cp[0],
      nb: cp[0],
      ne: function ne(n) {
        var s = String(n).split('.'),
            t0 = Number(s[0]) == n;
        return t0 && n >= 1 && n <= 4 ? 'one' : 'other';
      },
      nl: cp[0],
      pa: cp[0],
      pl: cp[0],
      prg: cp[0],
      pt: cp[0],
      ro: cp[1],
      root: cp[0],
      ru: cp[0],
      sh: cp[0],
      si: cp[0],
      sk: cp[0],
      sl: cp[0],
      sq: function sq(n) {
        var s = String(n).split('.'),
            t0 = Number(s[0]) == n,
            n10 = t0 && s[0].slice(-1),
            n100 = t0 && s[0].slice(-2);
        return n == 1 ? 'one' : n10 == 4 && n100 != 14 ? 'many' : 'other';
      },
      sr: cp[0],
      sv: function sv(n) {
        var s = String(n).split('.'),
            t0 = Number(s[0]) == n,
            n10 = t0 && s[0].slice(-1),
            n100 = t0 && s[0].slice(-2);
        return (n10 == 1 || n10 == 2) && n100 != 11 && n100 != 12 ? 'one' : 'other';
      },
      sw: cp[0],
      ta: cp[0],
      te: cp[0],
      th: cp[0],
      tl: cp[1],
      tr: cp[0],
      uk: function uk(n) {
        var s = String(n).split('.'),
            t0 = Number(s[0]) == n,
            n10 = t0 && s[0].slice(-1),
            n100 = t0 && s[0].slice(-2);
        return n10 == 3 && n100 != 13 ? 'few' : 'other';
      },
      ur: cp[0],
      uz: cp[0],
      vi: cp[1],
      zh: cp[0],
      zu: cp[0]
    }
  };

  var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
    return typeof obj === 'undefined' ? 'undefined' : _typeof2(obj);
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === 'undefined' ? 'undefined' : _typeof2(obj);
  };

  var classCallCheck = function classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var get = function get(object, property, receiver) {
    if (object === null) object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);

    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);

      if (parent === null) {
        return undefined;
      } else {
        return get(parent, property, receiver);
      }
    } else if ("value" in desc) {
      return desc.value;
    } else {
      var getter = desc.get;

      if (getter === undefined) {
        return undefined;
      }

      return getter.call(receiver);
    }
  };

  var inherits = function inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === 'undefined' ? 'undefined' : _typeof2(superClass)));
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };

  var possibleConstructorReturn = function possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && ((typeof call === 'undefined' ? 'undefined' : _typeof2(call)) === "object" || typeof call === "function") ? call : self;
  };

  var slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  var toConsumableArray = function toConsumableArray(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }return arr2;
    } else {
      return Array.from(arr);
    }
  };

  function isStructurallyValidLanguageTag(locale) {
    return locale.split('-').every(function (subtag) {
      return (/[a-z0-9]+/i.test(subtag)
      );
    });
  }

  function canonicalizeLocaleList(locales) {
    if (!locales) return [];
    if (!Array.isArray(locales)) locales = [locales];
    return locales.map(function (tag) {
      switch (typeof tag === 'undefined' ? 'undefined' : _typeof(tag)) {
        case 'string':
          break;
        case 'object':
          tag = tag.toString();break;
        default:
          throw new TypeError('Locales should be strings, ' + JSON.stringify(tag) + " isn't.");
      }
      if (!isStructurallyValidLanguageTag(tag)) {
        throw new RangeError('The locale ' + JSON.stringify(tag) + ' is not a structurally valid BCP 47 language tag.');
      }
      return tag;
    }).reduce(function (seen, tag) {
      if (seen.indexOf(tag) < 0) seen.push(tag);
      return seen;
    }, []);
  }

  function defaultLocale() {
    return typeof window !== 'undefined' && window.navigator && (window.navigator.userLanguage || window.navigator.language) || 'en-US';
  }

  function findLocale(locales, locale) {
    do {
      if (locales[locale]) return locale;
      locale = locale.replace(/-?[^-]*$/, '');
    } while (locale);
    return null;
  }

  function resolveLocale(availableLocales, requestedLocales) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = requestedLocales[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var locale = _step.value;

        var availableLocale = findLocale(availableLocales, locale);
        if (availableLocale) return availableLocale;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return findLocale(availableLocales, defaultLocale());
  }

  function getStyle(_ref) {
    var style = _ref.style;

    if (!style) return 'cardinal';
    if (['cardinal', 'ordinal'].indexOf(style) < 0) {
      throw new RangeError('Not a valid plural syle: ' + JSON.stringify(style));
    }
    return style;
  }

  var PluralRules = function () {
    function PluralRules(locales) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      classCallCheck(this, PluralRules);

      var requestedLocales = canonicalizeLocaleList(locales);
      this.style = getStyle(options);
      this.locale = resolveLocale(pluralData[this.style], requestedLocales);
      this.select = pluralData[this.style][this.locale];
    }

    createClass(PluralRules, [{
      key: 'resolvedOptions',
      value: function resolvedOptions() {
        return { locale: this.locale, style: this.style };
      }
    }], [{
      key: 'supportedLocalesOf',
      value: function supportedLocalesOf(locales) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        var requestedLocales = canonicalizeLocaleList(locales);
        var style = getStyle(options);
        return requestedLocales.filter(function (locale) {
          return findLocale(pluralData[style], locale);
        });
      }
    }]);
    return PluralRules;
  }();

  if (typeof Intl === 'undefined') {
    if (typeof global !== 'undefined') {
      global.Intl = { PluralRules: PluralRules };
    } else if (typeof window !== 'undefined') {
      window.Intl = { PluralRules: PluralRules };
    } else {
      this.Intl = { PluralRules: PluralRules };
    }
  } else if (!Intl.PluralRules || typeof ClobberIntlPluralRules !== 'undefined' && ClobberIntlPluralRules) {
    Intl.PluralRules = PluralRules;
  } else if (typeof console !== 'undefined') {
    console.warn('Intl.PluralRules already exists, and has NOT been replaced by this polyfill');
    console.log('To force, set a global ClobberIntlPluralRules = true');
  }

  if (typeof navigator !== 'undefined' && navigator.languages === undefined) {
    navigator.languages = [navigator.language];
  }

  if (typeof Intl === 'undefined') {
    window.Intl = {};
  }

  var MAX_PLACEABLES = 100;

  var RuntimeParser = function () {
    function RuntimeParser() {
      classCallCheck(this, RuntimeParser);
    }

    createClass(RuntimeParser, [{
      key: 'getResource',

      value: function getResource(string) {
        this._source = string;
        this._index = 0;
        this._length = string.length;

        var entries = {};
        var errors = [];

        this.getWS();
        while (this._index < this._length) {
          try {
            this.getEntry(entries);
          } catch (e) {
            if (e instanceof SyntaxError) {
              errors.push(e);

              var nextEntity = this._findNextEntryStart();
              this._index = nextEntity === -1 ? this._length : nextEntity;
            } else {
              throw e;
            }
          }
          this.getWS();
        }

        return [entries, errors];
      }
    }, {
      key: 'getEntry',
      value: function getEntry(entries) {
        if (this._index !== 0 && this._source[this._index - 1] !== '\n') {
          throw this.error('Expected new line and a new entry');
        }

        var ch = this._source[this._index];

        if (ch === '/') {
          this.getComment();
          return;
        }

        if (ch === '[') {
          this.getSection();
          return;
        }

        if (ch !== '\n') {
          this.getMessage(entries);
        }
      }
    }, {
      key: 'getSection',
      value: function getSection() {
        this._index += 1;
        if (this._source[this._index] !== '[') {
          throw this.error('Expected "[[" to open a section');
        }

        this._index += 1;

        this.getLineWS();
        this.getSymbol();
        this.getLineWS();

        if (this._source[this._index] !== ']' || this._source[this._index + 1] !== ']') {
          throw this.error('Expected "]]" to close a section');
        }

        this._index += 2;

        return undefined;
      }
    }, {
      key: 'getMessage',
      value: function getMessage(entries) {
        var id = this.getIdentifier();
        var attrs = null;
        var tags = null;

        this.getLineWS();

        var ch = this._source[this._index];

        var val = void 0;

        if (ch === '=') {
          this._index++;

          this.getLineWS();

          val = this.getPattern();
        } else {
          this.getWS();
        }

        ch = this._source[this._index];

        if (ch === '\n') {
          this._index++;
          this.getLineWS();
          ch = this._source[this._index];
        }

        if (ch === '.') {
          attrs = this.getAttributes();
        }

        if (ch === '#') {
          if (attrs !== null) {
            throw this.error('Tags cannot be added to a message with attributes.');
          }
          tags = this.getTags();
        }

        if (tags === null && attrs === null && typeof val === 'string') {
          entries[id] = val;
        } else {
          if (val === undefined) {
            if (tags === null && attrs === null) {
              throw this.error('Expected a value (like: " = value") or\n            an attribute (like: ".key = value")');
            }
          }

          entries[id] = { val: val };
          if (attrs) {
            entries[id].attrs = attrs;
          }
          if (tags) {
            entries[id].tags = tags;
          }
        }
      }
    }, {
      key: 'getWS',
      value: function getWS() {
        var cc = this._source.charCodeAt(this._index);

        while (cc === 32 || cc === 10 || cc === 9 || cc === 13) {
          cc = this._source.charCodeAt(++this._index);
        }
      }
    }, {
      key: 'getLineWS',
      value: function getLineWS() {
        var cc = this._source.charCodeAt(this._index);

        while (cc === 32 || cc === 9) {
          cc = this._source.charCodeAt(++this._index);
        }
      }
    }, {
      key: 'getIdentifier',
      value: function getIdentifier() {
        var start = this._index;
        var cc = this._source.charCodeAt(this._index);

        if (cc >= 97 && cc <= 122 || cc >= 65 && cc <= 90 || cc === 95) {
          cc = this._source.charCodeAt(++this._index);
        } else {
          throw this.error('Expected an identifier (starting with [a-zA-Z_])');
        }

        while (cc >= 97 && cc <= 122 || cc >= 65 && cc <= 90 || cc >= 48 && cc <= 57 || cc === 95 || cc === 45) {
          cc = this._source.charCodeAt(++this._index);
        }

        return this._source.slice(start, this._index);
      }
    }, {
      key: 'getSymbol',
      value: function getSymbol() {
        var name = '';

        var start = this._index;
        var cc = this._source.charCodeAt(this._index);

        if (cc >= 97 && cc <= 122 || cc >= 65 && cc <= 90 || cc === 95 || cc === 32) {
          cc = this._source.charCodeAt(++this._index);
        } else if (name.length === 0) {
          throw this.error('Expected a keyword (starting with [a-zA-Z_])');
        }

        while (cc >= 97 && cc <= 122 || cc >= 65 && cc <= 90 || cc >= 48 && cc <= 57 || cc === 95 || cc === 45 || cc === 32) {
          cc = this._source.charCodeAt(++this._index);
        }

        while (this._source.charCodeAt(this._index - 1) === 32) {
          this._index--;
        }

        name += this._source.slice(start, this._index);

        return { type: 'sym', name: name };
      }
    }, {
      key: 'getString',
      value: function getString() {
        var value = '';

        while (++this._index < this._length) {
          var ch = this._source[this._index];

          if (ch === '"') {
            break;
          }

          if (ch === '\n') {
            break;
          }

          value += ch;
        }

        this._index++;
        return value;
      }

    }, {
      key: 'getPattern',
      value: function getPattern() {
        var start = this._index;
        var eol = this._source.indexOf('\n', this._index);

        if (eol === -1) {
          eol = this._length;
        }

        var line = start !== eol ? this._source.slice(start, eol) : undefined;

        if (line !== undefined && line.includes('{')) {
          return this.getComplexPattern();
        }

        this._index = eol + 1;

        if (this._source[this._index] === ' ') {
          this._index = start;
          return this.getComplexPattern();
        }

        return line;
      }

    }, {
      key: 'getComplexPattern',
      value: function getComplexPattern() {
        var buffer = '';
        var content = [];
        var placeables = 0;

        var ch = this._source[this._index];

        if (ch === '\\' && (this._source[this._index + 1] === '"' || this._source[this._index + 1] === '{' || this._source[this._index + 1] === '\\')) {
          buffer += this._source[this._index + 1];
          this._index += 2;
          ch = this._source[this._index];
        }

        while (this._index < this._length) {
          if (ch === '\n') {
            this._index++;
            if (this._source[this._index] !== ' ') {
              break;
            }
            this.getLineWS();

            if (this._source[this._index] === '}' || this._source[this._index] === '[' || this._source[this._index] === '*' || this._source[this._index] === '#' || this._source[this._index] === '.') {
              break;
            }

            if (buffer.length) {
              buffer += '\n';
            }
            ch = this._source[this._index];
            continue;
          } else if (ch === '\\') {
            var ch2 = this._source[this._index + 1];
            if (ch2 === '"' || ch2 === '{') {
              ch = ch2;
              this._index++;
            }
          } else if (ch === '{') {
            if (buffer.length) {
              content.push(buffer);
            }
            if (placeables > MAX_PLACEABLES - 1) {
              throw this.error('Too many placeables, maximum allowed is ' + MAX_PLACEABLES);
            }
            buffer = '';
            content.push(this.getPlaceable());

            this._index++;

            ch = this._source[this._index];
            placeables++;
            continue;
          }

          if (ch) {
            buffer += ch;
          }
          this._index++;
          ch = this._source[this._index];
        }

        if (content.length === 0) {
          return buffer.length ? buffer : undefined;
        }

        if (buffer.length) {
          content.push(buffer);
        }

        return content;
      }
    }, {
      key: 'getPlaceable',
      value: function getPlaceable() {
        var start = ++this._index;

        this.getWS();

        if (this._source[this._index] === '*' || this._source[this._index] === '[' && this._source[this._index + 1] !== ']') {
          var _variants = this.getVariants();

          return {
            type: 'sel',
            exp: null,
            vars: _variants[0],
            def: _variants[1]
          };
        }

        this._index = start;
        this.getLineWS();

        var selector = this.getSelectorExpression();
        var variants = void 0;

        this.getWS();

        var ch = this._source[this._index];

        if (ch !== '}') {
          if (ch !== '-' || this._source[this._index + 1] !== '>') {
            throw this.error('Expected "}", "," or "->"');
          }

          this._index += 2;

          this.getLineWS();

          if (this._source[this._index] !== '\n') {
            throw this.error('Variants should be listed in a new line');
          }

          this.getWS();

          variants = this.getVariants();

          if (variants[0].length === 0) {
            throw this.error('Expected members for the select expression');
          }
        }

        if (variants === undefined) {
          return selector;
        }
        return {
          type: 'sel',
          exp: selector,
          vars: variants[0],
          def: variants[1]
        };
      }
    }, {
      key: 'getSelectorExpression',
      value: function getSelectorExpression() {
        var literal = this.getLiteral();

        if (literal.type !== 'ref') {
          return literal;
        }

        if (this._source[this._index] === '.') {
          this._index++;

          var name = this.getIdentifier();
          this._index++;
          return {
            type: 'attr',
            id: literal,
            name: name
          };
        }

        if (this._source[this._index] === '[') {
          this._index++;

          var key = this.getVariantKey();
          this._index++;
          return {
            type: 'var',
            id: literal,
            key: key
          };
        }

        if (this._source[this._index] === '(') {
          this._index++;
          var args = this.getCallArgs();

          this._index++;

          literal.type = 'fun';

          return {
            type: 'call',
            fun: literal,
            args: args
          };
        }

        return literal;
      }
    }, {
      key: 'getCallArgs',
      value: function getCallArgs() {
        var args = [];

        if (this._source[this._index] === ')') {
          return args;
        }

        while (this._index < this._length) {
          this.getLineWS();

          var exp = this.getSelectorExpression();

          if (exp.type !== 'ref' || exp.namespace !== undefined) {
            args.push(exp);
          } else {
            this.getLineWS();

            if (this._source[this._index] === ':') {
              this._index++;
              this.getLineWS();

              var val = this.getSelectorExpression();

              if (typeof val === 'string' || Array.isArray(val) || val.type === 'num') {
                args.push({
                  type: 'narg',
                  name: exp.name,
                  val: val
                });
              } else {
                this._index = this._source.lastIndexOf(':', this._index) + 1;
                throw this.error('Expected string in quotes, number.');
              }
            } else {
              args.push(exp);
            }
          }

          this.getLineWS();

          if (this._source[this._index] === ')') {
            break;
          } else if (this._source[this._index] === ',') {
            this._index++;
          } else {
            throw this.error('Expected "," or ")"');
          }
        }

        return args;
      }
    }, {
      key: 'getNumber',
      value: function getNumber() {
        var num = '';
        var cc = this._source.charCodeAt(this._index);

        if (cc === 45) {
          num += '-';
          cc = this._source.charCodeAt(++this._index);
        }

        if (cc < 48 || cc > 57) {
          throw this.error('Unknown literal "' + num + '"');
        }

        while (cc >= 48 && cc <= 57) {
          num += this._source[this._index++];
          cc = this._source.charCodeAt(this._index);
        }

        if (cc === 46) {
          num += this._source[this._index++];
          cc = this._source.charCodeAt(this._index);

          if (cc < 48 || cc > 57) {
            throw this.error('Unknown literal "' + num + '"');
          }

          while (cc >= 48 && cc <= 57) {
            num += this._source[this._index++];
            cc = this._source.charCodeAt(this._index);
          }
        }

        return {
          type: 'num',
          val: num
        };
      }
    }, {
      key: 'getAttributes',
      value: function getAttributes() {
        var attrs = {};

        while (this._index < this._length) {
          var ch = this._source[this._index];

          if (ch !== '.') {
            break;
          }
          this._index++;

          var key = this.getIdentifier();

          this.getLineWS();

          this._index++;

          this.getLineWS();

          var val = this.getPattern();

          if (typeof val === 'string') {
            attrs[key] = val;
          } else {
            attrs[key] = {
              val: val
            };
          }

          this.getWS();
        }

        return attrs;
      }
    }, {
      key: 'getTags',
      value: function getTags() {
        var tags = [];

        while (this._index < this._length) {
          var ch = this._source[this._index];

          if (ch !== '#') {
            break;
          }
          this._index++;

          var symbol = this.getSymbol();

          tags.push(symbol.name);

          this.getWS();
        }

        return tags;
      }
    }, {
      key: 'getVariants',
      value: function getVariants() {
        var variants = [];
        var index = 0;
        var defaultIndex = void 0;

        while (this._index < this._length) {
          var ch = this._source[this._index];

          if ((ch !== '[' || this._source[this._index + 1] === '[') && ch !== '*') {
            break;
          }
          if (ch === '*') {
            this._index++;
            defaultIndex = index;
          }

          if (this._source[this._index] !== '[') {
            throw this.error('Expected "["');
          }

          this._index++;

          var key = this.getVariantKey();

          this.getLineWS();

          var variant = {
            key: key,
            val: this.getPattern()
          };
          variants[index++] = variant;

          this.getWS();
        }

        return [variants, defaultIndex];
      }

    }, {
      key: 'getVariantKey',
      value: function getVariantKey() {
        var cc = this._source.charCodeAt(this._index);
        var literal = void 0;

        if (cc >= 48 && cc <= 57 || cc === 45) {
          literal = this.getNumber();
        } else {
          literal = this.getSymbol();
        }

        if (this._source[this._index] !== ']') {
          throw this.error('Expected "]"');
        }

        this._index++;
        return literal;
      }
    }, {
      key: 'getLiteral',
      value: function getLiteral() {
        var cc = this._source.charCodeAt(this._index);
        if (cc >= 48 && cc <= 57 || cc === 45) {
          return this.getNumber();
        } else if (cc === 34) {
          return this.getString();
        } else if (cc === 36) {
          this._index++;
          return {
            type: 'ext',
            name: this.getIdentifier()
          };
        }

        return {
          type: 'ref',
          name: this.getIdentifier()
        };
      }

    }, {
      key: 'getComment',
      value: function getComment() {
        var eol = this._source.indexOf('\n', this._index);

        while (eol !== -1 && this._source[eol + 1] === '/' && this._source[eol + 2] === '/') {
          this._index = eol + 3;

          eol = this._source.indexOf('\n', this._index);

          if (eol === -1) {
            break;
          }
        }

        if (eol === -1) {
          this._index = this._length;
        } else {
          this._index = eol + 1;
        }
      }
    }, {
      key: 'error',
      value: function error(message) {
        return new SyntaxError(message);
      }
    }, {
      key: '_findNextEntryStart',
      value: function _findNextEntryStart() {
        var start = this._index;

        while (true) {
          if (start === 0 || this._source[start - 1] === '\n') {
            var cc = this._source.charCodeAt(start);

            if (cc >= 97 && cc <= 122 || cc >= 65 && cc <= 90 || cc === 95 || cc === 47 || cc === 91) {
              break;
            }
          }

          start = this._source.indexOf('\n', start);

          if (start === -1) {
            break;
          }
          start++;
        }

        return start;
      }
    }]);
    return RuntimeParser;
  }();

  function parse(string) {
    var parser = new RuntimeParser();
    return parser.getResource(string);
  }

  var FluentType = function () {
    function FluentType(value, opts) {
      classCallCheck(this, FluentType);

      this.value = value;
      this.opts = opts;
    }

    createClass(FluentType, [{
      key: 'valueOf',
      value: function valueOf() {
        throw new Error('Subclasses of FluentType must implement valueOf.');
      }
    }]);
    return FluentType;
  }();

  var FluentNone = function (_FluentType) {
    inherits(FluentNone, _FluentType);

    function FluentNone() {
      classCallCheck(this, FluentNone);
      return possibleConstructorReturn(this, (FluentNone.__proto__ || Object.getPrototypeOf(FluentNone)).apply(this, arguments));
    }

    createClass(FluentNone, [{
      key: 'valueOf',
      value: function valueOf() {
        return this.value || '???';
      }
    }]);
    return FluentNone;
  }(FluentType);

  var FluentNumber = function (_FluentType2) {
    inherits(FluentNumber, _FluentType2);

    function FluentNumber(value, opts) {
      classCallCheck(this, FluentNumber);
      return possibleConstructorReturn(this, (FluentNumber.__proto__ || Object.getPrototypeOf(FluentNumber)).call(this, parseFloat(value), opts));
    }

    createClass(FluentNumber, [{
      key: 'valueOf',
      value: function valueOf(ctx) {
        var nf = ctx._memoizeIntlObject(Intl.NumberFormat, this.opts);
        return nf.format(this.value);
      }
    }, {
      key: 'match',
      value: function match(ctx, other) {
        if (other instanceof FluentNumber) {
          return this.value === other.value;
        }
        return false;
      }
    }]);
    return FluentNumber;
  }(FluentType);

  var FluentDateTime = function (_FluentType3) {
    inherits(FluentDateTime, _FluentType3);

    function FluentDateTime(value, opts) {
      classCallCheck(this, FluentDateTime);
      return possibleConstructorReturn(this, (FluentDateTime.__proto__ || Object.getPrototypeOf(FluentDateTime)).call(this, new Date(value), opts));
    }

    createClass(FluentDateTime, [{
      key: 'valueOf',
      value: function valueOf(ctx) {
        var dtf = ctx._memoizeIntlObject(Intl.DateTimeFormat, this.opts);
        return dtf.format(this.value);
      }
    }]);
    return FluentDateTime;
  }(FluentType);

  var FluentSymbol = function (_FluentType4) {
    inherits(FluentSymbol, _FluentType4);

    function FluentSymbol() {
      classCallCheck(this, FluentSymbol);
      return possibleConstructorReturn(this, (FluentSymbol.__proto__ || Object.getPrototypeOf(FluentSymbol)).apply(this, arguments));
    }

    createClass(FluentSymbol, [{
      key: 'valueOf',
      value: function valueOf() {
        return this.value;
      }
    }, {
      key: 'match',
      value: function match(ctx, other) {
        if (other instanceof FluentSymbol) {
          return this.value === other.value;
        } else if (typeof other === 'string') {
          return this.value === other;
        } else if (other instanceof FluentNumber) {
          var pr = ctx._memoizeIntlObject(Intl.PluralRules, other.opts);
          return this.value === pr.select(other.value);
        } else if (Array.isArray(other)) {
          var values = other.map(function (symbol) {
            return symbol.value;
          });
          return values.includes(this.value);
        }
        return false;
      }
    }]);
    return FluentSymbol;
  }(FluentType);

  var builtins = {
    'NUMBER': function NUMBER(_ref, opts) {
      var _ref2 = slicedToArray(_ref, 1),
          arg = _ref2[0];

      return new FluentNumber(arg.value, merge(arg.opts, opts));
    },
    'DATETIME': function DATETIME(_ref3, opts) {
      var _ref4 = slicedToArray(_ref3, 1),
          arg = _ref4[0];

      return new FluentDateTime(arg.value, merge(arg.opts, opts));
    }
  };

  function merge(argopts, opts) {
    return Object.assign({}, argopts, values(opts));
  }

  function values(opts) {
    var unwrapped = {};
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = Object.keys(opts)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var name = _step.value;

        unwrapped[name] = opts[name].value;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return unwrapped;
  }

  var MAX_PLACEABLE_LENGTH = 2500;

  var FSI = '\u2068';
  var PDI = '\u2069';

  function PlaceableLength(env, parts) {
    var ctx = env.ctx;

    return parts.reduce(function (sum, part) {
      return sum + part.valueOf(ctx).length;
    }, 0);
  }

  function DefaultMember(env, members, def) {
    if (members[def]) {
      return members[def];
    }

    var errors = env.errors;

    errors.push(new RangeError('No default'));
    return new FluentNone();
  }

  function MessageReference(env, _ref) {
    var name = _ref.name;
    var ctx = env.ctx,
        errors = env.errors;

    var message = ctx.messages.get(name);

    if (!message) {
      errors.push(new ReferenceError('Unknown message: ' + name));
      return new FluentNone(name);
    }

    return message;
  }

  function Tags(env, _ref2) {
    var name = _ref2.name;
    var ctx = env.ctx,
        errors = env.errors;

    var message = ctx.messages.get(name);

    if (!message) {
      errors.push(new ReferenceError('Unknown message: ' + name));
      return new FluentNone(name);
    }

    if (!message.tags) {
      errors.push(new RangeError('No tags in message "' + name + '"'));
      return new FluentNone(name);
    }

    return message.tags.map(function (tag) {
      return new FluentSymbol(tag);
    });
  }

  function VariantExpression(env, _ref3) {
    var id = _ref3.id,
        key = _ref3.key;

    var message = MessageReference(env, id);
    if (message instanceof FluentNone) {
      return message;
    }

    var ctx = env.ctx,
        errors = env.errors;

    var keyword = Type(env, key);

    function isVariantList(node) {
      return Array.isArray(node) && node[0].type === 'sel' && node[0].exp === null;
    }

    if (isVariantList(message.val)) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = message.val[0].vars[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var variant = _step.value;

          var variantKey = Type(env, variant.key);
          if (keyword.match(ctx, variantKey)) {
            return variant;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }

    errors.push(new ReferenceError('Unknown variant: ' + keyword.valueOf(ctx)));
    return Type(env, message);
  }

  function AttributeExpression(env, _ref4) {
    var id = _ref4.id,
        name = _ref4.name;

    var message = MessageReference(env, id);
    if (message instanceof FluentNone) {
      return message;
    }

    if (message.attrs) {
      for (var attrName in message.attrs) {
        if (name === attrName) {
          return message.attrs[name];
        }
      }
    }

    var errors = env.errors;

    errors.push(new ReferenceError('Unknown attribute: ' + name));
    return Type(env, message);
  }

  function SelectExpression(env, _ref5) {
    var exp = _ref5.exp,
        vars = _ref5.vars,
        def = _ref5.def;

    if (exp === null) {
      return DefaultMember(env, vars, def);
    }

    var selector = exp.type === 'ref' ? Tags(env, exp) : Type(env, exp);
    if (selector instanceof FluentNone) {
      return DefaultMember(env, vars, def);
    }

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = vars[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var variant = _step2.value;

        var key = Type(env, variant.key);
        var keyCanMatch = key instanceof FluentNumber || key instanceof FluentSymbol;

        if (!keyCanMatch) {
          continue;
        }

        var ctx = env.ctx;

        if (key.match(ctx, selector)) {
          return variant;
        }
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    return DefaultMember(env, vars, def);
  }

  function Type(env, expr) {
    if (typeof expr === 'string' || expr instanceof FluentNone) {
      return expr;
    }

    if (Array.isArray(expr)) {
      return Pattern(env, expr);
    }

    switch (expr.type) {
      case 'sym':
        return new FluentSymbol(expr.name);
      case 'num':
        return new FluentNumber(expr.val);
      case 'ext':
        return ExternalArgument(env, expr);
      case 'fun':
        return FunctionReference(env, expr);
      case 'call':
        return CallExpression(env, expr);
      case 'ref':
        {
          var message = MessageReference(env, expr);
          return Type(env, message);
        }
      case 'attr':
        {
          var attr = AttributeExpression(env, expr);
          return Type(env, attr);
        }
      case 'var':
        {
          var variant = VariantExpression(env, expr);
          return Type(env, variant);
        }
      case 'sel':
        {
          var member = SelectExpression(env, expr);
          return Type(env, member);
        }
      case undefined:
        {
          if (expr.val !== undefined) {
            return Type(env, expr.val);
          }

          var errors = env.errors;

          errors.push(new RangeError('No value'));
          return new FluentNone();
        }
      default:
        return new FluentNone();
    }
  }

  function ExternalArgument(env, _ref6) {
    var name = _ref6.name;
    var args = env.args,
        errors = env.errors;

    if (!args || !args.hasOwnProperty(name)) {
      errors.push(new ReferenceError('Unknown external: ' + name));
      return new FluentNone(name);
    }

    var arg = args[name];

    if (arg instanceof FluentType) {
      return arg;
    }

    switch (typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) {
      case 'string':
        return arg;
      case 'number':
        return new FluentNumber(arg);
      case 'object':
        if (arg instanceof Date) {
          return new FluentDateTime(arg);
        }
      default:
        errors.push(new TypeError('Unsupported external type: ' + name + ', ' + (typeof arg === 'undefined' ? 'undefined' : _typeof(arg))));
        return new FluentNone(name);
    }
  }

  function FunctionReference(env, _ref7) {
    var name = _ref7.name;

    var functions = env.ctx.functions,
        errors = env.errors;

    var func = functions[name] || builtins[name];

    if (!func) {
      errors.push(new ReferenceError('Unknown function: ' + name + '()'));
      return new FluentNone(name + '()');
    }

    if (typeof func !== 'function') {
      errors.push(new TypeError('Function ' + name + '() is not callable'));
      return new FluentNone(name + '()');
    }

    return func;
  }

  function CallExpression(env, _ref8) {
    var fun = _ref8.fun,
        args = _ref8.args;

    var callee = FunctionReference(env, fun);

    if (callee instanceof FluentNone) {
      return callee;
    }

    var posargs = [];
    var keyargs = [];

    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = args[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var arg = _step3.value;

        if (arg.type === 'narg') {
          keyargs[arg.name] = Type(env, arg.val);
        } else {
          posargs.push(Type(env, arg));
        }
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    return callee(posargs, keyargs);
  }

  function Pattern(env, ptn) {
    var ctx = env.ctx,
        dirty = env.dirty,
        errors = env.errors;

    if (dirty.has(ptn)) {
      errors.push(new RangeError('Cyclic reference'));
      return new FluentNone();
    }

    dirty.add(ptn);
    var result = [];

    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = ptn[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var elem = _step4.value;

        if (typeof elem === 'string') {
          result.push(elem);
          continue;
        }

        var part = Type(env, elem);

        if (ctx.useIsolating) {
          result.push(FSI);
        }

        if (Array.isArray(part)) {
          var len = PlaceableLength(env, part);

          if (len > MAX_PLACEABLE_LENGTH) {
            errors.push(new RangeError('Too many characters in placeable ' + ('(' + len + ', max allowed is ' + MAX_PLACEABLE_LENGTH + ')')));
            result.push(new FluentNone());
          } else {
            result.push.apply(result, toConsumableArray(part));
          }
        } else {
          result.push(part);
        }

        if (ctx.useIsolating) {
          result.push(PDI);
        }
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4.return) {
          _iterator4.return();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }

    dirty.delete(ptn);
    return result;
  }

  function resolve(ctx, args, message) {
    var errors = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

    var env = {
      ctx: ctx, args: args, errors: errors, dirty: new WeakSet()
    };
    return Type(env, message);
  }

  var MessageContext = function () {
    function MessageContext(locales) {
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref$functions = _ref.functions,
          functions = _ref$functions === undefined ? {} : _ref$functions,
          _ref$useIsolating = _ref.useIsolating,
          useIsolating = _ref$useIsolating === undefined ? true : _ref$useIsolating;

      classCallCheck(this, MessageContext);

      this.locales = Array.isArray(locales) ? locales : [locales];
      this.functions = functions;
      this.useIsolating = useIsolating;
      this.messages = new Map();
      this.intls = new WeakMap();
    }

    createClass(MessageContext, [{
      key: 'addMessages',
      value: function addMessages(source) {
        var _parse = parse(source),
            _parse2 = slicedToArray(_parse, 2),
            entries = _parse2[0],
            errors = _parse2[1];

        for (var id in entries) {
          this.messages.set(id, entries[id]);
        }

        return errors;
      }

    }, {
      key: 'formatToParts',
      value: function formatToParts(message, args, errors) {
        if (typeof message === 'string') {
          return [message];
        }

        if (typeof message.val === 'string') {
          return [message.val];
        }

        if (message.val === undefined) {
          return null;
        }

        var result = resolve(this, args, message, errors);

        return result instanceof FluentNone ? null : result;
      }

    }, {
      key: 'format',
      value: function format(message, args, errors) {
        var _this = this;

        if (typeof message === 'string') {
          return message;
        }

        if (typeof message.val === 'string') {
          return message.val;
        }

        if (message.val === undefined) {
          return null;
        }

        var result = resolve(this, args, message, errors);

        if (result instanceof FluentNone) {
          return null;
        }

        return result.map(function (part) {
          return part.valueOf(_this);
        }).join('');
      }
    }, {
      key: '_memoizeIntlObject',
      value: function _memoizeIntlObject(ctor, opts) {
        var cache = this.intls.get(ctor) || {};
        var id = JSON.stringify(opts);

        if (!cache[id]) {
          cache[id] = new ctor(this.locales, opts);
          this.intls.set(ctor, cache);
        }

        return cache[id];
      }
    }]);
    return MessageContext;
  }();

  var likelySubtagsMin = {
    'ar': 'ar-arab-eg',
    'az-arab': 'az-arab-ir',
    'az-ir': 'az-arab-ir',
    'be': 'be-cyrl-by',
    'da': 'da-latn-dk',
    'el': 'el-grek-gr',
    'en': 'en-latn-us',
    'fa': 'fa-arab-ir',
    'ja': 'ja-jpan-jp',
    'ko': 'ko-kore-kr',
    'pt': 'pt-latn-br',
    'sr': 'sr-cyrl-rs',
    'sr-ru': 'sr-latn-ru',
    'sv': 'sv-latn-se',
    'ta': 'ta-taml-in',
    'uk': 'uk-cyrl-ua',
    'zh': 'zh-hans-cn',
    'zh-gb': 'zh-hant-gb',
    'zh-us': 'zh-hant-us'
  };

  var regionMatchingLangs = ['az', 'bg', 'cs', 'de', 'es', 'fi', 'fr', 'hu', 'it', 'lt', 'lv', 'nl', 'pl', 'ro', 'ru'];

  function getLikelySubtagsMin(loc) {
    if (likelySubtagsMin.hasOwnProperty(loc)) {
      return new Locale(likelySubtagsMin[loc]);
    }
    var locale = new Locale(loc);
    if (regionMatchingLangs.includes(locale.language)) {
      locale.region = locale.language;
      locale.string = locale.language + '-' + locale.region;
      return locale;
    }
    return null;
  }

  var languageCodeRe = '([a-z]{2,3}|\\*)';
  var scriptCodeRe = '(?:-([a-z]{4}|\\*))';
  var regionCodeRe = '(?:-([a-z]{2}|\\*))';
  var variantCodeRe = '(?:-([a-z]{3}|\\*))';

  var localeRe = new RegExp('^' + languageCodeRe + scriptCodeRe + '?' + regionCodeRe + '?' + variantCodeRe + '?$', 'i');

  var localeParts = ['language', 'script', 'region', 'variant'];

  var Locale = function () {
    function Locale(locale) {
      var range = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      classCallCheck(this, Locale);

      var result = localeRe.exec(locale.replace(/_/g, '-'));
      if (!result) {
        return;
      }

      var missing = range ? '*' : undefined;

      var language = result[1] || missing;
      var script = result[2] || missing;
      var region = result[3] || missing;
      var variant = result[4] || missing;

      this.language = language;
      this.script = script;
      this.region = region;
      this.variant = variant;
      this.string = locale;
    }

    createClass(Locale, [{
      key: 'isEqual',
      value: function isEqual(locale) {
        var _this = this;

        return localeParts.every(function (part) {
          return _this[part] === locale[part];
        });
      }
    }, {
      key: 'matches',
      value: function matches(locale) {
        var _this2 = this;

        return localeParts.every(function (part) {
          return _this2[part] === '*' || locale[part] === '*' || _this2[part] === undefined && locale[part] === undefined || _this2[part] !== undefined && locale[part] !== undefined && _this2[part].toLowerCase() === locale[part].toLowerCase();
        });
      }
    }, {
      key: 'setVariantRange',
      value: function setVariantRange() {
        this.variant = '*';
      }
    }, {
      key: 'setRegionRange',
      value: function setRegionRange() {
        this.region = '*';
      }
    }, {
      key: 'addLikelySubtags',
      value: function addLikelySubtags() {
        var _this3 = this;

        var newLocale = getLikelySubtagsMin(this.string.toLowerCase());

        if (newLocale) {
          localeParts.forEach(function (part) {
            return _this3[part] = newLocale[part];
          });
          this.string = newLocale.string;
          return true;
        }
        return false;
      }
    }]);
    return Locale;
  }();

  function filterMatches(requestedLocales, availableLocales, strategy) {
    var supportedLocales = new Set();

    var availLocales = new Set(availableLocales.map(function (locale) {
      return new Locale(locale, true);
    }));

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      outer: for (var _iterator = requestedLocales[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var reqLocStr = _step.value;

        var reqLocStrLC = reqLocStr.toLowerCase();
        var requestedLocale = new Locale(reqLocStrLC);

        if (requestedLocale.language === undefined) {
          continue;
        }

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = availableLocales[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _availableLocale = _step2.value;

            if (reqLocStrLC === _availableLocale.toLowerCase()) {
              supportedLocales.add(_availableLocale);
              var _iteratorNormalCompletion7 = true;
              var _didIteratorError7 = false;
              var _iteratorError7 = undefined;

              try {
                for (var _iterator7 = availLocales[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                  var loc = _step7.value;

                  if (loc.isEqual(requestedLocale)) {
                    availLocales.delete(loc);
                    break;
                  }
                }
              } catch (err) {
                _didIteratorError7 = true;
                _iteratorError7 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion7 && _iterator7.return) {
                    _iterator7.return();
                  }
                } finally {
                  if (_didIteratorError7) {
                    throw _iteratorError7;
                  }
                }
              }

              if (strategy === 'lookup') {
                return Array.from(supportedLocales);
              } else if (strategy === 'matching') {
                continue outer;
              } else {
                break;
              }
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = availLocales[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var _availableLocale2 = _step3.value;

            if (requestedLocale.matches(_availableLocale2)) {
              supportedLocales.add(_availableLocale2.string);
              availLocales.delete(_availableLocale2);
              if (strategy === 'lookup') {
                return Array.from(supportedLocales);
              } else if (strategy === 'matching') {
                continue outer;
              } else {
                break;
              }
            }
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }

        if (requestedLocale.addLikelySubtags()) {
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = availLocales[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var availableLocale = _step4.value;

              if (requestedLocale.matches(availableLocale)) {
                supportedLocales.add(availableLocale.string);
                availLocales.delete(availableLocale);
                if (strategy === 'lookup') {
                  return Array.from(supportedLocales);
                } else if (strategy === 'matching') {
                  continue outer;
                } else {
                  break;
                }
              }
            }
          } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
              }
            } finally {
              if (_didIteratorError4) {
                throw _iteratorError4;
              }
            }
          }
        }

        requestedLocale.setVariantRange();

        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = availLocales[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var _availableLocale3 = _step5.value;

            if (requestedLocale.matches(_availableLocale3)) {
              supportedLocales.add(_availableLocale3.string);
              availLocales.delete(_availableLocale3);
              if (strategy === 'lookup') {
                return Array.from(supportedLocales);
              } else if (strategy === 'matching') {
                continue outer;
              } else {
                break;
              }
            }
          }
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5.return) {
              _iterator5.return();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
            }
          }
        }

        requestedLocale.setRegionRange();

        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = availLocales[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var _availableLocale4 = _step6.value;

            if (requestedLocale.matches(_availableLocale4)) {
              supportedLocales.add(_availableLocale4.string);
              availLocales.delete(_availableLocale4);
              if (strategy === 'lookup') {
                return Array.from(supportedLocales);
              } else if (strategy === 'matching') {
                continue outer;
              } else {
                break;
              }
            }
          }
        } catch (err) {
          _didIteratorError6 = true;
          _iteratorError6 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion6 && _iterator6.return) {
              _iterator6.return();
            }
          } finally {
            if (_didIteratorError6) {
              throw _iteratorError6;
            }
          }
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return Array.from(supportedLocales);
  }

  function GetOption(options, property, type, values, fallback) {
    var value = options[property];

    if (value !== undefined) {
      if (type === 'boolean') {
        value = new Boolean(value);
      } else if (type === 'string') {
        value = String(value);
      }

      if (values !== undefined && values.indexOf(value) === -1) {
        throw new Error('Invalid option value');
      }

      return value;
    }

    return fallback;
  }

  function negotiateLanguages(requestedLocales, availableLocales) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var defaultLocale = GetOption(options, 'defaultLocale', 'string');
    var likelySubtags = GetOption(options, 'likelySubtags', 'object', undefined);
    var strategy = GetOption(options, 'strategy', 'string', ['filtering', 'matching', 'lookup'], 'filtering');

    if (strategy === 'lookup' && !defaultLocale) {
      throw new Error('defaultLocale cannot be undefined for strategy `lookup`');
    }

    var resolvedReqLoc = Array.from(Object(requestedLocales)).map(function (loc) {
      return String(loc);
    });
    var resolvedAvailLoc = Array.from(Object(availableLocales)).map(function (loc) {
      return String(loc);
    });

    var supportedLocales = filterMatches(resolvedReqLoc, resolvedAvailLoc, strategy, likelySubtags);

    if (strategy === 'lookup') {
      if (supportedLocales.length === 0) {
        supportedLocales.push(defaultLocale);
      }
    } else if (defaultLocale && !supportedLocales.includes(defaultLocale)) {
      supportedLocales.push(defaultLocale);
    }
    return supportedLocales;
  }

  function _extendableBuiltin(cls) {
    function ExtendableBuiltin() {
      var instance = Reflect.construct(cls, Array.from(arguments));
      Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
      return instance;
    }

    ExtendableBuiltin.prototype = Object.create(cls.prototype, {
      constructor: {
        value: cls,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });

    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(ExtendableBuiltin, cls);
    } else {
      ExtendableBuiltin.__proto__ = cls;
    }

    return ExtendableBuiltin;
  }

  var L10nError = function (_extendableBuiltin2) {
    inherits(L10nError, _extendableBuiltin2);

    function L10nError(message, id, lang) {
      classCallCheck(this, L10nError);

      var _this = possibleConstructorReturn(this, (L10nError.__proto__ || Object.getPrototypeOf(L10nError)).call(this));

      _this.name = 'L10nError';
      _this.message = message;
      _this.id = id;
      _this.lang = lang;
      return _this;
    }

    return L10nError;
  }(_extendableBuiltin(Error));

  var properties = new WeakMap();
  var contexts = new WeakMap();

  var Localization = function () {
    function Localization(requestBundles, createContext) {
      classCallCheck(this, Localization);

      var createHeadContext = function createHeadContext(bundles) {
        return createHeadContextWith(createContext, bundles);
      };

      properties.set(this, {
        requestBundles: requestBundles, createHeadContext: createHeadContext
      });

      this.interactive = requestBundles().then(function (bundles) {
        return createHeadContext(bundles).then(function () {
          return bundles;
        });
      });
    }

    createClass(Localization, [{
      key: 'requestLanguages',
      value: function requestLanguages(requestedLangs) {
        var _properties$get = properties.get(this),
            requestBundles = _properties$get.requestBundles,
            createHeadContext = _properties$get.createHeadContext;

        return this.interactive = Promise.all([this.interactive, requestBundles(requestedLangs)]).then(function (_ref) {
          var _ref2 = slicedToArray(_ref, 2),
              oldBundles = _ref2[0],
              newBundles = _ref2[1];

          if (equal(oldBundles, newBundles)) {
            return oldBundles;
          }

          return createHeadContext(newBundles).then(function () {
            return newBundles;
          });
        });
      }

    }, {
      key: 'formatWithFallback',
      value: function formatWithFallback(bundles, ctx, keys, method, prev) {
        var _this = this;

        if (!ctx) {
          return prev.translations;
        }

        var current = keysFromContext(method, this.sanitizeArgs, ctx, keys, prev);

        if (typeof console !== 'undefined') {
          current.errors.forEach(function (errs) {
            return errs ? errs.forEach(function (e) {
              return console.warn(e);
            }) : null;
          });
        }

        if (!current.hasFatalErrors) {
          return current.translations;
        }

        var tailBundles = bundles.slice(1);

        var _properties$get2 = properties.get(this),
            createHeadContext = _properties$get2.createHeadContext;

        return createHeadContext(tailBundles).then(function (next) {
          return _this.formatWithFallback(tailBundles, next, keys, method, current);
        });
      }

    }, {
      key: 'formatEntities',
      value: function formatEntities(keys) {
        var _this2 = this;

        return this.interactive.then(function (bundles) {
          return _this2.formatWithFallback(bundles, contexts.get(bundles[0]), keys, _this2.entityFromContext);
        });
      }

    }, {
      key: 'formatValues',
      value: function formatValues() {
        var _this3 = this;

        for (var _len = arguments.length, keys = Array(_len), _key = 0; _key < _len; _key++) {
          keys[_key] = arguments[_key];
        }

        var keyTuples = keys.map(function (key) {
          return Array.isArray(key) ? key : [key, null];
        });
        return this.interactive.then(function (bundles) {
          return _this3.formatWithFallback(bundles, contexts.get(bundles[0]), keyTuples, _this3.valueFromContext);
        });
      }

    }, {
      key: 'formatValue',
      value: function formatValue(id, args) {
        return this.formatValues([id, args]).then(function (_ref3) {
          var _ref4 = slicedToArray(_ref3, 1),
              val = _ref4[0];

          return val;
        });
      }

    }, {
      key: 'sanitizeArgs',
      value: function sanitizeArgs(args) {
        return args;
      }

    }, {
      key: 'entityFromContext',
      value: function entityFromContext(ctx, errors, id, args) {
        var entity = ctx.messages.get(id);

        if (entity === undefined) {
          errors.push(new L10nError('Unknown entity: ' + id));
          return { value: id, attrs: null };
        }

        var formatted = {
          value: ctx.format(entity, args, errors),
          attrs: null
        };

        if (entity.attrs) {
          formatted.attrs = {};
          for (var name in entity.attrs) {
            var attr = ctx.format(entity.attrs[name], args, errors);
            if (attr !== null) {
              formatted.attrs[name] = attr;
            }
          }
        }

        return formatted;
      }

    }, {
      key: 'valueFromContext',
      value: function valueFromContext(ctx, errors, id, args) {
        var entity = ctx.messages.get(id);

        if (entity === undefined) {
          errors.push(new L10nError('Unknown entity: ' + id));
          return id;
        }

        return ctx.format(entity, args, errors);
      }
    }]);
    return Localization;
  }();

  function createHeadContextWith(createContext, bundles) {
    var _bundles = slicedToArray(bundles, 1),
        bundle = _bundles[0];

    if (!bundle) {
      return Promise.resolve(null);
    }

    return bundle.fetch().then(function (resources) {
      var ctx = createContext(bundle.lang);
      resources.filter(function (res) {
        return res !== null;
      }).forEach(function (res) {
        return ctx.addMessages(res);
      });

      contexts.set(bundle, ctx);
      return ctx;
    });
  }

  function equal(bundles1, bundles2) {
    return bundles1.length === bundles2.length && bundles1.every(function (_ref5, i) {
      var lang = _ref5.lang;
      return lang === bundles2[i].lang;
    });
  }

  function keysFromContext(method, sanitizeArgs, ctx, keys, prev) {
    var entityErrors = [];
    var result = {
      errors: new Array(keys.length),
      withoutFatal: new Array(keys.length),
      hasFatalErrors: false
    };

    result.translations = keys.map(function (key, i) {
      if (prev && !prev.errors[i]) {
        return prev.translations[i];
      }

      entityErrors.length = 0;
      var args = sanitizeArgs(key[1]);
      var translation = method(ctx, entityErrors, key[0], args);

      if (entityErrors.length === 0) {
        return translation;
      }

      result.errors[i] = entityErrors.slice();

      if (!entityErrors.some(isL10nError)) {
        result.withoutFatal[i] = true;
      } else if (!result.hasFatalErrors) {
        result.hasFatalErrors = true;
      }

      if (prev && prev.withoutFatal[i]) {
        result.withoutFatal[i] = true;
        return prev.translations[i];
      }

      return translation;
    });

    return result;
  }

  function isL10nError(error) {
    return error instanceof L10nError;
  }

  var reOverlay = /<|&#?\w+;/;

  var ALLOWED_ELEMENTS = {
    'http://www.w3.org/1999/xhtml': ['a', 'em', 'strong', 'small', 's', 'cite', 'q', 'dfn', 'abbr', 'data', 'time', 'code', 'var', 'samp', 'kbd', 'sub', 'sup', 'i', 'b', 'u', 'mark', 'ruby', 'rt', 'rp', 'bdi', 'bdo', 'span', 'br', 'wbr']
  };

  var ALLOWED_ATTRIBUTES = {
    'http://www.w3.org/1999/xhtml': {
      global: ['title', 'aria-label', 'aria-valuetext', 'aria-moz-hint'],
      a: ['download'],
      area: ['download', 'alt'],

      input: ['alt', 'placeholder'],
      menuitem: ['label'],
      menu: ['label'],
      optgroup: ['label'],
      option: ['label'],
      track: ['label'],
      img: ['alt'],
      textarea: ['placeholder'],
      th: ['abbr']
    },
    'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul': {
      global: ['accesskey', 'aria-label', 'aria-valuetext', 'aria-moz-hint', 'label'],
      key: ['key', 'keycode'],
      textbox: ['placeholder'],
      toolbarbutton: ['tooltiptext']
    }
  };

  function overlayElement(element, translation) {
    var value = translation.value;

    if (typeof value === 'string') {
      if (!reOverlay.test(value)) {
        element.textContent = value;
      } else {
        var tmpl = element.ownerDocument.createElementNS('http://www.w3.org/1999/xhtml', 'template');
        tmpl.innerHTML = value;

        overlay(element, tmpl.content);
      }
    }

    if (translation.attrs === null) {
      return;
    }

    for (var name in translation.attrs) {
      if (isAttrAllowed({ name: name }, element)) {
        element.setAttribute(name, translation.attrs[name]);
      }
    }
  }

  function overlay(sourceElement, translationElement) {
    var result = translationElement.ownerDocument.createDocumentFragment();
    var k = void 0,
        attr = void 0;

    var childElement = void 0;
    while (childElement = translationElement.childNodes[0]) {
      translationElement.removeChild(childElement);

      if (childElement.nodeType === childElement.TEXT_NODE) {
        result.appendChild(childElement);
        continue;
      }

      var index = getIndexOfType(childElement);
      var sourceChild = getNthElementOfType(sourceElement, childElement, index);
      if (sourceChild) {
        overlay(sourceChild, childElement);
        result.appendChild(sourceChild);
        continue;
      }

      if (isElementAllowed(childElement)) {
        var sanitizedChild = childElement.ownerDocument.createElement(childElement.nodeName);
        overlay(sanitizedChild, childElement);
        result.appendChild(sanitizedChild);
        continue;
      }

      result.appendChild(translationElement.ownerDocument.createTextNode(childElement.textContent));
    }

    sourceElement.textContent = '';
    sourceElement.appendChild(result);

    if (translationElement.attributes) {
      for (k = 0, attr; attr = translationElement.attributes[k]; k++) {
        if (isAttrAllowed(attr, sourceElement)) {
          sourceElement.setAttribute(attr.name, attr.value);
        }
      }
    }
  }

  function isElementAllowed(element) {
    var allowed = ALLOWED_ELEMENTS[element.namespaceURI];
    if (!allowed) {
      return false;
    }

    return allowed.indexOf(element.tagName.toLowerCase()) !== -1;
  }

  function isAttrAllowed(attr, element) {
    var allowed = ALLOWED_ATTRIBUTES[element.namespaceURI];
    if (!allowed) {
      return false;
    }

    var attrName = attr.name.toLowerCase();
    var elemName = element.tagName.toLowerCase();

    if (allowed.global.indexOf(attrName) !== -1) {
      return true;
    }

    if (!allowed[elemName]) {
      return false;
    }

    if (allowed[elemName].indexOf(attrName) !== -1) {
      return true;
    }

    if (element.namespaceURI === 'http://www.w3.org/1999/xhtml' && elemName === 'input' && attrName === 'value') {
      var type = element.type.toLowerCase();
      if (type === 'submit' || type === 'button' || type === 'reset') {
        return true;
      }
    }

    return false;
  }

  function getNthElementOfType(context, element, index) {
    var nthOfType = 0;
    for (var i = 0, child; child = context.children[i]; i++) {
      if (child.nodeType === child.ELEMENT_NODE && child.tagName.toLowerCase() === element.tagName.toLowerCase()) {
        if (nthOfType === index) {
          return child;
        }
        nthOfType++;
      }
    }
    return null;
  }

  function getIndexOfType(element) {
    var index = 0;
    var child = void 0;
    while (child = element.previousElementSibling) {
      if (child.tagName === element.tagName) {
        index++;
      }
    }
    return index;
  }

  var reHtml = /[&<>]/g;
  var htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
  };

  function getDirection(code) {
    var tag = code.split('-')[0];
    return ['ar', 'he', 'fa', 'ps', 'ur'].indexOf(tag) >= 0 ? 'rtl' : 'ltr';
  }

  var DOMLocalization = function (_Localization) {
    inherits(DOMLocalization, _Localization);

    function DOMLocalization(requestBundles, createContext, name, observer) {
      classCallCheck(this, DOMLocalization);

      var _this = possibleConstructorReturn(this, (DOMLocalization.__proto__ || Object.getPrototypeOf(DOMLocalization)).call(this, requestBundles, createContext));

      _this.name = name;
      _this.query = '[data-l10n-with=' + name + ']';
      _this.roots = new Set();
      _this.observer = observer;
      return _this;
    }

    createClass(DOMLocalization, [{
      key: 'handleEvent',
      value: function handleEvent() {
        return this.requestLanguages();
      }

    }, {
      key: 'requestLanguages',
      value: function requestLanguages(requestedLangs) {
        var _this2 = this;

        get(DOMLocalization.prototype.__proto__ || Object.getPrototypeOf(DOMLocalization.prototype), 'requestLanguages', this).call(this, requestedLangs).then(function () {
          return _this2.translateRoots();
        });
      }

    }, {
      key: 'setAttributes',
      value: function setAttributes(element, id, args) {
        element.setAttribute('data-l10n-id', id);
        if (args) {
          element.setAttribute('data-l10n-args', JSON.stringify(args));
        }
        return element;
      }

    }, {
      key: 'getAttributes',
      value: function getAttributes(element) {
        return {
          id: element.getAttribute('data-l10n-id'),
          args: JSON.parse(element.getAttribute('data-l10n-args'))
        };
      }

    }, {
      key: 'connectRoot',
      value: function connectRoot(root) {
        this.roots.add(root);

        if (this.observer) {
          this.observer.observeRoot(root);
        }
      }

    }, {
      key: 'disconnectRoot',
      value: function disconnectRoot(root) {
        this.roots.delete(root);

        if (this.observer) {
          this.observer.unobserveRoot(root);
        }

        return this.roots.size === 0;
      }

    }, {
      key: 'translateRoots',
      value: function translateRoots() {
        var _this3 = this;

        var roots = Array.from(this.roots);
        return Promise.all(roots.map(function (root) {
          return _this3.translateRoot(root);
        }));
      }

    }, {
      key: 'translateRoot',
      value: function translateRoot(root) {
        var _this4 = this;

        return this.translateRootContent(root).then(function () {
          return _this4.interactive;
        }).then(function (bundles) {
          var langs = bundles.map(function (bundle) {
            return bundle.lang;
          });
          var wasLocalizedBefore = root.hasAttribute('langs');

          root.setAttribute('langs', langs.join(' '));
          root.setAttribute('lang', langs[0]);
          root.setAttribute('dir', getDirection(langs[0]));

          if (wasLocalizedBefore) {
            root.dispatchEvent(new CustomEvent('DOMRetranslated', {
              bubbles: false,
              cancelable: false
            }));
          }
        });
      }
    }, {
      key: 'translateRootContent',
      value: function translateRootContent(root) {
        var _this5 = this;

        var anonChildren = document.getAnonymousNodes ? document.getAnonymousNodes(root) : null;
        if (!anonChildren) {
          return this.translateFragment(root);
        }

        return Promise.all([root].concat(toConsumableArray(anonChildren)).map(function (node) {
          return _this5.translateFragment(node);
        }));
      }

    }, {
      key: 'translateFragment',
      value: function translateFragment(frag) {
        return this.translateElements(this.getTranslatables(frag));
      }
    }, {
      key: 'translateElements',
      value: function translateElements(elements) {
        var _this6 = this;

        if (!elements.length) {
          return Promise.resolve([]);
        }

        var keys = elements.map(this.getKeysForElement);
        return this.formatEntities(keys).then(function (translations) {
          return _this6.applyTranslations(elements, translations);
        });
      }

    }, {
      key: 'translateElement',
      value: function translateElement(element) {
        var _this7 = this;

        return this.formatEntities([this.getKeysForElement(element)]).then(function (translations) {
          return _this7.applyTranslations([element], translations);
        });
      }
    }, {
      key: 'applyTranslations',
      value: function applyTranslations(elements, translations) {
        if (this.observer) {
          this.observer.pauseObserving();
        }

        for (var i = 0; i < elements.length; i++) {
          overlayElement(elements[i], translations[i]);
        }

        if (this.observer) {
          this.observer.resumeObserving();
        }
      }
    }, {
      key: 'getTranslatables',
      value: function getTranslatables(element) {
        var nodes = Array.from(element.querySelectorAll(this.query));

        if (typeof element.hasAttribute === 'function' && element.hasAttribute('data-l10n-id')) {
          var elemBundleName = element.getAttribute('data-l10n-with');
          if (elemBundleName === this.name) {
            nodes.push(element);
          }
        }

        return nodes;
      }
    }, {
      key: 'getKeysForElement',
      value: function getKeysForElement(element) {
        return [element.getAttribute('data-l10n-id'), JSON.parse(element.getAttribute('data-l10n-args') || null)];
      }

    }, {
      key: 'sanitizeArgs',
      value: function sanitizeArgs(args) {
        for (var name in args) {
          var arg = args[name];
          if (typeof arg === 'string') {
            args[name] = arg.replace(reHtml, function (match) {
              return htmlEntities[match];
            });
          }
        }
        return args;
      }
    }]);
    return DOMLocalization;
  }(Localization);

  var DocumentLocalization = function (_DOMLocalization) {
    inherits(DocumentLocalization, _DOMLocalization);

    function DocumentLocalization(requestBundles, createContext) {
      classCallCheck(this, DocumentLocalization);

      var _this = possibleConstructorReturn(this, (DocumentLocalization.__proto__ || Object.getPrototypeOf(DocumentLocalization)).call(this, requestBundles, createContext, 'main'));


      _this.query = '[data-l10n-with="main"], [data-l10n-id]:not([data-l10n-with])';

      _this.delegates = new Map();

      _this.observer = _this;

      _this.observedRoots = new Set();
      _this.mutationObserver = new MutationObserver(function (mutations) {
        return _this.translateMutations(mutations);
      });

      _this.observerConfig = {
        attributes: true,
        characterData: false,
        childList: true,
        subtree: true,
        attributeFilter: ['data-l10n-id', 'data-l10n-args', 'data-l10n-with']
      };
      return _this;
    }

    createClass(DocumentLocalization, [{
      key: 'requestLanguages',
      value: function requestLanguages(requestedLangs) {
        var _this2 = this;

        var requests = [get(DocumentLocalization.prototype.__proto__ || Object.getPrototypeOf(DocumentLocalization.prototype), 'requestLanguages', this).call(this, requestedLangs)].concat(Array.from(this.delegates.values(), function (delegate) {
          return delegate.requestLanguages(requestedLangs);
        }));

        return Promise.all(requests).then(function () {
          return _this2.translateDocument();
        });
      }

    }, {
      key: 'observeRoot',
      value: function observeRoot(root) {
        this.observedRoots.add(root);
        this.mutationObserver.observe(root, this.observerConfig);
      }

    }, {
      key: 'unobserveRoot',
      value: function unobserveRoot(root) {
        this.observedRoots.delete(root);

        this.pauseObserving();
        this.resumeObserving();
      }

    }, {
      key: 'pauseObserving',
      value: function pauseObserving() {
        this.mutationObserver.disconnect();
      }

    }, {
      key: 'resumeObserving',
      value: function resumeObserving() {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.observedRoots[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var root = _step.value;

            this.mutationObserver.observe(root, this.observerConfig);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }

    }, {
      key: 'translateMutations',
      value: function translateMutations(mutations) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = mutations[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var mutation = _step2.value;

            switch (mutation.type) {
              case 'attributes':
                this.translateElement(mutation.target);
                break;
              case 'childList':
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                  for (var _iterator3 = mutation.addedNodes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var addedNode = _step3.value;

                    if (addedNode.nodeType === addedNode.ELEMENT_NODE) {
                      if (addedNode.childElementCount) {
                        this.translateFragment(addedNode);
                      } else if (addedNode.hasAttribute('data-l10n-id')) {
                        this.translateElement(addedNode);
                      }
                    }
                  }
                } catch (err) {
                  _didIteratorError3 = true;
                  _iteratorError3 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                      _iterator3.return();
                    }
                  } finally {
                    if (_didIteratorError3) {
                      throw _iteratorError3;
                    }
                  }
                }

                break;
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }

    }, {
      key: 'translateDocument',
      value: function translateDocument() {
        var localizations = [this].concat(toConsumableArray(this.delegates.values()));
        return Promise.all(localizations.map(function (l10n) {
          return l10n.translateRoots();
        }));
      }

    }, {
      key: 'translateFragment',
      value: function translateFragment(frag) {
        var requests = [get(DocumentLocalization.prototype.__proto__ || Object.getPrototypeOf(DocumentLocalization.prototype), 'translateFragment', this).call(this, frag)].concat(Array.from(this.delegates.values(), function (delegate) {
          return delegate.translateFragment(frag);
        }));

        return Promise.all(requests);
      }

    }, {
      key: 'translateElement',
      value: function translateElement(element) {
        var name = element.getAttribute('data-l10n-with');

        var l10n = void 0;
        if (!name || name === 'main') {
          l10n = this;
        } else if (this.delegates.has(name)) {
          l10n = this.delegates.get(name);
        } else {
          var err = new L10nError('Unknown Localization: ' + name + '.');
          return Promise.reject(err);
        }

        return l10n.formatEntities([l10n.getKeysForElement(element)]).then(function (translations) {
          return l10n.applyTranslations([element], translations);
        });
      }
    }, {
      key: 'getTranslatables',
      value: function getTranslatables(element) {
        var nodes = Array.from(element.querySelectorAll(this.query));

        if (typeof element.hasAttribute === 'function' && element.hasAttribute('data-l10n-id')) {
          var elemBundleName = element.getAttribute('data-l10n-with');
          if (!elemBundleName || elemBundleName === this.name) {
            nodes.push(element);
          }
        }

        return nodes;
      }
    }]);
    return DocumentLocalization;
  }(DOMLocalization);

  var HTTP_STATUS_CODE_OK = 200;

  function load(url) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();

      if (xhr.overrideMimeType) {
        xhr.overrideMimeType('text/plain');
      }

      xhr.open('GET', url, true);

      xhr.addEventListener('load', function (e) {
        if (e.target.status === HTTP_STATUS_CODE_OK || e.target.status === 0) {
          resolve(e.target.responseText);
        } else {
          reject(new Error(url + ' not found'));
        }
      });

      xhr.addEventListener('error', function () {
        return reject(new Error(url + ' failed to load'));
      });
      xhr.addEventListener('timeout', function () {
        return reject(new Error(url + ' timed out'));
      });

      xhr.send(null);
    });
  }

  function fetchResource(res, lang) {
    var url = res.replace('{locale}', lang);
    return load(url).catch(function () {
      return null;
    });
  }

  var ResourceBundle = function () {
    function ResourceBundle(lang, el) {
      classCallCheck(this, ResourceBundle);

      this.lang = lang;
      this.loaded = false;
      this.el = el;
    }

    createClass(ResourceBundle, [{
      key: 'fetch',
      value: function fetch() {
        var _this = this;

        if (!this.loaded) {
          this.loaded = Promise.resolve([this.el.text]);
        }

        return this.loaded;
      }
    }]);
    return ResourceBundle;
  }();

  function documentReady() {
    var rs = document.readyState;
    if (rs === 'interactive' || rs === 'completed') {
      return Promise.resolve();
    }

    return new Promise(function (resolve) {
      return document.addEventListener('readystatechange', resolve, { once: true });
    });
  }

  function getResourceLinks(elem) {
    return Array.prototype.map.call(elem.querySelectorAll('script[type="text/fluent"]'), function (el) {
      return [el.getAttribute('lang'), el];
    }).reduce(function (seq, _ref) {
      var _ref2 = slicedToArray(_ref, 2),
          lang = _ref2[0],
          el = _ref2[1];

      return seq.set(lang, el);
    }, new Map());
  }

  function getMeta(head) {
    var availableLangs = [];
    var defaultLang = null;
    var appVersion = null;

    var metas = Array.from(head.querySelectorAll('meta[name="availableLanguages"],' + 'meta[name="defaultLanguage"],' + 'meta[name="appVersion"]'));
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = metas[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var meta = _step.value;

        var name = meta.getAttribute('name');
        var content = meta.getAttribute('content').trim();
        switch (name) {
          case 'availableLanguages':
            availableLangs = content.split(',').map(function (lang) {
              return lang.trim();
            });
            break;
          case 'defaultLanguage':
            defaultLang = content;
            break;
          case 'appVersion':
            appVersion = content;
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return {
      defaultLang: defaultLang,
      availableLangs: availableLangs,
      appVersion: appVersion
    };
  }

  function createContext(lang) {
    return new MessageContext(lang);
  }

  function createLocalization(defaultLocale, availableLangs, lang, el) {
    function requestBundles() {
      var requestedLangs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : navigator.languages;

      var newLangs = negotiateLanguages(requestedLangs, availableLangs, { defaultLocale: defaultLocale });

      var bundles = newLangs.map(function (lang) {
        return new ResourceBundle(lang, el);
      });

      return Promise.resolve(bundles);
    }
    let name = 'main';
    if (name === 'main') {
      document.l10n = new DocumentLocalization(requestBundles, createContext);
      document.l10n.ready = documentReady().then(function () {
        document.l10n.connectRoot(document.documentElement);
        return document.l10n.translateDocument();
      }).then(function () {
        window.addEventListener('languagechange', document.l10n);
      });
    } else {
      var l10n = new DOMLocalization(requestBundles, createContext, name, document.l10n);

      document.l10n.delegates.set(name, l10n);
    }
  }

  var _getMeta = getMeta(document.head);
  var defaultLang = _getMeta.defaultLang;
  var availableLangs = _getMeta.availableLangs;
  getResourceLinks(document.head).forEach(function (el, lang) {
    return createLocalization(defaultLang, availableLangs, lang, el);
  });
})();
//# sourceMappingURL=l20n.js.map
