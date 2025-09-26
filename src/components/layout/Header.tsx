import Link from 'next/link'
import HamburgerMenu from '@/components/HamburgerMenu'
import Button from '@/components/ui/Button'

interface HeaderProps {
  title: string
  currentPage?: 'dashboard' | 'bots' | 'settings'
  backLink?: {
    href: string
    label: string
  }
  actionButton?: {
    label: string
    onClick: () => void
  }
}

export default function Header({
  title,
  currentPage,
  backLink,
  actionButton
}: HeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center space-x-4">
        {backLink && (
          <>
            <Link
              href={backLink.href}
              className="text-indigo-600 hover:text-indigo-500"
            >
              {backLink.label}
            </Link>
            <div className="h-4 w-px bg-gray-300"></div>
          </>
        )}
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      </div>
      <div className="flex items-center space-x-4">
        {actionButton && (
          <Button onClick={actionButton.onClick}>
            {actionButton.label}
          </Button>
        )}
        <HamburgerMenu currentPage={currentPage} />
      </div>
    </div>
  )
}