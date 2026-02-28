import { useState, useCallback, useRef } from 'react'
import './App.css'

const MIN_ROWS = 5
const MAX_ROWS = 12
const MIN_COLS = 2
const MAX_COLS = 5

function getValidCols(prevCol, cols) {
  if (prevCol === null || prevCol === undefined) return Array.from({ length: cols }, (_, i) => i)
  const valid = [prevCol]
  if (prevCol > 0) valid.push(prevCol - 1)
  if (prevCol < cols - 1) valid.push(prevCol + 1)
  return valid
}

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
  // Grid size
  const [rows, setRows] = useState(10)
  const [cols, setCols] = useState(5)
  // Game modes: 'setup' | 'play' | 'win' | 'lose'
  const [mode, setMode] = useState('setup')
  // Secret path: array of row column indices, null = not set
  const [secretPath, setSecretPath] = useState(() => Array(10).fill(null))
  // Play state
  const [activeRow, setActiveRow] = useState(0)
  const [completedCells, setCompletedCells] = useState([])
  // Wrong cell
  const [wrongCell, setWrongCell] = useState(null)
  // Warning message
  const [warning, setWarning] = useState('')

  const startSetup = useCallback(() => {
    setMode('setup')
    setSecretPath(Array(rows).fill(null))
    setActiveRow(0)
    setCompletedCells([])
    setWarning('')
  }, [rows])

  const handleSetupTap = useCallback(
    (row, col) => {
      if (mode !== 'setup') return
      const prevCol = row === 0 ? null : secretPath[row - 1]
      if (!getValidCols(prevCol, cols).includes(col)) return
      setWarning('')
      setSecretPath((prev) => {
        const next = [...prev]
        next[row] = col
        // Clear downstream rows that are no longer adjacent
        for (let r = row + 1; r < rows; r++) {
          if (next[r] === null) break
          const valid = getValidCols(next[r - 1], cols)
          if (!valid.includes(next[r])) {
            for (let clear = r; clear < rows; clear++) next[clear] = null
            break
          }
        }
        return next
      })
    },
    [mode, secretPath, rows, cols]
  )

  const randomizePath = useCallback(() => {
    const path = Array(rows).fill(null)
    path[0] = Math.floor(Math.random() * cols)
    for (let r = 1; r < rows; r++) {
      const valid = getValidCols(path[r - 1], cols)
      path[r] = valid[Math.floor(Math.random() * valid.length)]
    }
    setSecretPath(path)
    setWarning('')
  }, [rows, cols])

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

      if (col === secretPath[row]) {
        // Correct!
        setCompletedCells((prev) => [...prev, { row, col }])

        if (row === rows - 1) {
          setMode('win')
        } else {
          setActiveRow(row + 1)
        }
      } else {
        // Wrong — freeze the board with the wrong cell shown
        setWrongCell({ row, col })
        setMode('lose')
      }
    },
    [mode, activeRow, secretPath, rows]
  )

  const editPath = useCallback(() => {
    setMode('setup')
    setActiveRow(0)
    setCompletedCells([])
    setWarning('')
  }, [])

  const playAgain = useCallback(() => {
    setActiveRow(0)
    setCompletedCells([])
    setWrongCell(null)
    setMode('play')
  }, [])

  const getCellClass = (row, col) => {
    const classes = ['cell']

    if (mode === 'setup') {
      const prevCol = row === 0 ? null : secretPath[row - 1]
      const isValid = (row === 0 || prevCol !== null) && getValidCols(prevCol, cols).includes(col)
      if (secretPath[row] === col) {
        classes.push('setup-selected')
      } else if (isValid) {
        classes.push('option')
      } else {
        classes.push('disabled')
      }
    }

    if (mode === 'play' || mode === 'win' || mode === 'lose') {
      if (completedCells.some((c) => c.row === row && c.col === col)) {
        classes.push('correct')
      }
      if (wrongCell && wrongCell.row === row && wrongCell.col === col) {
        classes.push('flash-wrong')
      }
      if (mode === 'play' && row === activeRow) {
        const prevCol = row === 0 ? null : secretPath[row - 1]
        if (getValidCols(prevCol, cols).includes(col)) {
          classes.push('option')
        }
      }
    }

    return classes.join(' ')
  }

  const getRowClass = (row) => {
    if (mode === 'setup') return 'grid-row'
    if (mode === 'lose') return 'grid-row'
    if (mode !== 'play') return 'grid-row inactive'

    if (row === activeRow) return 'grid-row active-row'
    return 'grid-row inactive'
  }

  return (
    <div className="app">
      <div className="game-container">
        {/* Header */}
        <div className="header">
          <div className="title-row">
            <div className="logo">
              <span className="logo-icon">🐸</span>
              <h1>Tap Hop</h1>
            </div>
            <div className="title-actions">
              {mode === 'setup' && (
                <>
                  <button className="btn btn-dice" onClick={randomizePath} aria-label="Randomize path">
                    🎲
                  </button>
                  <button className="btn btn-lock" onClick={lockPath}>
                    Play
                  </button>
                </>
              )}
              {mode === 'play' && (
                <button className="btn btn-icon" onClick={editPath} aria-label="Edit path">
                  ✏️
                </button>
              )}
              {mode === 'lose' && (
                <button className="btn btn-retry" onClick={playAgain}>
                  Retry
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Grid size controls */}
        {mode === 'setup' && (
          <div className="size-controls">
            <div className="size-stepper">
              <button
                className="btn btn-step"
                disabled={cols <= MIN_COLS}
                onClick={() => { setCols((c) => c - 1); setSecretPath(Array(rows).fill(null)) }}
              >−</button>
              <button
                className="btn btn-step"
                disabled={cols >= MAX_COLS}
                onClick={() => { setCols((c) => c + 1); setSecretPath(Array(rows).fill(null)) }}
              >+</button>
              <button
                className="btn btn-step"
                disabled={rows <= MIN_ROWS}
                onClick={() => { setRows((r) => r - 1); setSecretPath(Array(rows - 1).fill(null)) }}
              >↑</button>
              <button
                className="btn btn-step"
                disabled={rows >= MAX_ROWS}
                onClick={() => { setRows((r) => r + 1); setSecretPath(Array(rows + 1).fill(null)) }}
              >↓</button>
            </div>
          </div>
        )}

        {/* Warning */}
        {warning && <div className="warning">{warning}</div>}

        {/* Grid */}
        <div className="grid">
            {/* Rows */}
            {Array.from({ length: rows }, (_, r) => (
              <div className={getRowClass(r)} key={r} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                {Array.from({ length: cols }, (_, c) => (
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
