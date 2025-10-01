'use client'
import { motion } from 'framer-motion'
import { CaseStudy } from '@/types'
import CaseStudyCard from './CaseStudyCard'
import { cardVariants, containerVariants } from '@/lib/motion-variants'

interface CaseStudiesListProps {
  cases: CaseStudy[]
}

const CaseStudiesList = ({ cases }: CaseStudiesListProps) => {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {cases.map(caseStudy => (
        <motion.div key={caseStudy.id} variants={cardVariants}>
          <CaseStudyCard caseStudy={caseStudy} />
        </motion.div>
      ))}
    </motion.div>
  )
}

export default CaseStudiesList
