'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { aboutFeatures } from '@/lib/config'
import {
  containerVariants,
  itemVariants,
  textVariants,
} from '@/lib/motion-variants'

const AboutSection = () => {
  return (
    <motion.section
      className="py-6 xl:py-14"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
    >
      <motion.div className="section-title" variants={itemVariants}>
        why arcast
      </motion.div>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 mb-8 xl:mb-16"
        variants={containerVariants}
      >
        <motion.div className="max-w-2xs" variants={itemVariants}>
          <motion.div
            className="lg:text-7xl text-5xl font-medium py-4"
            variants={textVariants}
          >
            40K+
          </motion.div>
          <motion.p className="text-secondary" variants={itemVariants}>
            and counting hours of
            <br /> production already completed successfully.
          </motion.p>
        </motion.div>
        <motion.h3
          className="md:col-span-3 max-w-5xl lg:px-10"
          variants={textVariants}
        >
          We provided solid technical and creative background for the talents.
          <br />
          All you need is just to bring your ideas{' '}
          <span className="text-accent">and we will do the rest!</span>
        </motion.h3>
      </motion.div>
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        variants={containerVariants}
      >
        {aboutFeatures.map(feature => (
          <motion.div
            key={feature.title}
            className="grid grid-rows-2 overflow-hidden rounded-3xl transition-all hover:shadow-md"
            variants={itemVariants}
          >
            <div
              className="flex flex-col justify-end text-white font-nunito-sans font-bold text-xl tracking-tight px-6 py-4 bg-cover bg-center"
              style={{ backgroundImage: `url(${feature.image})` }}
            >
              {feature.title}
            </div>
            <div className="bg-muted p-6 pb-5">
              <p className="mb-4">{feature.description}</p>
              <Link
                href={feature.url}
                className="font-medium underline underline-offset-2"
              >
                Learn more
              </Link>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  )
}

export default AboutSection
