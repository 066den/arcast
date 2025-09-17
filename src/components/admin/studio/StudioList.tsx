'use client'
import { Card, CardContent, CardHeader } from '../../ui/card'
import { Studio } from '@/types'
import StudioItem from './StudioItem'
import { Button } from '../../ui/button'
import { Plus } from 'lucide-react'
import { useStudios } from '@/hooks/storeHooks/useStudios'
import { useEffect } from 'react'
import { motion } from 'motion/react'
import { containerVariants, itemVariants } from '@/lib/motion-variants'
import useFlag from '@/hooks/useFlag'
import AddStudioModal from './AddStudioModal'
import { Preloader } from '@/components/ui/preloader'

interface StudioListProps {
  initialStudios: Studio[]
}

const StudioList = ({ initialStudios }: StudioListProps) => {
  const { studios, setStudios, isLoading, fetchStudios } = useStudios()

  const [isAddStudioModalOpen, openAddStudioModal, closeAddStudioModal] =
    useFlag()

  const handleAddStudio = () => {
    openAddStudioModal()
  }

  useEffect(() => {
    setStudios(initialStudios)
    if (studios.length === 0) {
      fetchStudios()
    }
  }, [initialStudios, setStudios, fetchStudios, studios.length])

  return (
    <Card className="px-4 h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Studios</h1>
        <Button
          variant="destructive"
          size="md"
          disabled={isLoading}
          onClick={handleAddStudio}
        >
          {isLoading ? (
            'Processing...'
          ) : (
            <>
              <Plus className="w-4 h-4" /> Add New Studio
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent className="flex-1">
        {isLoading ? (
          <div className="p-4 h-full flex items-center justify-center">
            <Preloader variant="wave" size="lg" text="Processing data..." />
          </div>
        ) : studios.length > 0 || initialStudios.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 xl:grid-cols-2 gap-4"
          >
            {(studios.length > 0 ? studios : initialStudios).map(studio => (
              <motion.div key={studio.id} variants={itemVariants}>
                <StudioItem key={studio.id} studio={studio} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg text-muted-foreground mb-2">
                No studios found
              </p>
              <p className="text-sm text-muted-foreground">
                Click &quot;Add New Studio&quot; to create your first studio
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <AddStudioModal
        isOpen={isAddStudioModalOpen}
        onClose={closeAddStudioModal}
      />
    </Card>
  )
}

export default StudioList
