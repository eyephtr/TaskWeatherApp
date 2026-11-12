# TaskWeatherApp

แอปพลิเคชัน React Native สำหรับจัดการงาน (Task) พร้อมแสดงพยากรณ์อากาศ

---

## 1. การติดตั้งและรันโปรเจกต์

### เวอร์ชันของเครื่องมือที่ใช้

| เครื่องมือ | เวอร์ชัน |
|---|---|
| Node.js | >= 22.11.0 |
| React Native | 0.88.1 |
| React | 19.3.0 |
| TypeScript | ^6.0.3 |
| Ruby (สำหรับ iOS CocoaPods) | >= 2.7 |
| Xcode | >= 15 (iOS) |
| Android Studio / JDK | >= JDK 17 (Android) |

### ขั้นตอนการติดตั้ง

```bash
# 1. ติดตั้ง dependencies
npm install

# 2. ติดตั้ง iOS Pods (macOS เท่านั้น)
cd ios && bundle exec pod install && cd ..
```

### รันโปรเจกต์

```bash
# เริ่ม Metro bundler
npm start

# รันบน iOS simulator (macOS เท่านั้น)
npm run ios

# รันบน Android emulator
npm run android
```

### คำสั่งอื่น ๆ

```bash
# รัน unit tests
npm test

# รัน linter
npm run lint
```

---

## 2. โครงสร้างของโปรเจกต์

```
src/
├── components/
│   ├── common/          # UI components ที่ใช้ร่วมกันทั้งแอป
│   │                    #   AppErrorBoundary, EmptyState, FloatingTabBar,
│   │                    #   IconSegmentedControl, ScreenHeader, Skeleton, StatusBanner
│   ├── task/            # Components เฉพาะฟีเจอร์ Task
│   │                    #   AgendaItem, Check, FlippableNotebookCard, NotebookCard,
│   │                    #   SearchBar, StatusFilter, WeekStrip
│   └── weather/         # Components เฉพาะฟีเจอร์ Weather
│                        #   CurrentWeatherCard, ForecastCard, WeatherSkeleton
│
├── navigation/
│   └── RootNavigator.tsx   # กำหนด Tab และ Stack navigation ทั้งหมด
│
├── screens/
│   ├── TaskListScreen.tsx     # หน้าหลัก — แสดงรายการ task แบบ agenda + calendar strip
│   ├── TaskFormScreen.tsx     # หน้าแก้ไข task (ใช้สำหรับ edit flow เท่านั้น)
│   ├── TaskDetailScreen.tsx   # หน้าดูรายละเอียด task
│   ├── WeatherScreen.tsx      # หน้าพยากรณ์อากาศ (current + 7-day forecast)
│   └── SettingsScreen.tsx     # หน้าตั้งค่า (theme ฯลฯ)
│
├── store/
│   ├── taskStore.ts         # factory สร้าง Zustand store สำหรับ task
│   ├── useTaskStore.ts      # singleton instance + React hook
│   ├── weatherStore.ts      # factory สร้าง Zustand store สำหรับ weather
│   └── useWeatherStore.ts   # singleton instance + React hook
│
├── storage/
│   ├── keyValueStore.ts     # interface นามธรรมสำหรับ key-value storage
│   ├── appStorage.ts        # concrete implementation บน AsyncStorage
│   ├── taskRepository.ts    # serialize/deserialize task พร้อม schema versioning
│   └── weatherCache.ts      # cache ข้อมูลอากาศพร้อม key ตาม lat/lon
│
├── services/
│   ├── weatherApi.ts        # เรียก Open-Meteo API + parse response
│   ├── weatherCodes.ts      # แปลง WMO weather code เป็น label และ icon
│   ├── weatherConfig.ts     # ค่าคงที่ (TTL, timeout, default location ฯลฯ)
│   └── weatherErrors.ts     # typed error สำหรับทุก failure case ของ weather
│
├── theme/
│   ├── ThemeProvider.tsx    # Context + hook สำหรับ light/dark theme
│   ├── tokens.ts            # design tokens (spacing, fontSize, radius, palette, semantic colors)
│   └── priority.ts          # สีตาม task priority
│
├── types/
│   ├── task.ts              # type Task, TaskInput, Subtask, ValidationErrors
│   ├── weather.ts           # type WeatherData, DailyForecast, GeoLocation
│   └── navigation.ts        # type RootStackParamList, TabParamList
│
└── utils/
    ├── date.ts              # helper สำหรับ date string (YYYY-MM-DD)
    ├── time.ts              # helper สำหรับ time string (HH:MM)
    ├── id.ts                # สร้าง unique ID
    ├── cache.ts             # ตรวจสอบความสดของ cache ด้วย TTL
    ├── useDebounce.ts       # generic debounce hook สำหรับ input
    ├── taskFilters.ts       # filter task ตาม status (all/active/done)
    ├── taskSelectors.ts     # group/sort task สำหรับแสดงผล
    ├── taskStatus.ts        # ตรวจสอบสถานะ (overdue, done ฯลฯ)
    └── taskValidation.ts    # validate TaskInput ก่อนบันทึก
```

---

## 3. เหตุผลในการเลือกใช้เทคโนโลยี

### State Management — Zustand

เลือก [Zustand](https://github.com/pmndrs/zustand) แทน Redux หรือ Context API เพราะ:

- **Boilerplate น้อย** — ไม่ต้องมี action type, reducer, หรือ provider ครอบ component tree; store เป็น plain function เขียนและอ่านได้ตรง ๆ
- **Factory pattern** — `taskStore.ts` และ `weatherStore.ts` เป็น factory function ที่รับ dependency (repository, cache, fetch) เข้ามา ทำให้ inject mock ใน test ได้โดยไม่ต้องพึ่ง module mock
- **Selector ที่ fine-grained** — component subscribe ได้เฉพาะ slice ที่ต้องการ ไม่ re-render โดยไม่จำเป็น

### การจัดเก็บข้อมูล — AsyncStorage + Repository Pattern

- **AsyncStorage** เหมาะกับข้อมูลขนาดเล็กอย่าง task list ที่ไม่ต้องการ query ซับซ้อน ไม่ต้องพึ่ง SQLite หรือ Realm
- **`keyValueStore.ts`** เป็น interface นามธรรมที่คั่นกลางระหว่าง storage จริงกับ business logic ทำให้สลับ implementation ใน test ได้ง่าย (ใช้ in-memory store แทน AsyncStorage)
- **`taskRepository.ts`** ห่อ serialize/deserialize พร้อม schema version และ type guard ป้องกัน corrupt data จากรุ่นเก่าของแอป
- **`weatherCache.ts`** cache ข้อมูลอากาศด้วย key ที่ตาม lat/lon ลด API call ที่ซ้ำซ้อน โดย TTL ควบคุมผ่าน `weatherConfig.ts`

### Weather API — Open-Meteo

เลือก [Open-Meteo](https://open-meteo.com/) เพราะไม่ต้องใช้ API key และให้ข้อมูลพยากรณ์มาตรฐาน WMO ครบถ้วน (current + 7-day forecast) ฟรี เหมาะกับ prototype และการพัฒนาโดยไม่มี backend

### Navigation — React Navigation

ใช้ `@react-navigation/native-stack` สำหรับ Stack และ `@react-navigation/bottom-tabs` สำหรับ Tab ซึ่งเป็น standard ของ React Native ecosystem มี TypeScript type สำหรับ route params แบบ end-to-end ผ่าน `RootStackParamList` และ `TabParamList`

### Animation — React Native Reanimated

ใช้ [Reanimated v4](https://docs.swmansion.com/react-native-reanimated/) สำหรับ animation ที่ต้องการความลื่นไหลระดับ 60fps เช่น `AddTaskOverlay` ที่ slide-up พร้อม scale และ backdrop fade เมื่อกด FAB Reanimated รัน animation บน UI thread โดยตรง ทำให้ไม่สะดุดแม้ JS thread จะยุ่งอยู่ ซึ่ง `Animated` จาก React Native core (ที่ใช้ใน `FloatingTabBar`) ก็ยังคงใช้สำหรับ animation ที่ไม่ต้องการ interactivity สูง
