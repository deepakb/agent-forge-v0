'use client'

import * as React from "react"
import useEmblaCarousel from 'embla-carousel-react'
import AutoPlay from 'embla-carousel-autoplay'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Product = {
  title: string
  description: string
  features: string[]
  metrics: Array<{ label: string; value: string }>
  status: string
  statusVariant: "success" | "info" | "warning"
}

const products: Product[] = [
  {
    title: "Agent Orchestration Engine",
    description: "Enterprise-grade agent orchestration with advanced state management, real-time monitoring, and fault tolerance. Built for high-reliability and scalability.",
    features: ["State Management", "Real-time Monitoring", "Fault Tolerance", "Event-driven Architecture"],
    metrics: [
      { label: "Reliability", value: "99.99%" },
      { label: "Scalability", value: "∞" },
    ],
    status: "GA",
    statusVariant: "success",
  },
  {
    title: "Workflow Management System",
    description: "Sophisticated workflow orchestration with dependency management, parallel execution, and comprehensive error handling. Perfect for complex enterprise workflows.",
    features: ["Dependency Resolution", "Parallel Execution", "Error Recovery", "Progress Tracking"],
    metrics: [
      { label: "Step Recovery", value: "100%" },
      { label: "Concurrency", value: "N+1" },
    ],
    status: "Beta",
    statusVariant: "info",
  },
  {
    title: "Enterprise Integration Hub",
    description: "Secure communication layer with built-in message routing, state persistence, and enterprise-grade logging. Includes Redis-backed state management and OpenAI integration.",
    features: ["Message Routing", "State Persistence", "OpenAI Integration", "Redis Support"],
    metrics: [
      { label: "Message Rate", value: "10K/s" },
      { label: "Data Safety", value: "100%" },
    ],
    status: "Preview",
    statusVariant: "warning",
  },
]

export function ProductCarousel() {
  // Initialize autoplay plugin
  const [autoplayRef] = React.useState(() => 
    AutoPlay({ 
      delay: 5000, 
      stopOnInteraction: false,
      stopOnMouseEnter: false,
      rootNode: (emblaRoot) => emblaRoot.parentElement,
    })
  )

  // Initialize carousel
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: 'center',
      skipSnaps: false,
      dragFree: false,
    },
    [autoplayRef]
  )

  const [prevBtnDisabled, setPrevBtnDisabled] = React.useState(true)
  const [nextBtnDisabled, setNextBtnDisabled] = React.useState(true)
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollPrev()
    }
  }, [emblaApi])

  const scrollNext = React.useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollNext()
    }
  }, [emblaApi])

  const scrollTo = React.useCallback((index: number) => {
    if (emblaApi) {
      emblaApi.scrollTo(index)
    }
  }, [emblaApi])

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return

    setSelectedIndex(emblaApi.selectedScrollSnap())
    setPrevBtnDisabled(!emblaApi.canScrollPrev())
    setNextBtnDisabled(!emblaApi.canScrollNext())
  }, [emblaApi])

  React.useEffect(() => {
    if (!emblaApi) return

    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)

    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  return (
    <div className="relative w-full px-4 sm:px-6">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4">
          {products.map((product, index) => (
            <div 
              key={index}
              className="flex-[0_0_100%] min-w-0 pl-4"
            >
              <div className="rounded-lg border border-white/10 bg-white/5 p-8 hover:bg-white/[0.07] transition-colors min-h-[360px]">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-white">
                      {product.title}
                    </h3>
                    <Badge variant={product.statusVariant}>
                      {product.status}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-base text-gray-300 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    {product.metrics.map((metric, idx) => (
                      <div key={idx} className="bg-white/5 rounded-lg p-3 text-center">
                        <div className="text-lg font-semibold text-white">
                          {metric.value}
                        </div>
                        <div className="text-sm text-gray-400">
                          {metric.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2">
                    {product.features.map((feature, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="bg-white/5 hover:bg-white/10 text-blue-200 border-white/10"
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex gap-1.5">
          {products.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollTo(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === selectedIndex 
                  ? 'w-8 bg-blue-500' 
                  : 'w-1.5 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={scrollPrev}
            disabled={prevBtnDisabled}
            className="h-8 w-8 border-0 bg-white/5 hover:bg-white/10 text-white rounded-full disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            disabled={nextBtnDisabled}
            className="h-8 w-8 border-0 bg-white/5 hover:bg-white/10 text-white rounded-full disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
