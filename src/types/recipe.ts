
import type { Paint } from '../algorithms/colorMixer'

// 保存するレシピのデータ型
export type SavedRecipe = {
  id: string
  targetColor: string
  mixedColor: string
  paints: Paint[]
  ratios: number[]
  difference: number
  createdAt: string
}
