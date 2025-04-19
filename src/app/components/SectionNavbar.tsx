import Link from 'next/link';

export default function SectionNavbar() {
  return (
    <div className="bg-gray-800 text-white p-4 mb-6 ">
      <div className="flex justify-start space-x-4 ">
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
