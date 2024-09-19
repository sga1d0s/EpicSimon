import { useState, useEffect, useRef } from 'react';
import useSound from 'use-sound';
import simon from './assets/sounds/bubbles.mp3';
import './App.css'

function App() {
  // declarar referencias al DOM de los elementos de colores
  const yellowRef = useRef(null);
  const blueRef = useRef(null);
  const redRef = useRef(null);
  const greenRef = useRef(null);

  // iniciar librería de sonido con los efectos de sonido
  const [play] = useSound(simon, {
    sprite: {
      // definir sonidos con su tiempo de inicio y duración
      one: [500, 1000],
      two: [500, 1000],
      three: [500, 1000],
      four: [500, 1000],
      error: [500, 2000],
    }
  });

  // declarar un array de objetos con los colores, referencias al DOM, y sonidos asociados
  const colors = [
    { color: '#d13722', ref: redRef, sound: 'three' },
    { color: '#41854f', ref: greenRef, sound: 'four' },
    { color: '#9ed9e6', ref: blueRef, sound: 'two' },
    { color: '#e9b12e', ref: yellowRef, sound: 'one' },
  ];

  // constantes para cálculos y velocidad inicial del juego
  const minNumber = 0;
  const maxNumber = 3;
  const speedGame = 800;

  // HOOKS DE ESTADO
  // almacena la secuencia que genera el juego
  const [sequence, setSequence] = useState([]);
  // almacena la secuencia que va ejecutando el jugador
  const [currentGame, setCurrentGame] = useState([]);
  // booleano para permitir o no la interacción del jugador
  const [isAllowedToPlay, setIsAllowedToPlay] = useState(false);
  // almacena los cambios progresivos de velocidad
  const [speed, setSpeed] = useState(speedGame);
  // almacena el número de turno que se está jugando
  const [turn, setTurn] = useState(0);
  // almacena el número de pulsaciones del jugador
  const [pulses, setPulses] = useState(0);
  // almacena el número de aciertos del jugador
  const [success, setSuccess] = useState(0);
  // indica si el juego debe iniciarse o no
  const [isGameOn, setIsGameOn] = useState(false);

  // función para iniciar el juego
  const initGame = () => {
    randomNumber();
    setIsGameOn(true);
  };

  // función para generar un número aleatorio
  const randomNumber = () => {
    setIsAllowedToPlay(false); // deshabilitar la interacción del jugador
    const randomNumber = Math.floor(Math.random() * (maxNumber - minNumber + 1) + minNumber);
    // agregar el número aleatorio a la secuencia
    setSequence([...sequence, randomNumber]);
    // incrementar el turno
    setTurn(turn + 1);
  };

  // HANDLECLICK
  // manejar el clic en un color
  const handleClick = (index) => {
    if (isAllowedToPlay) {
      // reproducir el sonido asociado al color
      play({ id: colors[index].sound });
      // modificar el estilo para indicar que se ha pulsado
      colors[index].ref.current.style.opacity = 0.7;

      setTimeout(() => {
        // restaurar el estilo original
        colors[index].ref.current.style.opacity = 0;
        // agregar el clic a la secuencia del jugador
        setCurrentGame([...currentGame, index]);
        // incrementar el número de pulsaciones
        setPulses(pulses + 1);
      }, speed / 2);
    }
  };

  // useEffect PULSES
  // useEffect para manejar las pulsaciones del jugador
  useEffect(() => {
    if (pulses > 0) {
      if (Number(sequence[pulses - 1]) === Number(currentGame[pulses - 1])) {
        setSuccess(success + 1);
      } else {
        // encender todos los pads al fallar
        colors.forEach((color) => {
          color.ref.current.style.opacity = 0.7;
          // reprocudir error
          play({ id: 'error' })
        });

        // Mantener los pads encendidos durante 2 segundos
        setTimeout(() => {
          colors.forEach((color) => {
            color.ref.current.style.opacity = 0;
          });
          setIsGameOn(false);
        }, speed * 2);
      }
    }
  }, [pulses]);

  // useEffect ISGAMEON
  // useEffect para manejar el estado del juego
  useEffect(() => {
    if (!isGameOn) {
      // reiniciar el estado cuando el juego termine
      setSequence([]);
      setCurrentGame([]);
      setIsAllowedToPlay(false);
      setSpeed(speedGame);
      setSuccess(0);
      setPulses(0);
      setTurn(0);
    }
  }, [isGameOn]);

  // useEffect SUCCESS
  // useEffect para manejar los aciertos del jugador
  useEffect(() => {
    if (success === sequence.length && success > 0) {
      setTimeout(() => {
        setSuccess(0);
        setPulses(0);
        setCurrentGame([]);
        randomNumber();

        // reducir tiempo entre pulsaciones
        setSpeed(prevSpeed => Math.max(prevSpeed - 50, 100));
      }, 500);
    }
  }, [success]);


  // UseEffect SEQUENCE
  // useEffect para manejar la secuencia del juego
  useEffect(() => {
    if (!isAllowedToPlay) {
      // reproducir la secuencia generada por el juego
      sequence.map((item, index) => {
        setTimeout(() => {
          play({ id: colors[item].sound });
          colors[item].ref.current.style.opacity = 0.7;
          setTimeout(() => {
            colors[item].ref.current.style.opacity = 0;
          }, speed / 2);
        }, speed * index);
      });
    }
    // permitir al jugador interactuar después de mostrar la secuencia
    setIsAllowedToPlay(true);
  }, [sequence]);

  return (
    <>
      <div>
        {isGameOn ? (
          <>
            {/* mostrar el juego si isGameOn es true */}
            <div className='header'>
              <h1>Play...</h1>
            </div>
            <div className='container'>
              {/* recorrer el array de colores y crear un div por cada color */}
              {colors.map((item, index) => {
                return (
                  <div
                    key={index}
                    ref={item.ref}
                    className={`pad pad-${index}`}
                    style={{
                      backgroundColor: `${item.color}`,
                      opacity: 0,
                      background: `radial-gradient(${item.color} 0%, rgba(250, 14, 3, 0) 80%)`,
                    }}
                    onClick={() => handleClick(index)}
                  ></div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            {/* mostrar la pantalla de inicio si isGameOn es false */}
            <div className='header'>
              <h1>EPIC SIMON</h1>
            </div>
            <button className='custom-button' onClick={initGame}>
              START! if you dare...
            </button>
          </>
        )}
      </div>
    </>
  );
}

export default App;
