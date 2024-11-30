import Image from 'next/image'
import { Container } from '@/components/ui/container'

const testimonials = [
  {
    quote: "Agent Forge has transformed how we handle customer support. The AI agents are incredibly effective.",
    author: "Sarah Chen",
    title: "CTO, TechCorp",
    avatar: "/avatars/avatar-1.jpg"
  },
  {
    quote: "The scalability and reliability of Agent Forge is unmatched. It's become essential to our operations.",
    author: "Michael Rodriguez",
    title: "Head of AI, DataFlow",
    avatar: "/avatars/avatar-2.jpg"
  },
  {
    quote: "Implementing AI agents has never been easier. The enterprise features are exactly what we needed.",
    author: "Emily Thompson",
    title: "Engineering Lead, CloudScale",
    avatar: "/avatars/avatar-3.jpg"
  }
]

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-gray-50">
      <Container>
        <h2 className="text-2xl font-bold text-center mb-12">
          Trusted by Industry Leaders
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg border border-gray-200"
            >
              <div className="flex items-center mb-6">
                <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{testimonial.author}</h3>
                  <p className="text-sm text-gray-600">{testimonial.title}</p>
                </div>
              </div>
              <blockquote className="text-gray-700 italic">
                "{testimonial.quote}"
              </blockquote>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
