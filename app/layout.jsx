import './globals.css'

export const metadata = {
  title: 'SWAY | Try On',
  description: 'Experience your perfect fit instantly.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        {children}
      </body>
    </html>
  )
}
