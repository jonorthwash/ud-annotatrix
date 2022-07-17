"use strict";

import * as _ from "underscore";
import * as constants from "./constants";
import * as re from "./regex";

export function combine<T>(arr: T[], k: number): T[][] {
  if (k > arr.length || k <= 0)
    return [];

  if (k === arr.length)
    return [arr];

  if (k === 1)
    return arr.map(e => [e]);

  let combs: T[][] = [];
  for (let i = 0; i < arr.length - k + 1; i++) {
    const head = arr.slice(i, i + 1);
    const tailCombs = combine(arr.slice(i + 1), k - 1);
    tailCombs.forEach(tailComb => { combs.push(head.concat(tailComb)); });
  }
  return combs;
}

export function hexToRGB(hex: string): [number, number, number]|undefined {
  const match = hex.match(re.hexColor);

  if (match)
    return [
      parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)
    ];

  return undefined;
}

export function isJSONSerializable(obj: any): boolean {
  if (typeof obj === "string") {
    try {
      JSON.parse(obj);
    } catch (e) {
      return false;
    }

  } else {
    try {
      JSON.stringify(obj);
    } catch (e) {
      return false;
    }
  }

  return true;
}

export function noop<T>(t: T): T {
  return t;
}

export function thin<T>(t: T): T|undefined {
  return !!t ? t : undefined;
}

export function dedup<T>(master: T, slave: T): T {
  let dedup = {} as T;

  _.each(slave, (value, key) => {
    if (master[key] !== value)
      dedup[key] = value;
  });

  return dedup;
}

export function hashStringToHex(s: string): string {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = s.charCodeAt(i) + ((hash << 5) - hash);
  }

  let hex = "";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    hex += ("00" + value.toString(16)).substr(-2);
  }
  return hex;
}

export function getRandomHexColor(): string {
  let color = "";
  do {
    color = Math.floor(Math.random() * constants.hexConstant).toString(16);
  } while (color.length !== 7);

  return color;
}

export function getContrastingColor(background: string): string {
  let color = "ffffff";

  const rgb = hexToRGB(background);
  if (!rgb)
    return color;

  const [r, g, b] = rgb;
  if ((r ** 2 + g ** 2 + b ** 2) >
      ((255 - r) ** 2 + (255 - g) ** 2 + (255 - b) ** 2))
    color = "000000";

  return color;
}
