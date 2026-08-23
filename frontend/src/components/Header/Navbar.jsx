import React from 'react'
import { MdOutlineShoppingBag } from "react-icons/md";
export default function Navbar() {
  return (
    <div
    className='w-full bg-white border-b border-gray-100'>
      <div
      className="max-w-7x1 mx-auto flex items-center justify-between px-6 py-4">
        {/* logo */}
        <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-none">LibaStyle</h1>
            <p className="text-xs text-gray-500 tracking-wide">Men's Underwear</p>
        </div>
        {/*button */}
        <button 
        className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition">
            Commander maintenant
            <i
            className="text-lg"><MdOutlineShoppingBag /></i>
        </button>
      </div>
    </div>
  )
}
