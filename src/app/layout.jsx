import './globals.css'

export const metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || 'Ballistic Devotion',
  description: 'Uma experiência interativa Neo-Noir com física WebGL.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#0a0a0a] text-[#C0C0C0] overflow-hidden m-0 p-0">
        {children}
      </body>
    </html>
  )
}