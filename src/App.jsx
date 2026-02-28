import { useState, useCallback, useRef, useEffect } from 'react'
import './App.css'

const ROWS = 10
const COLS = 5

function Confetti() {
  const pieces = useRef(
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6bc1', '#a66cff'][
        Math.floor(Math.random() * 6)
      ],
      size: 6 + Math.random() * 8,
      duration: 2 + Math.random() * 2,
      delay: Math.random() * 1.5,
      shape: Math.random() > 0.5 ? '50%' : '0%',
    }))
  ).current

  return (
    <div className="confetti-container">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.shape,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

function App() {
  // Game modes: 'setup' | 'play' | 'win'
  const [mode, setMode] = useState('setup')
  // Secret path: array of 10 column indices (0-4), null = not set
  const [secretPath, setSecretPath] = useState(() => Array(ROWS).fill(null))
  // Play state
  const [activeRow, setActiveRow] = useState(0)
  const [completedCells, setCompletedCells] = useState([])
  // Flash state: { row, col, type: 'correct'|'wrong' }
  const [flash, setFlash] = useState(null)
  // Banner: { type: 'correct'|'wrong' }
  const [banner, setBanner] = useState(null)
  // Warning message
  const [warning, setWarning] = useState('')

  const flashTimeout = useRef(null)
  const bannerTimeout = useRef(null)

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      clearTimeout(flashTimeout.current)
      clearTimeout(bannerTimeout.current)
    }
  }, [])

  const startSetup = useCallback(() => {
    setMode('setup')
    setSecretPath(Array(ROWS).fill(null))
    setActiveRow(0)
    setCompletedCells([])
    setFlash(null)
    setBanner(null)
    setWarning('')
  }, [])

  const handleSetupTap = useCallback(
    (row, col) => {
      if (mode !== 'setup') return
      setWarning('')
      setSecretPath((prev) => {
        const next = [...prev]
        next[row] = col
        return next
      })
    },
    [mode]
  )

  const lockPath = useCallback(() => {
    const incomplete = secretPath.some((v) => v === null)
    if (incomplete) {
      setWarning('Please select a square for every row.')
      return
    }
    setMode('play')
    setActiveRow(0)
    setCompletedCells([])
    setWarning('')
  }, [secretPath])

  const handlePlayTap = useCallback(
    (row, col) => {
      if (mode !== 'play') return
      if (row !== activeRow) return
      if (flash) return // ignore taps during flash

      if (col === secretPath[row]) {
        // Correct!
        setFlash({ row, col, type: 'correct' })
        setBanner({ type: 'correct' })

        clearTimeout(flashTimeout.current)
        clearTimeout(bannerTimeout.current)

        flashTimeout.current = setTimeout(() => {
          setFlash(null)
          setCompletedCells((prev) => [...prev, { row, col }])

          if (row === ROWS - 1) {
            // Won!
            setMode('win')
            setBanner(null)
          } else {
            setActiveRow(row + 1)
          }
        }, 800)

        bannerTimeout.current = setTimeout(() => {
          setBanner(null)
        }, 1200)
      } else {
        // Wrong!
        setFlash({ row, col, type: 'wrong' })
        setBanner({ type: 'wrong' })

        clearTimeout(flashTimeout.current)
        clearTimeout(bannerTimeout.current)

        flashTimeout.current = setTimeout(() => {
          setFlash(null)
          setActiveRow(0)
          setCompletedCells([])
        }, 1500)

        bannerTimeout.current = setTimeout(() => {
          setBanner(null)
        }, 1500)
      }
    },
    [mode, activeRow, secretPath, flash]
  )

  const resetGame = useCallback(() => {
    setActiveRow(0)
    setCompletedCells([])
    setFlash(null)
    setBanner(null)
    setMode('play')
  }, [])

  const editPath = useCallback(() => {
    startSetup()
  }, [startSetup])

  const playAgain = useCallback(() => {
    setActiveRow(0)
    setCompletedCells([])
    setFlash(null)
    setBanner(null)
    setMode('play')
  }, [])

  const getCellClass = (row, col) => {
    const classes = ['cell']

    if (mode === 'setup' && secretPath[row] === col) {
      classes.push('setup-selected')
    }

    if (mode === 'play' || mode === 'win') {
      if (completedCells.some((c) => c.row === row && c.col === col)) {
        classes.push('correct')
      }
    }

    if (flash && flash.row === row && flash.col === col) {
      classes.push(flash.type === 'correct' ? 'flash-correct' : 'flash-wrong')
    }

    return classes.join(' ')
  }

  const getRowClass = (row) => {
    if (mode === 'setup') return 'grid-row'
    if (mode !== 'play') return 'grid-row inactive'

    if (row === activeRow) return 'grid-row active-row'
    // Allow flash row to stay visible during wrong-flash reset
    if (flash && flash.row === row) return 'grid-row active-row'
    return 'grid-row inactive'
  }

  return (
    <div className="app">
      <div className="game-container">
        {/* Header */}
        <div className="header">
          <h1>Secret Path</h1>
          <div className="mode-label">
            {mode === 'setup' && 'Leader: tap one square per row'}
            {mode === 'play' && ''}
            {mode === 'win' && ''}
          </div>

        </div>

        {/* Controls */}
        <div className="controls">
          {mode === 'setup' && (
            <button className="btn btn-lock" onClick={lockPath}>
              Lock Path &amp; Play
            </button>
          )}

          {mode === 'play' && (
            <>
              <button className="btn btn-reset" onClick={resetGame}>
                Reset Game
              </button>
              <button className="btn btn-edit" onClick={editPath}>
                Edit Path
              </button>
            </>
          )}
        </div>

        {/* Warning */}
        {warning && <div className="warning">{warning}</div>}

        {/* Grid */}
        <div className="grid-wrapper">
          <div className="row-labels">
            {Array.from({ length: ROWS }, (_, r) => (
              <div className="row-label" key={r}>
                R{r + 1}
              </div>
            ))}
          </div>
          <div className="grid">
            {/* Column headers */}
            <div className="col-headers">
              {Array.from({ length: COLS }, (_, c) => (
                <div className="col-header" key={c}>
                  C{c + 1}
                </div>
              ))}
            </div>

            {/* Rows */}
            {Array.from({ length: ROWS }, (_, r) => (
              <div className={getRowClass(r)} key={r}>
                {Array.from({ length: COLS }, (_, c) => (
                  <div
                    key={c}
                    className={getCellClass(r, c)}
                    onClick={() => {
                      if (mode === 'setup') handleSetupTap(r, c)
                      if (mode === 'play') handlePlayTap(r, c)
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Banner */}
      {banner && (
        <div
          className={`banner ${
            banner.type === 'correct' ? 'banner-correct' : 'banner-wrong'
          }`}
        >
          {banner.type === 'correct' ? '👍 Correct! Keep going!' : '❌ Wrong! Start again.'}
        </div>
      )}

      {/* Win Screen */}
      {mode === 'win' && (
        <>
          <Confetti />
          <div className="win-overlay">
            <div className="emoji">🎉</div>
            <h2>YOU MADE IT!</h2>
            <button className="btn btn-setup" onClick={playAgain}>
              Play Again
            </button>
            <button
              className="btn btn-edit"
              style={{ marginTop: 12 }}
              onClick={editPath}
            >
              New Path
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default App
