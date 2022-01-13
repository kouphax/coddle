import {useEffect, useMemo, useState} from "react";

const randomDigit = () => Math.floor(Math.random() * 10)

const storageKey = () => `coddle-${new Date().toISOString().substring(0,10)}`

const getTodays = () => {
  const key = storageKey();
  if(!localStorage.getItem(key)) {
    localStorage.setItem(key, JSON.stringify({
      code: [randomDigit(), randomDigit(), randomDigit(), randomDigit()],
      history: [],
      current: [],
      broken: false
    }))
  }

  return JSON.parse(localStorage.getItem(key))
}

export function App() {
  const today = useMemo(getTodays, []);

  const [code] = useState(today.code)
  const [history, setHistory] = useState(today.history)
  const [current, setCurrent] = useState(today.current)
  const [broken, setBroken] = useState(today.broken)


  const position = (cell, index) => {
    if(code.includes(cell)) {
      if(code[index] === cell) {
        return 'inplace'
      } else {
        return 'misplaced'
      }
    } else {
      return 'missing'
    }
  }

  const findBestHistoricalPlacement = (value) => {
    let best = ""
    for (let rowIndex = 0; rowIndex < history.length; rowIndex++) {
      const row = history[rowIndex];
      for(let index = 0; index < row.length; index++) {
        if(row[index] === value) {
          best = position(value, index)
          if(best === 'inplace' || best === 'missing') {
            return best;
          }
        }
      }
    }
    return best
  }

  const handler = ({key}) => {
    if(!broken) {
      if (!isNaN(key)) {
        if (current.length < 4) {
          setCurrent([...current, parseInt(key, 10)])
        }
      } else if (key === 'Backspace') {
        setCurrent(current.slice(0, -1))
      } else if (key === 'Enter' && current.length === 4) {
        setHistory([...history, current])
        setBroken(current.join('') === code.join(''))
        setCurrent([])
      }
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [handler]);

  useEffect(() => {
    window.localStorage.setItem(storageKey(), JSON.stringify({ code, current, broken, history }))
  }, [code, current, broken, history])

  return <div className="app">
    <div>
      <h1>Coddle</h1>
      <h2>Code Breaker</h2>
      <div className="history">
        {
          history.map((row, rowIndex) => {
            return <div key={`row-${rowIndex}`}>
              {row.map((cell, cellIndex) => {
                return <span key={`row-${rowIndex}-${cellIndex}`} className={`cell ${position(cell, cellIndex)}`}>{cell}</span>
              })}
            </div>
          })
        }
        <div>
          { !broken &&
              [0,1,2,3].map(index => {
                return <span key={index} className="cell">{current[index] !== undefined ? current[index] : '*'}</span>
              })
          }
          {/*{*/}
          {/*  !broken && <span>({current.reduce((partial_sum, a) => partial_sum + a, 0)} +"/" +{code.reduce((partial_sum, a) => partial_sum + a, 0)})</span>*/}
          {/*}*/}
          { broken &&
              <h3>Code broken in {history.length} attempts</h3>
          }
        </div>
      </div>
    </div>
    <div className="keyboard">
      { [0,1,2,3,4].map(key => <span onClick={() => handler({key})} key={key} className={`cell ${findBestHistoricalPlacement(key)}`}>{key}</span>) }
      <br/>
      { [5,6,7,8,9].map(key => <span onClick={() => handler({key})} key={key} className={`cell  ${findBestHistoricalPlacement(key)}`}>{key}</span>)}
      <br/>
      <span onClick={() => handler({key: 'Backspace'})} className={`cell`}>{'⌫'}</span>
      <span onClick={() => handler({key: 'Enter'})} className={`cell`}>{'⏎'}</span>
    </div>
  </div>;
}
