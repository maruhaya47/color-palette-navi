
import type { SavedRecipe } from '../types/recipe'

// 保存したレシピを読み込む
export function loadRecipes(): SavedRecipe[] {
  const data = localStorage.getItem('color-palette-recipes')

  if (!data) {
    return []
  }

  try {
    return JSON.parse(data) as SavedRecipe[]
  } catch {
    return []
  }
}

// レシピを保存する
export function saveRecipes(recipes: SavedRecipe[]): void {
  localStorage.setItem(
    'color-palette-recipes',
    JSON.stringify(recipes)
  )
}

// レシピを1件削除する
export function deleteRecipe(id: string): SavedRecipe[] {
  const recipes = loadRecipes()
  const updatedRecipes = recipes.filter(
    (recipe) => recipe.id !== id
  )

  saveRecipes(updatedRecipes)

  return updatedRecipes
}
