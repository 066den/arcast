'use client'

import { Users, MapPin, Star } from 'lucide-react'
import { Studio } from '../../types'

interface StudioCardProps {
  studio: Studio
  isSelected: boolean
  onClick: (id: string) => void
}

export function StudioCard({ studio, isSelected, onClick }: StudioCardProps) {
  const handleClick = () => {
    onClick(studio.id)
  }

  return (
    <div
      className={`p-6 border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg ${
        isSelected
          ? 'border-blue-500 bg-blue-50 bg-blue-900/20 shadow-lg'
          : 'border-slate-200 hover:border-slate-300 bg-white bg-slate-800'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-xl text-slate-900 text-white mb-2">
            {studio.name}
          </h3>
          <p className="text-slate-600 text-slate-300 text-sm leading-relaxed">
            {studio.description}
          </p>
        </div>
        {isSelected && (
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-slate-600 text-slate-300">
          <Users className="h-4 w-4" />
          <span>Capacity: {studio.capacity} people</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600 text-slate-300">
          <MapPin className="h-4 w-4" />
          <span>Location: {studio.location}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600 text-slate-300">
          <Star className="h-4 w-4" />
          <span>Rating: 4.8/5</span>
        </div>
      </div>
    </div>
  )
}
