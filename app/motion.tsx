'use client'

import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react'

// แอนิเมชันหน้าแรกด้วย Motion (motion.dev) ปิดเองถ้าผู้ใช้ตั้ง reduced motion
const ease = [0.22, 1, 0.36, 1] as const
const viewport = { once: true, margin: '-80px' }

// เลื่อนขึ้น + เฟดเข้า ตอนโหลดหน้า หน่วงตาม delay (ใช้กับ hero)
export function Rise({ delay = 0, ...props }: HTMLMotionProps<'div'> & { delay?: number }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease, delay }}
      {...props}
    />
  )
}

// เลื่อนขึ้น + เฟดเข้า เมื่อเลื่อนมาถึง (ครั้งเดียว)
export function Reveal({ delay = 0, ...props }: HTMLMotionProps<'div'> & { delay?: number }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ duration: 0.7, ease, delay }}
      {...props}
    />
  )
}

// รายการที่โผล่ไล่ทีละใบ
export function Stagger(props: HTMLMotionProps<'ul'>) {
  const reduce = useReducedMotion()
  return (
    <motion.ul
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={viewport}
      variants={{ show: { transition: { staggerChildren: 0.09 } } }}
      {...props}
    />
  )
}

export function StaggerItem({ lift = false, ...props }: HTMLMotionProps<'li'> & { lift?: boolean }) {
  return (
    <motion.li
      variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }}
      whileHover={lift ? { y: -4, boxShadow: '0 8px 24px rgb(23 23 21 / 0.08)' } : undefined}
      {...props}
    />
  )
}
