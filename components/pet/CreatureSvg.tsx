import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
} from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Path, Ellipse, Circle, G, Line } from 'react-native-svg';
import { Colors } from '@/constants/tokens';

export type CreatureSvgRef = {
  triggerFed: () => void;
  triggerEvolve: () => void;
};

interface CreatureSvgProps {
  stage: number;
  color?: string;
  size?: number;
}

function blob(
  cx: number,
  cy: number,
  radii: number[],
  squash: number = 1
): string {
  const n = radii.length;
  const pts: [number, number][] = radii.map((r, i) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r * squash];
  });
  let d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d +=
      ' C' +
      c1x.toFixed(1) +
      ' ' +
      c1y.toFixed(1) +
      ' ' +
      c2x.toFixed(1) +
      ' ' +
      c2y.toFixed(1) +
      ' ' +
      p2[0].toFixed(1) +
      ' ' +
      p2[1].toFixed(1);
  }
  return d + 'Z';
}

interface Eye {
  x: number;
  y: number;
  r: number;
}

interface StageData {
  radii: number[];
  cx: number;
  cy: number;
  squash: number;
  eyes: Eye[];
  pupil: number;
  mouth: string;
  mouthFill: boolean;
  teeth: number[] | null;
  brow: boolean;
}

const STAGES: StageData[] = [
  {
    radii: [40, 58, 60, 62, 61, 63, 60, 62, 60, 62, 61, 58],
    cx: 110,
    cy: 122,
    squash: 1.04,
    eyes: [
      { x: 92, y: 110, r: 13 },
      { x: 128, y: 110, r: 13 },
    ],
    pupil: 5.5,
    mouth: 'M100 142 Q110 150 120 142',
    mouthFill: false,
    teeth: null,
    brow: false,
  },
  {
    radii: [58, 74, 66, 80, 70, 72, 84, 80, 86, 80, 72, 76, 70, 80, 66, 74],
    cx: 110,
    cy: 114,
    squash: 1.0,
    eyes: [
      { x: 88, y: 100, r: 16 },
      { x: 132, y: 100, r: 16 },
    ],
    pupil: 7,
    mouth: 'M84 132 Q110 122 136 132 Q120 162 110 162 Q100 162 84 132 Z',
    mouthFill: true,
    teeth: [94, 124, 110, 128],
    brow: false,
  },
  {
    radii: [80, 64, 96, 68, 90, 66, 98, 70, 88, 64, 94, 68, 92, 66, 96, 70],
    cx: 110,
    cy: 108,
    squash: 1.0,
    eyes: [
      { x: 80, y: 92, r: 15 },
      { x: 140, y: 92, r: 15 },
      { x: 110, y: 74, r: 11 },
    ],
    pupil: 6.5,
    mouth: 'M74 128 Q110 116 146 128 Q138 168 110 168 Q82 168 74 128 Z',
    mouthFill: true,
    teeth: [88, 120, 108, 124, 128, 120],
    brow: true,
  },
];

const CreatureSvg = forwardRef<CreatureSvgRef, CreatureSvgProps>(
  ({ stage, color = Colors.lime, size = 220 }, ref) => {
    const s = STAGES[Math.max(0, Math.min(STAGES.length - 1, stage))];
    const { cx, cy } = s;

    // Breathing: oscillates 0 -> 1 -> 0; mapped to scale.
    const breath = useRef(new Animated.Value(0)).current;
    const reactX = useRef(new Animated.Value(1)).current;
    const reactY = useRef(new Animated.Value(1)).current;
    const reactRotate = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(breath, {
            toValue: 1,
            duration: 1600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(breath, {
            toValue: 0,
            duration: 1600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }, [breath]);

    useImperativeHandle(ref, () => ({
      triggerFed: () => {
        reactX.setValue(1);
        reactY.setValue(1);
        Animated.parallel([
          Animated.sequence([
            Animated.timing(reactX, {
              toValue: 1.18,
              duration: 120,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(reactX, {
              toValue: 0.92,
              duration: 180,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(reactX, {
              toValue: 1,
              duration: 200,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(reactY, {
              toValue: 0.84,
              duration: 120,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(reactY, {
              toValue: 1.12,
              duration: 180,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(reactY, {
              toValue: 1,
              duration: 200,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      },
      triggerEvolve: () => {
        reactX.setValue(1);
        reactY.setValue(1);
        reactRotate.setValue(0);
        Animated.parallel([
          Animated.sequence([
            Animated.timing(reactX, {
              toValue: 0.6,
              duration: 300,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(reactX, {
              toValue: 1.25,
              duration: 350,
              easing: Easing.out(Easing.back(2)),
              useNativeDriver: true,
            }),
            Animated.timing(reactX, {
              toValue: 1,
              duration: 350,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(reactY, {
              toValue: 0.6,
              duration: 300,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(reactY, {
              toValue: 1.25,
              duration: 350,
              easing: Easing.out(Easing.back(2)),
              useNativeDriver: true,
            }),
            Animated.timing(reactY, {
              toValue: 1,
              duration: 350,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(reactRotate, {
              toValue: -1,
              duration: 300,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(reactRotate, {
              toValue: 0,
              duration: 700,
              easing: Easing.elastic(1.2),
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      },
    }));

    const breathScaleX = breath.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.04],
    });
    const breathScaleY = breath.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.96],
    });

    const rotate = reactRotate.interpolate({
      inputRange: [-1, 0],
      outputRange: ['-12deg', '0deg'],
    });

    const transform = [
      { scaleX: Animated.multiply(breathScaleX, reactX) },
      { scaleY: Animated.multiply(breathScaleY, reactY) },
      { rotate },
    ];

    const yTop = stage >= 2 ? 128 : 132;
    const tongueCy = stage >= 2 ? 160 : 154;

    return (
      <Animated.View style={{ width: size, height: size, transform }}>
        <Svg
          width={size}
          height={size}
          viewBox="0 0 220 220"
          style={{ overflow: 'visible' }}
        >
          {/* 1. body */}
          <Path d={blob(cx, cy, s.radii, s.squash)} fill={color} />

          {/* 2. gloss */}
          <Ellipse
            cx={cx - 22}
            cy={cy - 34}
            rx={26}
            ry={16}
            fill="#fff"
            opacity={0.16}
          />

          {/* 3. drips for stage >= 1 */}
          {stage >= 1 && (
            <>
              <Circle cx={cx - 30} cy={cy + 58} r={7} fill={color} />
              <Circle cx={cx + 34} cy={cy + 52} r={5} fill={color} />
            </>
          )}

          {/* 4. extra drip for stage >= 2 */}
          {stage >= 2 && <Circle cx={cx + 12} cy={cy + 66} r={6} fill={color} />}

          {/* 5. brows */}
          {s.brow && (
            <G stroke="rgba(0,0,0,0.55)" strokeWidth={5} strokeLinecap="round">
              <Line x1={68} y1={74} x2={92} y2={82} />
              <Line x1={152} y1={74} x2={128} y2={82} />
            </G>
          )}

          {/* 6. eyes */}
          {s.eyes.map((e, i) => (
            <G key={'eye-' + i}>
              <Circle cx={e.x} cy={e.y} r={e.r} fill="#fff" />
              <Circle
                cx={e.x + 2}
                cy={e.y + 2}
                r={s.pupil}
                fill="#15110b"
              />
              <Circle
                cx={e.x + 4}
                cy={e.y - 1}
                r={s.pupil * 0.42}
                fill="#fff"
              />
            </G>
          ))}

          {/* 7. cheeks */}
          {stage >= 1 && (
            <G fill="#fff" opacity={0.22}>
              <Circle cx={74} cy={124} r={8} />
              <Circle cx={146} cy={124} r={8} />
            </G>
          )}

          {/* 8. mouth */}
          {s.mouthFill ? (
            <>
              <Path d={s.mouth} fill="rgba(10,8,6,0.62)" />
              {s.teeth &&
                s.teeth.map((x, i) => (
                  <Path
                    key={'tooth-' + i}
                    d={
                      'M' +
                      (x - 6) +
                      ' ' +
                      yTop +
                      ' L' +
                      (x + 6) +
                      ' ' +
                      yTop +
                      ' L' +
                      x +
                      ' ' +
                      (yTop + 11) +
                      ' Z'
                    }
                    fill="#fff"
                  />
                ))}
              <Ellipse
                cx={cx}
                cy={tongueCy}
                rx={13}
                ry={8}
                fill="#ff5b8a"
              />
            </>
          ) : (
            <Path
              d={s.mouth}
              fill="none"
              stroke="rgba(10,8,6,0.62)"
              strokeWidth={4}
              strokeLinecap="round"
            />
          )}
        </Svg>
      </Animated.View>
    );
  }
);

CreatureSvg.displayName = 'CreatureSvg';

export default CreatureSvg;
