import React from "react";

import MoonLoader from "react-spinners/MoonLoader"

export default function Loader() {

    return (
        <div className="w-screen bg-slate-800 h-screen items-center flex justify-center">
            <MoonLoader color="#10c700" />
        </div>
    )

}