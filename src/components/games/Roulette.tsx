import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useWebSocket } from "../../hooks/useWebSocket";
import { BetOption, GameState } from "../../types/roulette";
interface PlacedBet extends BetOption {
  position: { x: number; y: number };
  amount: number;
}
import { animate, utils } from "animejs";

const redNumbers = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
];

const blackNumbers = [
  2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
];

const betTableNumber = [
  [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
  [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
  [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
];

const HistoryContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1rem;
  overflow-x: auto;
  padding: 0.5rem;
`;

const HistoryNumber = styled.div<{ isRed: boolean; number: number }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #efd49b;
  background-color: ${({ isRed, number }) => {
    if (number === 0) return "#33841f";
    return isRed ? "#8d291e" : "#121214";
  }};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  font-size: 0.9rem;
  border: 2px solid #efd49b;
  border-radius: 50%;
`;

const RouletteContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background: ${({ theme }) => theme.colors.background};
  width: 100%;
  height: 100%;
  overflow-y: auto;
`;

const GameLayout = styled.div`
  display: flex;
  gap: 2rem;
  width: 100%;
  height: 100%;
  align-items: flex-start;
  padding: 1rem;

  @media (max-width: 1024px) {
    flex-direction: column;
    align-items: center;
    overflow-y: auto;
  }
`;

const WheelSection = styled.div`
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BettingSection = styled.div`
  flex: 1;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 1rem;
`;

const ChipContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
  flex-wrap: wrap;
  position: relative;
`;

const Chip = styled.div<{ value: number; isSelected: boolean }>`
  position: relative;
  width: 50px;
  height: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  transform-origin: center center;
  transform: ${({ isSelected }) => (isSelected ? "scale(1.2)" : "scale(1)")};

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: ${({ isSelected }) =>
      isSelected ? "brightness(1.2)" : "brightness(1)"};
  }

  span {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: ${({ isSelected }) => (isSelected ? "#FFD700" : "#efd49b")};
    font-weight: bold;
    font-size: ${({ value }) => (value >= 100 ? "0.8rem" : "1rem")};
    text-shadow: ${({ isSelected }) =>
      isSelected
        ? "0 0 10px rgba(255, 215, 0, 0.5), 1px 1px 2px rgba(0, 0, 0, 0.8)"
        : "1px 1px 2px rgba(0, 0, 0, 0.8)"};
  }

  &:hover {
    transform: ${({ isSelected }) =>
      isSelected ? "scale(1.2)" : "scale(1.1)"};
  }
`;

const BettingTable = styled.div`
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  background: ${({ theme }) => theme.colors.background};
  padding: 10px;
  border-radius: 8px;

  img {
    width: 100%;
    height: auto;
    display: block;
  }
`;

const BetMarker = styled.div<{ x: number; y: number }>`
  position: absolute;
  width: 30px;
  height: 30px;
  transform: translate(-50%, -50%);
  left: ${(props) => props.x}%;
  top: ${(props) => props.y}%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  span {
    position: absolute;
    color: #efd49b;
    font-weight: bold;
    font-size: 0.8rem;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  }
`;

const GameStatus = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 8px;
  text-align: center;
`;

const RouletteWheel = styled.div`
  position: relative;
  width: 380px;
  height: 380px;
  margin: 0 auto 2rem;

  &::before {
    content: "";
    display: block;
    padding-top: 100%;
  }
`;

const Layer1 = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url("/images/roulette/roulette_1.png") no-repeat center center;
  background-size: contain;
  will-change: transform;
`;

const Layer2 = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url("/images/roulette/roulette_2.png") no-repeat center center;
  background-size: contain;
  will-change: transform;
`;

const Layer3 = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url("/images/roulette/roulette_3.png") no-repeat center center;
  background-size: contain;
  pointer-events: none;
`;

const Layer4 = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url("/images/roulette/roulette_4.png") no-repeat center center;
  background-size: contain;
  will-change: transform;
`;

const Layer5 = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url("/images/roulette/roulette_5.png") no-repeat center center;
  background-size: contain;
  pointer-events: none;
`;

const BallContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 280px;
  height: 280px;
  transform: translate(-50%, -50%);
  will-change: transform;
  transform-origin: center center;
  pointer-events: none;
`;

const Ball = styled.div`
  position: absolute;
  width: 14px;
  height: 14px;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  transform-origin: center 140px;
  background: radial-gradient(circle at 30% 30%, #ffffff, #d0d0d0);
  border-radius: 50%;
  box-shadow: inset -1px -1px 4px rgba(0, 0, 0, 0.5),
    2px 2px 4px rgba(0, 0, 0, 0.3);
  filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.7));
`;

const ActionButton = styled.button`
  padding: 0.8rem 1.5rem;
  background: linear-gradient(135deg, #b8860b, #daa520);
  border: 2px solid #efd49b;
  border-radius: 8px;
  color: #fff;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.3);
    background: linear-gradient(135deg, #daa520, #ffd700);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: center;
`;

const wheelNumbers = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
  16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

const Roulette: React.FC = () => {
  const [selectedBet, setSelectedBet] = useState<BetOption | null>(null);
  const [betAmount, setBetAmount] = useState<number>(0);
  const [gameState, setGameState] = useState<GameState>({
    status: "waiting",
    timeRemaining: 30,
    lastNumber: null,
  });
  const [placedBets, setPlacedBets] = useState<PlacedBet[]>([]);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [numberHistory, setNumberHistory] = useState<number[]>([]);
  const socket = useWebSocket("ws://localhost:3002");
  const layer2Ref = useRef<HTMLDivElement>(null);
  const layer4Ref = useRef<HTMLDivElement>(null);
  const ballContainerRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);

  const totalNumbers = 37;
  const singleSpinDuration = 5000;
  const singleRotationDegree = 360 / totalNumbers;
  const [lastNumber, setLastNumber] = useState<number>(0);
  const nextNumber = (number: number) => {
    setGameState((prev) => ({
      ...prev,
      lastNumber: number,
      timeRemaining: 30, // Reset timer when new number is drawn
      status: "waiting",
    }));
    setTimeout(
      () => setNumberHistory((prev) => [number, ...prev].slice(0, 10)),
      5000
    );
    return number;
  };

  const complete = useCallback((): void => {
    setGameState((prev) => ({
      status: "waiting",
      lastNumber: prev.lastNumber || 0,
      timeRemaining: 30,
    }));
  }, []);

  const getRotationFromNumber = (number: string) => {
    const index = getRouletteIndexFromNumber(number);
    return singleRotationDegree * index;
  };

  const getRouletteIndexFromNumber = (number: string) => {
    return wheelNumbers.indexOf(parseInt(number));
  };

  const getRandomEndRotation = (
    minNumberOfSpins: number,
    maxNumberOfSpins: number
  ) => {
    const rotateTo = utils.random(
      minNumberOfSpins * totalNumbers,
      maxNumberOfSpins * totalNumbers
    );

    return singleRotationDegree * rotateTo;
  };

  const getZeroEndRotation = (totalRotation: number) => {
    const rotation = 360 - Math.abs(totalRotation % 360);
    return rotation;
  };

  const getBallEndRotation = (zeroEndRotation: number, currentNumber: any) => {
    return Math.abs(zeroEndRotation) + getRotationFromNumber(currentNumber);
  };

  const getBallNumberOfRotations = (
    minNumberOfSpins: number,
    maxNumberOfSpins: number
  ): number => {
    const numberOfSpins = utils.random(minNumberOfSpins, maxNumberOfSpins);
    return 360 * numberOfSpins;
  };

  const spinWheel = useCallback(
    (landingNumber: number): void => {
      const bezier = [0.165, 0.84, 0.44, 1.005];
      const ballMinNumberOfSpins = 2;
      const ballMaxNumberOfSpins = 4;
      const wheelMinNumberOfSpins = 2;
      const wheelMaxNumberOfSpins = 4;

      const currentNumber = nextNumber(landingNumber);
      const lastNumberRotation = getRotationFromNumber(lastNumber.toString());

      const endRotation = -getRandomEndRotation(
        wheelMinNumberOfSpins,
        wheelMaxNumberOfSpins
      );

      const zeroFromEndRotation = getZeroEndRotation(endRotation);

      const ballEndRotation =
        getBallNumberOfRotations(ballMinNumberOfSpins, ballMaxNumberOfSpins) +
        getBallEndRotation(zeroFromEndRotation, currentNumber);

      // Reset wheel to the last number position
      utils.set(".wheel", {
        rotate: lastNumberRotation,
      });

      // Reset ball container
      utils.set(".ball", {
        rotate: 0,
        translateY: 0,
      });

      // Animate wheel
      if (layer2Ref.current && layer4Ref.current) {
        animate([layer2Ref.current, layer4Ref.current], {
          rotate: endRotation,
          duration: singleSpinDuration,
          easing: `cubicBezier(${bezier.join(",")})`,
          complete,
        });
      }

      // Animate ball
      if (ballRef.current) {
        // Tạo animation ballContainer chứa cả translateY và rotate
        animate(ballRef.current, {
          translateY: [
            { value: 0, duration: 0 },
            { value: -15, duration: 1000 },
            { value: -25, duration: 1000 },
            { value: -10, duration: 1000 },
            { value: 0, duration: 1000 },
            { value: 50, duration: 1000 },
          ],
          rotate: ballEndRotation,
          duration: singleSpinDuration,
          easing: `cubicBezier(${bezier.join(",")})`,
        });
      }
    },
    [lastNumber]
  );

  const handleSpin = useCallback((): void => {
    if (gameState.status !== "waiting") return;
    setGameState((prev) => ({ ...prev, status: "spinning", timeRemaining: 0 }));

    // Pick a random landing number
    const landingIndex = Math.floor(Math.random() * wheelNumbers.length);
    const landingNumber = wheelNumbers[landingIndex];
    spinWheel(landingNumber);
  }, [gameState.status, spinWheel]);

  useEffect(() => {
    if (gameState.status === "waiting" && gameState.timeRemaining > 0) {
      // Clear any existing interval
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }

      // Start new countdown
      countdownIntervalRef.current = setInterval(() => {
        setGameState((prev) => {
          const newTimeRemaining = prev.timeRemaining - 1;
          if (newTimeRemaining <= 0) {
            if (newTimeRemaining <= 0 && countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }
          }
          return {
            ...prev,
            timeRemaining: Math.max(0, newTimeRemaining),
          };
        });
      }, 1000);

      // Cleanup interval
      return () => {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
      };
    }
  }, [gameState.status, gameState.timeRemaining]);

  useEffect(() => {
    if (gameState.status === "waiting" && gameState.timeRemaining === 0) {
      handleSpin();
    }
  }, [gameState.timeRemaining, gameState.status, handleSpin]);

  useEffect(() => {
    if (selectedBet && betAmount > 0 && gameState.status === "waiting") {
      const newBet: PlacedBet = {
        ...selectedBet,
        position: {
          x: 0,
          y: 0,
        },
        amount: betAmount,
      };
      setPlacedBets((prevBets) => [...prevBets, newBet]);
      setSelectedBet(null);
      setBetAmount(0);
    }
  }, [selectedBet, betAmount, gameState, socket]);

  const isRedNumber = (number: number): boolean => {
    return redNumbers.includes(number);
  };

  const renderBettingTable = () => {
    const handleBetClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (gameState?.status !== "waiting" || !betAmount) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      console.log("Bet clicked at:", { x, y });

      let bet: BetOption | null = null;

      // Zero bet
      if (x < 7 && y > 35 && y < 84) {
        bet = {
          type: "straight",
          numbers: [0],
          payout: 35,
        };
      }

      // Inside number bets
      if (y > 23 && y < 76 && x > 7 && x < 90) {
        const columnWidth = (90 - 7) / 12;
        const columnIndex = Math.floor((x - 7) / columnWidth);

        const rowHeight = (76 - 23) / 3;
        const rowIndex = Math.floor((y - 23) / rowHeight);

        bet = {
          type: "straight",
          numbers: [betTableNumber[rowIndex][columnIndex]],
          payout: 35,
        };
      }

      // Outside bets
      if (x > 7 && x < 90) {
        if (y < 22 && y > 6) {
          if (x < 34) {
            bet = {
              type: "dozen",
              numbers: Array.from({ length: 12 }, (_, i) => i + 1),
              payout: 1,
            };
          } else if (x < 62 && x > 34) {
            bet = {
              type: "dozen",
              numbers: Array.from({ length: 12 }, (_, i) => i + 13),
              payout: 1,
            };
          } else if (x > 62 && x < 90) {
            bet = {
              type: "dozen",
              numbers: Array.from({ length: 12 }, (_, i) => i + 25),
              payout: 1,
            };
          }
        } else if (y > 67 && y < 93) {
          if (x < 20 && x > 7) {
            bet = {
              type: "1-18",
              numbers: Array.from({ length: 18 }, (_, i) => i + 1),
              payout: 1,
            };
          } else if (x < 34 && x > 20) {
            bet = {
              type: "even",
              numbers: Array.from({ length: 18 }, (_, i) => i * 2 + 19),
              payout: 1,
            };
          } else if (x < 48 && x > 34) {
            bet = {
              type: "red",
              numbers: redNumbers,
              payout: 1,
            };
          } else if (x > 48 && x < 62) {
            bet = {
              type: "black",
              numbers: blackNumbers,
              payout: 1,
            };
          } else if (x > 62 && x < 76) {
            bet = {
              type: "odd",
              numbers: Array.from({ length: 18 }, (_, i) => i * 2 + 1),
              payout: 1,
            };
          } else if (x > 76 && x < 90) {
            bet = {
              type: "19-36",
              numbers: Array.from({ length: 18 }, (_, i) => i + 19),
              payout: 1,
            };
          }
        }
      }

      // Column bets
      if (x > 90 && y > 23 && y < 76 && x < 98) {
        const rowHeight = (76 - 23) / 3;
        const rowIndex = Math.floor((y - 23) / rowHeight);
        if (rowIndex >= 0 && rowIndex < 3) {
          bet = {
            type: "column",
            numbers: betTableNumber[rowIndex],
            payout: 2,
          };
        }
      }

      if (bet) {
        const newBet: PlacedBet = {
          ...bet,
          position: { x, y },
          amount: betAmount,
        };
        console.log("New bet placed:", {
          type: bet.type,
          numbers: bet.numbers,
          payout: bet.payout,
          amount: betAmount,
          position: { x, y },
          timestamp: new Date().toISOString(),
        });
        setPlacedBets((prevBets) => [...prevBets, newBet]);
      }
    };

    const chipValues = [1, 2, 5, 10, 50, 100];

    return (
      <>
        <HistoryContainer>
          {numberHistory.map((number: number, index: number) => (
            <HistoryNumber
              key={index}
              isRed={isRedNumber(number)}
              number={number}
            >
              {number}
            </HistoryNumber>
          ))}
        </HistoryContainer>
        <BettingTable>
          <img
            src="/images/roulette/bet_table.png"
            alt="Roulette Betting Table"
          />
          <div
            id="last-click-event"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              cursor: "pointer",
            }}
            onClick={handleBetClick}
          />
          {placedBets.map((bet: PlacedBet, index: number) => (
            <BetMarker key={index} x={bet.position.x} y={bet.position.y}>
              <img src="/images/chips/chip1.png" alt={`Bet ${bet.amount}`} />
              <span>{bet.amount}</span>
            </BetMarker>
          ))}
        </BettingTable>
        <ChipContainer>
          {chipValues.map((value: number) => (
            <Chip
              key={value}
              value={value}
              isSelected={betAmount === value}
              onClick={() => setBetAmount(value)}
            >
              <img src="/images/chips/chip1.png" alt={`${value} chip`} />
              <span>{value}</span>
            </Chip>
          ))}
        </ChipContainer>
        <ActionButtonsContainer>
          <ActionButton
            onClick={() => {
              if (placedBets.length > 0) {
                setPlacedBets((prevBets: PlacedBet[]) => prevBets.slice(0, -1));
              }
            }}
            disabled={placedBets.length === 0}
          >
            Undo Bet
          </ActionButton>
          <ActionButton
            onClick={() => setPlacedBets([])}
            disabled={placedBets.length === 0}
          >
            Clear Bets
          </ActionButton>
        </ActionButtonsContainer>
      </>
    );
  };

  return (
    <RouletteContainer>
      <GameLayout>
        <WheelSection>
          <RouletteWheel>
            <Layer1 />
            <Layer2 ref={layer2Ref} className="wheel" />
            <Layer3 />
            <Layer4 ref={layer4Ref} className="wheel" />
            <Layer5 />
            <BallContainer ref={ballContainerRef}>
              <Ball ref={ballRef} className="ball" />
            </BallContainer>
          </RouletteWheel>

          {gameState && (
            <GameStatus>
              <p>Status: {gameState.status}</p>
              {gameState.timeRemaining > 0 && (
                <p>Time Remaining: {gameState.timeRemaining}s</p>
              )}
            </GameStatus>
          )}
        </WheelSection>

        <BettingSection>{renderBettingTable()}</BettingSection>
      </GameLayout>
    </RouletteContainer>
  );
};

export default Roulette;
