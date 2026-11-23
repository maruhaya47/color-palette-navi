import { calculateDeltaE } from './colorDifference'

// 絵の具のデータ型
export type Paint = {
  name: string
  color: string
}

// 混色結果のデータ型
export type MixResult = {
  paints: Paint[]
  ratios: number[]
  color: string
  difference: number
}

// 使用する絵の具
export const paintList: Paint[] = [
  { name: 'シアン', color: '#00A6C8' },
  { name: 'マゼンタ', color: '#D62983' },
  { name: 'イエロー', color: '#F5D928' },
  { name: 'レッド', color: '#D94336' },
  { name: 'ブルー', color: '#3156A3' },
  { name: 'グリーン', color: '#32965A' },
  { name: 'ホワイト', color: '#FFFFFF' },
  { name: 'ブラック', color: '#222222' },
  { name: 'ブラウン', color: '#875333' },
]

// HEXをRGBに変換する
function hexToRgb(hex: string): number[] {
  const value = hex.replace('#', '')

  return [
    parseInt(value.substring(0, 2), 16),
    parseInt(value.substring(2, 4), 16),
    parseInt(value.substring(4, 6), 16),
  ]
}

// RGBをHEXに変換する
function rgbToHex(rgb: number[]): string {
  return (
    '#' +
    rgb
      .map((value) =>
        Math.round(value).toString(16).padStart(2, '0')
      )
      .join('')
      .toUpperCase()
  )
}

// 2色を指定した割合で混ぜる近似計算

function mixColors(
  color1: string,
  color2: string,
  ratio: number
): string {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  // RGBを0～1の範囲に変換
  const result = rgb1.map((value, index) => {
    const c1 = value / 255
    const c2 = rgb2[index] / 255

    // 各色の反射を近似的に混ぜる
    const mixed =
      1 / (
        ratio / Math.max(c1, 0.001) +
        (1 - ratio) / Math.max(c2, 0.001)
      )

    return mixed * 255
  })

  return rgbToHex(result)
}


// 2色間の色の差を計算する
// 2色間の色の差を計算する
function calculateDifference(
  color1: string,
  color2: string
): number {
  return calculateDeltaE(color1, color2)
}

// 目標色に近い混色レシピを探す
export function findBestMix(targetColor: string): MixResult {
  let bestResult: MixResult = {
    paints: [paintList[0]],
    ratios: [100],
    color: paintList[0].color,
    difference: Infinity,
  }

  // 1色だけの場合も調べる
  for (const paint of paintList) {
    const difference = calculateDifference(
      targetColor,
      paint.color
    )

    if (difference < bestResult.difference) {
      bestResult = {
        paints: [paint],
        ratios: [100],
        color: paint.color,
        difference,
      }
    }
  }

  // 2色の組み合わせを調べる
  for (let i = 0; i < paintList.length; i++) {
    for (let j = i + 1; j < paintList.length; j++) {
      for (let percent = 5; percent < 100; percent += 5) {
        const ratio = percent / 100

        const mixedColor = mixColors(
          paintList[i].color,
          paintList[j].color,
          ratio
        )

        const difference = calculateDifference(
          targetColor,
          mixedColor
        )

        if (difference < bestResult.difference) {
          bestResult = {
            paints: [paintList[i], paintList[j]],
            ratios: [percent, 100 - percent],
            color: mixedColor,
            difference,
          }
        }
      }
    }
  }


  // 3色の組み合わせを調べる
  for (let i = 0; i < paintList.length; i++) {
    for (let j = i + 1; j < paintList.length; j++) {
      for (let k = j + 1; k < paintList.length; k++) {

        // 10%刻みで3色の割合を探索
        for (let p1 = 10; p1 < 90; p1 += 10) {
          for (let p2 = 10; p2 < 100 - p1; p2 += 10) {
            const p3 = 100 - p1 - p2

            if (p3 <= 0) continue

            // 1色目と2色目を混ぜる
            const firstMix = mixColors(
              paintList[i].color,
              paintList[j].color,
              p1 / (p1 + p2)
            )

            // そこに3色目を混ぜる
            const mixedColor = mixColors(
              firstMix,
              paintList[k].color,
              (p1 + p2) / 100
            )

            const difference = calculateDifference(
              targetColor,
              mixedColor
            )

            if (difference < bestResult.difference) {
              bestResult = {
                paints: [
                  paintList[i],
                  paintList[j],
                  paintList[k],
                ],
                ratios: [p1, p2, p3],
                color: mixedColor,
                difference,
              }
            }
          }
        }
      }
    }
  }


  return bestResult
}
