import Link from 'next/link';


export default function Footer() {
  return (
    <div>      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="container mx-auto text-center">
          <h3 className="text-white text-xl font-bold mb-4">CourseMaster</h3>
          <p className="mb-8 max-w-md mx-auto text-gray-300">
            Empowering students with accessible education. Built with Next.js, Node.js, and MongoDB.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6 text-sm">
            <Link href="#" className="hover:text-white">Privacy Policy</Link>
            <Link href="#" className="hover:text-white">Terms of Service</Link>
            <Link href="#" className="hover:text-white">Support</Link>
          </div>
          <p className="mt-8 text-xs">&copy; {new Date().getFullYear()} LMS Platform. All rights reserved.</p>
        </div>
      </footer></div>
  )
}
