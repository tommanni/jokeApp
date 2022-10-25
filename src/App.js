import './App.css';
import { useState, useReducer, useEffect } from 'react'
import axios from 'axios'

function reducer(state, action) {
  switch (action.type) {
    case 'GET_JOKE':
      if (action.payload.jokes.includes(action.payload.joke)) {
        action.payload.setFailedAttempts(action.payload.failedAttempts + 1)
        if (action.payload.failedAttempts >= 4) {
          return { ...state, noServerJokesLeft: true }
        }
        action.payload.setNewJoke(action.payload.newJoke + 1)
        return { ...state }
      }
      let newJokes = action.payload.jokes
      newJokes.push(action.payload.joke)
      action.payload.setJokes(newJokes)
      localStorage.setItem('jokes', JSON.stringify(newJokes))
      return { ...state, joke: action.payload.joke, noJokesLeft: false }

    case 'OFFLINE_JOKE':
      if (JSON.parse(localStorage.getItem('jokes')).length === 0) {
        return { ...state, noJokesLeft: true }
      } else {
        let newJokes = JSON.parse(localStorage.getItem('jokes')).filter(joke => joke !== action.payload.joke)
        localStorage.setItem('jokes', JSON.stringify(newJokes))
        return { ...state, joke: action.payload.joke }
      }
    default:
      throw new Error('Action.type kentän arvoa ei tunnistettu')
  }
}

function App() {
  const [joke, dispatch] = useReducer(reducer, { joke: "", noJokesLeft: false, noServerJokesLeft: false })
  const [jokes, setJokes] = useState([])
  const [newJoke, setNewJoke] = useState(0)
  const [timer, setTimer] = useState(0)
  const [failedAttempts, setFailedAttempts] = useState(0)

  useEffect(() => {
    setTimeout(() => setNewJoke(newJoke + 1), 10000);
    setTimeout(() => setTimer(timer + 1), 10000)
  }, [timer]);

  useEffect(() => {
    async function getJoke() {
      try {
        let result = await axios('https://api.chucknorris.io/jokes/random')
        dispatch({ type: 'GET_JOKE', payload: { joke: result.data.value, jokes: jokes, setJokes: setJokes, newJoke: newJoke, setNewJoke: setNewJoke, failedAttempts: failedAttempts, setFailedAttempts: setFailedAttempts } })
      } catch {
        let newOfflineJoke = JSON.parse(localStorage.getItem('jokes'))[Math.floor(Math.random() * JSON.parse(localStorage.getItem('jokes')).length)]
        dispatch({ type: 'OFFLINE_JOKE', payload: { joke: newOfflineJoke } })
      }
    }
    getJoke()
  }, [newJoke])

  return (
    <div>

      <h2 className='teksti'>{joke.noServerJokesLeft ? "Palvelimen vitsit eivät ole välttämättä loppu, mutta aika moni niistä on sovelluksen suorituksen aikana näytetty" : joke.noJokesLeft === true ? "vitsit loppuivat" : joke.joke}</h2>

      <button onClick={() => setNewJoke(newJoke + 1)}>{"hae vitsi"}</button>
    </div>
  );
}

export default App;
