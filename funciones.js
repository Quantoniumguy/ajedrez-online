alert('Ajedrez');
const WIDTH = 800;
const HEIGHT = 800;

const FILAS = 8;
const COLUMNAS = 8;

const ANCHO_CELDA = WIDTH / FILAS;
const ALTURA_CELDA = HEIGHT / COLUMNAS;

const colores = {
    light: '#FF7F50',
    dark: '#C0C0C0',
    highlight: '#FFFF00', // Color de resalte
};

const piezaTema = {
    light: 'white',
    dark: 'black',
};

const piezas = {
    rey: ['♚', '♔'],
    reina: ['♛', '♕'],
    torre: ['♜', '♖'],
    alfil: ['♝', '♗'],
    caballo: ['♞', '♘'],
    peon: ['♟', '♙'],
};

// Turno inicial: blancas empiezan
let turnoActual = 'blanco';



const $canvas = document.getElementById('ajedrezCanvas');
const ctx = $canvas.getContext('2d');

const boardMatrix = Array.from({ length: FILAS }, () => Array(COLUMNAS).fill(null));

// Inicializar tablero
const colocarPiezas = () => {
    const colocarFila = (color, fila) => {
        const piezaColor = color === piezaTema.light ? 0 : 1;
        boardMatrix[fila] = [
            { type: piezas.torre, color: piezaTema[color] },
            { type: piezas.caballo, color: piezaTema[color] },
            { type: piezas.alfil, color: piezaTema[color] },
            { type: piezas.reina, color: piezaTema[color] },
            { type: piezas.rey, color: piezaTema[color] },
            { type: piezas.alfil, color: piezaTema[color] },
            { type: piezas.caballo, color: piezaTema[color] },
            { type: piezas.torre, color: piezaTema[color] }
        ];
        for (let i = 0; i < COLUMNAS; i++) {
            boardMatrix[fila + (color === 'dark' ? 1 : -1)][i] = { type: piezas.peon, color: piezaTema[color] };
        }
    };
    colocarFila('dark', 0);
    colocarFila('light', 7);
};

colocarPiezas();

// Mostrar el turno actual
const mostrarTurno = () => {
    document.getElementById('turno').textContent = `Turno de: ${turnoActual.charAt(0).toUpperCase() + turnoActual.slice(1)}`;
};

const cambiarTurno = () => {
    turnoActual = turnoActual === 'blanco' ? 'negro' : 'blanco';
    mostrarTurno();

    // Verificar si el rey del jugador contrario está en jaque mate
    if (isCheckmate(turnoActual)) {
        alert(`¡Jaque mate! El jugador ${turnoActual === 'blanco' ? 'negro' : 'blanco'} ha ganado.`);
        reiniciarJuego();
        // Detener el juego o reiniciarlo según lo que prefieras hacer aquí
    } else if (isInCheck(turnoActual)) {
        alert(`¡Jaque! El rey ${turnoActual === 'blanco' ? 'blanco' : 'negro'} está en jaque.`);
    }
};

const isInCheck = (color) => {
    let reyPos;
    for (let x = 0; x < FILAS; x++) {
        for (let y = 0; y < COLUMNAS; y++) {
            const pieza = boardMatrix[x][y];
            if (pieza && pieza.type === piezas.rey && pieza.color === (color === 'blanco' ? piezaTema.light : piezaTema.dark)) {
                reyPos = { x, y };
                break;
            }
        }
    }

    const enemyColor = color === 'blanco' ? piezaTema.dark : piezaTema.light;
    for (let x = 0; x < FILAS; x++) {
        for (let y = 0; y < COLUMNAS; y++) {
            const pieza = boardMatrix[x][y];
            if (pieza && pieza.color === enemyColor) {
                const posiblesMovimientos = getPossibleMoves(x, y);
                if (posiblesMovimientos.some(move => move.x === reyPos.x && move.y === reyPos.y)) {
                    return true; // El rey está en jaque
                }
            }
        }
    }

    return false; // El rey no está en jaque
};

const isCheckmate = (color) => {
    if (!isInCheck(color)) {
        return false; // No está en jaque, así que no puede haber jaque mate
    }

    for (let x = 0; x < FILAS; x++) {
        for (let y = 0; y < COLUMNAS; y++) {
            const pieza = boardMatrix[x][y];
            if (pieza && pieza.color === (color === 'blanco' ? piezaTema.light : piezaTema.dark)) {
                const posiblesMovimientos = getPossibleMoves(x, y);
                for (const move of posiblesMovimientos) {
                    // Simular el movimiento
                    const original = boardMatrix[move.x][move.y];
                    boardMatrix[move.x][move.y] = pieza;
                    boardMatrix[x][y] = null;

                    // Verificar si el rey sigue en jaque
                    if (!isInCheck(color)) {
                        // Deshacer el movimiento
                        boardMatrix[x][y] = pieza;
                        boardMatrix[move.x][move.y] = original;
                        return false; // Hay un movimiento que evita el jaque mate
                    }

                    // Deshacer el movimiento
                    boardMatrix[x][y] = pieza;
                    boardMatrix[move.x][move.y] = original;
                }
            }
        }
    }
    return true; // No hay movimientos que eviten el jaque mate
};

const puedeMoverPieza = (pieza) => {
    return pieza.color === (turnoActual === 'blanco' ? 'white' : 'black');
};

const renderBoard = (movimientosPosibles = []) => {
    for (let x = 0; x < FILAS; x++) {
        for (let y = 0; y < COLUMNAS; y++) {
            // Comprobar si la celda actual está en la lista de movimientos posibles
            const esMovimientoPosible = movimientosPosibles.some(move => move.x === x && move.y === y);
            const rectColor = esMovimientoPosible ? colores.highlight : (x + y) % 2 === 0 ? colores.light : colores.dark;

            ctx.fillStyle = rectColor;
            ctx.fillRect(x * ANCHO_CELDA, y * ALTURA_CELDA, ANCHO_CELDA, ALTURA_CELDA);

            const pieza = boardMatrix[x][y];
            if (pieza) {
                ctx.fillStyle = pieza.color;
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                ctx.font = '64px Arial';
                ctx.fillText(pieza.type[0], x * ANCHO_CELDA + ANCHO_CELDA / 2, y * ALTURA_CELDA + ALTURA_CELDA / 2);
            }
        }
    }
};



const getPossibleMoves = (x, y) => {
    const pieza = boardMatrix[x][y];
    const moves = [];
    if (!pieza) return moves;

    const enemyColor = pieza.color === piezaTema.dark ? piezaTema.light : piezaTema.dark;

    // Movimiento del peón
    if (pieza.type === piezas.peon) {
        const direction = pieza.color === piezaTema.light ? -1 : 1; // -1 para blanco, 1 para negro
        const startRow = pieza.color === piezaTema.light ? 6 : 1;

        // Movimiento hacia adelante
        if (!boardMatrix[x + direction][y]) {
            moves.push({ x: x + direction, y });
            // Movimiento doble desde la posición inicial
            if (x === startRow && !boardMatrix[x + direction * 2][y]) {
                moves.push({ x: x + direction * 2, y });
            }
        }

        // Capturas diagonales
        if (y > 0 && boardMatrix[x + direction][y - 1] && boardMatrix[x + direction][y - 1].color === enemyColor) {
            moves.push({ x: x + direction, y: y - 1 });
        }
        if (y < COLUMNAS - 1 && boardMatrix[x + direction][y + 1] && boardMatrix[x + direction][y + 1].color === enemyColor) {
            moves.push({ x: x + direction, y: y + 1 });
        }
    }
    
            // Movimiento del rey
            if (pieza.type === piezas.rey) {
                const movimientosRey = [
                    { x: 1, y: 0 }, { x: -1, y: 0 },
                    { x: 0, y: 1 }, { x: 0, y: -1 },
                    { x: 1, y: 1 }, { x: 1, y: -1 },
                    { x: -1, y: 1 }, { x: -1, y: -1 },
                ];
                movimientosRey.forEach(move => {
                    const newX = x + move.x;
                    const newY = y + move.y;
                    if (newX >= 0 && newX < FILAS && newY >= 0 && newY < COLUMNAS) {
                        if (!boardMatrix[newX][newY] || boardMatrix[newX][newY].color === enemyColor) {
                            moves.push({ x: newX, y: newY });
                        }
                    }
                });
            }
        
            // Movimiento de la reina
            if (pieza.type === piezas.reina) {
                const direcciones = [
                    { x: 1, y: 0 }, { x: -1, y: 0 },
                    { x: 0, y: 1 }, { x: 0, y: -1 },
                    { x: 1, y: 1 }, { x: 1, y: -1 },
                    { x: -1, y: 1 }, { x: -1, y: -1 },
                ];
                direcciones.forEach(dir => {
                    for (let i = 1; i < FILAS; i++) {
                        const newX = x + dir.x * i;
                        const newY = y + dir.y * i;
                        if (newX >= 0 && newX < FILAS && newY >= 0 && newY < COLUMNAS) {
                            if (!boardMatrix[newX][newY]) {
                                moves.push({ x: newX, y: newY });
                            } else if (boardMatrix[newX][newY].color === enemyColor) {
                                moves.push({ x: newX, y: newY });
                                break; // Puede capturar y se detiene
                            } else {
                                break; // Se detiene si encuentra una pieza del mismo color
                            }
                        } else {
                            break; // Fuera del tablero
                        }
                    }
                });
            }
        
            // Movimiento de la torre
            if (pieza.type === piezas.torre) {
                const direcciones = [
                    { x: 1, y: 0 }, { x: -1, y: 0 },
                    { x: 0, y: 1 }, { x: 0, y: -1 },
                ];
                direcciones.forEach(dir => {
                    for (let i = 1; i < FILAS; i++) {
                        const newX = x + dir.x * i;
                        const newY = y + dir.y * i;
                        if (newX >= 0 && newX < FILAS && newY >= 0 && newY < COLUMNAS) {
                            if (!boardMatrix[newX][newY]) {
                                moves.push({ x: newX, y: newY });
                            } else if (boardMatrix[newX][newY].color === enemyColor) {
                                moves.push({ x: newX, y: newY });
                                break; // Puede capturar y se detiene
                            } else {
                                break; // Se detiene si encuentra una pieza del mismo color
                            }
                        } else {
                            break; // Fuera del tablero
                        }
                    }
                });
            }
        
            // Movimiento del alfil
            if (pieza.type === piezas.alfil) {
                const direcciones = [
                    { x: 1, y: 1 }, { x: 1, y: -1 },
                    { x: -1, y: 1 }, { x: -1, y: -1 },
                ];
                direcciones.forEach(dir => {
                    for (let i = 1; i < FILAS; i++) {
                        const newX = x + dir.x * i;
                        const newY = y + dir.y * i;
                        if (newX >= 0 && newX < FILAS && newY >= 0 && newY < COLUMNAS) {
                            if (!boardMatrix[newX][newY]) {
                                moves.push({ x: newX, y: newY });
                            } else if (boardMatrix[newX][newY].color === enemyColor) {
                                moves.push({ x: newX, y: newY });
                                break; // Puede capturar y se detiene
                            } else {
                                break; // Se detiene si encuentra una pieza del mismo color
                            }
                        } else {
                            break; // Fuera del tablero
                        }
                    }
                });
            }
        
            // Movimiento del caballo
            if (pieza.type === piezas.caballo) {
                const movimientosCaballo = [
                    { x: 2, y: 1 }, { x: 2, y: -1 },
                    { x: -2, y: 1 }, { x: -2, y: -1 },
                    { x: 1, y: 2 }, { x: 1, y: -2 },
                    { x: -1, y: 2 }, { x: -1, y: -2 },
                ];
                movimientosCaballo.forEach(move => {
                    const newX = x + move.x;
                    const newY = y + move.y;
                    if (newX >= 0 && newX < FILAS && newY >= 0 && newY < COLUMNAS) {
                        if (!boardMatrix[newX][newY] || boardMatrix[newX][newY].color === enemyColor) {
                            moves.push({ x: newX, y: newY });
                        }
                    }
                });
            }
        
            return moves;
        };


        let selectedPiece = null;
let selectedPosition = null;



const agregarPiezaCapturada = (pieza) => {
    const contenedor = pieza.color === piezaTema.light ? document.getElementById('piezasNegras') : document.getElementById('piezasBlancas');
    const span = document.createElement('span');
    span.classList.add('piezaCapturada');
    span.textContent = pieza.type[0];
    contenedor.appendChild(span);
};


const getSafeKingMoves = (kingPosition) => {
    const safeMoves = [];
    const posiblesMovimientos = getPossibleMoves(kingPosition.x, kingPosition.y);
    posiblesMovimientos.forEach(move => {
        // Simular el movimiento del rey
        const original = boardMatrix[move.x][move.y];
        boardMatrix[move.x][move.y] = boardMatrix[kingPosition.x][kingPosition.y];
        boardMatrix[kingPosition.x][kingPosition.y] = null;

        // Verificar si el rey sigue en jaque
        if (!isInCheck(turnoActual)) {
            safeMoves.push(move); // Movimiento seguro
        }

        // Deshacer el movimiento simulado
        boardMatrix[kingPosition.x][kingPosition.y] = boardMatrix[move.x][move.y];
        boardMatrix[move.x][move.y] = original;
    });

    return safeMoves;
};

// Modificar la detección de click para permitir solo movimientos seguros
$canvas.addEventListener('click', (event) => {
    const x = Math.floor(event.offsetX / ANCHO_CELDA);
    const y = Math.floor(event.offsetY / ALTURA_CELDA);

    const piezaSeleccionada = boardMatrix[x][y];

    if (isInCheck(turnoActual)) {
        // Si está en jaque, solo puede mover el rey
        if (piezaSeleccionada && piezaSeleccionada.type === piezas.rey && puedeMoverPieza(piezaSeleccionada)) {
            const movimientosSeguros = getSafeKingMoves({ x, y });
            renderBoard(movimientosSeguros); // Resaltar solo movimientos seguros
            selectedPiece = piezaSeleccionada;
            selectedPosition = { x, y };
        } else if (piezaSeleccionada && puedeMoverPieza(piezaSeleccionada)) {
            // Si intenta mover otra pieza mientras está en jaque
            alert("Primero debes salir del jaque moviendo tu rey.");
        } else if (selectedPiece) {
            // Manejo de movimiento del rey
            const newPosX = x;
            const newPosY = y;

            const validMove = getSafeKingMoves(selectedPosition).some(move => move.x === newPosX && move.y === newPosY);

            if (validMove) {
                const piezaCapturada = boardMatrix[newPosX][newPosY];
                if (piezaCapturada) {
                    agregarPiezaCapturada(piezaCapturada);
                }

                boardMatrix[newPosX][newPosY] = selectedPiece;
                boardMatrix[selectedPosition.x][selectedPosition.y] = null;
                cambiarTurno();
                alert("El rey ha salido del jaque.");
            }

            selectedPiece = null;
            selectedPosition = null;
            renderBoard(); // Redibuja el tablero
        } else {
            renderBoard(); // Redibuja el tablero si no se selecciona ninguna pieza
        }
    } else {
        // Si no está en jaque, manejar el movimiento normalmente
        if (piezaSeleccionada && puedeMoverPieza(piezaSeleccionada)) {
            const movimientosPosibles = getPossibleMoves(x, y);
            renderBoard(movimientosPosibles); // Resaltar movimientos posibles normales
            selectedPiece = piezaSeleccionada;
            selectedPosition = { x, y };
        } else if (selectedPiece) {
            const newPosX = x;
            const newPosY = y;

            const validMove = getPossibleMoves(selectedPosition.x, selectedPosition.y).some(move => move.x === newPosX && move.y === newPosY);

            if (validMove) {
                const piezaCapturada = boardMatrix[newPosX][newPosY];
                if (piezaCapturada) {
                    agregarPiezaCapturada(piezaCapturada);
                }

                boardMatrix[newPosX][newPosY] = selectedPiece;
                boardMatrix[selectedPosition.x][selectedPosition.y] = null;
                cambiarTurno();
            }

            selectedPiece = null;
            selectedPosition = null;
            renderBoard(); // Redibuja el tablero
        } else {
            renderBoard(); // Redibuja el tablero si no se selecciona ninguna pieza
        }
    }
});



const reiniciarJuego = () => {
    boardMatrix = Array.from({ length: FILAS }, () => Array(COLUMNAS).fill(null));
    colocarPiezas();
    turnoActual = 'blanco';
    mostrarTurno();
    renderBoard();
};

// Generar tablero inicial
renderBoard();
mostrarTurno();