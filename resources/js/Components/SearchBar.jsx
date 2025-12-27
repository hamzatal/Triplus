import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import { Search } from "lucide-react";

export default function SearchBar({ className = "" }) {
const { setData, get } = useForm({
query: "",
});
const [searchQuery, setSearchQuery] = useState("");

const handleSearch = (e) => {
e.preventDefault();
if (searchQuery.trim()) {
get(route("search"), {
data: { query: searchQuery },
preserveState: true,
preserveScroll: true,
});
}
};

return (
<form onSubmit={handleSearch} className={`relative max-w-md ${className}`}>
    <input
        type="text"
        placeholder="Search deals, destinations..."
        value={searchQuery}
        onChange={(e)=> {
    setSearchQuery(e.target.value);
    setData("query", e.target.value);
    }}
    className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800 bg-opacity-70 text-gray-300 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
    />
    <button type="submit" className="absolute left-3 top-3.5">
        <Search className="w-5 h-5 text-gray-400" />
    </button>
</form>
);
}