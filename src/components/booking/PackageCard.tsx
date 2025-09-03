'use client'

import { PackagePerk, StudioPackage } from '../../types'
import { Check } from 'lucide-react'

interface PackageCardProps {
  pkg: StudioPackage
  isSelected: boolean
  onClick: () => void
}

export function PackageCard({ pkg, isSelected, onClick }: PackageCardProps) {
  return (
    <div
      className={`p-6 border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
          : 'border-slate-200 hover:border-slate-300 bg-white dark:bg-slate-800'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-xl text-slate-900 dark:text-white">
              {pkg.name}
            </h3>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            {pkg.description}
          </p>
        </div>
        {isSelected && (
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center ml-4">
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

      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {pkg.price_per_hour}
          </span>
          <span className="text-slate-500 text-lg">{pkg.currency}/hour</span>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-slate-900 dark:text-white text-sm">
          Includes:
        </h4>
        <ul className="space-y-2">
          {pkg.packagePerks.map((perk: PackagePerk, index: number) => (
            <li
              key={index}
              className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"
            >
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>{perk.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
