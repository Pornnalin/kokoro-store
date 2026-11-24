# Kokoro Stationery

ร้านขายอุปกรณ์เครื่องเขียนออนไลน์ ทำเป็นผลงานพอร์ตโฟลิโอ เพื่อฝึกออกแบบและเขียน API ด้วย Next.js ครอบคลุม flow การซื้อของตั้งแต่เลือกสินค้า ใส่ตะกร้า สร้างออเดอร์ ไปจนถึงจ่ายเงิน

> การจ่ายเงินเป็นการ**จำลอง** ไม่ได้เชื่อมต่อ payment gateway จริง

**Demo:** https://nextjs-store-tan.vercel.app

<!-- ใส่ screenshot หรือ GIF ของ flow สินค้า → ตะกร้า → จ่ายเงิน -->

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router, Cache Components, Partial Prerendering)
- TypeScript, Tailwind CSS 4, [motion](https://motion.dev)
- [Neon](https://neon.tech) (Postgres) ผ่าน `@neondatabase/serverless`
- Deploy บน Vercel (Vercel Analytics, GA4)

## ฟีเจอร์

**หน้าบ้าน**
- หน้าสินค้า: ค้นหาชื่อ กรองหมวดและช่วงราคา เฉพาะที่มีสต็อก เรียงลำดับ และเพิ่มลงตะกร้าได้ทันที
- หน้ารายละเอียดสินค้า, ตะกร้า, จ่ายเงิน
- หน้าแรก, เกี่ยวกับเรา, ติดต่อเรา

**หลังบ้าน (API)**

| Method | Path | หน้าที่ |
| --- | --- | --- |
| GET | `/api/products` | รายการสินค้า (`?category=<slug>`) |
| GET | `/api/products/[slug]` | สินค้าชิ้นเดียว |
| GET | `/api/categories` | หมวดสินค้า |
| GET / POST / PATCH / DELETE | `/api/cart` | ดู เพิ่ม แก้จำนวน ลบสินค้าในตะกร้า |
| POST | `/api/checkout` | สร้างออเดอร์ (pending) จากตะกร้า |
| POST | `/api/orders/[id]/pay` | จ่ายเงินจำลอง (`promptpay`, `card`, `cod`) |
| POST | `/api/contact` | ส่งข้อความติดต่อ |

ราคาทั้งหมดเก็บเป็น**สตางค์** (จำนวนเต็ม) เพื่อเลี่ยงปัญหาทศนิยม

## จุดที่น่าสนใจทางเทคนิค

- **Checkout ปลอดภัยเรื่องสต็อก:** ทำใน transaction เดียว ล็อกแถวสินค้าด้วย `for update` (เรียงตาม id กัน deadlock) เช็กสต็อกก่อนตัด แล้วล้างตะกร้า คำขอที่ชนกันจึงไม่ตัดสต็อกเกิน
- **คืนสต็อกอัตโนมัติ:** ออเดอร์ที่ยังไม่เลือกวิธีจ่ายเกิน 30 นาทีจะถูกยกเลิกและคืนสต็อกตอน checkout ครั้งถัดไป โดยไม่ต้องมีตัวตั้งเวลา และไม่คืนซ้ำเมื่อคำขอชนกัน
- **Rate limit:** นับต่อ IP แบบ fixed window เก็บใน Neon ไม่ต้องใช้บริการเพิ่ม
- **ตะกร้าผูกกับ cookie** ไม่ต้องสมัครสมาชิก
- **Validation ที่ขอบ API** และ security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`)
- SEO: `robots.ts`, `sitemap.ts`, metadata ต่อหน้า

## เริ่มใช้งาน

ต้องมี Node.js และฐานข้อมูล Neon (หรือ Postgres ที่เข้ากันได้)

```bash
npm install
```

สร้างไฟล์ `.env.local`

```bash
DATABASE_URL=postgres://user:password@host/dbname
```

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

| คำสั่ง | ทำอะไร |
| --- | --- |
| `npm run dev` | รัน dev server |
| `npm run build` | build สำหรับ production |
| `npm run start` | รัน production build |
| `npm run lint` | ตรวจโค้ดด้วย ESLint |

### ฐานข้อมูล

โค้ดใช้ตาราง `categories`, `products`, `cart_items`, `orders`, `order_items` และ `rate_limits` ผู้ที่ clone ไปรันต้องสร้างตารางเหล่านี้เอง

## โครงสร้างโปรเจ็ค

```
app/            หน้าเว็บ (App Router) และ API routes ใน app/api
lib/            db, ตะกร้า, query สินค้า, rate limit, types
public/img/     รูปสินค้า
PLAN.md         แผนของโปรเจ็ค
```
