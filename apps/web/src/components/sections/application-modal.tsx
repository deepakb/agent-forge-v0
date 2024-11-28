'use client'

import Link from 'next/link'

type Application = {
  title: string
  price: string
  description: string
  features: string[]
  includes: string[]
  packageName: string
  demoUrl: string
  docsUrl: string
}

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  application: Application | null
}

export function ApplicationModal({ isOpen, onClose, application }: ModalProps) {
  if (!isOpen || !application) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold">{application.title}</h3>
              <div className="text-2xl font-bold text-blue-600 mt-2">{application.price}</div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-gray-600 mb-6">{application.description}</p>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-sm mb-3">Enterprise Features</h4>
              <ul className="grid grid-cols-2 gap-2">
                {application.features.map((feature) => (
                  <li key={feature} className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-3">Package Includes</h4>
              <ul className="grid grid-cols-2 gap-2">
                {application.includes.map((item) => (
                  <li key={item} className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <div className="text-sm font-mono p-3 bg-gray-50 rounded border border-gray-100">
                npx create-agent-forge-app --template {application.packageName}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href={application.demoUrl}
                  className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  View Demo
                </Link>
                <Link
                  href={application.docsUrl}
                  className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Documentation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
