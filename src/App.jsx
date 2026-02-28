import { useState, useCallback, useRef } from 'react'
import './App.css'

const MIN_ROWS = 2
const MAX_ROWS = 5
const MIN_COLS = 2
const MAX_COLS = 10

function FrogIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="logo-icon">
      <ellipse cx="16" cy="20" rx="11" ry="8" fill="#4caf50" />
      <ellipse cx="16" cy="22" rx="7" ry="5" fill="#a5d6a7" />
      <circle cx="10" cy="11" r="5" fill="#4caf50" />
      <circle cx="10" cy="11" r="3.5" fill="#fff" />
      <circle cx="10.5" cy="10.5" r="1.8" fill="#1b5e20" />
      <circle cx="22" cy="11" r="5" fill="#4caf50" />
      <circle cx="22" cy="11" r="3.5" fill="#fff" />
      <circle cx="22.5" cy="10.5" r="1.8" fill="#1b5e20" />
      <path d="M11 22 Q16 26 21 22" stroke="#1b5e20" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <circle cx="9" cy="20" r="2" fill="#ff8a80" opacity="0.4" />
      <circle cx="23" cy="20" r="2" fill="#ff8a80" opacity="0.4" />
    </svg>
  )
}

function DiceIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#fff" />
      <rect x="2" y="2" width="20" height="20" rx="4" stroke="#ccc" strokeWidth="0.5" />
      <circle cx="7.5" cy="7.5" r="2" fill="#1b5e20" />
      <circle cx="16.5" cy="7.5" r="2" fill="#1b5e20" />
      <circle cx="12" cy="12" r="2" fill="#1b5e20" />
      <circle cx="7.5" cy="16.5" r="2" fill="#1b5e20" />
      <circle cx="16.5" cy="16.5" r="2" fill="#1b5e20" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16.5 3.5l4 4L7 21H3v-4L16.5 3.5z" fill="#ffd54f" stroke="#f9a825" strokeWidth="1" strokeLinejoin="round" />
      <path d="M3 21l1.5-4L7 21H3z" fill="#ffab91" stroke="#f9a825" strokeWidth="0.5" />
      <path d="M14.5 5.5l4 4" stroke="#f9a825" strokeWidth="1" />
      <path d="M3 21l0.8-0.8" stroke="#555" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  )
}

function PartyIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      {/* Cone */}
      <path d="M10 6L16 28L22 6" fill="#ffd54f" stroke="#f9a825" strokeWidth="0.8" strokeLinejoin="round" />
      <path d="M10 6Q16 10 22 6" fill="#ff8a65" stroke="#f9a825" strokeWidth="0.5" />
      {/* Stripes */}
      <path d="M11.5 10L20.5 10" stroke="#ff8a65" strokeWidth="1" strokeLinecap="round" />
      <path d="M13 15L19 15" stroke="#4fc3f7" strokeWidth="1" strokeLinecap="round" />
      <path d="M14.5 20L17.5 20" stroke="#ce93d8" strokeWidth="1" strokeLinecap="round" />
      {/* Stars */}
      <circle cx="6" cy="10" r="1.5" fill="#ff6b6b" />
      <circle cx="26" cy="8" r="1.2" fill="#4fc3f7" />
      <circle cx="8" cy="4" r="1" fill="#ffd54f" />
      <circle cx="24" cy="14" r="1.3" fill="#ce93d8" />
      <circle cx="5" cy="18" r="0.8" fill="#6bcb77" />
      <circle cx="27" cy="20" r="1" fill="#ff8a65" />
      {/* Streamers */}
      <path d="M7 6Q4 8 6 12" stroke="#ff6b6b" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M25 6Q28 9 25 13" stroke="#4fc3f7" strokeWidth="1" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function getValidRows(prevRow, rows) {
  if (prevRow === null || prevRow === undefined) return Array.from({ length: rows }, (_, i) => i)
  const valid = [prevRow]
  if (prevRow > 0) valid.push(prevRow - 1)
  if (prevRow < rows - 1) valid.push(prevRow + 1)
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
    <div className="confetti-container" aria-hidden="true">
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
  const [rows, setRows] = useState(5)   // visual rows (height, 2-5)
  const [cols, setCols] = useState(5)   // visual columns (steps, 2-10)
  // Game modes: 'setup' | 'play' | 'win' | 'lose'
  const [mode, setMode] = useState('setup')
  // Secret path: array of column entries, each is a row index
  const [secretPath, setSecretPath] = useState(() => Array(5).fill(null))
  // Play state
  const [activeCol, setActiveCol] = useState(0)
  const [completedCells, setCompletedCells] = useState([])
  // Wrong cell
  const [wrongCell, setWrongCell] = useState(null)
  // Warning message
  const [warning, setWarning] = useState('')

  const startSetup = useCallback(() => {
    setMode('setup')
    setSecretPath(Array(cols).fill(null))
    setActiveCol(0)
    setCompletedCells([])
    setWarning('')
  }, [cols])

  const handleSetupTap = useCallback(
    (col, row) => {
      if (mode !== 'setup') return
      const prevRow = col === 0 ? null : secretPath[col - 1]
      if (!getValidRows(prevRow, rows).includes(row)) return
      setWarning('')
      setSecretPath((prev) => {
        const next = [...prev]
        next[col] = row
        // Clear downstream columns that are no longer adjacent
        for (let c = col + 1; c < cols; c++) {
          if (next[c] === null) break
          const valid = getValidRows(next[c - 1], rows)
          if (!valid.includes(next[c])) {
            for (let clear = c; clear < cols; clear++) next[clear] = null
            break
          }
        }
        return next
      })
    },
    [mode, secretPath, cols, rows]
  )

  const randomizePath = useCallback(() => {
    const path = Array(cols).fill(null)
    path[0] = Math.floor(Math.random() * rows)
    for (let c = 1; c < cols; c++) {
      const valid = getValidRows(path[c - 1], rows)
      path[c] = valid[Math.floor(Math.random() * valid.length)]
    }
    setSecretPath(path)
    setWarning('')
  }, [cols, rows])

  const lockPath = useCallback(() => {
    const incomplete = secretPath.some((v) => v === null)
    if (incomplete) {
      setWarning('Please select a square for every column.')
      return
    }
    setMode('play')
    setActiveCol(0)
    setCompletedCells([])
    setWarning('')
  }, [secretPath])

  const handlePlayTap = useCallback(
    (col, row) => {
      if (mode !== 'play') return
      if (col !== activeCol) return

      if (row === secretPath[col]) {
        // Correct!
        setCompletedCells((prev) => [...prev, { col, row }])

        if (col === cols - 1) {
          setMode('win')
        } else {
          setActiveCol(col + 1)
        }
      } else {
        // Wrong — freeze the board with the wrong cell shown
        setWrongCell({ col, row })
        setMode('lose')
      }
    },
    [mode, activeCol, secretPath, cols]
  )

  const editPath = useCallback(() => {
    setMode('setup')
    setActiveCol(0)
    setCompletedCells([])
    setWarning('')
  }, [])

  const playAgain = useCallback(() => {
    setActiveCol(0)
    setCompletedCells([])
    setWrongCell(null)
    setMode('play')
  }, [])

  const getCellState = (col, row) => {
    if (mode === 'setup') {
      if (secretPath[col] === row) return 'selected'
      const prevRow = col === 0 ? null : secretPath[col - 1]
      const isValid = (col === 0 || prevRow !== null) && getValidRows(prevRow, rows).includes(row)
      if (isValid) return 'option'
      return 'disabled'
    }
    if (mode === 'play' || mode === 'win' || mode === 'lose') {
      if (wrongCell && wrongCell.col === col && wrongCell.row === row) return 'wrong'
      if (completedCells.some((c) => c.col === col && c.row === row)) return 'correct'
      if (mode === 'play' && col === activeCol) {
        const prevRow = col === 0 ? null : secretPath[col - 1]
        if (getValidRows(prevRow, rows).includes(row)) return 'option'
      }
    }
    return 'empty'
  }

  const getCellClass = (col, row) => {
    const classes = ['cell']
    const state = getCellState(col, row)

    if (mode === 'setup') {
      if (state === 'selected') classes.push('setup-selected')
      else if (state === 'option') classes.push('option')
      else if (state === 'disabled') classes.push('disabled')
    }

    if (mode === 'play' || mode === 'win' || mode === 'lose') {
      if (state === 'correct') classes.push('correct')
      if (state === 'wrong') classes.push('flash-wrong')
      if (state === 'option') classes.push('option')
    }

    return classes.join(' ')
  }

  const getCellLabel = (col, row) => {
    const state = getCellState(col, row)
    const pos = `Column ${col + 1}, row ${row + 1}`
    if (mode === 'setup') {
      if (state === 'selected') return `${pos}, selected`
      if (state === 'option') return `${pos}, available`
      return `${pos}, unavailable`
    }
    if (state === 'correct') return `${pos}, correct`
    if (state === 'wrong') return `${pos}, wrong`
    if (state === 'option') return `${pos}, choose this cell`
    return `${pos}`
  }

  const isCellInteractive = (col, row) => {
    const state = getCellState(col, row)
    if (mode === 'setup') return state === 'option' || state === 'selected'
    if (mode === 'play') return state === 'option'
    return false
  }

  const handleCellKey = (e, col, row) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (mode === 'setup') handleSetupTap(col, row)
      if (mode === 'play') handlePlayTap(col, row)
    }
  }

  const getColClass = (col) => {
    if (mode === 'setup') return 'grid-row'
    if (mode === 'lose') return 'grid-row'
    if (mode !== 'play') return 'grid-row inactive'

    if (col === activeCol) return 'grid-row active-row'
    return 'grid-row inactive'
  }

  const statusText =
    mode === 'setup'
      ? `Setup mode. ${secretPath.filter((v) => v !== null).length} of ${cols} columns filled.`
      : mode === 'play'
        ? `Playing. Column ${activeCol + 1} of ${cols}.`
        : mode === 'lose'
          ? 'Wrong cell. Press Retry to try again.'
          : 'You made it!'

  return (
    <div className="app">
      <div className="game-container">
        {/* Live status for screen readers */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {statusText}
        </div>

        {/* Header */}
        <header className="header">
          <div className="logo">
            <FrogIcon />
            <h1>Tap Hop</h1>
          </div>
          <div className="title-actions">
            {mode === 'setup' && (
              <>
                <button className="btn btn-dice" onClick={randomizePath} aria-label="Randomize path">
                  <DiceIcon />
                </button>
                <button className="btn btn-lock" onClick={lockPath}>
                  Play
                </button>
              </>
            )}
            {mode === 'play' && (
              <button className="btn btn-icon" onClick={editPath} aria-label="Edit path">
                <PencilIcon />
              </button>
            )}
            {mode === 'lose' && (
              <button className="btn btn-retry" onClick={playAgain}>
                Retry
              </button>
            )}
          </div>
        </header>

        {/* Grid size controls */}
        {mode === 'setup' && (
          <div className="size-controls" role="group" aria-label="Grid size">
            <div className="size-stepper">
              <button
                className="btn btn-step"
                disabled={rows <= MIN_ROWS}
                aria-label={`Remove row, currently ${rows} rows tall`}
                onClick={() => {
                  const newRows = rows - 1
                  setRows(newRows)
                  setSecretPath((prev) => prev.map((v) => v !== null && v >= newRows ? null : v).map((v, i, arr) => {
                    if (i === 0 || v === null) return v
                    if (arr[i - 1] === null) return null
                    return getValidRows(arr[i - 1], newRows).includes(v) ? v : null
                  }))
                }}
              >−</button>
              <button
                className="btn btn-step"
                disabled={rows >= MAX_ROWS}
                aria-label={`Add row, currently ${rows} rows tall`}
                onClick={() => setRows((r) => r + 1)}
              >+</button>
              <button
                className="btn btn-step"
                disabled={cols <= MIN_COLS}
                aria-label={`Remove column, currently ${cols} columns`}
                onClick={() => {
                  setCols((c) => c - 1)
                  setSecretPath((prev) => prev.slice(0, -1))
                }}
              >←</button>
              <button
                className="btn btn-step"
                disabled={cols >= MAX_COLS}
                aria-label={`Add column, currently ${cols} columns`}
                onClick={() => {
                  setCols((c) => c + 1)
                  setSecretPath((prev) => [...prev, null])
                }}
              >→</button>
            </div>
          </div>
        )}

        {/* Warning */}
        {warning && <div className="warning" role="alert">{warning}</div>}

        {/* Grid (each step is a vertical column, path goes left to right) */}
        <div className="grid" role="grid" aria-label={`${cols} steps, ${rows} choices each`}>
            {Array.from({ length: cols }, (_, c) => (
              <div className={getColClass(c)} key={c} role="row">
                {Array.from({ length: rows }, (_, r) => {
                  const interactive = isCellInteractive(c, r)
                  return (
                    <div
                      key={r}
                      className={getCellClass(c, r)}
                      role="gridcell"
                      aria-label={getCellLabel(c, r)}
                      tabIndex={interactive ? 0 : -1}
                      aria-disabled={!interactive}
                      onClick={() => {
                        if (mode === 'setup') handleSetupTap(c, r)
                        if (mode === 'play') handlePlayTap(c, r)
                      }}
                      onKeyDown={(e) => handleCellKey(e, c, r)}
                    />
                  )
                })}
              </div>
            ))}
        </div>
        </div>

      {/* Win Screen */}
      {mode === 'win' && (
        <>
          <Confetti />
          <div className="win-overlay" role="dialog" aria-label="You won">
            <PartyIcon />
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
