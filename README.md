# TaskWeatherApp

แอปพลิเคชัน Mobile Task Manager + Weather สำหรับจัดการรายการสิ่งที่ต้องทำและติดตามสภาพอากาศ พัฒนาด้วย React Native CLI และ TypeScript

## Features

### 1. Core Features — ฟีเจอร์หลักตามโจทย์

**Task Management**
- เพิ่ม / แก้ไข / ลบรายการงาน (Create / Read / Update / Delete)
- ทำเครื่องหมายว่างานเสร็จสิ้น พร้อมแสดงสถานะแตกต่างอย่างชัดเจน
- ค้นหาและกรองรายการตาม All / Active / Done
- จัดเก็บข้อมูลแบบถาวร (Persistent Storage) ข้อมูลยังคงอยู่หลังปิดและเปิดแอปใหม่

**Weather**
- แสดงสภาพอากาศปัจจุบันและพยากรณ์ล่วงหน้า 5 วัน ผ่าน Open-Meteo API
- จัดการสถานะ Loading / Success / Error พร้อมข้อความแจ้งข้อผิดพลาดและปุ่ม Try Again
- Cache ข้อมูลเป็นเวลา 10 นาที ลดการเรียก API ซ้ำเมื่อข้อมูลยังไม่หมดอายุ

**Navigation**
- Task List, Weather และ Task Detail เชื่อมโยงถึงกัน
- รองรับ Stack Navigation และ Bottom Tab Navigation

### 2. Additional Features — ฟีเจอร์เพิ่มเติมนอกเหนือจากโจทย์

พัฒนาความสามารถเพิ่มเติมจากข้อกำหนดหลัก เพื่อเพิ่มความยืดหยุ่นในการจัดการงานและยกระดับประสบการณ์ใช้งาน (User Experience)

**Task Management**
- **Priority:** ระดับความสำคัญ 4 ระดับ (High / Medium / Low / None) แสดงเป็นธงสี พร้อมเรียงลำดับและกรองตาม Priority
- **Task Colors:** เลือกสีประจำงานได้ 8 เฉด แสดงผลบนการ์ดและจุดสีในปฏิทิน
- **Subtasks & Tags:** รองรับงานย่อยและแท็กเพื่อจัดหมวดหมู่งาน
- **Time Range:** กำหนดเวลาเริ่มต้นและสิ้นสุด พร้อมแสดงสถานะ Overdue
- **Outdoor Tasks:** ระบุงานที่ต้องทำกลางแจ้ง พร้อมคำเตือนฝนและความร้อนจากพยากรณ์อากาศ
- **Advanced Search:** ค้นหาจากชื่องาน แท็ก และงานย่อย
- **Calendar View:** มุมมองปฏิทินและแถบสัปดาห์ (Week Strip) พร้อมจุดสีแสดงวันที่มีงาน
- **Swipe Actions:** ปัดการ์ดเพื่อทำเครื่องหมายเสร็จหรือลบงาน
- **Smart Task Grouping:** จัดกลุ่มงานตามเวลา เรียงตามความสำคัญ และแสดงเวลาเพียงครั้งเดียวต่อกลุ่ม

**Weather & Visual Experience**
- **Dynamic Background:** พื้นหลังเปลี่ยนตามอุณหภูมิ
- **Weather Illustrations:** ภาพประกอบ SVG เปลี่ยนตามสภาพอากาศ รวมถึงแสดงพระจันทร์ในเวลากลางคืน
- **Parallax Forecast:** แผงพยากรณ์อากาศเลื่อนทับส่วนบน โดยมีเส้นคลื่นประกอบ
- **Offline Fallback:** เมื่อเครือข่ายล้มเหลวและมีข้อมูลเก่าใน Cache จะแสดงข้อมูลเดิมพร้อมแจ้งเตือน

**Appearance & Navigation**
- **Dark Mode:** เลือก System / Light / Dark และบันทึกค่าที่เลือกไว้
- **Settings:** หน้าตั้งค่าสำหรับจัดการการแสดงผลและตัวเลือกของแอป
- **Floating Tab Bar:** ออกแบบ Bottom Tab Bar ให้ลอยเหนือเนื้อหา พร้อมปุ่มเพิ่มงานแบบ Floating Action Button

## Additional Features — Testing Status

ตารางด้านล่างสรุปฟีเจอร์ที่พัฒนาเพิ่มเติม พร้อมวิธีทดสอบ เพื่อให้เห็นขอบเขตการทำงานและสถานะการตรวจสอบอย่างชัดเจน

| ฟีเจอร์ | รายละเอียด | การทดสอบ |
|---|---|---|
| Flippable Notebook Card | การ์ดพลิกและขยายเป็นฟอร์มเพิ่มงานด้วย Reanimated | Manual Test (iOS) |
| Priority System | 4 ระดับ แสดงธงสี เรียงลำดับ และกรองตาม Priority | Unit Test |
| Task Colors | เลือกสีได้ 8 เฉด แสดงบนการ์ดและปฏิทิน | Unit Test |
| Subtasks / Tags / Time Range | งานย่อย แท็ก เวลาเริ่ม-สิ้นสุด และ Overdue | Unit Test |
| Calendar / Week Strip | สลับมุมมองปฏิทินและแถบสัปดาห์ พร้อมจุดสี | Manual Test + Unit Test (Date Logic) |
| Swipe Actions | ปัดการ์ดเพื่อ Done / Delete ด้วย Gesture Handler | Manual Test |
| Outdoor Weather Warning | แจ้งเตือนฝนและความร้อนสำหรับงานกลางแจ้ง | Unit Test |
| Weather Illustrations | ภาพประกอบตามสภาพอากาศและช่วงกลางวัน/กลางคืน | Unit Test (Weather Description) + Manual Test (Visuals) |
| Parallax Forecast | แผงพยากรณ์เลื่อนทับส่วนบนพร้อมเส้นคลื่น | Manual Test |
| Offline Fallback | แสดงข้อมูลเก่าจาก Cache เมื่อเครือข่ายล้มเหลว | Unit Test |
| Dark Mode | เลือก System / Light / Dark และบันทึกค่า | Unit Test (Preference) + Manual Test (UI) |
| Settings & Floating Tab Bar | เพิ่มหน้า Settings และ Bottom Tab Bar แบบลอย | Manual Test |

## 1. Installation & Setup

### Prerequisites

| เครื่องมือ | เวอร์ชัน |
|---|---|
| Node.js | >= 22.11.0 |
| React Native | 0.88.1 (React Native CLI) |
| React | 19.3.0 |
| TypeScript | ^6.0.3 |
| Ruby (CocoaPods) | >= 2.7 |
| Xcode | >= 15 (iOS) |
| JDK | >= 17 (Android) |

### Installation

```bash
npm install
cd ios && bundle exec pod install && cd ..
```

### Run the Application

```bash
# Start Metro Bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

ไม่จำเป็นต้องตั้งค่า API Key เนื่องจาก Open-Meteo สามารถใช้งานได้โดยไม่ต้องใช้ API Key

**หมายเหตุ:** หลังติดตั้งหรือเพิ่ม Native Dependencies เช่น `react-native-svg` ต้องรัน `pod install` และ Build แอปใหม่

### Other Commands

```bash
# Run tests
npm test

# Run lint
npm run lint

# Type checking
npx tsc --noEmit
```

## 2. Project Structure

```text
src/
├── components/
│   ├── common/
│   │   ├── AppErrorBoundary
│   │   ├── EmptyState
│   │   ├── FloatingTabBar
│   │   ├── IconSegmentedControl
│   │   ├── ScreenHeader
│   │   ├── Skeleton
│   │   └── StatusBanner
│   ├── task/
│   │   ├── AgendaItem
│   │   ├── Check
│   │   ├── ColorPicker
│   │   ├── FilterChips
│   │   ├── FlippableNotebookCard
│   │   ├── SearchBar
│   │   ├── TimeRangeRow
│   │   └── WeekStrip
│   └── weather/
│       ├── CurrentWeatherCard
│       ├── ForecastCard
│       ├── WeatherIllustration
│       └── WeatherSkeleton
├── navigation/
│   └── RootNavigator
├── screens/
│   ├── TaskListScreen
│   ├── TaskDetailScreen
│   ├── TaskFormScreen
│   ├── WeatherScreen
│   └── SettingsScreen
├── store/
│   ├── taskStore
│   └── weatherStore
├── storage/
│   ├── keyValueStore
│   ├── appStorage
│   ├── taskRepository
│   ├── weatherCache
│   └── themePreference
├── services/
│   ├── weatherApi
│   ├── weatherCodes
│   ├── weatherConfig
│   └── weatherErrors
├── theme/
│   ├── ThemeProvider
│   ├── tokens
│   └── priority
├── types/
│   ├── task
│   ├── weather
│   └── navigation
├── utils/
│   ├── date
│   ├── time
│   ├── id
│   ├── cache
│   ├── useDebounce
│   ├── taskFilters
│   ├── taskSelectors
│   ├── taskOrder
│   ├── taskStatus
│   ├── taskValidation
│   └── weatherWarning
└── test-utils/
    ├── memoryKv
    └── weather fixtures

__tests__/
├── tasks/
├── weather/
└── unit test files
```

### Architecture & Separation of Concerns

แบ่งโครงสร้างการทำงานออกเป็น 3 ชั้นหลัก เพื่อแยกความรับผิดชอบและให้สามารถทดสอบแต่ละส่วนได้อย่างอิสระ

- **UI Layer:** `screens/` และ `components/` รับผิดชอบการแสดงผลและรับ Input จากผู้ใช้
- **Business Logic Layer:** `store/` และ `utils/` จัดการ State, Validation, Filtering, Sorting, Overdue และ Weather Warning โดยแยก Logic ออกจาก UI
- **Data Layer:** `storage/` และ `services/` รับผิดชอบการจัดเก็บข้อมูลและเรียกใช้ API โดยมี Interface เป็นตัวกลางเพื่อให้สามารถเปลี่ยน Implementation และ Inject Dependencies สำหรับการทดสอบได้

## 3. Technology Choices & Design Decisions

| Technology | เหตุผลในการเลือกใช้ |
|---|---|
| React Native CLI + TypeScript | พัฒนา Native Mobile Application ด้วย TypeScript เพื่อเพิ่มความปลอดภัยด้านชนิดข้อมูล |
| Zustand | Boilerplate น้อย ไม่ต้องใช้ Provider ครอบแอป รองรับ Selector เพื่อลด Re-render และออกแบบ Store เป็น Factory เพื่อ Inject Dependencies สำหรับการทดสอบ |
| AsyncStorage + Repository Pattern | เหมาะกับข้อมูลรายการงานที่มีขนาดไม่ใหญ่และไม่ต้อง Query ซับซ้อน ใช้ `KeyValueStore` เป็น Interface เพื่อสลับเป็น In-memory Storage ในการทดสอบได้ พร้อม Schema Version และ Type Guard สำหรับตรวจสอบข้อมูล |
| Open-Meteo | Public Weather API ที่ไม่ต้องใช้ API Key ช่วยลดขั้นตอนการตั้งค่า |
| React Navigation | รองรับ Tab และ Stack Navigation พร้อม TypeScript สำหรับตรวจสอบ Route Parameters |
| Reanimated 4 | ใช้สร้าง Animation การพลิกและขยายการ์ด โดยให้ Animation ทำงานบน UI Thread |
| React Native Gesture Handler | รองรับ Gesture สำหรับปัดการ์ดงาน |
| React Native SVG | ใช้สร้างภาพประกอบสภาพอากาศและเส้นคลื่น |
| React Native Calendars | ใช้สร้างมุมมองปฏิทินและแสดงจุดสีหลายสีในแต่ละวัน |

### Race Condition & Duplicate Request Handling

มีการจัดการป้องกันปัญหาจากการทำงานแบบ Asynchronous ในหลายส่วน

- **Weather Store:** ใช้ `inFlight` ป้องกันการเรียก API ซ้ำ, `requestId` ป้องกันการนำผลลัพธ์จาก Request เก่ามาทับข้อมูลใหม่ และ `AbortController` ร่วมกับ Timeout สำหรับควบคุมคำขอ
- **Task Form:** ใช้ `savedRef` ป้องกันการกดบันทึกซ้ำ
- **Task Repository:** ใช้ Queue สำหรับจัดลำดับการเขียนข้อมูล เพื่อป้องกันการเขียนทับกัน

## 4. Testing

เน้นทดสอบ Business Logic และ Data Layer ด้วย Unit Test โดยใช้ Dependency Injection และ In-memory Storage เพื่อลดการพึ่งพา Native Modules ระหว่างการทดสอบ

**ขอบเขตการทดสอบ**
- Task Store และ Repository
- Task Validation, Filtering และ Sorting
- Task Status และ Priority
- Date และ Time Utilities
- Weather API และ Weather Store
- Weather Cache และ Weather Warning
- Theme Preference

**สถานะการทดสอบเพิ่มเติม**

- Unit Test สำหรับ Logic สำคัญของ Task และ Weather
- Manual Test สำหรับ UI, Animation, Gesture และการแสดงผลบน iOS
- ยังไม่มี Component Test และ Integration Test

## 5. Known Limitations & Future Improvements

ระบุข้อจำกัดที่ทราบในเวอร์ชันปัจจุบัน พร้อมแนวทางพัฒนาต่อ เพื่อให้เห็นขอบเขตงานที่ดำเนินการแล้วและส่วนที่ยังต้องปรับปรุง

| ข้อจำกัด | สถานะปัจจุบัน | แนวทางพัฒนาต่อ |
|---|---|---|
| Settings บางตัวเลือก | `Show completed tasks`, `Rain alerts` และ `Temperature unit` ยังเป็น UI ที่ไม่เชื่อมกับ Logic จริง ส่วน Appearance ใช้งานได้ | บันทึกค่าใน Storage และเชื่อมกับ Task List, Weather Warning และการแสดงอุณหภูมิ |
| Component / Integration Tests | ยังไม่มี UI Test | เพิ่ม `@testing-library/react-native` พร้อม Mock Reanimated, SVG และ Gesture Handler |
| Weather Theme Logic | `heroColor` และ `COLD_BELOW_C` ยังอยู่ใน Component | ย้ายไป `utils/weatherTheme.ts` เพื่อให้ทดสอบได้ |
| Location Selection | ตำแหน่งปัจจุบันกำหนดเป็นกรุงเทพฯ แม้ Store รองรับ `setLocation` แล้ว | เพิ่ม UI สำหรับค้นหาและเลือกเมืองผ่าน Open-Meteo Geocoding API |
| Duplicate Form Logic | ฟอร์ม Add (Flippable Notebook Card) และ Edit (TaskFormScreen) มี Logic ซ้ำกันบางส่วน | แยกเป็น `TaskForm` Component กลาง |
| Notifications | Overdue และ Weather Warning แสดงเฉพาะภายในแอป ยังไม่มี Push / Local Notifications | เพิ่มระบบ Local Notifications สำหรับแจ้งเตือนงานและสภาพอากาศ |
| Android Testing | ทดสอบบน iOS เท่านั้น | ทดสอบ DateTimePicker, Shadow และ Animation บน Android |
| Screen Responsiveness | ทดสอบกับ iPhone ขนาดทั่วไป ยังไม่ครอบคลุมจอขนาดเล็กมากและ iPad | ปรับ Layout และทดสอบหลายขนาดหน้าจอ |
| Accessibility | มี Label และ Role ในปุ่มหลักบางส่วนแล้ว แต่ยังไม่ได้ทดสอบอย่างจริงจัง | ตรวจสอบด้วย VoiceOver และ TalkBack |
| DateTimePicker Locale | ปีที่แสดงอาจเป็น พ.ศ. ตามการตั้งค่าภูมิภาคของอุปกรณ์ | พิจารณากำหนดรูปแบบวันที่ให้สอดคล้องกัน |

### Known Constraints

- ข้อมูล Task จัดเก็บภายในอุปกรณ์เท่านั้น ยังไม่รองรับการ Sync ข้ามอุปกรณ์
- เมื่อเปิดแอปครั้งแรก อาจเห็น Theme ตาม System ชั่วคราวก่อนโหลดค่าที่บันทึกไว้

---

**หมายเหตุ:** ฟีเจอร์เพิ่มเติมบางส่วนยังไม่มี Component Test หรือ Integration Test โดยได้ระบุวิธีทดสอบและข้อจำกัดไว้ตามจริง ส่วนการทดสอบบน UI และพฤติกรรมของ Native Components ใช้ Manual Test บน iOS เป็นหลัก