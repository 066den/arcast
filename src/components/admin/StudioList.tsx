'use client'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Studio } from '@/types'
import StudioItem from './StudioItem'
import { Button } from '../ui/button'
import { Plus } from 'lucide-react'
import { useStudios } from '@/hooks/storeHooks/useStudios'
import { useEffect } from 'react'
import { motion } from 'motion/react'
import { containerVariants, itemVariants } from '@/lib/variants'

interface StudioListProps {
  initialStudios: Studio[]
}

const StudioList = ({ initialStudios }: StudioListProps) => {
  const { studios, setStudios, isLoading, fetchStudios } = useStudios()

  useEffect(() => {
    setStudios(initialStudios)
    fetchStudios()
  }, [initialStudios, setStudios, fetchStudios])

  return (
    <Card className="px-4 h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Studios</h1>
        <Button variant="destructive" size="md">
          <Plus className="w-4 h-4" /> Add New Studio
        </Button>
      </CardHeader>
      <CardContent>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 xl:grid-cols-2 gap-4"
        >
          {studios.map(studio => (
            <motion.div key={studio.id} variants={itemVariants}>
              <StudioItem key={studio.id} studio={studio} />
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  )
}

export default StudioList
