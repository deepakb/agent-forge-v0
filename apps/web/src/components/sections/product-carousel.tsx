import * as React from "react"
import useEmblaCarousel, { EmblaCarouselType } from 'embla-carousel-react'
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
    title: "Agent Development Studio",
    description: "Build and test AI agents with our enterprise-grade development environment. Includes visual builder, real-time testing, and comprehensive debugging tools.",
    features: ["Visual Builder", "Real-time Testing", "Version Control", "Team Collaboration"],
    metrics: [
      { label: "Deployment Time", value: "↓60%" },
      { label: "Development Speed", value: "↑3x" },
    ],
    status: "GA",
    statusVariant: "success",
  },
  {
    title: "Deployment Platform",
    description: "Deploy and scale AI agents with enterprise-grade reliability and monitoring. Built-in observability, auto-scaling, and production safeguards.",
    features: ["Auto-scaling", "Monitoring", "Load Balancing", "Zero-downtime"],
    metrics: [
      { label: "Uptime", value: "99.99%" },
      { label: "Response Time", value: "<100ms" },
    ],
    status: "Beta",
    statusVariant: "info",
  },
  {
    title: "Enterprise Hub",
    description: "Access verified enterprise agents and components with compliance built-in. Includes security scanning, audit logs, and enterprise support.",
    features: ["Verified Agents", "Compliance", "Enterprise Support", "Audit Logs"],
    metrics: [
      { label: "Security Score", value: "A+" },
      { label: "Compliance", value: "SOC2" },
    ],
    status: "Preview",
    statusVariant: "warning",
  },
]

const autoplay = AutoPlay({ delay: 5000, stopOnInteraction: false })

export function ProductCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: 'center',
      dragFree: false,
    }, 
    [autoplay]
  )

  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(true)
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = React.useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index)
  }, [emblaApi])

  const onInit = React.useCallback((emblaApi: EmblaCarouselType) => {
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [])

  const onSelect = React.useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap())
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [])

  React.useEffect(() => {
    if (!emblaApi) return

    emblaApi.on('init', onInit)
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onInit)

    onInit(emblaApi)

    return () => {
      emblaApi.off('init', onInit)
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onInit)
    }
  }, [emblaApi, onInit, onSelect])

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {products.map((product, index) => (
            <div 
              key={index} 
              className="flex-[0_0_100%] min-w-0 pl-4 relative"
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
            disabled={!canScrollPrev}
            className="h-8 w-8 border-0 bg-white/5 hover:bg-white/10 text-white rounded-full disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="h-8 w-8 border-0 bg-white/5 hover:bg-white/10 text-white rounded-full disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
