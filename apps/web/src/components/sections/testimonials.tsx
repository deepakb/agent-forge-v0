import Image from 'next/image'
import { Container } from '@/components/ui/container'

const testimonials = [
  {
    quote: "Agent Forge has transformed how we handle customer service. The AI agents are incredibly effective.",
    author: "Sarah Chen",
    role: "CTO at TechCorp",
    avatar: "/testimonials/avatar1.svg"
  },
  {
    quote: "The enterprise features and security compliance made the decision to adopt Agent Forge easy.",
    author: "Michael Rodriguez",
    role: "Head of AI at Enterprise Co",
    avatar: "/testimonials/avatar2.svg"
  },
  {
    quote: "We've seen a 300% improvement in our data processing efficiency since implementing Agent Forge.",
    author: "Emily Thompson",
    role: "Data Science Lead at DataTech",
    avatar: "/testimonials/avatar3.svg"
  }
]

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-background">
      <Container>
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Trusted by Innovators
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what industry leaders are saying about Agent Forge
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-card rounded-lg p-6 border">
              <blockquote className="space-y-6">
                <p className="text-muted-foreground">"{testimonial.quote}"</p>
                <footer className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <cite className="not-italic font-semibold">{testimonial.author}</cite>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </footer>
              </blockquote>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
