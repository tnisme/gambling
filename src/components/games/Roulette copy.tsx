import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useWebSocket } from "../../hooks/useWebSocket";
import { BetOption, GameState } from "../../types/roulette";
import { animate, utils } from "animejs";

const redNumbers = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
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
`;

const Chip = styled.div<{ value: number }>`
  position: relative;
  width: 50px;
  height: 50px;
  cursor: pointer;
  transition: transform 0.2s;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  span {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-weight: bold;
    font-size: ${({ value }) => (value >= 100 ? "0.8rem" : "1rem")};
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  }

  &:hover {
    transform: scale(1.1);
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

const BettingControls = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  align-items: center;
`;

const BetInput = styled.input`
  padding: 0.5rem;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  font-size: 1rem;
  width: 120px;
`;

const BetButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
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
    setNumberHistory((prev) => [number, ...prev].slice(0, 10));
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
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }
            // Trigger spin on next tick to ensure state is updated
            setTimeout(() => handleSpin(), 0);
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
  }, [gameState.status, gameState.timeRemaining, handleSpin]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSpin();
    }, 10000); // Giảm xuống 3 giây để thuận tiện cho việc test

    return () => clearTimeout(timer);
  }, [handleSpin]);

  const placeBet = useCallback(() => {
    if (!selectedBet || !socket) return;

    socket.send(
      JSON.stringify({
        type: "place_bet",
        bet: selectedBet,
        amount: betAmount,
      })
    );
  }, [selectedBet, betAmount, socket]);

  const isRedNumber = (number: number): boolean => {
    return redNumbers.includes(number);
  };

  const renderBettingTable = () => {
    const handleBetClick = (event: React.MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const xPercent = (x / rect.width) * 100;
      const yPercent = (y / rect.height) * 100;

      // Define betting areas based on click coordinates
      let bet: BetOption | null = null;

      // Straight bets (individual numbers)
      if (yPercent > 20 && yPercent < 60) {
        const col = Math.floor(xPercent / 8.33);
        if (col >= 0 && col < 12) {
          const number = 3 * col + Math.floor((60 - yPercent) / 13.33);
          bet = {
            type: "straight",
            numbers: [number],
            payout: 35,
          };
        }
      }

      // Outside bets
      if (yPercent > 65) {
        if (xPercent < 33) {
          if (yPercent < 75) {
            bet = {
              type: "1-18",
              numbers: Array.from({ length: 18 }, (_, i) => i + 1),
              payout: 1,
            };
          } else {
            bet = {
              type: "even",
              numbers: Array.from({ length: 18 }, (_, i) => (i + 1) * 2),
              payout: 1,
            };
          }
        } else if (xPercent > 66) {
          if (yPercent < 75) {
            bet = {
              type: "19-36",
              numbers: Array.from({ length: 18 }, (_, i) => i + 19),
              payout: 1,
            };
          } else {
            bet = {
              type: "odd",
              numbers: Array.from({ length: 18 }, (_, i) => i * 2 + 1),
              payout: 1,
            };
          }
        }
      }

      // Column bets
      if (yPercent < 20 && xPercent > 8.33) {
        const col = Math.floor((xPercent - 8.33) / 30.67);
        if (col >= 0 && col < 3) {
          bet = {
            type: "column",
            numbers: Array.from({ length: 12 }, (_, i) => i * 3 + col + 1),
            payout: 2,
          };
        }
      }

      if (bet) {
        setSelectedBet(bet);
      }
    };

    const chipValues = [1, 2, 5, 10, 50, 100];

    return (
      <>
        <HistoryContainer>
          {numberHistory.map((number, index) => (
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
        </BettingTable>
        <ChipContainer>
          {chipValues.map((value) => (
            <Chip key={value} value={value} onClick={() => setBetAmount(value)}>
              <img src="/images/chips/chip1.png" alt={`${value} chip`} />
              <span style={{ color: "#efd49b" }}>{value}</span>
            </Chip>
          ))}
        </ChipContainer>
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
          <BettingControls>
            <BetInput
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              min={1}
              placeholder="Enter bet amount"
            />
            <BetButton
              onClick={placeBet}
              disabled={!selectedBet || gameState?.status !== "waiting"}
            >
              Place Bet
            </BetButton>
            <BetButton
              onClick={handleSpin}
              disabled={gameState?.status !== "waiting"}
            >
              Spin
            </BetButton>
          </BettingControls>
        </WheelSection>

        <BettingSection>{renderBettingTable()}</BettingSection>
      </GameLayout>
    </RouletteContainer>
  );
};

export default Roulette;
