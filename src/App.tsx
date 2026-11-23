
import { useEffect, useRef, useState } from 'react'
import { findBestMix } from './algorithms/colorMixer'
import type { SavedRecipe } from './types/recipe'
import { loadRecipes, saveRecipes, deleteRecipe } from './utils/recipeStorage'
import './App.css'

function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState('#FFFFFF')
  const [rgb, setRgb] = useState({ r: 255, g: 255, b: 255 })

  const [previewColor, setPreviewColor] = useState<string | null>(null)

  // 保存済みレシピを管理
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>(() => {
    return loadRecipes()
  })

  // 選択した色から混色レシピを計算
  const mixResult = findBestMix(selectedColor)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 現在の混色レシピを保存する
  const handleSaveRecipe = () => {
    const newRecipe: SavedRecipe = {
      id: crypto.randomUUID(),
      targetColor: selectedColor,
      mixedColor: mixResult.color,
      paints: mixResult.paints,
      ratios: mixResult.ratios,
      difference: mixResult.difference,
      createdAt: new Date().toLocaleString('ja-JP'),
    }

    const updatedRecipes = [...savedRecipes, newRecipe]

    setSavedRecipes(updatedRecipes)
    saveRecipes(updatedRecipes)

    alert('レシピを保存しました！')
  }

  // 保存したレシピを削除する
  const handleDeleteRecipe = (id: string) => {
    const updatedRecipes = deleteRecipe(id)

    setSavedRecipes(updatedRecipes)
  }

  // 画像を選択したときの処理
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください')
      return
    }

    const url = URL.createObjectURL(file)
    setImageUrl(url)
    setSelectedColor('#FFFFFF')
    setRgb({ r: 255, g: 255, b: 255 })
  }

  // 画像をCanvasに描画する
  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget
    const canvas = canvasRef.current

    if (!canvas) return

    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight

    const context = canvas.getContext('2d')

    if (!context) return

    context.drawImage(image, 0, 0)
  }

  // マウス位置の色を取得する
  const getColorAtPosition = (
    event: React.MouseEvent<HTMLImageElement>
  ) => {
    const image = event.currentTarget
    const canvas = canvasRef.current

    if (!canvas) return null

    const rect = image.getBoundingClientRect()

    const x = Math.min(
      canvas.width - 1,
      Math.max(0, Math.floor(
        ((event.clientX - rect.left) / rect.width) * canvas.width
      ))
    )

    const y = Math.min(
      canvas.height - 1,
      Math.max(0, Math.floor(
        ((event.clientY - rect.top) / rect.height) * canvas.height
      ))
    )

    const context = canvas.getContext('2d')

    if (!context) return null

    const pixel = context.getImageData(x, y, 1, 1).data

    const r = pixel[0]
    const g = pixel[1]
    const b = pixel[2]

    const hex =
      '#' +
      [r, g, b]
        .map((value) => value.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase()

    return { hex, r, g, b }
  }

  // マウスを合わせたときのプレビュー
  const handleMouseMove = (
    event: React.MouseEvent<HTMLImageElement>
  ) => {
    const color = getColorAtPosition(event)

    if (!color) return

    setPreviewColor(color.hex)
  }

  // クリックした色を固定する
  const handleImageClick = (
    event: React.MouseEvent<HTMLImageElement>
  ) => {
    const color = getColorAtPosition(event)

    if (!color) return

    setSelectedColor(color.hex)
    setRgb({ r: color.r, g: color.g, b: color.b })
    setPreviewColor(null)
  }

  // 古い画像データを解放する
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl)
      }
    }
  }, [imageUrl])

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span className="logo-icon">●</span>
          Color Palette Navi
        </div>
        <p>あなたの絵づくりをサポート</p>
      </header>

      <main className="main">
        <section className="intro">
          <h1>好きな色を見つけよう。</h1>
          <p>
            画像にマウスを合わせて色を確認し、クリックすると選択した色を固定できます。
          </p>
        </section>

        <div className="workspace">
          <section className="image-section">
            <h2>画像を選択</h2>

            <label className="upload-button">
              ＋ 画像をアップロード
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                hidden
              />
            </label>

            <div className="image-area">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="色を調べる画像"
                  onLoad={handleImageLoad}
                  onMouseMove={handleMouseMove}
                  onClick={handleImageClick}
                  onMouseLeave={() => setPreviewColor(null)}
                  className="uploaded-image"
                  style={{ cursor: 'crosshair' }}
                />
              ) : (
                <div className="empty-message">
                  <span className="image-icon">▧</span>
                  <p>ここに画像が表示されます</p>
                  <small>画像をアップロードしてください</small>
                </div>
              )}
            </div>

            {previewColor && (
              <p style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                カーソル位置の色：
                <span
                  style={{
                    width: '25px',
                    height: '25px',
                    backgroundColor: previewColor,
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                  }}
                />
                <strong>{previewColor}</strong>
              </p>
            )}

            <canvas ref={canvasRef} hidden />
          </section>

          <section className="color-section">
            <h2>選択した色</h2>

            <div
              className="color-preview"
              style={{ backgroundColor: selectedColor }}
            />

            <div className="color-info">
              <p>HEX</p>
              <strong>{selectedColor}</strong>
            </div>

            <div className="color-info">
              <p>RGB</p>
              <strong>
                {rgb.r}, {rgb.g}, {rgb.b}
              </strong>
            </div>

            <div className="recipe-placeholder">
              <h3>混色レシピ</h3>

              <p>目標色に近い絵の具の組み合わせ</p>

            <div
              style={{
                  backgroundColor: mixResult.color,
                  height: '60px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  marginBottom: '15px',
              }}
            />

            {mixResult.paints.map((paint, index) => (
            <div
              key={paint.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '10px',
              }}
            >
            <div
              style={{
                width: '25px',
                height: '25px',
                backgroundColor: paint.color,
                borderRadius: '5px',
                border: '1px solid #ddd',
              }}
            />

            <span>{paint.name}</span>

            
            <div
              style={{
                marginLeft: 'auto',
                width: '100px',
                height: '12px',
                backgroundColor: '#eee',
                borderRadius: '6px',
                overflow: 'hidden',
              }}
            >
            <div
              style={{
                width: `${mixResult.ratios[index]}%`,
                height: '100%',
                backgroundColor: paint.color,
                borderRadius: '6px',
              }}
            />
          </div>

        <strong style={{ width: '45px', textAlign: 'right' }}>
          {mixResult.ratios[index]}%
        </strong>

    </div>
  ))}

  <p>
  色差（ΔE76）：{mixResult.difference.toFixed(2)}
  </p>

  <button
    onClick={handleSaveRecipe}
    style={{
      width: '100%',
      padding: '12px',
      marginTop: '15px',
      backgroundColor: '#8B654A',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '15px',
    }}
  >
    ★ この混色レシピを保存
  </button>

  <p style={{ fontSize: '13px', color: '#666' }}>
    {mixResult.difference < 2
      ? '目視ではほとんど違いが分からない色です。'
      : mixResult.difference < 5
      ? 'わずかな色の違いがあります。'
      : mixResult.difference < 10
      ? '色の違いがはっきり分かります。'
      : '大きな色の違いがあります。'}
  </p>
  
</div>
          </section>
          <section className="saved-section">
            <h2>保存したレシピ</h2>

            {savedRecipes.length === 0 ? (
              <p>保存したレシピはまだありません。</p>
            ) : (
              savedRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  style={{
                    padding: '15px',
                    marginBottom: '15px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: recipe.targetColor,
                        borderRadius: '6px',
                      }}
                    />

                    <div>
                      <strong>{recipe.targetColor}</strong>
                      <p style={{ margin: '4px 0', fontSize: '12px' }}>
                        保存日時：{recipe.createdAt}
                      </p>
                    </div>
                  </div>

                  <p>
                    色差（ΔE76）：{recipe.difference.toFixed(2)}
                  </p>

                  <p>
                    使用する絵の具：
                    {recipe.paints.map((paint, index) => (
                      <span key={paint.name}>
                        {paint.name}（{recipe.ratios[index]}%）
                        {index < recipe.paints.length - 1 ? '、' : ''}
                      </span>
                    ))}
                  </p>
                  <button
                    onClick={() => handleDeleteRecipe(recipe.id)}
                    style={{
                      padding: '8px 15px',
                      marginTop: '10px',
                      backgroundColor: '#d9534f',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    削除
                  </button>
                </div>
              ))
            )}
          </section>
        </div>
      </main>

      <footer>
        <p>Color Palette Navi © 2026</p>
      </footer>
    </div>
  )
}

export default App
