import React from 'react'



const ApiTemplateFrame = ({name, link, description }) => {

    const handleCopy = () => {
        navigator.clipboard.writeText(link);
        alert("Link copied to clipboard!");
    };

    return (
        <div className="h-[30vh] w-[26vw] bg-gray-900 text-gray-100 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-2">{name}</h2>
            <p className="text-sm text-gray-400 mb-4">{description}</p>

            <div className="flex items-center space-x-2">
                <input
                    type="text"
                    value={link}
                    disabled
                    className="flex-1 px-3 py-2 bg-gray-800 text-gray-300 rounded border border-gray-700 cursor-not-allowed"
                />
                <button
                    onClick={handleCopy}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium"
                >
                    Copy
                </button>
            </div>
        </div>
    )
}

export default ApiTemplateFrame
