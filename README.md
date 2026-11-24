# Kokoro Stationery

ร้านขายอุปกรณ์เครื่องเขียนออนไลน์ ทำเป็นผลงานพอร์ตโฟลิโอ เพื่อฝึกออกแบบและเขียน API ด้วย Next.js ครอบคลุม flow การซื้อของตั้งแต่เลือกสินค้า ใส่ตะกร้า สร้างออเดอร์ ไปจนถึงจ่ายเงิน

**Demo:** https://kokoro-store.vercel.app

> การจ่ายเงินเป็นการ**จำลอง** ไม่มีการตัดเงินจริง ลองสั่งซื้อได้เลยโดยไม่ต้องสมัครสมาชิก
> ข้อมูล demo (ออเดอร์ ตะกร้า สต็อก) จะถูกล้างและเติมใหม่อัตโนมัติทุกวัน

## ภาพหน้าจอ

| หน้าแรก | สินค้าทั้งหมด |
| --- | --- |
| ![หน้าแรก](docs/screenshots/home.png) | ![สินค้าทั้งหมด](docs/screenshots/products.png) |

![รายละเอียดสินค้า](docs/screenshots/product.png)

### ขั้นตอนสั่งซื้อและจ่ายเงิน

| ตะกร้า | ข้อมูลจัดส่ง |
| --- | --- |
| ![ตะกร้า](docs/screenshots/cart.png) | ![ข้อมูลจัดส่ง](docs/screenshots/checkout.png) |

| เลือกวิธีชำระเงิน | เสร็จสิ้น |
| --- | --- |
| ![เลือกวิธีชำระเงิน](docs/screenshots/payment.png) | ![ชำระเงินสำเร็จ](docs/screenshots/success.png) |

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router, Route Handlers, Cache Components, Partial Prerendering)
- TypeScript, Tailwind CSS 4, [motion](https://motion.dev)
- [Neon](https://neon.tech) (Postgres) ผ่าน `@neondatabase/serverless`
- Deploy บน Vercel พร้อม Vercel Cron, Vercel Analytics และ GA4
- Cloudflare Turnstile กันบอท
- ทดสอบด้วย test runner ที่มากับ Node (`node:test`) ไม่มี dependency เพิ่ม

## ฟีเจอร์

**หน้าบ้าน**
- หน้าสินค้า: ค้นหาชื่อ กรองหมวดและช่วงราคา เฉพาะที่มีสต็อก เรียงลำดับ และเพิ่มลงตะกร้าได้ทันที
- หน้ารายละเอียดสินค้า, ตะกร้า, checkout 3 ขั้น (ข้อมูลจัดส่ง → เลือกวิธีจ่าย → เสร็จสิ้น)
- หน้าแรก, เกี่ยวกับเรา, ติดต่อเรา (ฟอร์มพร้อมขอความยินยอมเก็บข้อมูล)
- แบนเนอร์ขอความยินยอมคุกกี้ เปลี่ยนใจได้จากปุ่ม "ตั้งค่าคุกกี้" ใน footer

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
| GET | `/api/cron/cleanup` | ล้างข้อมูล demo รายวัน (เรียกโดย Vercel Cron เท่านั้น) |

ราคาทั้งหมดเก็บเป็น**สตางค์** (จำนวนเต็ม) เพื่อเลี่ยงปัญหาทศนิยม

## จุดที่น่าสนใจทางเทคนิค

**ความถูกต้องของข้อมูล**
- **Checkout ไม่ตัดสต็อกเกิน:** ทำใน transaction เดียว ล็อกแถวสินค้าด้วย `select ... for update` (เรียงตาม id กัน deadlock) เช็กสต็อกก่อนตัด สร้างออเดอร์ แล้วล้างตะกร้า ถ้ามีคนซื้อตัดหน้า อีกคนจะได้ 409 แทนที่จะได้ของที่ไม่มีอยู่จริง
- **คืนสต็อกอัตโนมัติ:** ออเดอร์ที่ยังไม่เลือกวิธีจ่ายเกิน 30 นาทีจะถูกยกเลิกและคืนสต็อกตอน checkout ครั้งถัดไป ไม่ต้องมีตัวตั้งเวลา และใช้ `update ... returning` จึงไม่คืนซ้ำเมื่อคำขอชนกัน
- **ออเดอร์เก็บชื่อและราคา ณ ตอนสั่ง** แก้ราคาสินค้าภายหลังไม่กระทบออเดอร์เก่า
- **จ่ายเงินซ้ำไม่ได้:** เปลี่ยนสถานะด้วย `where status = 'pending'` ครั้งที่สองได้ 409

**ความปลอดภัยและกันบอท**
- **Validation ที่ขอบ API** ทุก route ไม่เชื่อข้อมูลจากฝั่ง client (ราคาและยอดรวมคำนวณใหม่ฝั่งเซิร์ฟเวอร์)
- **Rate limit ต่อ IP** แบบ fixed window เก็บใน Neon ไม่ต้องใช้บริการเพิ่ม
- **Cloudflare Turnstile** ที่ checkout และฟอร์มติดต่อ ยืนยัน token ฝั่งเซิร์ฟเวอร์ และปฏิเสธทุกคำขอถ้า production ไม่ได้ตั้ง secret
- **Security headers** (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`) และ cookie ตะกร้าเป็น `httpOnly`
- **GA4 โหลดหลังได้รับความยินยอมเท่านั้น** (PDPA) ส่วน Vercel Analytics ไม่ใช้คุกกี้

**ดูแล demo ให้ใช้ได้ตลอด**
- จำกัด 5 ชิ้นต่อรายการ คนเดียว (หรือบอท) กวาดสต็อกหมดไม่ได้
- Vercel Cron วันละครั้งลบออเดอร์ที่เก่ากว่า 1 วัน ตะกร้าที่เก่ากว่า 7 วัน และเติมสต็อกให้ไม่ต่ำกว่า 50 ป้องกันด้วย `CRON_SECRET`

**อื่น ๆ**
- SEO: `robots.ts`, `sitemap.ts` (รวมหน้าสินค้าทุกชิ้น), metadata ต่อหน้า
- Integration test ครอบคลุม checkout สำเร็จ, ข้อมูลไม่ครบ, ตะกร้าว่าง, เพดานจำนวน, ซื้อตัดหน้า และจ่ายซ้ำ

**สิ่งที่ตั้งใจไม่ทำ**
- ระบบสมาชิก: ใช้ guest checkout แบบร้านทั่วไป ตะกร้าผูกกับ cookie
- Payment gateway จริง: จำลองการจ่ายเงินเพื่อโฟกัสที่ flow และความถูกต้องของข้อมูล

## เริ่มใช้งาน

ต้องมี Node.js และฐานข้อมูล Neon (หรือ Postgres ที่เข้ากันได้)

```bash
npm install
```

สร้างตารางด้วย [`db/schema.sql`](db/schema.sql) (รันใน Neon SQL Editor หรือ `psql "$DATABASE_URL" -f db/schema.sql`) ไฟล์นี้สร้างเฉพาะโครงตาราง ต้องเพิ่มข้อมูลหมวดและสินค้าเอง

สร้างไฟล์ `.env.local`

```bash
DATABASE_URL=postgres://user:password@host/dbname
```

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

### Environment variables

| ชื่อ | ใช้ที่ | จำเป็น |
| --- | --- | --- |
| `DATABASE_URL` | ทุกที่ | ✓ |
| `CRON_SECRET` | Vercel (production) ให้ cron เรียก `/api/cron/cleanup` ได้ สุ่มด้วย `openssl rand -hex 32` | production |
| `TURNSTILE_SECRET_KEY` | Vercel (production) ยืนยัน Cloudflare Turnstile ตอน dev ไม่ต้องใช้ (ใช้ test key และข้ามการยืนยัน) | production |

### คำสั่ง

| คำสั่ง | ทำอะไร |
| --- | --- |
| `npm run dev` | รัน dev server |
| `npm run build` | build สำหรับ production |
| `npm run start` | รัน production build |
| `npm run lint` | ตรวจโค้ดด้วย ESLint |
| `TEST_BASE_URL=http://localhost:3000 npm test` | integration test ของ checkout |

> test ยิง HTTP ไปที่เซิร์ฟเวอร์ที่รันอยู่ และอ่าน `DATABASE_URL` จาก `.env.local` ต้องเป็นฐานข้อมูลเดียวกับเซิร์ฟเวอร์ test สร้างออเดอร์และตัดสต็อกจริง ควรใช้ Neon branch แยกสำหรับทดสอบ และไม่ยอมรันกับโดเมน production

## โครงสร้างโปรเจ็ค

```
app/              หน้าเว็บ (App Router)
app/api/          API routes (สินค้า, ตะกร้า, checkout, จ่ายเงิน, ติดต่อ, cron)
lib/              db, ตะกร้า, query สินค้า, rate limit, Turnstile, types
db/schema.sql     โครงสร้างฐานข้อมูล
tests/            integration test ของ checkout
docs/screenshots/ ภาพหน้าจอใน README
public/img/       รูปสินค้า
vercel.json       ตั้งเวลา cron
```
