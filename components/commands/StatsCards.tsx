// import React from 'react'
// import { Card } from '@/components/ui/card'

// interface StatCardProps {
//   title: string
//   value: string | number
//   change: number
//   icon: React.ReactNode
// }

// export function StatCard({ title, value, change, icon }: StatCardProps) {
//   const isPositive = change >= 0
  
//   return (
//     <Card className="p-6">
//       <div className="flex items-start justify-between">
//         <div className="flex-1">
//           <p className="text-sm font-medium text-muted-foreground">{title}</p>
//           <h3 className="mt-2 text-2xl font-bold">{value}</h3>
//           <p className={`mt-1 text-sm font-medium ${
//             isPositive ? 'text-green-600' : 'text-red-600'
//           }`}>
//             {isPositive ? '+' : ''}{change}% from last month
//           </p>
//         </div>
//         <div className="text-3xl text-muted-foreground opacity-50">
//           {icon}
//         </div>
//       </div>
//     </Card>
//   )
// }
'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { motion, Variants } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change: number
  icon: React.ReactNode
  delay?: number
}

export function StatCard({ title, value, change, icon, delay = 0 }: StatCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const isPositive = change >= 0
  
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay,
        ease: [0.34, 1.56, 0.64, 1],
      },
    },
  }

  const iconVariants: Variants = {
    initial: { scale: 1, rotate: 0 },
    hover: {
      scale: 1.2,
      rotate: 12,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10,
      },
    },
  }

  const valueVariants: Variants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.08,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 15,
      },
    },
  }

  const trendVariants = {
    initial: { x: 0, opacity: 0.7 },
    hover: {
      x: 4,
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="relative overflow-hidden p-6 transition-colors duration-300 hover:bg-accent/50">
        {/* Animated gradient background on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Glowing orb effect */}
        <motion.div
          className="absolute -top-8 -right-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none"
          animate={{
            x: isHovered ? -10 : 0,
            y: isHovered ? -10 : 0,
            scale: isHovered ? 1.2 : 1,
          }}
          transition={{ duration: 0.4 }}
        />

        <div className="relative z-10 flex items-start justify-between">
          <div className="flex-1">
            <motion.p
              className="text-sm font-medium text-muted-foreground uppercase tracking-wide"
              animate={{ letterSpacing: isHovered ? '0.05em' : '0em' }}
              transition={{ duration: 0.3 }}
            >
              {title}
            </motion.p>

            <motion.h3
              className="mt-2 text-4xl font-bold text-foreground"
              variants={valueVariants}
              initial="initial"
              animate={isHovered ? 'hover' : 'initial'}
            >
              {value}
            </motion.h3>

            <motion.div
              className="mt-3 flex items-center gap-1"
              variants={trendVariants}
              initial="initial"
              animate={isHovered ? 'hover' : 'initial'}
            >
              <span
                className={`text-sm font-semibold flex items-center gap-1 ${
                  isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}
              >
                {isPositive ? (
                  <>
                    <motion.span
                      animate={isHovered ? { rotate: 360, y: -2 } : { rotate: 0, y: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      <TrendingUp size={16} />
                    </motion.span>
                    +{change}%
                  </>
                ) : (
                  <>
                    <motion.span
                      animate={isHovered ? { rotate: 360, y: 2 } : { rotate: 0, y: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      <TrendingDown size={16} />
                    </motion.span>
                    {change}%
                  </>
                )}
              </span>
              <span className="text-xs text-muted-foreground">from last month</span>
            </motion.div>
          </div>

          <motion.div
            className="text-5xl opacity-70"
            variants={iconVariants}
            initial="initial"
            animate={isHovered ? 'hover' : 'initial'}
          >
            {icon}
          </motion.div>
        </div>

        {/* Border glow on hover */}
        <motion.div
          className="absolute inset-0 rounded-lg border border-primary/20 pointer-events-none"
          animate={{
            borderColor: isHovered ? 'rgba(var(--primary), 0.4)' : 'rgba(var(--primary), 0.1)',
            boxShadow: isHovered
              ? '0 0 20px rgba(var(--primary), 0.1)'
              : '0 0 0px rgba(var(--primary), 0)',
          }}
          transition={{ duration: 0.3 }}
        />
      </Card>
    </motion.div>
  )
}
