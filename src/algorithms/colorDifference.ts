
// RGBの型
type RGB = {
  r: number
  g: number
  b: number
}

// HEXカラーをRGBに変換
function hexToRgb(hex: string): RGB {
  const cleanHex = hex.replace('#', '')

  return {
    r: parseInt(cleanHex.substring(0, 2), 16),
    g: parseInt(cleanHex.substring(2, 4), 16),
    b: parseInt(cleanHex.substring(4, 6), 16),
  }
}

// sRGBをリニアRGBに変換
function toLinear(value: number): number {
  const v = value / 255

  if (v <= 0.04045) {
    return v / 12.92
  }

  return Math.pow((v + 0.055) / 1.055, 2.4)
}

// RGBをXYZに変換
function rgbToXyz(rgb: RGB) {
  const r = toLinear(rgb.r)
  const g = toLinear(rgb.g)
  const b = toLinear(rgb.b)

  return {
    x: (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047,
    y: r * 0.2126 + g * 0.7152 + b * 0.0722,
    z: (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883,
  }
}

// XYZをLabに変換
function xyzToLab(xyz: { x: number; y: number; z: number }) {
  const f = (value: number) => {
    if (value > 0.008856) {
      return Math.cbrt(value)
    }

    return 7.787 * value + 16 / 116
  }

  const x = f(xyz.x)
  const y = f(xyz.y)
  const z = f(xyz.z)

  return {
    l: 116 * y - 16,
    a: 500 * (x - y),
    b: 200 * (y - z),
  }
}

// CIELAB色差（ΔE76）を計算
export function calculateDeltaE(color1: string, color2: string): number {
  const lab1 = xyzToLab(rgbToXyz(hexToRgb(color1)))
  const lab2 = xyzToLab(rgbToXyz(hexToRgb(color2)))

  const difference = Math.sqrt(
    Math.pow(lab1.l - lab2.l, 2) +
    Math.pow(lab1.a - lab2.a, 2) +
    Math.pow(lab1.b - lab2.b, 2)
  )

  return Number(difference.toFixed(2))
}
