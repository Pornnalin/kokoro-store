// ราคาใน DB เป็นสตางค์ แปลงเป็น "฿15.00" ตอนแสดงผล
export function formatPrice(satang: number) {
  return (satang / 100).toLocaleString('th-TH', { style: 'currency', currency: 'THB' })
}
