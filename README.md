# TaskWeatherApp

> สถานะ: 🚧 อยู่ระหว่างพัฒนา (อัปเดตล่าสุด 9 พ.ย. 2569)

## 1. วิธีการติดตั้งและรันโปรเจกต์

### เวอร์ชันที่ใช้
| เครื่องมือ | เวอร์ชัน |
|---|---|
| React Native | 0.88.1 |
| Node | _(รัน `node -v`)_ |
| Xcode | _(รัน `xcodebuild -version`)_ |
| Ruby | _(รัน `ruby -v`)_ |
| iOS Simulator | iPhone 16 Pro (iOS 18.6) |

### คำสั่ง
```bash
git clone https://github.com/eyephtr/TaskWeatherApp.git
cd TaskWeatherApp
npm install
bundle install
cd ios && bundle exec pod install && cd ..
npm start          # เทอร์มินัลที่ 1 (Metro)
npm run ios        # เทอร์มินัลที่ 2
```

### หมายเหตุการตั้งค่า
- `ios/Podfile` มีโค้ดใน `post_install` ที่ยก deployment target ของ pod ที่ต่ำกว่า iOS 15.0 ให้เป็น 15.1 เนื่องจาก Xcode เวอร์ชันนี้ไม่รองรับ target ต่ำกว่านั้น (พบกับ AsyncStorage)
- Reanimated 4 ต้องใช้ `react-native-worklets` และต้องใส่ `'react-native-worklets/plugin'` เป็นลำดับสุดท้ายใน `babel.config.js`
- Weather API: Open-Meteo ไม่ต้องใช้ API Key

## 2. โครงสร้างของโปรเจกต์

```
src/
  navigation/   การนำทาง (Tab + Stack)
  screens/      หน้าจอ (UI เท่านั้น)
  components/   คอมโพเนนต์ที่ใช้ซ้ำ
  store/        State และ business logic (Zustand)
  services/     การเรียก API ภายนอก (Weather) และ cache
  storage/      ชั้นเข้าถึงข้อมูลถาวร (AsyncStorage wrapper)
  types/        TypeScript types
  utils/        ฟังก์ชันช่วยเหลือ (pure functions)
  theme/        สี/ระยะ/ฟอนต์ และ ThemeProvider (light/dark)
```

## 3. เหตุผลในการเลือกใช้เทคโนโลยี

_(เติมระหว่างทำ ตอนนี้บันทึกไว้เบื้องต้น)_

- **React Navigation**: เป็นมาตรฐานของ React Native รองรับทั้ง Tab และ Stack ตามโจทย์
- **Zustand**: เบา โค้ดน้อย แยก logic ออกจาก UI ได้ง่าย และทดสอบ store ได้โดยไม่ต้อง render
- **AsyncStorage**: โจทย์ไม่ได้กำหนดชนิดของ storage ข้อมูลเป็น list ขนาดเล็ก ไม่จำเป็นต้องใช้ฐานข้อมูล โดยห่อด้วย wrapper เพื่อสลับไปใช้ตัวอื่นได้ภายหลัง
- **Open-Meteo**: ไม่ต้องใช้ API Key ลดขั้นตอนการตั้งค่าของผู้ตรวจ
- **Theme tokens**: รวมสีไว้ที่เดียว ทำให้รองรับ dark mode ได้โดยไม่ต้องแก้ทีละหน้า

## 4. ขอบเขตงานที่ยังไม่แล้วเสร็จและแผนการดำเนินการต่อ

_(ส่วนนี้จะอัปเดตทุกวันตลอดการทำงาน)_

| รายการ | สถานะ | หมายเหตุ / แผนต่อ |
|---|---|---|
| ส่วน Task (CRUD, กรอง, ค้นหา, persist) | ยังไม่เริ่ม | |
| ส่วน Weather (3 สถานะ, cache 10 นาที) | ยังไม่เริ่ม | |
| Unit test | ยังไม่เริ่ม | |
| ฟีเจอร์เสริม | ยังไม่เริ่ม | |