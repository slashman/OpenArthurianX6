// From http://www.krazydad.com/makecolors.php
function RGB2Color(r,g,b) {
  return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
}

function RGB2Hexa(r,g,b) {
  return parseInt(byte2Hex(r) + byte2Hex(g) + byte2Hex(b), 16);
}

// From http://www.krazydad.com/makecolors.php
function byte2Hex(n) {
  var nybHexString = "0123456789ABCDEF";
  return String(nybHexString.substr((n >> 4) & 0x0F,1)) + nybHexString.substr(n & 0x0F,1);
}

function getSunStrength(hour){
  if (hour < 0)
    hour = 0;
  if (hour > 2359)
    hour = 2359;
  if (hour > 1200)
    hour = 2400 - hour;
  return 1.0007721047271 * (1 - Math.pow(1 + Math.pow(hour / 439.73631426292, 7.8143467692704), -0.913569795416587));
}

const SkyColor = {
  setup(atmosphereDiffraction, atmosphereBase, sunColor, moonColor) {
    this.atmosphereDiffraction = atmosphereDiffraction;
    this.atmosphereBase = atmosphereBase;
    this.sunColor = sunColor;
    this.moonColor = moonColor;
  },

  /**
   * @param hourOfDay, number from 0000 to 2359
   */
  getColor(hourOfDay) {
    const sunStrength = getSunStrength(hourOfDay);
    const moonStrength = 1 - sunStrength;

    let skyr = this.atmosphereBase.r;
    let skyg = this.atmosphereBase.g;
    let skyb = this.atmosphereBase.b;

    skyr += this.sunColor.r * sunStrength * this.atmosphereDiffraction.r;
    skyg += this.sunColor.g * sunStrength * this.atmosphereDiffraction.g;
    skyb += this.sunColor.b * sunStrength * this.atmosphereDiffraction.b;

    skyr += this.moonColor.r * moonStrength * this.atmosphereDiffraction.r;
    skyg += this.moonColor.g * moonStrength * this.atmosphereDiffraction.g;
    skyb += this.moonColor.b * moonStrength * this.atmosphereDiffraction.b;

    if (skyr > 255) {
      skyr = 255;
    }
    if (skyg > 255) {
      skyg = 255;
    }
    if (skyb > 255) {
      skyb = 255;
    }
    return RGB2Hexa(skyr, skyg, skyb);
  }
}

const EARTH = {
  atmosphereBase: {
    r: 0, g: 0, b: 0
  },
  atmosphereDiffraction: {
    r: 0.15, g: 0.48, b: 0.84
  },
};

const SUNLIGHT = { r: 255, g: 255, b: 255 };
const MOONLIGHT = { r: 80, g: 80, b: 80 };

SkyColor.setup(EARTH.atmosphereDiffraction, EARTH.atmosphereBase, SUNLIGHT, MOONLIGHT);

module.exports = SkyColor;