// Importação CRÍTICA: Se esta linha faltar, o site fica sem estilo
import './globals.css'

export const metadata = {
  title: 'Ballistic Devotion',
  description: 'Neo-Noir Experience',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body className="antialiased bg-black text-white">
        {children}
      </body>
    </html>
  )
}