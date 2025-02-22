import {useAuth} from "@/context/AuthProvider";

export default function () {
    const {user} = useAuth()

    return (
        <div className="max-w-md mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-semibold mb-4 text-blue-400">Обновить профиль</h1>

            <form id="updateForm">
                <div className="space-y-4">
                    <label className="block">
                        <span className="text-gray-400">Username:</span>
                        <input type="text" id="username" defaultValue={user?.username}
                               className="w-full mt-1 p-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
                    </label>
                    <label className="block">
                        <span className="text-gray-400">Description:</span>
                        <input type="text" id="description" defaultValue={user?.description}
                               className="w-full mt-1 p-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
                    </label>

                    <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                        Сохранить изменения
                    </button>
                </div>
            </form>
        </div>
    );
}