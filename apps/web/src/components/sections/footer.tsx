import Link from 'next/link'

const footerLinks = {
  Product: [
    { name: 'Features', href: '#' },
    { name: 'Documentation', href: '/docs' },
    { name: 'Pricing', href: '#' },
  ],
  Company: [
    { name: 'About', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'Careers', href: '#' },
  ],
  Resources: [
    { name: 'Community', href: '#' },
    { name: 'Contact', href: '#' },
    { name: 'Support', href: '#' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Agent Forge</h3>
            <p className="text-gray-400">
              Building the future of AI agent systems
            </p>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-800 pt-8">
          <p className="text-center text-gray-400">
            © {new Date().getFullYear()} Agent Forge. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
