import Link from 'next/link';

export default function SectionNavbar() {
  return (
    <div className="w-2/5 bg-gray-800 text-white p-4 mb-6 rounded-lg shadow">
      <div className="flex justify-center space-x-4 items-center ">
      <Link href="/terminales">
          <button className="hover:bg-blue-600 px-4 py-2 rounded">Terminales</button>
        </Link>
        <Link href="/paises">
          <button className="hover:bg-blue-600 px-4 py-2 rounded">Paises</button>
        </Link>
        <Link href="/estados">
          <button className="hover:bg-blue-600 px-4 py-2 rounded">Estados</button>
        </Link>
        <Link href="/monedas">
          <button className="hover:bg-blue-600 px-4 py-2 rounded">Monedas</button>
        </Link>
      </div>
    </div>
  );
}
