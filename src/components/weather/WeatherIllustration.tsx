import React from 'react';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import { palette } from '../../theme/tokens';

import type { WeatherIconName } from '../../services/weatherCodes';

const SW = 8;
const CLOUD_PATH = 'M60 150 H140 A28 28 0 0 0 140 94 A38 38 0 0 0 70 84 A33 33 0 0 0 60 150 Z';

function Sun({ cx, cy, r, ink }: { cx: number; cy: number; r: number; ink: string }) {
    return (
        <G>
            {Array.from({ length: 8 }).map((_, i) => {
                const a = (i * Math.PI) / 4;
                return (
                    <Line
                        key={i}
                        x1={cx + Math.cos(a) * (r + 10)}
                        y1={cy + Math.sin(a) * (r + 10)}
                        x2={cx + Math.cos(a) * (r + 22)}
                        y2={cy + Math.sin(a) * (r + 22)}
                        stroke={palette.bistre}
                        strokeWidth={SW}
                        strokeLinecap="round"
                    />
                );
            })}
            <Circle cx={cx} cy={cy} r={r} fill={palette.bistre} />
            <Circle cx={cx - r * 0.32} cy={cy - r * 0.05} r={3.5} fill={ink} />
            <Circle cx={cx + r * 0.32} cy={cy - r * 0.05} r={3.5} fill={ink} />
            <Path
                d={`M${cx - 6} ${cy + r * 0.3} Q${cx} ${cy + r * 0.3 + 6} ${cx + 6} ${cy + r * 0.3}`}
                stroke={ink}
                strokeWidth={3}
                strokeLinecap="round"
                fill="none"
            />
        </G>
    );
}

function Moon({ cx, cy, r, bg }: { cx: number; cy: number; r: number; bg: string }) {
    return (
        <G>
            <Circle cx={cx} cy={cy} r={r} fill={palette.bistre} />
            <Circle cx={cx + r * 0.5} cy={cy - r * 0.3} r={r * 0.85} fill={bg} />
        </G>
    );
}

function Stars() {
    return (
        <G fill={palette.bistre}>
            <Circle cx={152} cy={50} r={4} />
            <Circle cx={166} cy={92} r={3} />
            <Circle cx={46} cy={60} r={3} />
        </G>
    );
}

function Cloud({ bg, ink, dy = 0, face = true }: { bg: string; ink: string; dy?: number; face?: boolean }) {
    return (
        <G translate={`0, ${dy}`}>
            <Path d={CLOUD_PATH} fill={bg} stroke={palette.bistre} strokeWidth={SW} strokeLinejoin="round" />
            {face ? (
                <>
                    <Circle cx={88} cy={122} r={3.5} fill={ink} />
                    <Circle cx={112} cy={122} r={3.5} fill={ink} />
                    <Path
                        d="M94 131 Q100 137 106 131"
                        stroke={ink}
                        strokeWidth={3}
                        strokeLinecap="round"
                        fill="none"
                    />
                </>
            ) : null}
        </G>
    );
}

interface Props {
    icon: WeatherIconName;
    size?: number;
    bg: string; 
    ink: string; 
}

export default function WeatherIllustration({ icon, size = 220, bg, ink }: Props) {
    let content: React.ReactNode;
    switch (icon) {
        case 'sunny':
            content = <Sun cx={100} cy={100} r={38} ink={ink} />;
            break;
        case 'moon':
            content = (
                <>
                    <Moon cx={100} cy={100} r={44} bg={bg} />
                    <Stars />
                </>
            );
            break;
        case 'partly-sunny':
            content = (
                <>
                    <Sun cx={128} cy={72} r={32} ink={ink} />
                    <Cloud bg={bg} ink={ink} dy={12} face={false} />
                </>
            );
            break;
        case 'cloudy-night':
            content = (
                <>
                    <Moon cx={125} cy={72} r={32} bg={bg} />
                    <Cloud bg={bg} ink={ink} dy={12} face={false} />
                </>
            );
            break;
        case 'rainy':
            content = (
                <>
                    <Cloud bg={bg} ink={ink} dy={-14} />
                    {[78, 100, 122].map((x, i) => (
                        <Line
                            key={x}
                            x1={x}
                            y1={146 + (i % 2) * 6}
                            x2={x - 7}
                            y2={164 + (i % 2) * 6}
                            stroke={palette.bistre}
                            strokeWidth={6}
                            strokeLinecap="round"
                        />
                    ))}
                </>
            );
            break;
        case 'thunderstorm':
            content = (
                <>
                    <Cloud bg={bg} ink={ink} dy={-16} />
                    <Path d="M106 126 L88 154 H103 L96 178 L122 146 H106 Z" fill={palette.bistre} strokeLinejoin="round" />
                </>
            );
            break;
        case 'snow':
            content = (
                <>
                    <Cloud bg={bg} ink={ink} dy={-14} />
                    <G fill={palette.bistre}>
                        <Circle cx={80} cy={152} r={5} />
                        <Circle cx={100} cy={166} r={5} />
                        <Circle cx={120} cy={152} r={5} />
                    </G>
                </>
            );
            break;
        default:
            content = <Cloud bg={bg} ink={ink} />;
    }

    return (
        <Svg width={size} height={size} viewBox="0 0 200 200">
            {content}
        </Svg>
    );
}