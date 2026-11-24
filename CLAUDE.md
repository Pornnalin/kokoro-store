@AGENTS.md

# กฎของโปรเจ็ค

- ใช้ Next.js (อ่านคู่มือใน `node_modules/next/dist/docs/` ก่อนเขียนโค้ด)
- ใช้ TypeScript เท่านั้น
- **ห้ามใช้ `any`** (ใช้ type ที่เหมาะสม, `unknown`, หรือ generics แทน)
- ใช้ Tailwind CSS สำหรับ styling
- **ห้ามแก้ไขไฟล์/โค้ดเองโดยไม่ได้รับอนุญาต**
- ถ้าผู้ใช้ "ถาม" ให้อธิบายวิธีแก้เท่านั้น ห้ามลงมือแก้ จนกว่าผู้ใช้จะสั่งให้แก้
- **commit ได้** (เมื่อผู้ใช้สั่ง) แต่ **ห้าม push** ทุกกรณี ให้ผู้ใช้ push เอง
- **ห้ามใส่ชื่อ Claude ใน author** ไม่ต้องเติมบรรทัด `Co-Authored-By` หรือ `Generated with Claude Code` ในข้อความ commit/PR

แผนของโปรเจ็คอยู่ที่ @PLAN.md
