'use client'
import { motion } from 'framer-motion'
import { Card, CardHeader } from '../ui/card'
import { BusinessIcon } from '../ui/icons'
import businessCard from '@/data/businessCard.json'
import { containerVariants, cardVariants } from '@/lib/motion-variants'

const BusinessCardSection = () => {
  return (
    <section className="lg:py-12 py-6 space-y-6">
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 lg:gap-y-6 lg:gap-x-16 gap-4 max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {businessCard.map(card => (
          <motion.div key={card.title} variants={cardVariants}>
            <Card className="rounded-[1.25em] shadow-lg border-none h-full">
              <CardHeader>
                <div className="flex items-center gap-6">
                  <div className="p-6 bg-input rounded-[1.25em]">
                    <BusinessIcon
                      name={card.icon}
                      className="fill-accent size-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl">{card.title}</h3>
                    <p className="text-base">{card.description}</p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </motion.div>
      <p className="text-center font-nunito-sans py-4">
        Limited time slots available each month
      </p>
    </section>
  )
}

export default BusinessCardSection
