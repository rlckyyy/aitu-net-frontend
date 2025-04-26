import React from "react";

export function Loading() {
    return (
        <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    )
}

export function useLoading() {
    return <Loading/>
}